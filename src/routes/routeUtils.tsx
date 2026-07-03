import { type ReactNode, Suspense } from "react";
import { RouteFallback } from "@/components/common/PageLoader";

export const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);
