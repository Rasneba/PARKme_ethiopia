import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { parkingSpaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ spaceId: string }> };

function validateLayout(layout: any): boolean {
  if (!layout || typeof layout !== "object") return false;
  if (!Array.isArray(layout.floors)) return false;
  for (const floor of layout.floors) {
    if (typeof floor.id !== "string" || typeof floor.name !== "string") return false;
    if (!Array.isArray(floor.spots)) return false;
    for (const spot of floor.spots) {
      if (typeof spot.id !== "string" || typeof spot.label !== "string") return false;
      if (typeof spot.x !== "number" || typeof spot.y !== "number") return false;
      if (!["available", "occupied", "maintenance", "reserved"].includes(spot.state)) return false;
    }
  }
  return true;
}

export async function GET(request: NextRequest, context: RouteContext) {
  await ensureParkmeSeeded();
  const { spaceId } = await context.params;
  const numId = Number(spaceId);
  if (!Number.isInteger(numId) || numId < 1) return NextResponse.json({ error: "Invalid parking space." }, { status: 400 });
  const [space] = await db
    .select({ id: parkingSpaces.id, name: parkingSpaces.name, corporate: parkingSpaces.corporate, layout: parkingSpaces.layout })
    .from(parkingSpaces)
    .where(eq(parkingSpaces.id, numId))
    .limit(1);
  if (!space) return NextResponse.json({ error: "Parking space not found." }, { status: 404 });
  return NextResponse.json({ space });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  await ensureParkmeSeeded();
  const { spaceId } = await context.params;
  const numId = Number(spaceId);
  if (!Number.isInteger(numId) || numId < 1) return NextResponse.json({ error: "Invalid parking space." }, { status: 400 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const layout = body?.layout;
  if (!validateLayout(layout)) return NextResponse.json({ error: "Invalid layout structure." }, { status: 400 });

  const [space] = await db
    .update(parkingSpaces)
    .set({ corporate: true, layout, updatedAt: new Date() })
    .where(eq(parkingSpaces.id, numId))
    .returning();
  if (!space) return NextResponse.json({ error: "Parking space not found." }, { status: 404 });
  return NextResponse.json({ space });
}
