import { Route, type RouteProps } from "react-router-dom";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import type { FeatureKey } from "@/lib/features";

type FeatureRouteProps = RouteProps & {
  flag: FeatureKey;
};

/** Registers a route only when the feature flag is enabled. */
export const FeatureRoute = ({ flag, ...routeProps }: FeatureRouteProps) => {
  const { isEnabled, ready } = useFeatureFlags();
  if (!ready || !isEnabled(flag)) return null;
  return <Route {...routeProps} />;
};
