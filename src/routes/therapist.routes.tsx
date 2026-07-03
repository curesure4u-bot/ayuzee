import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const therapistRoutes = (
  <>
    <Route path="/therapist" element={withSuspense(<P.TherapistLayout />)}>
      <Route index element={withSuspense(<P.TherapistDashboard />)} />
      <Route path="sessions" element={withSuspense(<P.TherapistSessions />)} />
      <Route path="availability" element={withSuspense(<P.TherapistAvailability />)} />
      <Route path="earnings" element={withSuspense(<P.TherapistEarnings />)} />
      <Route path="profile" element={withSuspense(<P.TherapistProfile />)} />
      <Route path="support" element={withSuspense(<P.TherapistSupport />)} />
    </Route>
  </>
);
