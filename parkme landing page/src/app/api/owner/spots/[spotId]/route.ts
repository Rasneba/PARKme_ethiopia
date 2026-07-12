import { updateSpotPrice } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ spotId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { spotId } = await context.params;
    const body = (await request.json()) as { pricePerHourEtb?: number; hostId?: string };
    const result = await updateSpotPrice({
      spotId,
      hostId: body.hostId,
      pricePerHourEtb: Number(body.pricePerHourEtb),
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
