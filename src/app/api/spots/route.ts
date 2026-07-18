import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { parkingSpaces } from "@/db/schema";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let migrated = false;

async function ensureCategoryColumn() {
  if (migrated) return;
  try {
    await db.execute(sql`ALTER TABLE parking_spaces ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'standard'`);
    await db.execute(sql`UPDATE parking_spaces SET category = 'ev_charging' WHERE slug IN ('unity-park-garage','edna-mall-parking','bole-road-garage','bole-medhanialem-2','megenagna-parking') AND category = 'standard'`);
    await db.execute(sql`UPDATE parking_spaces SET category = 'cctv' WHERE slug IN ('bole-medhanialem','mexico-square-space-4','kazanchis-business-parking','bole-atlas-parking','mexico-supermarket-parking') AND category = 'standard'`);
    await db.execute(sql`UPDATE parking_spaces SET category = '24hr' WHERE slug IN ('meskel-square-lot','churchill-avenue-lot','haya-hulet-parking','tor-hayloch-parking') AND category = 'standard'`);
    await db.execute(sql`UPDATE parking_spaces SET category = 'wheelchair' WHERE slug IN ('piassa-parking-lot','summit-view-parking','arada-parking-hub') AND category = 'standard'`);
    migrated = true;
  } catch { migrated = true; }
}

export async function GET(request: NextRequest) {
  await ensureParkmeSeeded();
  await ensureCategoryColumn();

  const query = request.nextUrl.searchParams.get("q")?.trim();
  const onlyAvailable = request.nextUrl.searchParams.get("available") !== "false";
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const type = request.nextUrl.searchParams.get("type")?.trim();

  const conditions = [eq(parkingSpaces.isActive, true)];

  if (query) {
    conditions.push(
      or(
        ilike(parkingSpaces.name, `%${query}%`),
        ilike(parkingSpaces.address, `%${query}%`),
        ilike(parkingSpaces.neighborhood, `%${query}%`),
        ilike(parkingSpaces.category, `%${query}%`),
      )!,
    );
  }

  if (category && category !== "all") {
    conditions.push(eq(parkingSpaces.category, category));
  }

  if (type === "corporate") {
    conditions.push(eq(parkingSpaces.corporate, true));
  } else if (type === "normal") {
    conditions.push(eq(parkingSpaces.corporate, false));
  }

  const rows = await db
    .select()
    .from(parkingSpaces)
    .where(and(...conditions))
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
      category: spot.category,
      tone: spot.tone,
      price: spot.priceHourlyEtb,
      rating: (spot.ratingTenths / 10).toFixed(1),
      availableSpots: spot.availableSpots,
      totalSpots: spot.totalSpots,
      spaces: `${spot.availableSpots} spots`,
      hostName: spot.hostName,
      lat: spot.lat,
      lng: spot.lng,
      corporate: spot.corporate,
      layout: spot.layout ?? null,
    }));

  return NextResponse.json({ spots, count: spots.length });
}
