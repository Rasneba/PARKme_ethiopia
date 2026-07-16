import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { availabilityBlocks, parkingSpaces } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureParkmeSeeded();
  const blocks = await db.select().from(availabilityBlocks).orderBy(asc(availabilityBlocks.blockedDate));
  return NextResponse.json({ blocks });
}

export async function POST(request: NextRequest) {
  await ensureParkmeSeeded();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parkingSpaceId = Number(body?.parkingSpaceId);
  const blockedDate = body?.blockedDate;

  if (!Number.isInteger(parkingSpaceId) || typeof blockedDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(blockedDate)) {
    return NextResponse.json({ error: "Choose a parking space and a valid date." }, { status: 400 });
  }
  const [space] = await db.select({ id: parkingSpaces.id }).from(parkingSpaces).where(eq(parkingSpaces.id, parkingSpaceId)).limit(1);
  if (!space) return NextResponse.json({ error: "Parking space not found." }, { status: 404 });

  const [block] = await db
    .insert(availabilityBlocks)
    .values({ parkingSpaceId, blockedDate, reason: typeof body?.reason === "string" ? body.reason.slice(0, 120) : "Host unavailable" })
    .onConflictDoNothing()
    .returning();

  return NextResponse.json({ block, created: Boolean(block) }, { status: block ? 201 : 200 });
}

export async function DELETE(request: NextRequest) {
  await ensureParkmeSeeded();
  const parkingSpaceId = Number(request.nextUrl.searchParams.get("parkingSpaceId"));
  const blockedDate = request.nextUrl.searchParams.get("blockedDate");
  if (!Number.isInteger(parkingSpaceId) || !blockedDate) return NextResponse.json({ error: "Provide a space and date." }, { status: 400 });

  await db
    .delete(availabilityBlocks)
    .where(and(eq(availabilityBlocks.parkingSpaceId, parkingSpaceId), eq(availabilityBlocks.blockedDate, blockedDate)));
  return NextResponse.json({ ok: true });
}
