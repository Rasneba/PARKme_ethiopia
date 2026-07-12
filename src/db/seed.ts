import { db } from "@/db";
import { bookings, parkingSpaces, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

const demoUserId = "demo-miki";

export async function ensurePrakmeSeeded() {
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
      },
    ])
    .onConflictDoNothing({ target: parkingSpaces.slug });

  await db
    .insert(walletTransactions)
    .values({
      reference: "seed-wallet-opening-balance",
      userId: demoUserId,
      type: "deposit",
      amountEtb: 250,
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
      userId: demoUserId,
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

export const DEMO_USER_ID = demoUserId;
