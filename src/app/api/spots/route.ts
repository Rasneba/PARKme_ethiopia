import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { parkingSpaces } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await ensureParkmeSeeded();

  const query = request.nextUrl.searchParams.get("q")?.trim();
  const onlyAvailable = request.nextUrl.searchParams.get("available") !== "false";

  const rows = await db
    .select()
    .from(parkingSpaces)
    .where(
      query
        ? and(
            eq(parkingSpaces.isActive, true),
            or(
              ilike(parkingSpaces.name, `%${query}%`),
              ilike(parkingSpaces.address, `%${query}%`),
              ilike(parkingSpaces.neighborhood, `%${query}%`),
            ),
          )
        : eq(parkingSpaces.isActive, true),
    )
    .orderBy(asc(parkingSpaces.priceHourlyEtb));

  const spots = rows
    .filter((spot) => !onlyAvailable || spot.availableSpots > 0)
    .map((spot) => ({
      id: spot.id,
      slug: spot.slug,
      name: spot.name,
      address: spot.address,
      neighborhood: spot.neighborhood,
      label: spot.kind,
      tone: spot.tone,
      price: spot.priceHourlyEtb,
      rating: (spot.ratingTenths / 10).toFixed(1),
      availableSpots: spot.availableSpots,
      totalSpots: spot.totalSpots,
      spaces: `${spot.availableSpots} spots`,
      hostName: spot.hostName,
      lat: spot.lat,
      lng: spot.lng,
    }));

  return NextResponse.json({ spots, count: spots.length });
}
