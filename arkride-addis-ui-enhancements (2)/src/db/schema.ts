import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("arkride_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("rider"),
  walletBalanceEtb: integer("wallet_balance_etb").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vehicles = pgTable(
  "arkride_vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    plateNumber: text("plate_number").notNull(),
    color: text("color").notNull().default("white"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("arkride_vehicles_user_idx").on(table.userId)],
);

export const parkingSpots = pgTable(
  "arkride_parking_spots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address").notNull(),
    neighborhood: text("neighborhood").notNull(),
    description: text("description").notNull().default(""),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    walkMinutes: integer("walk_minutes").notNull(),
    pricePerHourEtb: integer("price_per_hour_etb").notNull(),
    capacity: integer("capacity").notNull(),
    availableSpaces: integer("available_spaces").notNull(),
    covered: boolean("covered").notNull().default(false),
    evCharging: boolean("ev_charging").notNull().default(false),
    gateCode: text("gate_code").notNull(),
    level: text("level").notNull().default("Ground"),
    spaceLabel: text("space_label").notNull().default("General"),
    rating: doublePrecision("rating").notNull().default(4.8),
    reviewCount: integer("review_count").notNull().default(0),
    tone: text("tone").notNull().default("sage"),
    label: text("label").notNull().default("Available"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("arkride_spots_host_idx").on(table.hostId),
    index("arkride_spots_neighborhood_idx").on(table.neighborhood),
    index("arkride_spots_active_idx").on(table.active),
  ],
);

export const bookings = pgTable(
  "arkride_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    spotId: uuid("spot_id").notNull().references(() => parkingSpots.id, { onDelete: "restrict" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    status: text("status").notNull().default("active"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    durationHours: integer("duration_hours").notNull(),
    pricePerHourEtb: integer("price_per_hour_etb").notNull(),
    discountEtb: integer("discount_etb").notNull().default(0),
    totalEtb: integer("total_etb").notNull(),
    couponCode: text("coupon_code"),
    paymentMethod: text("payment_method").notNull().default("wallet"),
    gateCode: text("gate_code").notNull(),
    qrToken: text("qr_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("arkride_bookings_user_idx").on(table.userId),
    index("arkride_bookings_spot_idx").on(table.spotId),
    index("arkride_bookings_status_idx").on(table.status),
  ],
);

export const walletTransactions = pgTable(
  "arkride_wallet_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    amountEtb: integer("amount_etb").notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("arkride_wallet_user_idx").on(table.userId)],
);

export const spotBlockedDates = pgTable(
  "arkride_spot_blocked_dates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    spotId: uuid("spot_id").notNull().references(() => parkingSpots.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    reason: text("reason").notNull().default("Host blocked"),
    priceMultiplier: doublePrecision("price_multiplier").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("arkride_blocked_spot_date_unique").on(table.spotId, table.date),
    index("arkride_blocked_spot_idx").on(table.spotId),
  ],
);

export const hostPayouts = pgTable(
  "arkride_host_payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amountEtb: integer("amount_etb").notNull(),
    status: text("status").notNull().default("processing"),
    scheduledFor: text("scheduled_for").notNull(),
    bankLabel: text("bank_label").notNull(),
    maskedAccount: text("masked_account").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("arkride_payouts_host_idx").on(table.hostId)],
);
