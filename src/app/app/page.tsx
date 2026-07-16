import { Suspense } from "react";
import ParkmeApp from "@/components/ArkRideApp";

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <ParkmeApp />
    </Suspense>
  );
}
