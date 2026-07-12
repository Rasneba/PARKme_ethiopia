import { DEMO_USER_ID, depositWallet, getDemoUser, listWalletTransactions } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? DEMO_USER_ID;
    const [user, walletTransactions] = await Promise.all([getDemoUser(userId), listWalletTransactions(userId)]);
    return Response.json({ ok: true, user, walletTransactions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string; amountEtb?: number; method?: string };
    const result = await depositWallet({
      userId: body.userId,
      amountEtb: Number(body.amountEtb),
      method: body.method ?? "telebirr",
    });

    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
