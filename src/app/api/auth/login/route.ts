import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, SESSION_DURATION_MS } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role === "host" ? "host" : "driver";

    if (!email || !password) {
      return NextResponse.json({ error: "Enter email and password." }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, passwordHash: users.passwordHash, isHost: users.isHost })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (role === "host" && !user.isHost) {
      return NextResponse.json({ error: "This account is not a host account. Please sign up as a host first." }, { status: 403 });
    }

    const token = uuid();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await db.insert(sessions).values({ userId: user.id, token, expiresAt });

    const cookie = createSessionCookie(token);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, isHost: user.isHost } });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
