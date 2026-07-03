import type { ReactNode } from "react";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import type { FeatureKey } from "@/lib/features";

export const FeatureGate = ({
  flag,
  children,
  fallback = null,
}: {
  flag: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const { isEnabled, ready } = useFeatureFlags();
  if (!ready) return null;
  return isEnabled(flag) ? children : fallback;
};
