"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ParkmeLanding from "@/components/ParkmeLanding";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((u) => { if (u) router.replace("/app"); else setChecking(false); })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) return null;

  return <ParkmeLanding />;
}
