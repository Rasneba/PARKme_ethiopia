import { headers } from "next/headers";
import { isMobileUserAgent, MobileOnlyNotice } from "@/components/RequireMobile";

export default async function MobileGateLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const ua = h.get("user-agent") || "";
  if (!isMobileUserAgent(ua)) return <MobileOnlyNotice />;
  return <>{children}</>;
}
