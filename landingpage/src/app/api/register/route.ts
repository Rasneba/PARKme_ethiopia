import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return err("Invalid request body.");

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "host" ? "host" : "driver";

  if (!fullName || fullName.length < 2) return err("Please enter your full name.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Please enter a valid email address.");
  if (!phone || phone.length < 9) return err("Please enter a valid phone number.");
  if (!password || password.length < 6) return err("Password must be at least 6 characters.");

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return err("An account with this email already exists. Try signing in instead.", 409);

  const [user] = await db
    .insert(users)
    .values({ fullName, email, phone, password, role })
    .returning({ id: users.id, fullName: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt });

  return NextResponse.json({ user }, { status: 201 });
}

export async function GET() {
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      city: users.city,
      createdAt: users.createdAt,
    })
    .from(users)
    .limit(100);

  return NextResponse.json({ users: rows, count: rows.length });
}
