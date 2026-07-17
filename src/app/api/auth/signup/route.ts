import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth";
import { v4 as uuid } from "uuid";
import { sessions } from "@/db/schema";
import { SESSION_DURATION_MS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const role = body?.role === "host" ? "host" : "driver";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = hashSync(password, 10);
    const isHost = role === "host";
    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash, isHost, role })
      .returning({ id: users.id, email: users.email, name: users.name, isHost: users.isHost, role: users.role });

    const token = uuid();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await db.insert(sessions).values({ userId: user.id, token, expiresAt });

    const cookie = createSessionCookie(token);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, isHost: user.isHost, role: user.role } }, { status: 201 });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
