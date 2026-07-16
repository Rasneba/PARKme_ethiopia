import { db } from "@/db";
import { ensureParkmeSeeded } from "@/db/seed";
import { walletTransactions } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";

export async function GET() {
  await ensureParkmeSeeded();
  let userId: string;
  try { userId = await requireUserId(); } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const [totals] = await db
    .select({ balance: sql<string>`coalesce(sum(${walletTransactions.amountEtb}), 0)` })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId));
  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(20);

  return NextResponse.json({ balanceEtb: Number(totals?.balance ?? 0), transactions });
}

export async function POST(request: NextRequest) {
  await ensureParkmeSeeded();
  let userId: string;
  try { userId = await requireUserId(); } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

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
      userId,
      type: "deposit",
      amountEtb,
      provider,
      note: "Wallet top up",
    })
    .returning();

  const [totals] = await db
    .select({ balance: sql<string>`coalesce(sum(${walletTransactions.amountEtb}), 0)` })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId));

  return NextResponse.json({ transaction, balanceEtb: Number(totals?.balance ?? 0) }, { status: 201 });
}
