import { Suspense } from "react";
import { RequireMobile } from "@/components/RequireMobile";
import ParkmeApp from "@/components/ArkRideApp";

export const dynamic = "force-dynamic";

export default function AppPage() {
  return (
    <RequireMobile>
      <Suspense fallback={null}>
        <ParkmeApp />
      </Suspense>
    </RequireMobile>
  );
}
