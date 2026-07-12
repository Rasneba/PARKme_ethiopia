import { listParkingSpots } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxPrice = searchParams.get("maxPrice");
    const limit = searchParams.get("limit");
    const spots = await listParkingSpots({
      query: searchParams.get("query") ?? undefined,
      covered: searchParams.get("covered") === "true",
      ev: searchParams.get("ev") === "true",
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return Response.json({ ok: true, spots });
  } catch (error) {
    return jsonError(error);
  }
}
