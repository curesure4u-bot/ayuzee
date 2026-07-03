import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/homeo";
import { withSuspense } from "@/routes/routeUtils";

export const homeoRoutes = (
  <>
    <Route path="/homeo" element={withSuspense(<P.HomeoLayout />)}>
      <Route index element={withSuspense(<P.HomeoDashboard />)} />
      <Route path="patients/new" element={withSuspense(<P.HomeoNewPatient />)} />
      <Route path="case-taking" element={withSuspense(<P.HomeoCaseTaking />)} />
      <Route path="case-form" element={withSuspense(<P.HomeoCaseTakingForm />)} />
      <Route path="repertory" element={withSuspense(<P.HomeoRepertory />)} />
      <Route path="repertorisation" element={withSuspense(<P.HomeoRepertorisationEngine />)} />
      <Route path="saved-cases" element={withSuspense(<P.HomeoSavedCases />)} />
      <Route path="materia-medica" element={withSuspense(<P.HomeoMateriaMedica />)} />
      <Route path="materia-medica/compare" element={withSuspense(<P.HomeoRemedyCompare />)} />
      <Route path="materia-medica/:id" element={withSuspense(<P.HomeoRemedyDetail />)} />
      <Route path="prescription" element={withSuspense(<P.HomeoPrescription />)} />
      <Route path="follow-up" element={withSuspense(<P.HomeoFollowUp />)} />
      <Route path="reports" element={withSuspense(<P.HomeoReports />)} />
      <Route path="mind" element={withSuspense(<P.MindDashboard />)} />
      <Route path="mind/new" element={withSuspense(<P.MindNewCase />)} />
      <Route path="mind/cases" element={withSuspense(<P.MindCasesList />)} />
      <Route path="mind/cases/:id" element={withSuspense(<P.MindCaseDetail />)} />
      <Route path="mind/cases/:id/followup" element={withSuspense(<P.MindFollowUp />)} />
      <Route path="mind/followups" element={withSuspense(<P.MindFollowUpsList />)} />
      <Route path="mind/reports" element={withSuspense(<P.MindReports />)} />
      <Route path="emotional" element={withSuspense(<P.EmotionalEngine />)} />
      <Route path="emotional/admin" element={withSuspense(<P.EmotionalAdmin />)} />
    </Route>
  </>
);
