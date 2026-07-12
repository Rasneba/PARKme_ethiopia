import { db } from "@/db";
import { DEMO_USER_ID, ensurePrakmeSeeded } from "@/db/seed";
import { bookings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(_: Request, context: RouteContext) {
  await ensurePrakmeSeeded();
  const { bookingId } = await context.params;
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, DEMO_USER_ID)))
    .limit(1);

  if (!booking) return NextResponse.json({ error: "Parking pass not found." }, { status: 404 });
  if (booking.status === "cancelled") return NextResponse.json({ error: "This parking pass has been cancelled." }, { status: 409 });

  const [checkedIn] = await db
    .update(bookings)
    .set({ status: "active", checkInAt: booking.checkInAt ?? new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  return NextResponse.json({ booking: checkedIn });
}
