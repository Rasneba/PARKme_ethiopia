import { db } from "@/db";
import { sql } from "drizzle-orm";
import ParkmeApp from "@/components/ArkRideApp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Keep the landing route tied to the configured Drizzle/PostgreSQL service.
  await db.execute(sql`select 1`);

  return <ParkmeApp />;
}
