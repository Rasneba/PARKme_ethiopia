import { db } from "@/db";
import { ensurePrakmeSeeded } from "@/db/seed";
import { bookings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(_: Request, context: RouteContext) {
  await ensurePrakmeSeeded();
  let userId: string;
  try { userId = await requireUserId(); } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const { bookingId } = await context.params;
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .limit(1);

  if (!booking) return NextResponse.json({ error: "Parking pass not found." }, { status: 404 });
  if (booking.status === "cancelled") return NextResponse.json({ error: "This pass has been cancelled." }, { status: 409 });

  const [checkedIn] = await db
    .update(bookings)
    .set({ status: "active", checkInAt: booking.checkInAt ?? new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  return NextResponse.json({ booking: checkedIn });
}
