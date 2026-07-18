import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  real,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    isHost: boolean("is_host").notNull().default(false),
    role: text("role").notNull().default("driver"),
    hostType: text("host_type").notNull().default("normal"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sessions_token_unique").on(table.token)],
);

export const parkingSpaces = pgTable(
  "parking_spaces",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    neighborhood: text("neighborhood").notNull(),
    kind: text("kind").notNull().default("Open air"),
    category: text("category").notNull().default("standard"),
    tone: text("tone").notNull().default("sage"),
    priceHourlyEtb: integer("price_hourly_etb").notNull(),
    ratingTenths: integer("rating_tenths").notNull().default(48),
    availableSpots: integer("available_spots").notNull().default(0),
    totalSpots: integer("total_spots").notNull().default(0),
    hostName: text("host_name").notNull().default("Host"),
    photos: text("photos").array().notNull().default([]),
    lat: real("lat").notNull().default(9.0192),
    lng: real("lng").notNull().default(38.7525),
    isActive: boolean("is_active").notNull().default(true),
    corporate: boolean("corporate").notNull().default(false),
    layout: jsonb("layout"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("parking_spaces_slug_unique").on(table.slug)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parkingSpaceId: integer("parking_space_id")
      .notNull()
      .references(() => parkingSpaces.id, { onDelete: "restrict" }),
    parkingDate: date("parking_date").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    durationHours: integer("duration_hours").notNull(),
    spaceLabel: text("space_label").notNull(),
    status: text("status").notNull().default("confirmed"),
    paymentMethod: text("payment_method").notNull(),
    amountEtb: integer("amount_etb").notNull(),
    gateCode: text("gate_code").notNull(),
    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("bookings_reference_unique").on(table.reference)],
);

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    amountEtb: integer("amount_etb").notNull(),
    provider: text("provider"),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("wallet_transactions_reference_unique").on(table.reference)],
);

export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: serial("id").primaryKey(),
    parkingSpaceId: integer("parking_space_id")
      .notNull()
      .references(() => parkingSpaces.id, { onDelete: "cascade" }),
    blockedDate: date("blocked_date").notNull(),
    reason: text("reason").notNull().default("Host unavailable"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("availability_blocks_space_date_unique").on(
      table.parkingSpaceId,
      table.blockedDate,
    ),
  ],
);
