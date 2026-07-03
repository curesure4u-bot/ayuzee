import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const adminRoutes = (
  <>
    <Route path="/admin" element={withSuspense(<P.AdminLayout />)}>
      <Route index element={withSuspense(<P.AdminDashboard />)} />
      <Route path="dashboard" element={withSuspense(<P.SuperAdminDashboard />)} />
      <Route path="admins" element={withSuspense(<P.AdminManagement />)} />
      <Route path="users" element={withSuspense(<P.AdminUsersV2 />)} />
      <Route path="users-legacy" element={withSuspense(<P.AdminUsers />)} />
      <Route path="doctors" element={withSuspense(<P.AdminDoctors />)} />
      <Route path="students" element={withSuspense(<P.AdminStudents />)} />
      <Route path="appointments" element={withSuspense(<P.AdminAppointments />)} />
      <Route path="sessions" element={withSuspense(<P.AdminSessions />)} />
      <Route path="orders" element={withSuspense(<P.AdminOrders />)} />
      <Route path="prescriptions" element={withSuspense(<P.AdminPrescriptions />)} />
      <Route path="products" element={withSuspense(<P.AdminProducts />)} />
      <Route path="products/approvals" element={withSuspense(<P.ProductApprovals />)} />
      <Route path="manufacturers/approvals" element={withSuspense(<P.ManufacturerApprovals />)} />
      <Route path="commissions" element={withSuspense(<P.AdminCommissions />)} />
      <Route path="commission-rules" element={withSuspense(<P.CommissionRules />)} />
      <Route path="blogs" element={withSuspense(<P.AdminBlogs />)} />
      <Route path="notifications" element={withSuspense(<P.AdminNotifications />)} />
      <Route path="payments" element={withSuspense(<P.AdminPayments />)} />
      <Route path="payouts" element={withSuspense(<P.AdminPayouts />)} />
      <Route path="reports" element={withSuspense(<P.AdminReports />)} />
      <Route path="safety" element={withSuspense(<P.AdminSafety />)} />
      <Route path="settings" element={withSuspense(<P.AdminSettings />)} />
      <Route path="astg-management" element={withSuspense(<P.ASTGManagement />)} />
      <Route path="formulary-analytics" element={withSuspense(<P.AdminFormularyAnalytics />)} />
      <Route path="afi-management" element={withSuspense(<P.AdminAfiManagement />)} />
      <Route path="team" element={withSuspense(<P.AdminTeam />)} />
      <Route path="gamification" element={withSuspense(<P.AdminGamification />)} />
      <Route path="therapies" element={withSuspense(<P.AdminTherapies />)} />
      <Route path="learning" element={withSuspense(<P.AdminLearning />)} />
      <Route path="health-conditions" element={withSuspense(<P.AdminHealthConditions />)} />
      <Route path="treatment-systems" element={withSuspense(<P.AdminTreatmentSystems />)} />
      <Route path="condition-leads" element={withSuspense(<P.AdminConditionLeads />)} />
      <Route path="therapists" element={withSuspense(<P.AdminTherapists />)} />
      <Route path="venues" element={withSuspense(<P.AdminVenues />)} />
      <Route path="therapy-sessions" element={withSuspense(<P.AdminSessions />)} />
      <Route path="revenue-split" element={withSuspense(<P.AdminRevenueSplit />)} />
      <Route path="jobs" element={withSuspense(<P.AdminJobs />)} />
      <Route path="atmri-help" element={withSuspense(<P.AdminAtmriHelp />)} />
      <Route path="roadmap" element={withSuspense(<P.AdminRoadmap />)} />
      <Route path="essential-drugs" element={withSuspense(<P.AdminEssentialDrugs />)} />
      <Route path="essential-siddha-drugs" element={withSuspense(<P.AdminEssentialSiddhaDrugs />)} />
      <Route path="essential-unani-drugs" element={withSuspense(<P.AdminEssentialUnaniDrugs />)} />
      <Route path="essential-homeopathy-drugs" element={withSuspense(<P.AdminEssentialHomeopathyDrugs />)} />
      <Route path="backlinks" element={withSuspense(<P.AdminBacklinks />)} />
      <Route path="hms-access" element={withSuspense(<P.AdminHmsAccess />)} />
      <Route path="master-management" element={withSuspense(<P.AdminMasterManagement />)} />
      <Route path="master-management/trusted-ip" element={withSuspense(<P.TrustedIpMaster />)} />
      <Route path="master-management/labels" element={withSuspense(<P.LabelMaster />)} />
      <Route path="master-management/packages" element={withSuspense(<P.PackageMaster />)} />
      <Route path="master-management/departments" element={withSuspense(<P.DepartmentMaster />)} />
      <Route path="master-management/suggestions" element={withSuspense(<P.SuggestionMaster />)} />
      <Route path="master-management/forms" element={withSuspense(<P.FormMaster />)} />
      <Route path="master-management/stores" element={withSuspense(<P.StoreMaster />)} />
      <Route path="master-management/rate-plans" element={withSuspense(<P.RatePlanMaster />)} />
      <Route path="master-management/tax" element={withSuspense(<P.TaxMaster />)} />
      <Route path="master-management/billing" element={withSuspense(<P.BillingMaster />)} />
      <Route path="master-management/settlement" element={withSuspense(<P.SettlementMaster />)} />
      <Route path="master-management/insurance" element={withSuspense(<P.InsuranceMaster />)} />
      <Route path="master-management/wards" element={withSuspense(<P.WardMaster />)} />
      <Route path="master-management/ip-admission-types" element={withSuspense(<P.IpAdmissionMaster />)} />
      <Route path="master-management/areas" element={withSuspense(<P.AreaMaster />)} />
      <Route path="master-management/templates" element={withSuspense(<P.TemplateMaster />)} />
      <Route path="master-management/whatsapp-templates" element={withSuspense(<P.WhatsAppMaster />)} />
      <Route path="master-management/email-templates" element={withSuspense(<P.EmailMaster />)} />
      <Route path="master-management/reports-config" element={withSuspense(<P.ReportMaster />)} />
      <Route path="master-management/token-display" element={withSuspense(<P.TokenDisplayMaster />)} />
      <Route path="master-management/currency" element={withSuspense(<P.CurrencyMaster />)} />
      <Route path="master-management/patient-config" element={withSuspense(<P.PatientMaster />)} />
      <Route path="pharmacy-orders" element={withSuspense(<P.AdminPlaceholder title="⚡ HMS Tools Ultra — Pharmacy Orders" description="Central pharmacy order routing." />)} />
      <Route path="ip-admissions" element={withSuspense(<P.AdminPlaceholder title="⚡ HMS Tools Ultra — IP Admissions" />)} />
      <Route path="ward-status" element={withSuspense(<P.WardMaster />)} />
    </Route>
  </>
);
