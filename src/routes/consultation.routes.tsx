import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const consultationRoutes = (
  <>
    <Route path="/consultation/:id/pre-form" element={withSuspense(<P.PreConsultationForm />)} />
    <Route path="/consultation/:id/room" element={withSuspense(<P.ConsultationRoom />)} />
    <Route path="/consultation/:id/post-feedback" element={withSuspense(<P.PostConsultationFeedback />)} />
    <Route path="/consultation/:id/summary" element={withSuspense(<P.ConsultationSummary />)} />
  </>
);
