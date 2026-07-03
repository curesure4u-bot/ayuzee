import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/gamification";
import { withSuspense } from "@/routes/routeUtils";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { FEATURES } from "@/lib/features";

export function useGamificationRoutes() {
  const { isEnabled, ready } = useFeatureFlags();
  if (!ready || !isEnabled(FEATURES.GAMIFICATION_PORTAL)) return null;

  return (
    <>
      <Route path="/gamification/certificates/:id" element={withSuspense(<P.CertificateView />)} />
      <Route path="/gamification" element={withSuspense(<P.GamificationLayout />)}>
        <Route index element={withSuspense(<P.GamificationDashboard />)} />
        <Route path="points" element={withSuspense(<P.MyPoints />)} />
        <Route path="badges" element={withSuspense(<P.MyBadges />)} />
        <Route path="certificates" element={withSuspense(<P.MyCertificates />)} />
        <Route path="challenges" element={withSuspense(<P.Challenges />)} />
        <Route path="leaderboard" element={withSuspense(<P.Leaderboard />)} />
        <Route path="wall" element={withSuspense(<P.AppreciationWall />)} />
        <Route path="rewards" element={withSuspense(<P.GamRewards />)} />
      </Route>
    </>
  );
}
