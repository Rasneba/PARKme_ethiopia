import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_MAP_TOKEN || process.env.NEXT_PUBLIC_GEBETA_TOKEN || "";

function decodePolyline(str: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < str.length) {
    let result = 1;
    let shift = 0;
    let b: number;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lng / 1e6, lat / 1e6]);
  }
  return coords;
}

const VALHALLA_SIGN: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0,
  9: 1, 10: 1, 11: 1, 12: 1, 13: -1, 14: -1, 15: -1, 16: -1,
  17: 0, 18: 1, 19: -1, 20: 1, 21: -1, 22: 0, 23: 1, 24: -1,
  25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0, 31: 0, 32: 0,
};

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

  const url = `https://mapapi.gebeta.app/api/route/direction/?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&instruction=1&format=valhalla&apiKey=${GEBETA_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.msg === "error" || data.error) {
      return NextResponse.json({ error: data.error?.message || data.msg || "No route found" }, { status: 404 });
    }

    if (data.trip && data.trip.legs && data.trip.legs.length) {
      const leg = data.trip.legs[0];
      const shape: string = leg.shape || "";
      const coords = decodePolyline(shape);

      const summary = leg.summary || data.trip.summary || {};
      const distance = (summary.length != null ? summary.length : 0) * 1000;
      const time = summary.time != null ? summary.time * 1000 : 0;

      const instructions = (leg.maneuvers || []).map((m: any, i: number) => ({
        text: m.instruction || m.type?.toString() || "",
        distance: (m.length || 0) * 1000,
        time: (m.time || 0) * 1000,
        sign: VALHALLA_SIGN[m.type] ?? 0,
        type: m.type,
        index: i,
      }));

      return NextResponse.json({
        route: { type: "LineString", coordinates: coords },
        distance,
        time,
        instructions,
        points: { type: "LineString", coordinates: coords },
      });
    }

    if (data.direction && Array.isArray(data.direction)) {
      const coords: [number, number][] = data.direction.map((c: number[]) => [c[1], c[0]]);
      const instructions = (data.instruction || []).map((step: any, i: number) => ({
        text: step.path || "",
        distance: step.distance || 0,
        time: 0,
        sign: step.sign ?? 0,
        type: step.type,
        index: i,
      }));

      return NextResponse.json({
        route: { type: "LineString", coordinates: coords },
        distance: data.totalDistance || 0,
        time: (data.totalTime || 0) * 1000,
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
