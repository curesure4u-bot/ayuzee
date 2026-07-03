import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/atmri";
import { withSuspense } from "@/routes/routeUtils";
import { FeatureRoute } from "@/components/common/FeatureRoute";
import { FEATURES } from "@/lib/features";

const atmriHelpRoutes = (
  <>
    <Route path="/atmri-help" element={withSuspense(<P.AtmriHelp />)} />
    <Route path="/atmri-help/cases" element={withSuspense(<P.AtmriCasesList />)} />
    <Route path="/atmri-help/cases/:id" element={withSuspense(<P.AtmriCaseDetail />)} />
    <Route path="/atmri-help/apply" element={withSuspense(<P.AtmriApply />)} />
    <Route path="/atmri-help/pledge" element={withSuspense(<P.AtmriDoctorPledge />)} />
    <Route path="/atmri-help/hospitals" element={withSuspense(<P.AtmriPartnerHospitals />)} />
    <FeatureRoute
      flag={FEATURES.ATMRI_CAMPAIGNS}
      path="/atmri-help/campaigns"
      element={withSuspense(<P.AtmriComingSoon title="Active Campaigns" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_CSR}
      path="/atmri-help/csr"
      element={withSuspense(<P.AtmriComingSoon title="CSR Partnerships" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_IMPACT}
      path="/atmri-help/impact"
      element={withSuspense(<P.AtmriComingSoon title="Impact Dashboard" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_LEADERBOARD}
      path="/atmri-help/leaderboard"
      element={withSuspense(<P.AtmriComingSoon title="Doctor Leaderboard" />)}
    />
  </>
);

const ayushHelpRoutes = (
  <>
    <Route path="/ayush-help" element={withSuspense(<P.AtmriHelp />)} />
    <Route path="/ayush-help/cases" element={withSuspense(<P.AtmriCasesList />)} />
    <Route path="/ayush-help/cases/:id" element={withSuspense(<P.AtmriCaseDetail />)} />
    <Route path="/ayush-help/apply" element={withSuspense(<P.AtmriApply />)} />
    <Route path="/ayush-help/pledge" element={withSuspense(<P.AtmriDoctorPledge />)} />
    <Route path="/ayush-help/hospitals" element={withSuspense(<P.AtmriPartnerHospitals />)} />
    <FeatureRoute
      flag={FEATURES.ATMRI_CAMPAIGNS}
      path="/ayush-help/campaigns"
      element={withSuspense(<P.AtmriComingSoon title="Active Campaigns" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_CSR}
      path="/ayush-help/csr"
      element={withSuspense(<P.AtmriComingSoon title="CSR Partnerships" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_IMPACT}
      path="/ayush-help/impact"
      element={withSuspense(<P.AtmriComingSoon title="Impact Dashboard" />)}
    />
    <FeatureRoute
      flag={FEATURES.ATMRI_LEADERBOARD}
      path="/ayush-help/leaderboard"
      element={withSuspense(<P.AtmriComingSoon title="Doctor Leaderboard" />)}
    />
  </>
);

export const atmriRoutes = (
  <>
    {atmriHelpRoutes}
    {ayushHelpRoutes}
  </>
);
