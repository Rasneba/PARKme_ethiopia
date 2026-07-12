import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, vehicles } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: "driver" | "host" | "both";
    };

    const fullName = (body.fullName ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const phone = (body.phone ?? "").trim();
    const password = (body.password ?? "").trim();
    const role = body.role === "host" ? "host" : body.role === "both" ? "host" : "rider";

    // Validation
    const errors: string[] = [];
    if (!fullName || fullName.length < 2) errors.push("Full name is required (minimum 2 characters)");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email address is required");
    if (!phone || phone.length < 9) errors.push("A valid phone number is required");
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters");

    if (errors.length > 0) {
      return Response.json({ ok: false, error: errors.join(". ") }, { status: 400 });
    }

    // Check for existing user
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return Response.json({ ok: false, error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }

    const userId = randomUUID();
    const now = new Date();

    // Insert user
    await db.insert(users).values({
      id: userId,
      name: fullName,
      email,
      role,
      walletBalanceEtb: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Add a default vehicle for the user
    await db.insert(vehicles).values({
      id: randomUUID(),
      userId,
      nickname: "My Vehicle",
      plateNumber: phone.slice(-6).toUpperCase() || "AA-0000",
      color: "white",
      isDefault: true,
      createdAt: now,
    });

    const initials = fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return Response.json(
      {
        ok: true,
        user: {
          id: userId,
          name: fullName,
          email,
          phone,
          role,
          initials,
          walletBalanceEtb: 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("Prakme registration error:", error);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
