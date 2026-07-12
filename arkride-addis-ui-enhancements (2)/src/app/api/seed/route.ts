import { ensureDemoData, getArkRideBootstrap } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const seed = await ensureDemoData();
    const data = await getArkRideBootstrap();
    return Response.json({ ok: true, seed, data });
  } catch (error) {
    return jsonError(error);
  }
}
