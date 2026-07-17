"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FindPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/app"); }, [router]);
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "Arial,sans-serif", color: "#888" }}>
      <p>Redirecting to app...</p>
    </main>
  );
}
