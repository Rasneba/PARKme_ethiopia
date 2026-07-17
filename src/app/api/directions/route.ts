import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_TOKEN || process.env.NEXT_PUBLIC_GEBETA_MAP_TOKEN || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromLat = searchParams.get("from_lat");
  const fromLng = searchParams.get("from_lng");
  const toLat = searchParams.get("to_lat");
  const toLng = searchParams.get("to_lng");

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return NextResponse.json({ error: "from_lat, from_lng, to_lat, to_lng are required" }, { status: 400 });
  }

  if (!GEBETA_TOKEN) {
    return NextResponse.json({ error: "Gebeta API token not configured" }, { status: 500 });
  }

  const url = `https://mapapi.gebeta.app/api/route/direction/?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&apiKey=${GEBETA_TOKEN}&instruction=1`;

  try {
    const res = await fetch(url);
    const raw = await res.json();
    console.log("[directions] Gebeta response keys:", Object.keys(raw), "msg:", raw.msg);

    const root = raw.data || raw;
    const directionData = root.direction || raw.direction;

    if (!res.ok || !directionData || raw.msg === "NoRoute" || raw.msg === "error") {
      console.error("[directions] No route:", raw);
      return NextResponse.json({ error: raw.message || raw.msg || "No route found" }, { status: 404 });
    }

    let coords: [number, number][];

    if (Array.isArray(directionData) && directionData.length > 0 && Array.isArray(directionData[0])) {
      coords = directionData.map((c: number[]) => [c[1], c[0]]);
    } else if (Array.isArray(directionData) && directionData.length > 0 && directionData[0].point) {
      coords = directionData.map((p: any) => {
        const pt = p.point;
        return Array.isArray(pt) ? [pt[1], pt[0]] : [pt.lng || pt[1], pt.lat || pt[0]];
      });
    } else {
      coords = [];
    }

    if (coords.length < 2) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const rawInstructions = root.instruction || raw.instruction || [];
    const instructions = rawInstructions.map((step: any) => ({
      text: step.path || step.name || "Continue",
      distance: step.distance || 0,
      sign: step.sign ?? 0,
      coord: step.turning_longitude && step.turning_latitude
        ? [step.turning_longitude, step.turning_latitude]
        : step.coord || null,
      type: step.type,
    }));

    return NextResponse.json({
      route: { type: "LineString", coordinates: coords },
      distance: root.totalDistance || raw.totalDistance || 0,
      time: root.timetaken || raw.timetaken || 0,
      instructions,
    });
  } catch (e) {
    console.error("[directions] Gebeta error:", e);
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 502 });
  }
}
