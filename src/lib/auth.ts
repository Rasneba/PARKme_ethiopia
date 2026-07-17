import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_COOKIE = "parkme_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [session] = await db
    .select({
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      isHost: users.isHost,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export function createSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    },
  };
}

export function deleteSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

export { SESSION_DURATION_MS };
