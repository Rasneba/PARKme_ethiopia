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

  const url = `https://mapapi.gebeta.app/api/route/direction/?origin={${fromLat},${fromLng}}&destination={${toLat},${toLng}}&apiKey=${GEBETA_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.msg === "error" || data.msg === "NoRoute") {
      return NextResponse.json({ error: data.error?.message || data.msg || "No route found" }, { status: 404 });
    }

    if (data.msg === "Ok" && data.direction && Array.isArray(data.direction)) {
      const coords: [number, number][] = data.direction.map((c: number[]) => [c[1], c[0]]);

      const distanceMeters = (data.totalDistance || 0) * 1000;
      const timeSeconds = data.timetaken || 0;
      const timeMs = timeSeconds * 1000;

      const instructions = (data.instruction || []).map((step: any, i: number) => ({
        text: step.path || step.text || "",
        distance: step.distance || 0,
        time: 0,
        sign: step.sign ?? 0,
        type: step.type,
        index: i,
      }));

      return NextResponse.json({
        route: { type: "LineString", coordinates: coords },
        distance: distanceMeters,
        time: timeMs,
        instructions,
        points: { type: "LineString", coordinates: coords },
      });
    }

    return NextResponse.json({ error: "No route found" }, { status: 404 });
  } catch (e) {
    console.error("Gebeta directions error:", e);
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 502 });
  }
}
