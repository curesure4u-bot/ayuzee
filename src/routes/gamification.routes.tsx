import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const gamificationRoutes = (
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
