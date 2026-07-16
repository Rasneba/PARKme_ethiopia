import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { bookings, parkingSpaces, walletTransactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  await ensureParkmeSeeded();
  let userId: string;
  try { userId = await requireUserId(); } catch { return error("Please log in.", 401); }

  const { bookingId } = await params;
  if (!bookingId) return error("Invalid booking.");

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const addHours = Number(body?.addHours ?? 1);
  if (!Number.isInteger(addHours) || addHours < 1) return error("Extension must be at least 1 hour.");

  try {
    const extended = await db.transaction(async (tx) => {
      const [booking] = await tx.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId))).limit(1);
      if (!booking) throw new Error("NOT_FOUND");
      if (booking.status === "cancelled" || booking.status === "completed") throw new Error("CLOSED");

      const [spot] = await tx.select().from(parkingSpaces).where(eq(parkingSpaces.id, booking.parkingSpaceId)).limit(1);
      if (!spot) throw new Error("NOT_FOUND");

      const extra = Math.round(spot.priceHourlyEtb * addHours);
      const newEndAt = new Date(new Date(booking.endAt).getTime() + addHours * 60 * 60 * 1000);

      const [updated] = await tx
        .update(bookings)
        .set({ endAt: newEndAt, durationHours: booking.durationHours + addHours, amountEtb: booking.amountEtb + extra })
        .where(eq(bookings.id, bookingId))
        .returning();

      await tx.insert(walletTransactions).values({
        reference: `extend-${updated.reference}-${Date.now().toString(36)}`,
        userId,
        type: "parking_charge",
        amountEtb: -extra,
        provider: "ParkmeWallet",
        note: `Extended ${spot.name} by ${addHours}h`,
      });

      return { booking: updated, spot };
    });

    return NextResponse.json({ booking: { ...extended.booking, spotName: extended.spot.name, spotAddress: extended.spot.address } });
  } catch (caught) {
    const code = caught instanceof Error ? caught.message : "EXTEND_FAILED";
    if (code === "NOT_FOUND") return error("Booking not found.", 404);
    if (code === "CLOSED") return error("This booking can no longer be extended.", 409);
    return error("Could not extend booking.", 500);
  }
}
