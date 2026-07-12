import { createBooking, DEMO_USER_ID, listBookings } from "@/lib/arkride-backend";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookings = await listBookings(searchParams.get("userId") ?? DEMO_USER_ID);
    return Response.json({ ok: true, bookings });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      spotId?: string;
      startsAt?: string;
      durationHours?: number;
      paymentMethod?: "wallet" | "telebirr";
      couponCode?: string;
    };

    if (!body.spotId) {
      return Response.json({ ok: false, error: "spotId is required" }, { status: 400 });
    }

    const result = await createBooking({
      userId: body.userId,
      spotId: body.spotId,
      startsAt: body.startsAt,
      durationHours: body.durationHours ?? 1,
      paymentMethod: body.paymentMethod === "telebirr" ? "telebirr" : "wallet",
      couponCode: body.couponCode,
    });

    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
