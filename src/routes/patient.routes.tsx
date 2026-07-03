import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const patientRoutes = (
  <>
    <Route path="/dashboard" element={withSuspense(<P.PatientLayout />)}>
      <Route index element={withSuspense(<P.Dashboard />)} />
      <Route path="profile" element={withSuspense(<P.PatientProfile />)} />
      <Route path="appointments" element={withSuspense(<P.PatientAppointmentsList />)} />
      <Route path="saved-medicines" element={withSuspense(<P.PatientSavedMedicines />)} />
      <Route path="saved-posts" element={withSuspense(<P.PatientSavedPosts />)} />
      <Route path="orders" element={withSuspense(<P.MyOrders />)} />
      <Route path="addresses" element={withSuspense(<P.PatientAddresses />)} />
      <Route path="wallet" element={withSuspense(<P.PatientWallet />)} />
      <Route path="bank" element={withSuspense(<P.PatientBank />)} />
      <Route path="help" element={withSuspense(<P.PatientHelp />)} />
      <Route path="guidance" element={withSuspense(<P.PatientGuidance />)} />
    </Route>
  </>
);
