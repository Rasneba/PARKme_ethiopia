import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ParkmeLanding from "@/components/ParkmeLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await db.execute(sql`select 1`);

  const user = await getCurrentUser();
  if (user) redirect("/app");

  const h = await headers();
  const ua = h.get("user-agent") || "";
  const isMobile = /android|iphone|ipad|ipod|mobile|opera mini|iemobile/i.test(ua);
  if (isMobile) redirect("/app");

  return <ParkmeLanding />;
}
