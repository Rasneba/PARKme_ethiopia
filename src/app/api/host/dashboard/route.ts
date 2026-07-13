import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { availabilityBlocks, bookings, parkingSpaces } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureParkmeSeeded();
  let userId: string;
  try { userId = await requireUserId(); } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const [user] = await db.select({ name: parkingSpaces.hostName }).from(parkingSpaces).limit(1);
  const hostName = user?.name ?? "Host";

  const [spaces, allBookings, blocks] = await Promise.all([
    db.select().from(parkingSpaces).where(eq(parkingSpaces.hostName, hostName)).orderBy(asc(parkingSpaces.id)),
    db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt)),
    db.select().from(availabilityBlocks).orderBy(asc(availabilityBlocks.blockedDate)),
  ]);

  const paidBookings = allBookings.filter((b) => b.status !== "cancelled");
  const totalEarningsEtb = paidBookings.reduce((sum, b) => sum + b.amountEtb, 0);
  const hostPayoutEtb = Math.round(totalEarningsEtb * 0.85);
  const platformFeeEtb = totalEarningsEtb - hostPayoutEtb;
  const activeBookings = paidBookings.filter((b) => b.status === "active" || b.status === "confirmed");
  const averageRating = spaces.length ? spaces.reduce((sum, s) => sum + s.ratingTenths, 0) / spaces.length / 10 : 0;
  const totalCapacity = spaces.reduce((sum, s) => sum + s.totalSpots, 0);
  const totalAvailable = spaces.reduce((sum, s) => sum + s.availableSpots, 0);
  const occupancyRate = totalCapacity ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100) : 0;

  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weeklyEarnings = weekday.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    const amountEtb = paidBookings
      .filter((b) => b.createdAt >= date && b.createdAt < next)
      .reduce((sum, b) => sum + b.amountEtb, 0);
    return { day, amountEtb };
  });

  return NextResponse.json({
    summary: {
      totalEarningsEtb,
      hostPayoutEtb,
      platformFeeEtb,
      bookingCount: paidBookings.length,
      activeBookingCount: activeBookings.length,
      occupancyRate,
      averageRating: Number(averageRating.toFixed(1)),
    },
    spaces: spaces.map((s) => ({
      id: s.id, name: s.name, address: s.address,
      priceHourlyEtb: s.priceHourlyEtb, availableSpots: s.availableSpots,
      totalSpots: s.totalSpots, isActive: s.isActive,
    })),
    weeklyEarnings,
    availabilityBlocks: blocks,
  });
}
