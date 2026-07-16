import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";

export async function POST() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const [updated] = await db
    .update(users)
    .set({ isHost: true })
    .where(eq(users.id, userId))
    .returning({ isHost: users.isHost });

  if (!updated) {
    return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
  }

  return NextResponse.json({ isHost: true });
}
