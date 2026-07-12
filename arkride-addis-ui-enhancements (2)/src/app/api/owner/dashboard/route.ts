import { DEMO_USER_ID, getOwnerDashboard } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerDashboard = await getOwnerDashboard(searchParams.get("hostId") ?? DEMO_USER_ID);
    return Response.json({ ok: true, ownerDashboard });
  } catch (error) {
    return jsonError(error);
  }
}
