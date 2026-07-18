"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Route error:", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 14, background: "#f4f6f4" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#0fa24b,#086a32)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22 }}>P</div>
      <h1 style={{ fontSize: 18, margin: 0 }}>This screen couldn’t load</h1>
      <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 300, margin: 0 }}>{error?.message || "An unexpected error occurred."}</p>
      <button onClick={() => reset()} style={{ padding: "11px 22px", borderRadius: 11, border: "none", background: "#0fa24b", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Reload</button>
    </main>
  );
}
