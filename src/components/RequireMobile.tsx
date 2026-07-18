import { headers } from "next/headers";
import Link from "next/link";

export const MOBILE_UA_RE = /android|iphone|ipad|ipod|mobile|opera mini|iemobile|blackberry|windows phone/i;

export function isMobileUserAgent(ua: string): boolean {
  return MOBILE_UA_RE.test(ua);
}

export function MobileOnlyNotice() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 24px",
        background: "linear-gradient(160deg, #0a100c 0%, #086a32 100%)",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: "rgba(255,255,255,.12)",
          display: "grid",
          placeItems: "center",
          marginBottom: 22,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.3px" }}>Parkme is mobile only</h1>
      <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.85, maxWidth: 340, marginBottom: 8 }}>
        This app is built for phones. Open Parkme on your Android or iPhone to park, book, and guide drivers.
      </p>
      <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 340, marginBottom: 26 }}>
        On a computer? Visit our landing page to learn more.
      </p>
      <Link
        href="/"
        style={{
          padding: "13px 26px",
          borderRadius: 12,
          background: "#fff",
          color: "#086a32",
          fontWeight: 700,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        Go to landing page
      </Link>
    </main>
  );
}

export async function RequireMobile({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const ua = h.get("user-agent") || "";
  if (!isMobileUserAgent(ua)) return <MobileOnlyNotice />;
  return <>{children}</>;
}
