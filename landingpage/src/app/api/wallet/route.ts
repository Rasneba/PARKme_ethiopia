import { db } from "@/db";
import { DEMO_USER_ID, ensureArkRideSeeded } from "@/db/seed";
import { walletTransactions } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureArkRideSeeded();
  const [totals] = await db
    .select({ balance: sql<string>`coalesce(sum(${walletTransactions.amountEtb}), 0)` })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, DEMO_USER_ID));
  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, DEMO_USER_ID))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(20);

  return NextResponse.json({ balanceEtb: Number(totals?.balance ?? 0), transactions });
}

export async function POST(request: NextRequest) {
  await ensureArkRideSeeded();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const amountEtb = Number(body?.amountEtb);
  const provider = body?.provider === "bank" ? "Commercial Bank of Ethiopia" : "telebirr";

  if (!Number.isInteger(amountEtb) || amountEtb < 20 || amountEtb > 10000) {
    return NextResponse.json({ error: "Add between 20 and 10,000 ETB." }, { status: 400 });
  }

  const [transaction] = await db
    .insert(walletTransactions)
    .values({
      reference: `topup-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      userId: DEMO_USER_ID,
      type: "deposit",
      amountEtb,
      provider,
      note: "Wallet top up",
    })
    .returning();

  const [totals] = await db
    .select({ balance: sql<string>`coalesce(sum(${walletTransactions.amountEtb}), 0)` })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, DEMO_USER_ID));

  return NextResponse.json({ transaction, balanceEtb: Number(totals?.balance ?? 0) }, { status: 201 });
}
