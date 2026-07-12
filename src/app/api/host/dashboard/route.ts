import { db } from "@/db";
import { DEMO_USER_ID, ensurePrakmeSeeded } from "@/db/seed";
import { availabilityBlocks, bookings, parkingSpaces } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensurePrakmeSeeded();
  const [spaces, allBookings, blocks] = await Promise.all([
    db.select().from(parkingSpaces).where(eq(parkingSpaces.hostName, "Miki Tadesse")).orderBy(asc(parkingSpaces.id)),
    db.select().from(bookings).where(eq(bookings.userId, DEMO_USER_ID)).orderBy(desc(bookings.createdAt)),
    db.select().from(availabilityBlocks).orderBy(asc(availabilityBlocks.blockedDate)),
  ]);

  const paidBookings = allBookings.filter((booking) => booking.status !== "cancelled");
  const totalEarningsEtb = paidBookings.reduce((sum, booking) => sum + booking.amountEtb, 0);
  const activeBookings = paidBookings.filter((booking) => booking.status === "active" || booking.status === "confirmed");
  const averageRating = spaces.length
    ? spaces.reduce((sum, space) => sum + space.ratingTenths, 0) / spaces.length / 10
    : 0;
  const totalCapacity = spaces.reduce((sum, space) => sum + space.totalSpots, 0);
  const totalAvailable = spaces.reduce((sum, space) => sum + space.availableSpots, 0);
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
      .filter((booking) => booking.createdAt >= date && booking.createdAt < next)
      .reduce((sum, booking) => sum + booking.amountEtb, 0);
    return { day, amountEtb };
  });

  return NextResponse.json({
    summary: {
      totalEarningsEtb,
      bookingCount: paidBookings.length,
      activeBookingCount: activeBookings.length,
      occupancyRate,
      averageRating: Number(averageRating.toFixed(1)),
    },
    spaces: spaces.map((space) => ({
      id: space.id,
      name: space.name,
      address: space.address,
      priceHourlyEtb: space.priceHourlyEtb,
      availableSpots: space.availableSpots,
      totalSpots: space.totalSpots,
      isActive: space.isActive,
    })),
    weeklyEarnings,
    availabilityBlocks: blocks,
  });
}
