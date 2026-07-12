import { setBlockedDate } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      spotId?: string;
      date?: string;
      blocked?: boolean;
      reason?: string;
      priceMultiplier?: number;
      hostId?: string;
    };

    if (!body.spotId || !body.date) {
      return Response.json({ ok: false, error: "spotId and date are required" }, { status: 400 });
    }

    const result = await setBlockedDate({
      spotId: body.spotId,
      date: body.date,
      blocked: body.blocked ?? true,
      reason: body.reason,
      priceMultiplier: body.priceMultiplier,
      hostId: body.hostId,
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
