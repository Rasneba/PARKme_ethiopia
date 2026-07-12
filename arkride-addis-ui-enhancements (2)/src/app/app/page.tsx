import { db } from "@/db";
import { sql } from "drizzle-orm";
import ArkRideApp from "@/components/ArkRideApp";
import { getArkRideBootstrap } from "@/lib/arkride-backend";

export const dynamic = "force-dynamic";

export default async function ArkRideDashboardPage() {
  await db.execute(sql`select 1`);
  const initialData = await getArkRideBootstrap();
  return <ArkRideApp initialData={initialData} />;
}
