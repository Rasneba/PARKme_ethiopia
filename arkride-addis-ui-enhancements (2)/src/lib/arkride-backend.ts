import { randomUUID } from "crypto";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/db";
import {
  bookings,
  hostPayouts,
  parkingSpots,
  spotBlockedDates,
  users,
  vehicles,
  walletTransactions,
} from "@/db/schema";
import type {
  ArkRideBooking,
  ArkRideBootstrap,
  ArkRideSpot,
  ArkRideUser,
  OwnerBlockedDate,
  OwnerDashboard,
  OwnerSpace,
  WalletTransactionView,
} from "@/lib/arkride-types";

export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_VEHICLE_ID = "22222222-2222-4222-8222-222222222222";
const SPOT_UNITY_ID = "33333333-3333-4333-8333-333333333333";
const SPOT_BOLE_ID = "44444444-4444-4444-8444-444444444444";
const SPOT_MESKEL_ID = "55555555-5555-4555-8555-555555555555";
const ACTIVE_BOOKING_ID = "66666666-6666-4666-8666-666666666666";
const SEED_PAYMENT_TX_ID = "77777777-7777-4777-8777-777777777777";
const SEED_DEPOSIT_TX_ID = "88888888-8888-4888-8888-888888888888";
const SEED_PAYOUT_ID = "99999999-9999-4999-8999-999999999999";

const historicalBookingIds = [
  "70000000-0000-4000-8000-000000000001",
  "70000000-0000-4000-8000-000000000002",
  "70000000-0000-4000-8000-000000000003",
  "70000000-0000-4000-8000-000000000004",
  "70000000-0000-4000-8000-000000000005",
  "70000000-0000-4000-8000-000000000006",
  "70000000-0000-4000-8000-000000000007",
];

const spotSeed = [
  {
    id: SPOT_UNITY_ID,
    name: "Unity Park Garage",
    slug: "unity-park-garage",
    address: "Arat Kilo, Addis Ababa",
    neighborhood: "Arat Kilo",
    description: "Covered multi-level garage close to Unity Park and the National Palace.",
    latitude: 9.0354,
    longitude: 38.7614,
    walkMinutes: 3,
    pricePerHourEtb: 35,
    capacity: 22,
    availableSpaces: 12,
    covered: true,
    evCharging: false,
    gateCode: "4826",
    level: "Level B",
    spaceLabel: "Space 27",
    rating: 4.9,
    reviewCount: 132,
    tone: "sage",
    label: "Best value",
  },
  {
    id: SPOT_BOLE_ID,
    name: "Bole Medhanialem",
    slug: "bole-medhanialem",
    address: "Bole Road, Addis Ababa",
    neighborhood: "Bole",
    description: "Secure partner space near Medhanialem Cathedral, cafes, and airport road.",
    latitude: 8.9969,
    longitude: 38.7897,
    walkMinutes: 6,
    pricePerHourEtb: 45,
    capacity: 14,
    availableSpaces: 6,
    covered: true,
    evCharging: true,
    gateCode: "6194",
    level: "Ground",
    spaceLabel: "Space 12",
    rating: 4.8,
    reviewCount: 94,
    tone: "sand",
    label: "Covered",
  },
  {
    id: SPOT_MESKEL_ID,
    name: "Meskel Square Lot",
    slug: "meskel-square-lot",
    address: "Meskel Square, Addis Ababa",
    neighborhood: "Meskel Square",
    description: "Open-air event parking with attendants and easy exit to Africa Avenue.",
    latitude: 9.0101,
    longitude: 38.7619,
    walkMinutes: 8,
    pricePerHourEtb: 30,
    capacity: 30,
    availableSpaces: 18,
    covered: false,
    evCharging: false,
    gateCode: "2738",
    level: "Open Lot",
    spaceLabel: "Row C",
    rating: 4.7,
    reviewCount: 77,
    tone: "rose",
    label: "Open air",
  },
] as const;

type SpotRow = InferSelectModel<typeof parkingSpots>;
type BookingRow = InferSelectModel<typeof bookings>;
type UserRow = InferSelectModel<typeof users>;
type WalletRow = InferSelectModel<typeof walletTransactions>;
type BlockedRow = InferSelectModel<typeof spotBlockedDates>;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthDate(day: number) {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${month}-${String(day).padStart(2, "0")}`;
}

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function normalizeTone(value: string): ArkRideSpot["tone"] {
  if (["sage", "sand", "rose", "blue", "purple"].includes(value)) {
    return value as ArkRideSpot["tone"];
  }
  return "sage";
}

function mapUser(row: UserRow): ArkRideUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: row.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    walletBalanceEtb: row.walletBalanceEtb,
  };
}

function mapSpot(row: SpotRow): ArkRideSpot {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    neighborhood: row.neighborhood,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    walkMinutes: row.walkMinutes,
    walk: `${row.walkMinutes} min walk`,
    price: row.pricePerHourEtb,
    rating: row.rating.toFixed(1),
    reviewCount: row.reviewCount,
    capacity: row.capacity,
    availableSpaces: row.availableSpaces,
    spaces: `${row.availableSpaces} ${row.availableSpaces === 1 ? "spot" : "spots"}`,
    covered: row.covered,
    evCharging: row.evCharging,
    gateCode: row.gateCode,
    level: row.level,
    spaceLabel: row.spaceLabel,
    tone: normalizeTone(row.tone),
    label: row.label,
  };
}

function mapBooking(row: BookingRow, spot: SpotRow): ArkRideBooking {
  const status = ["active", "reserved", "completed", "cancelled"].includes(row.status)
    ? (row.status as ArkRideBooking["status"])
    : "active";
  const paymentMethod = row.paymentMethod === "telebirr" ? "telebirr" : "wallet";

  return {
    id: row.id,
    spotId: row.spotId,
    spotName: spot.name,
    spotAddress: spot.address,
    startsAt: toIso(row.startsAt),
    endsAt: toIso(row.endsAt),
    durationHours: row.durationHours,
    pricePerHourEtb: row.pricePerHourEtb,
    discountEtb: row.discountEtb,
    totalEtb: row.totalEtb,
    status,
    paymentMethod,
    gateCode: row.gateCode,
    level: spot.level,
    spaceLabel: spot.spaceLabel,
    qrToken: row.qrToken,
    createdAt: toIso(row.createdAt),
  };
}

function mapWalletTransaction(row: WalletRow): WalletTransactionView {
  const allowedTypes: WalletTransactionView["type"][] = ["deposit", "booking_payment", "booking_refund", "host_payout"];
  return {
    id: row.id,
    type: allowedTypes.includes(row.type as WalletTransactionView["type"])
      ? (row.type as WalletTransactionView["type"])
      : "deposit",
    amountEtb: row.amountEtb,
    note: row.note,
    bookingId: row.bookingId,
    createdAt: toIso(row.createdAt),
  };
}

function mapBlockedDate(row: BlockedRow): OwnerBlockedDate {
  return {
    spotId: row.spotId,
    date: row.date,
    reason: row.reason,
    priceMultiplier: row.priceMultiplier,
  };
}

export async function ensureDemoData() {
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);

  await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      name: "Miki Tadesse",
      email: "miki.t@arkride.et",
      role: "host",
      walletBalanceEtb: 250,
    })
    .onConflictDoNothing();

  await db
    .insert(vehicles)
    .values({
      id: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      nickname: "White Corolla",
      plateNumber: "AA-2-48391",
      color: "white",
      isDefault: true,
    })
    .onConflictDoNothing();

  await db
    .insert(parkingSpots)
    .values(spotSeed.map((spot) => ({ ...spot, hostId: DEMO_USER_ID })))
    .onConflictDoNothing();

  const now = new Date();
  const activeStartsAt = new Date(now.getTime() - (78 * 60 + 32) * 1000);
  const activeEndsAt = addHours(activeStartsAt, 2);

  await db
    .insert(bookings)
    .values({
      id: ACTIVE_BOOKING_ID,
      userId: DEMO_USER_ID,
      spotId: SPOT_UNITY_ID,
      vehicleId: DEMO_VEHICLE_ID,
      status: "active",
      startsAt: activeStartsAt,
      endsAt: activeEndsAt,
      durationHours: 2,
      pricePerHourEtb: 35,
      discountEtb: 0,
      totalEtb: 70,
      couponCode: null,
      paymentMethod: "wallet",
      gateCode: "4826",
      qrToken: "ARK-DEMO-UNITY",
    })
    .onConflictDoUpdate({
      target: bookings.id,
      set: {
        status: "active",
        startsAt: activeStartsAt,
        endsAt: activeEndsAt,
        updatedAt: now,
      },
    });

  const chartAmounts = [420, 560, 690, 520, 740, 910, 840];
  const historyRows = chartAmounts.map((amount, index) => {
    const started = addDays(now, index - 6);
    const spot = spotSeed[index % spotSeed.length];
    return {
      id: historicalBookingIds[index],
      userId: DEMO_USER_ID,
      spotId: spot.id,
      vehicleId: DEMO_VEHICLE_ID,
      status: "completed",
      startsAt: started,
      endsAt: addHours(started, 2),
      durationHours: 2,
      pricePerHourEtb: spot.pricePerHourEtb,
      discountEtb: 0,
      totalEtb: amount,
      couponCode: null,
      paymentMethod: "telebirr",
      gateCode: spot.gateCode,
      qrToken: `ARK-HISTORY-${index + 1}`,
      updatedAt: now,
    };
  });

  for (const row of historyRows) {
    await db.insert(bookings).values(row).onConflictDoUpdate({
      target: bookings.id,
      set: {
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        totalEtb: row.totalEtb,
        updatedAt: now,
      },
    });
  }

  await db
    .insert(walletTransactions)
    .values([
      {
        id: SEED_PAYMENT_TX_ID,
        userId: DEMO_USER_ID,
        bookingId: ACTIVE_BOOKING_ID,
        type: "booking_payment",
        amountEtb: -70,
        note: "Unity Park Garage parking pass",
      },
      {
        id: SEED_DEPOSIT_TX_ID,
        userId: DEMO_USER_ID,
        bookingId: null,
        type: "deposit",
        amountEtb: 300,
        note: "Wallet top up via telebirr",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(spotBlockedDates)
    .values([
      { spotId: SPOT_BOLE_ID, date: monthDate(6), reason: "Host maintenance", priceMultiplier: 1.3 },
      { spotId: SPOT_BOLE_ID, date: monthDate(13), reason: "Private event", priceMultiplier: 1.5 },
      { spotId: SPOT_MESKEL_ID, date: monthDate(20), reason: "City event", priceMultiplier: 1.8 },
    ])
    .onConflictDoNothing();

  await db
    .insert(hostPayouts)
    .values({
      id: SEED_PAYOUT_ID,
      hostId: DEMO_USER_ID,
      amountEtb: 3240,
      status: "processing",
      scheduledFor: isoDate(addDays(now, 2)),
      bankLabel: "Commercial Bank of Ethiopia",
      maskedAccount: "•••• 4928",
    })
    .onConflictDoNothing();

  return { seeded: !existingUser };
}

export async function getDemoUser(userId = DEMO_USER_ID) {
  await ensureDemoData();
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) throw new ApiError(404, "User not found");
  return mapUser(row);
}

export async function listParkingSpots(filters: { query?: string; covered?: boolean; ev?: boolean; maxPrice?: number; limit?: number } = {}) {
  await ensureDemoData();
  const conditions = [eq(parkingSpots.active, true)];

  if (filters.query?.trim()) {
    const pattern = `%${filters.query.trim()}%`;
    const queryClause = or(
      ilike(parkingSpots.name, pattern),
      ilike(parkingSpots.address, pattern),
      ilike(parkingSpots.neighborhood, pattern),
    );
    if (queryClause) conditions.push(queryClause);
  }

  if (filters.covered) conditions.push(eq(parkingSpots.covered, true));
  if (filters.ev) conditions.push(eq(parkingSpots.evCharging, true));
  if (filters.maxPrice) conditions.push(eq(parkingSpots.active, true));

  const rows = await db
    .select()
    .from(parkingSpots)
    .where(and(...conditions))
    .orderBy(desc(parkingSpots.availableSpaces), parkingSpots.pricePerHourEtb)
    .limit(filters.limit ?? 30);

  const mapped = rows.map(mapSpot);
  return filters.maxPrice ? mapped.filter((spot) => spot.price <= Number(filters.maxPrice)) : mapped;
}

export async function listBookings(userId = DEMO_USER_ID) {
  await ensureDemoData();
  const rows = await db
    .select({ booking: bookings, spot: parkingSpots })
    .from(bookings)
    .innerJoin(parkingSpots, eq(bookings.spotId, parkingSpots.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));

  return rows.map(({ booking, spot }) => mapBooking(booking, spot));
}

export async function listWalletTransactions(userId = DEMO_USER_ID) {
  await ensureDemoData();
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(20);

  return rows.map(mapWalletTransaction);
}

export async function getOwnerDashboard(hostId = DEMO_USER_ID): Promise<OwnerDashboard> {
  await ensureDemoData();
  const spotRows = await db.select().from(parkingSpots).where(eq(parkingSpots.hostId, hostId));
  const spotIds = spotRows.map((spot) => spot.id);
  const bookingRows = spotIds.length
    ? await db
        .select({ booking: bookings, spot: parkingSpots })
        .from(bookings)
        .innerJoin(parkingSpots, eq(bookings.spotId, parkingSpots.id))
        .where(inArray(bookings.spotId, spotIds))
    : [];

  const blockedRows = spotIds.length
    ? await db.select().from(spotBlockedDates).where(inArray(spotBlockedDates.spotId, spotIds))
    : [];

  const validBookings = bookingRows.filter(({ booking }) => booking.status !== "cancelled");
  const totalEarningsEtb = validBookings.reduce((total, { booking }) => total + booking.totalEtb, 0);
  const bookingCount = validBookings.length;
  const reviewCount = spotRows.reduce((total, spot) => total + spot.reviewCount, 0);
  const rating = spotRows.length
    ? (spotRows.reduce((total, spot) => total + spot.rating, 0) / spotRows.length).toFixed(1)
    : "0.0";
  const capacity = spotRows.reduce((total, spot) => total + spot.capacity, 0);
  const occupied = spotRows.reduce((total, spot) => total + (spot.capacity - spot.availableSpaces), 0);
  const occupancyRate = capacity ? Math.round((occupied / capacity) * 100) : 0;

  const now = new Date();
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    const key = isoDate(date);
    const amountEtb = validBookings
      .filter(({ booking }) => isoDate(new Date(booking.startsAt)) === key)
      .reduce((total, { booking }) => total + booking.totalEtb, 0);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      amountEtb,
    };
  });

  const spaces: OwnerSpace[] = spotRows.map((spot) => {
    const bookingsForSpot = validBookings.filter(({ booking }) => booking.spotId === spot.id);
    return {
      ...mapSpot(spot),
      revenueEtb: bookingsForSpot.reduce((total, { booking }) => total + booking.totalEtb, 0),
      bookingCount: bookingsForSpot.length,
    };
  });

  const [payout] = await db.select().from(hostPayouts).where(eq(hostPayouts.hostId, hostId)).limit(1);

  return {
    hostId,
    metrics: {
      totalEarningsEtb,
      bookings: bookingCount,
      occupancyRate,
      rating,
      reviewCount,
      earningsDelta: 18.5,
      bookingsDelta: 12,
      occupancyDelta: 8.2,
    },
    chart,
    spaces,
    blockedDates: blockedRows.map(mapBlockedDate),
    payout: {
      amountEtb: payout?.amountEtb ?? 0,
      status: payout?.status ?? "pending",
      scheduledFor: payout?.scheduledFor ?? isoDate(addDays(new Date(), 2)),
      bankLabel: payout?.bankLabel ?? "Commercial Bank of Ethiopia",
      maskedAccount: payout?.maskedAccount ?? "•••• 4928",
    },
  };
}

export async function getArkRideBootstrap(userId = DEMO_USER_ID): Promise<ArkRideBootstrap> {
  await ensureDemoData();
  const [user, spots, bookingsList, transactions, ownerDashboard] = await Promise.all([
    getDemoUser(userId),
    listParkingSpots(),
    listBookings(userId),
    listWalletTransactions(userId),
    getOwnerDashboard(userId),
  ]);
  const now = Date.now();
  const activeBooking =
    bookingsList.find((booking) =>
      ["active", "reserved"].includes(booking.status) && new Date(booking.endsAt).getTime() > now,
    ) ?? null;

  return {
    user,
    spots,
    bookings: bookingsList,
    activeBooking,
    walletTransactions: transactions,
    ownerDashboard,
    generatedAt: new Date().toISOString(),
  };
}

export async function createBooking(input: {
  userId?: string;
  spotId: string;
  startsAt?: string;
  durationHours: number;
  paymentMethod: "wallet" | "telebirr";
  couponCode?: string;
}) {
  await ensureDemoData();
  const userId = input.userId ?? DEMO_USER_ID;
  const durationHours = Math.min(8, Math.max(1, Math.round(Number(input.durationHours) || 1)));
  const startsAt = input.startsAt ? new Date(input.startsAt) : new Date();
  if (Number.isNaN(startsAt.getTime())) throw new ApiError(400, "Invalid start time");

  const bookingView = await db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new ApiError(404, "User not found");

    const [spot] = await tx
      .select()
      .from(parkingSpots)
      .where(and(eq(parkingSpots.id, input.spotId), eq(parkingSpots.active, true)))
      .limit(1);
    if (!spot) throw new ApiError(404, "Parking spot not found");
    if (spot.availableSpaces < 1) throw new ApiError(409, "This parking spot is full");

    const coupon = input.couponCode?.trim().toUpperCase() || null;
    const discountEtb = coupon === "ARKRIDE20" ? 20 : 0;
    const subtotal = durationHours * spot.pricePerHourEtb;
    const totalEtb = Math.max(0, subtotal - discountEtb);
    const paymentMethod = input.paymentMethod === "telebirr" ? "telebirr" : "wallet";

    if (paymentMethod === "wallet" && user.walletBalanceEtb < totalEtb) {
      throw new ApiError(402, "ArkWallet balance is too low for this booking");
    }

    const [created] = await tx
      .insert(bookings)
      .values({
        userId,
        spotId: spot.id,
        vehicleId: DEMO_VEHICLE_ID,
        status: "active",
        startsAt,
        endsAt: addHours(startsAt, durationHours),
        durationHours,
        pricePerHourEtb: spot.pricePerHourEtb,
        discountEtb,
        totalEtb,
        couponCode: coupon,
        paymentMethod,
        gateCode: spot.gateCode,
        qrToken: `ARK-${randomUUID().slice(0, 8).toUpperCase()}`,
      })
      .returning();

    await tx
      .update(parkingSpots)
      .set({ availableSpaces: Math.max(0, spot.availableSpaces - 1), updatedAt: new Date() })
      .where(eq(parkingSpots.id, spot.id));

    if (paymentMethod === "wallet") {
      await tx
        .update(users)
        .set({ walletBalanceEtb: user.walletBalanceEtb - totalEtb, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    await tx.insert(walletTransactions).values({
      userId,
      bookingId: created.id,
      type: "booking_payment",
      amountEtb: -totalEtb,
      note: `${spot.name} parking pass${paymentMethod === "telebirr" ? " via telebirr" : ""}`,
    });

    return mapBooking(created, { ...spot, availableSpaces: Math.max(0, spot.availableSpaces - 1) });
  });

  const [user, spots, wallet, bookingsList, ownerDashboard] = await Promise.all([
    getDemoUser(userId),
    listParkingSpots(),
    listWalletTransactions(userId),
    listBookings(userId),
    getOwnerDashboard(userId),
  ]);

  return { booking: bookingView, user, spots, walletTransactions: wallet, bookings: bookingsList, ownerDashboard };
}

export async function depositWallet(input: { userId?: string; amountEtb: number; method?: string }) {
  await ensureDemoData();
  const userId = input.userId ?? DEMO_USER_ID;
  const amountEtb = Math.round(Number(input.amountEtb));
  if (!Number.isFinite(amountEtb) || amountEtb < 10 || amountEtb > 10000) {
    throw new ApiError(400, "Deposit amount must be between 10 and 10,000 ETB");
  }

  await db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new ApiError(404, "User not found");
    await tx
      .update(users)
      .set({ walletBalanceEtb: user.walletBalanceEtb + amountEtb, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await tx.insert(walletTransactions).values({
      userId,
      bookingId: null,
      type: "deposit",
      amountEtb,
      note: `Wallet top up via ${input.method || "telebirr"}`,
    });
  });

  const [user, walletTransactionsList] = await Promise.all([getDemoUser(userId), listWalletTransactions(userId)]);
  return { user, walletTransactions: walletTransactionsList };
}

export async function updateSpotPrice(input: { spotId: string; pricePerHourEtb: number; hostId?: string }) {
  await ensureDemoData();
  const hostId = input.hostId ?? DEMO_USER_ID;
  const price = Math.round(Number(input.pricePerHourEtb));
  if (!Number.isFinite(price) || price < 10 || price > 500) {
    throw new ApiError(400, "Hourly price must be between 10 and 500 ETB");
  }

  const [updated] = await db
    .update(parkingSpots)
    .set({ pricePerHourEtb: price, updatedAt: new Date() })
    .where(and(eq(parkingSpots.id, input.spotId), eq(parkingSpots.hostId, hostId)))
    .returning();

  if (!updated) throw new ApiError(404, "Host parking spot not found");
  const [ownerDashboard, spots] = await Promise.all([getOwnerDashboard(hostId), listParkingSpots()]);
  return { spot: mapSpot(updated), ownerDashboard, spots };
}

export async function setBlockedDate(input: {
  spotId: string;
  date: string;
  blocked: boolean;
  reason?: string;
  priceMultiplier?: number;
  hostId?: string;
}) {
  await ensureDemoData();
  const hostId = input.hostId ?? DEMO_USER_ID;
  const [spot] = await db
    .select()
    .from(parkingSpots)
    .where(and(eq(parkingSpots.id, input.spotId), eq(parkingSpots.hostId, hostId)))
    .limit(1);
  if (!spot) throw new ApiError(404, "Host parking spot not found");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new ApiError(400, "Date must use YYYY-MM-DD format");

  if (input.blocked) {
    await db
      .insert(spotBlockedDates)
      .values({
        spotId: input.spotId,
        date: input.date,
        reason: input.reason || "Host blocked",
        priceMultiplier: input.priceMultiplier ?? 1,
      })
      .onConflictDoUpdate({
        target: [spotBlockedDates.spotId, spotBlockedDates.date],
        set: {
          reason: input.reason || "Host blocked",
          priceMultiplier: input.priceMultiplier ?? 1,
        },
      });
  } else {
    await db
      .delete(spotBlockedDates)
      .where(and(eq(spotBlockedDates.spotId, input.spotId), eq(spotBlockedDates.date, input.date)));
  }

  return { ownerDashboard: await getOwnerDashboard(hostId) };
}
