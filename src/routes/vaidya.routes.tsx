import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const vaidyaRoutes = (
  <>
    <Route path="/vaidya" element={withSuspense(<P.VaidyaLayout />)}>
      <Route index element={withSuspense(<P.VaidyaHome />)} />
      <Route path="hms" element={withSuspense(<P.HmsUltraDashboard />)} />
      <Route path="patients" element={withSuspense(<P.AllPatients />)} />
      <Route path="consultations" element={withSuspense(<P.Consultations />)} />
      <Route path="follow-up" element={withSuspense(<P.FollowUps />)} />
      <Route path="guidance" element={withSuspense(<P.VaidyaGuidance />)} />
      <Route path="upcoming" element={withSuspense(<P.UpcomingAppointments />)} />
      <Route path="leads" element={withSuspense(<P.Leads />)} />
      <Route path="inventory" element={withSuspense(<P.Inventory />)} />
      <Route path="bills" element={withSuspense(<P.BillsPage type="patient_bill" />)} />
      <Route path="direct-selling" element={withSuspense(<P.BillsPage type="direct_selling" />)} />
      <Route path="network" element={withSuspense(<P.PartnerNetwork />)} />
      <Route path="therapy-plans" element={withSuspense(<P.TherapyPlans />)} />
      <Route path="therapy-catalog" element={withSuspense(<P.TherapyCatalog />)} />
      <Route path="prakriti" element={withSuspense(<P.HmsPrakriti />)} />
      <Route path="developer" element={withSuspense(<P.DeveloperApi />)} />
      <Route path="reception" element={withSuspense(<P.Reception />)} />
      <Route path="patients/:source/:id" element={withSuspense(<P.VaidyaPatientProfile />)} />
      <Route path="analytics" element={withSuspense(<P.VaidyaAnalytics />)} />
      <Route path="mis" element={withSuspense(<P.MisReports />)} />
      <Route path="mis/drill/:type/:id" element={withSuspense(<P.MisDrillDown />)} />
      <Route path="ashtavidha" element={withSuspense(<P.Ashtavidha />)} />
      <Route path="panchakarma" element={withSuspense(<P.Panchakarma />)} />
      <Route path="posture" element={withSuspense(<P.PosturePage />)} />
      <Route path="hijama" element={withSuspense(<P.HijamaPage />)} />
      <Route path="parasurgical" element={withSuspense(<P.ParaSurgicalDashboard />)} />
      <Route path="parasurgical/new" element={withSuspense(<P.ParaSurgicalNewCase />)} />
      <Route path="parasurgical/:id" element={withSuspense(<P.ParaSurgicalCaseDetail />)} />
      <Route path="ayurveda-prescription" element={withSuspense(<P.AyurvedaPrescription />)} />
      <Route path="siddha-prescription" element={withSuspense(<P.SiddhaPrescription />)} />
      <Route path="unani-prescription" element={withSuspense(<P.UnaniPrescription />)} />
      <Route path="homeopathy-prescription" element={withSuspense(<P.HomeopathyPrescription />)} />
      <Route path="yoga" element={withSuspense(<P.YogaLayout />)}>
        <Route index element={withSuspense(<P.YogaDashboard />)} />
        <Route path="assessment/new" element={withSuspense(<P.YogaAssessmentForm />)} />
        <Route path="plans" element={withSuspense(<P.YogaPlansList />)} />
        <Route path="plans/new" element={withSuspense(<P.YogaPlanNew />)} />
        <Route path="plans/:id" element={withSuspense(<P.YogaPlanDetail />)} />
        <Route path="protocols" element={withSuspense(<P.YogaProtocolsList />)} />
        <Route path="progress" element={withSuspense(<P.YogaProgressTracker />)} />
        <Route path="notes" element={withSuspense(<P.YogaDashboard />)} />
      </Route>
    </Route>
  </>
);
