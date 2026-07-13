import { db } from "@/db";
import { sql } from "drizzle-orm";
import ParkmeApp from "@/components/ArkRideApp";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  await db.execute(sql`select 1`);
  return <ParkmeApp />;
}
