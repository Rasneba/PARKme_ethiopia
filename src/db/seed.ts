import { db } from "@/db";
import { bookings, parkingSpaces, walletTransactions } from "@/db/schema";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export async function ensurePrakmeSeeded() {
  const [existing] = await db.select({ id: users.id }).from(users).limit(1);
  if (existing) return;

  const passwordHash = hashSync("demo1234", 10);
  const [demoUser] = await db
    .insert(users)
    .values({
      email: "miki@prakme.et",
      name: "Miki Tadesse",
      passwordHash,
      phone: "+251911234567",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  let userId: string;
  if (demoUser) {
    userId = demoUser.id;
  } else {
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, "miki@prakme.et")).limit(1);
    userId = existingUser!.id;
  }

  await db
    .insert(parkingSpaces)
    .values([
      {
        slug: "unity-park-garage",
        name: "Unity Park Garage",
        address: "Arat Kilo, Addis Ababa",
        neighborhood: "Arat Kilo",
        kind: "Best value",
        tone: "sage",
        priceHourlyEtb: 35,
        ratingTenths: 49,
        availableSpots: 12,
        totalSpots: 36,
        hostName: "Miki Tadesse",
        lat: 9.0355,
        lng: 38.7468,
      },
      {
        slug: "bole-medhanialem",
        name: "Bole Medhanialem",
        address: "Bole Road, Addis Ababa",
        neighborhood: "Bole",
        kind: "Covered",
        tone: "sand",
        priceHourlyEtb: 45,
        ratingTenths: 48,
        availableSpots: 6,
        totalSpots: 18,
        hostName: "Miki Tadesse",
        lat: 9.0115,
        lng: 38.7892,
      },
      {
        slug: "meskel-square-lot",
        name: "Meskel Square Lot",
        address: "Meskel Square, Addis Ababa",
        neighborhood: "Meskel Square",
        kind: "Open air",
        tone: "rose",
        priceHourlyEtb: 30,
        ratingTenths: 47,
        availableSpots: 18,
        totalSpots: 50,
        hostName: "Miki Tadesse",
        lat: 9.0113,
        lng: 38.7614,
      },
      {
        slug: "mexico-square-space-4",
        name: "Mexico Square Space #4",
        address: "Churchill Avenue, Addis Ababa",
        neighborhood: "Mexico Square",
        kind: "Covered",
        tone: "sand",
        priceHourlyEtb: 35,
        ratingTenths: 46,
        availableSpots: 4,
        totalSpots: 10,
        hostName: "Miki Tadesse",
        lat: 9.0288,
        lng: 38.7578,
      },
      {
        slug: "edna-mall-parking",
        name: "Edna Mall Parking",
        address: "Bole Road, Addis Ababa",
        neighborhood: "Bole",
        kind: "Covered",
        tone: "sage",
        priceHourlyEtb: 50,
        ratingTenths: 47,
        availableSpots: 8,
        totalSpots: 24,
        hostName: "Miki Tadesse",
        lat: 9.0073,
        lng: 38.7815,
      },
      {
        slug: "piassa-parking-lot",
        name: "Piassa Parking Lot",
        address: "Piazza, Addis Ababa",
        neighborhood: "Piassa",
        kind: "Open air",
        tone: "rose",
        priceHourlyEtb: 25,
        ratingTenths: 44,
        availableSpots: 15,
        totalSpots: 30,
        hostName: "Miki Tadesse",
        lat: 9.0340,
        lng: 38.7500,
      },
    ])
    .onConflictDoNothing({ target: parkingSpaces.slug });

  await db
    .insert(walletTransactions)
    .values({
      reference: "seed-wallet-opening-balance",
      userId,
      type: "deposit",
      amountEtb: 500,
      provider: "telebirr",
      note: "PrakmeWallet opening balance",
    })
    .onConflictDoNothing({ target: walletTransactions.reference });

  const [unityPark] = await db
    .select({ id: parkingSpaces.id })
    .from(parkingSpaces)
    .where(eq(parkingSpaces.slug, "unity-park-garage"))
    .limit(1);

  if (!unityPark) return;

  const now = new Date();
  const start = new Date(now.getTime() - 78 * 60 * 1000);
  const end = new Date(now.getTime() + 42 * 60 * 1000);
  const today = now.toISOString().slice(0, 10);

  await db
    .insert(bookings)
    .values({
      reference: "seed-active-unity-pass",
      userId,
      parkingSpaceId: unityPark.id,
      parkingDate: today,
      startAt: start,
      endAt: end,
      durationHours: 2,
      spaceLabel: "B · 27",
      status: "active",
      paymentMethod: "wallet",
      amountEtb: 70,
      gateCode: "4826",
    })
    .onConflictDoNothing({ target: bookings.reference });
}

export const DEMO_USER_EMAIL = "miki@prakme.et";
