import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("parkme_session")?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  const cookie = deleteSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
