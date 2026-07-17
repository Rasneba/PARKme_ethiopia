import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_MAP_TOKEN || process.env.NEXT_PUBLIC_GEBETA_TOKEN || "";

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

  const url = `https://mapapi.gebeta.app/api/route/direction/?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&apiKey=${GEBETA_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.direction || data.msg === "NoRoute" || data.msg === "error") {
      return NextResponse.json({ error: data.message || data.msg || "No route found" }, { status: 404 });
    }

    const coords: [number, number][] = (data.direction || []).map((c: number[]) => [c[1], c[0]]);

    if (coords.length < 2) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const instructions = (data.instruction || []).map((step: any) => ({
      text: step.path || step.name || "Continue",
      distance: step.distance || 0,
      sign: step.sign ?? 0,
      coord: [step.turning_longitude, step.turning_latitude],
      type: step.type,
    }));

    return NextResponse.json({
      route: { type: "LineString", coordinates: coords },
      distance: data.totalDistance || 0,
      time: data.timetaken || 0,
      instructions,
    });
  } catch (e) {
    console.error("Gebeta directions error:", e);
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 502 });
  }
}
