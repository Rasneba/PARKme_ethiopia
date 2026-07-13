import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";

export const dynamic = "force-dynamic";

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return err("Invalid request body.");

    const name = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length < 2) return err("Please enter your full name.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Please enter a valid email address.");
    if (!phone || phone.length < 9) return err("Please enter a valid phone number.");
    if (!password || password.length < 6) return err("Password must be at least 6 characters.");

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) return err("An account with this email already exists. Try signing in instead.", 409);

    const passwordHash = hashSync(password, 10);

    const [user] = await db
      .insert(users)
      .values({ name, email, phone, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt });

    return NextResponse.json({ user: { ...user, fullName: user.name, role: "driver" } }, { status: 201 });
  } catch {
    return err("Internal server error. Please try again.", 500);
  }
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(100);

    return NextResponse.json({ users: rows, count: rows.length });
  } catch {
    return err("Internal server error.", 500);
  }
}
