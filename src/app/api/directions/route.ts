import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromLat = searchParams.get("from_lat");
  const fromLng = searchParams.get("from_lng");
  const toLat = searchParams.get("to_lat");
  const toLng = searchParams.get("to_lng");

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return NextResponse.json({ error: "from_lat, from_lng, to_lat, to_lng are required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GraphHopper API key not configured" }, { status: 500 });
  }

  const url = `https://graphhopper.com/api/1/route?point=${fromLat},${fromLng}&point=${toLat},${toLng}&vehicle=car&key=${apiKey}&type=geojson&instructions=true&calc_points=true&points_encoded=false&locale=en`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.paths || !data.paths.length) {
      return NextResponse.json({ error: "No route found", details: data.message }, { status: 404 });
    }

    const path = data.paths[0];
    return NextResponse.json({
      route: path,
      distance: path.distance,
      time: path.time,
      instructions: path.instructions || [],
      points: path.points,
    });
  } catch (e) {
    console.error("GraphHopper error:", e);
    return NextResponse.json({ error: "Routing service unavailable" }, { status: 502 });
  }
}
