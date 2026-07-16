import { db } from "@/db";
import { users } from "@/db/schema";
import { parkingSpaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "space";
}

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return err("Invalid request body.");

    const hostName = typeof body.hostName === "string" ? body.hostName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const neighborhood = typeof body.neighborhood === "string" ? body.neighborhood.trim() : "";
    const category = typeof body.category === "string" ? body.category : "standard";
    const kind = typeof body.kind === "string" ? body.kind : "Open air";
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const priceHourlyEtb = Number(body.priceHourlyEtb);
    const totalSpots = Number(body.totalSpots) || 1;
    const photos = Array.isArray(body.photos) ? (body.photos as string[]).filter((p) => typeof p === "string" && p.startsWith("data:")).slice(0, 3) : [];

    if (photos.length < 3) return err("Please add all 3 photos of your space.");

    if (!hostName || hostName.length < 2) return err("Please enter your name.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Please enter a valid email address.");
    if (!phone || phone.length < 9) return err("Please enter a valid phone number.");
    if (!name || name.length < 2) return err("Please enter the space name.");
    if (!address || address.length < 3) return err("Please enter the space address.");
    if (!neighborhood) return err("Please enter the neighborhood.");
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return err("Please drop a pin or enter valid coordinates.");
    if (!Number.isFinite(priceHourlyEtb) || priceHourlyEtb < 10) return err("Please enter a valid hourly price (min 10 ETB).");

    let [host] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!host) {
      const [created] = await db.insert(users).values({ name: hostName, email, phone, passwordHash: "", isHost: true }).returning({ id: users.id });
      host = created;
    } else {
      await db.update(users).set({ isHost: true }).where(eq(users.id, host.id));
    }

    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const [space] = await db.insert(parkingSpaces).values({
      slug,
      name,
      address,
      neighborhood,
      category,
      kind,
      hostName,
      photos,
      lat,
      lng,
      priceHourlyEtb: Math.round(priceHourlyEtb),
      totalSpots,
      availableSpots: totalSpots,
      isActive: true,
    }).returning({ id: parkingSpaces.id, slug: parkingSpaces.slug });

    return NextResponse.json({ space }, { status: 201 });
  } catch {
    return err("Internal server error. Please try again.", 500);
  }
}
