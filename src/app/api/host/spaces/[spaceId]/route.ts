import { db } from "@/db";
import { ensurePrakmeSeeded } from "@/db/seed";
import { parkingSpaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ spaceId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  await ensurePrakmeSeeded();
  const { spaceId } = await context.params;
  const id = Number(spaceId);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid parking space." }, { status: 400 });
  const priceHourlyEtb = body?.priceHourlyEtb;
  const isActive = body?.isActive;
  if (priceHourlyEtb !== undefined && (!Number.isInteger(priceHourlyEtb) || Number(priceHourlyEtb) < 10 || Number(priceHourlyEtb) > 500)) {
    return NextResponse.json({ error: "Price must be between 10 and 500 ETB per hour." }, { status: 400 });
  }
  if (isActive !== undefined && typeof isActive !== "boolean") return NextResponse.json({ error: "Availability must be a boolean." }, { status: 400 });

  const [space] = await db
    .update(parkingSpaces)
    .set({
      ...(priceHourlyEtb === undefined ? {} : { priceHourlyEtb: Number(priceHourlyEtb) }),
      ...(isActive === undefined ? {} : { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(parkingSpaces.id, id))
    .returning();

  if (!space) return NextResponse.json({ error: "Parking space not found." }, { status: 404 });
  return NextResponse.json({ space });
}
