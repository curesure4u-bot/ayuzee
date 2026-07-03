import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const doctorRoutes = (
  <>
    <Route path="/doctor" element={withSuspense(<P.DoctorLayout />)}>
      <Route index element={withSuspense(<P.DoctorHome />)} />
      <Route path="profile" element={withSuspense(<P.DoctorProfile />)} />
      <Route path="appointments" element={withSuspense(<P.PatientAppointments />)} />
      <Route path="patients" element={withSuspense(<P.MyPatients />)} />
      <Route path="feedback" element={withSuspense(<P.PatientFeedback />)} />
      <Route path="patient-orders" element={withSuspense(<P.PatientOrders />)} />
      <Route path="orders" element={withSuspense(<P.DoctorOrders />)} />
      <Route path="medicines" element={withSuspense(<P.DoctorMedicines />)} />
      <Route path="saved" element={withSuspense(<P.DoctorSavedPosts />)} />
      <Route path="feed" element={withSuspense(<P.DoctorFeed />)} />
      <Route path="blogs" element={withSuspense(<P.DoctorBlogs />)} />
      <Route path="ayuzee-money" element={withSuspense(<P.AyuzeeMoney />)} />
      <Route path="addresses" element={withSuspense(<P.DoctorAddresses />)} />
      <Route path="bank" element={withSuspense(<P.DoctorBank />)} />
      <Route path="rewards" element={withSuspense(<P.DoctorRewards />)} />
      <Route path="clinic" element={withSuspense(<P.DoctorClinic />)} />
      <Route path="category" element={withSuspense(<P.DoctorCategory />)} />
      <Route path="company" element={withSuspense(<P.DoctorCompany />)} />
      <Route path="payouts" element={withSuspense(<P.DoctorPayouts />)} />
      <Route path="about-partner" element={withSuspense(<P.AboutAyuzeePartner />)} />
      <Route path="support" element={withSuspense(<P.DoctorSupport />)} />
      <Route path="astg-reference" element={withSuspense(<P.ASTGReference />)} />
      <Route path="astg-reference/:categoryKey/:diseaseKey" element={withSuspense(<P.ASTGDiseaseDetail />)} />
      <Route path="astg-bookmarks" element={withSuspense(<P.ASTGBookmarks />)} />
      <Route path="formulary" element={withSuspense(<P.ClassicalFormulary />)} />
      <Route path="formulary/ingredients" element={withSuspense(<P.IngredientEncyclopedia />)} />
      <Route path="formulary/prescription/:id" element={withSuspense(<P.FormularyPrescription />)} />
      <Route path="afi-formulary" element={withSuspense(<P.AfiFormulary />)} />
      <Route path="afi-formulary/disease-index" element={withSuspense(<P.AfiDiseaseIndex />)} />
      <Route path="afi-formulary/ingredient/:botanical" element={withSuspense(<P.AfiIngredientFormulations />)} />
      <Route path="afi-formulary/:id" element={withSuspense(<P.AfiFormulaDetail />)} />
    </Route>
  </>
);
