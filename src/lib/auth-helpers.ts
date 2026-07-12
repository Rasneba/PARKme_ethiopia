import { getCurrentUser } from "@/lib/auth";

export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user.id;
}

export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
