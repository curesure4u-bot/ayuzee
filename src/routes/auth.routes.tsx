import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const authRoutes = (
  <>
    <Route path="/login" element={withSuspense(<P.LoginPicker />)} />
    <Route path="/auth" element={withSuspense(<P.Auth />)} />
    <Route path="/reset-password" element={withSuspense(<P.ResetPassword />)} />
    <Route path="/provider/auth" element={withSuspense(<P.ProviderAuth />)} />
    <Route path="/provider" element={withSuspense(<P.ProviderHome />)} />
    <Route path="/student/auth" element={withSuspense(<P.StudentAuth />)} />
    <Route path="/therapist/auth" element={withSuspense(<P.TherapistAuth />)} />
    <Route path="/venue/auth" element={withSuspense(<P.VenueAuth />)} />
    <Route path="/admin/auth" element={withSuspense(<P.AdminAuth />)} />
    <Route path="/doctor/auth" element={withSuspense(<P.DoctorAuth />)} />
  </>
);
