import { db } from "@/db";
import { DEMO_USER_ID, ensureArkRideSeeded } from "@/db/seed";
import { bookings, parkingSpaces, walletTransactions } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  await ensureArkRideSeeded();
  const requestedStatus = request.nextUrl.searchParams.get("status");
  const rows = await db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      status: bookings.status,
      parkingDate: bookings.parkingDate,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      durationHours: bookings.durationHours,
      spaceLabel: bookings.spaceLabel,
      paymentMethod: bookings.paymentMethod,
      amountEtb: bookings.amountEtb,
      gateCode: bookings.gateCode,
      checkInAt: bookings.checkInAt,
      createdAt: bookings.createdAt,
      spotId: parkingSpaces.id,
      spotName: parkingSpaces.name,
      spotAddress: parkingSpaces.address,
    })
    .from(bookings)
    .innerJoin(parkingSpaces, eq(bookings.parkingSpaceId, parkingSpaces.id))
    .where(
      requestedStatus
        ? and(eq(bookings.userId, DEMO_USER_ID), eq(bookings.status, requestedStatus))
        : eq(bookings.userId, DEMO_USER_ID),
    )
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json({ bookings: rows });
}

export async function POST(request: NextRequest) {
  await ensureArkRideSeeded();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parkingSpaceId = Number(body?.parkingSpaceId);
  const durationHours = Number(body?.durationHours);
  const paymentMethod = body?.paymentMethod;
  const couponCode = typeof body?.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";

  if (!Number.isInteger(parkingSpaceId) || parkingSpaceId < 1) return error("Choose a valid parking space.");
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) return error("Parking duration must be between 1 and 12 hours.");
  if (paymentMethod !== "wallet" && paymentMethod !== "telebirr") return error("Choose ArkWallet or telebirr for payment.");

  try {
    const created = await db.transaction(async (tx) => {
      const [spot] = await tx
        .select()
        .from(parkingSpaces)
        .where(eq(parkingSpaces.id, parkingSpaceId))
        .limit(1);

      if (!spot || !spot.isActive) throw new Error("PARKING_NOT_FOUND");
      if (spot.availableSpots < 1) throw new Error("PARKING_FULL");

      const discountEtb = couponCode === "ARKRIDE20" ? 20 : 0;
      const amountEtb = Math.max(0, spot.priceHourlyEtb * durationHours - discountEtb);
      if (paymentMethod === "wallet") {
        const [balanceRow] = await tx
          .select({ balance: sql<string>`coalesce(sum(${walletTransactions.amountEtb}), 0)` })
          .from(walletTransactions)
          .where(eq(walletTransactions.userId, DEMO_USER_ID));
        if (Number(balanceRow?.balance ?? 0) < amountEtb) throw new Error("INSUFFICIENT_BALANCE");
      }

      const startAt = new Date();
      const endAt = new Date(startAt.getTime() + durationHours * 60 * 60 * 1000);
      const reference = `AR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const gateCode = String(Math.floor(1000 + Math.random() * 9000));
      const spaceLabel = `B · ${Math.floor(10 + Math.random() * 30)}`;

      const [booking] = await tx
        .insert(bookings)
        .values({
          reference,
          userId: DEMO_USER_ID,
          parkingSpaceId: spot.id,
          parkingDate: startAt.toISOString().slice(0, 10),
          startAt,
          endAt,
          durationHours,
          spaceLabel,
          status: "confirmed",
          paymentMethod,
          amountEtb,
          gateCode,
        })
        .returning();

      await tx
        .update(parkingSpaces)
        .set({
          availableSpots: Math.max(0, spot.availableSpots - 1),
          updatedAt: new Date(),
        })
        .where(eq(parkingSpaces.id, spot.id));

      if (paymentMethod === "wallet") {
        await tx.insert(walletTransactions).values({
          reference: `wallet-${reference}`,
          userId: DEMO_USER_ID,
          type: "parking_charge",
          amountEtb: -amountEtb,
          provider: "ArkWallet",
          note: `${spot.name} parking pass`,
        });
      }

      return { booking, spot };
    });

    return NextResponse.json(
      {
        booking: {
          ...created.booking,
          spotName: created.spot.name,
          spotAddress: created.spot.address,
        },
      },
      { status: 201 },
    );
  } catch (caught) {
    const code = caught instanceof Error ? caught.message : "BOOKING_FAILED";
    if (code === "PARKING_NOT_FOUND") return error("That parking space is no longer available.", 404);
    if (code === "PARKING_FULL") return error("This space just filled up. Please choose another spot.", 409);
    if (code === "INSUFFICIENT_BALANCE") return error("Your ArkWallet balance is too low for this booking.", 409);
    return error("We could not create the booking. Please try again.", 500);
  }
}
