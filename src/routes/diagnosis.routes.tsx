import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/diagnosis";
import { withSuspense } from "@/routes/routeUtils";
import { FeatureRoute } from "@/components/common/FeatureRoute";
import { FEATURES } from "@/lib/features";

export const diagnosisRoutes = (
  <>
    <Route path="/diagnosis" element={withSuspense(<P.Diagnosis />)} />
    <FeatureRoute
      flag={FEATURES.SYMPTOM_CHECKER}
      path="/diagnosis/symptoms"
      element={withSuspense(<P.SymptomChecker />)}
    />
    <Route path="/diagnosis/prakriti" element={withSuspense(<P.PrakritiIntro />)} />
    <Route path="/diagnosis/prakriti/run" element={withSuspense(<P.PrakritiRun />)} />
    <Route path="/diagnosis/prakriti/result/:id" element={withSuspense(<P.PrakritiResult />)} />
    <Route path="/diagnosis/:slug" element={withSuspense(<P.AssessmentIntro />)} />
    <Route path="/diagnosis/:slug/run" element={withSuspense(<P.AssessmentRun />)} />
    <Route path="/diagnosis/:slug/result" element={withSuspense(<P.AssessmentResult />)} />
  </>
);
