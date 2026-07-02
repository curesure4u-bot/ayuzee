import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { RouteFallback } from "@/components/common/PageLoader";
import * as P from "@/routes/lazyPages";

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

export const AppRoutes = () => (
  <Routes>
<Route path="/" element={withSuspense(<P.Index />)} />
            <Route path="/about-us" element={withSuspense(<P.AboutUs />)} />
            <Route path="/contact" element={withSuspense(<P.Contact />)} />
            <Route path="/press" element={withSuspense(<P.Press />)} />
            <Route path="/refund-policy" element={withSuspense(<P.RefundPolicy />)} />
            <Route path="/privacy-policy" element={withSuspense(<P.PrivacyPolicy />)} />
            <Route path="/terms-of-use" element={withSuspense(<P.TermsOfUse />)} />
            <Route path="/careers" element={withSuspense(<P.Careers />)} />
            <Route path="/blog" element={withSuspense(<P.Blog />)} />
            <Route path="/login" element={withSuspense(<P.LoginPicker />)} />
            <Route path="/auth" element={withSuspense(<P.Auth />)} />
            <Route path="/reset-password" element={withSuspense(<P.ResetPassword />)} />
            <Route path="/provider/auth" element={withSuspense(<P.ProviderAuth />)} />
            <Route path="/provider" element={withSuspense(<P.ProviderHome />)} />
            <Route path="/student/auth" element={withSuspense(<P.StudentAuth />)} />
            <Route path="/student" element={withSuspense(<P.StudentLayout />)}>
              <Route index element={withSuspense(<P.StudentDashboard />)} />
              <Route path="dashboard" element={withSuspense(<P.StudentDashboard />)} />
              <Route path="courses" element={withSuspense(<P.StudentCourses />)} />
              <Route path="webinars" element={withSuspense(<P.StudentWebinars />)} />
              <Route path="jobs" element={withSuspense(<P.StudentJobs />)} />
              <Route path="research" element={withSuspense(<P.StudentResearch />)} />
              <Route path="certificates" element={withSuspense(<P.StudentCertificates />)} />
              <Route path="profile" element={withSuspense(<P.StudentProfilePage />)} />
            </Route>
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
            <Route path="/consultation/:id/pre-form" element={withSuspense(<P.PreConsultationForm />)} />
            <Route path="/consultation/:id/room" element={withSuspense(<P.ConsultationRoom />)} />
            <Route path="/consultation/:id/post-feedback" element={withSuspense(<P.PostConsultationFeedback />)} />
            <Route path="/consultation/:id/summary" element={withSuspense(<P.ConsultationSummary />)} />
            <Route path="/referral" element={withSuspense(<P.Referral />)} />
            <Route path="/doctors" element={withSuspense(<P.Doctors />)} />
            <Route path="/doctors/:id" element={withSuspense(<P.DoctorDetail />)} />
            <Route path="/clinics" element={withSuspense(<P.Clinics />)} />
            <Route path="/offers" element={withSuspense(<P.Offers />)} />
            <Route path="/search" element={withSuspense(<P.Search />)} />
            <Route path="/jobs" element={withSuspense(<P.Jobs />)} />
            <Route path="/colleges" element={withSuspense(<P.Colleges />)} />
            <Route path="/jobs/post" element={withSuspense(<P.JobPost />)} />
            <Route path="/shop" element={withSuspense(<P.Shop />)} />
            <Route path="/shop/conditions" element={withSuspense(<P.ShopByCondition />)} />
            <Route path="/shop/conditions/:slug" element={withSuspense(<P.ConditionProducts />)} />
            <Route path="/shop/panchakarma" element={withSuspense(<P.PanchakarmaShop />)} />
            <Route path="/shop/surgicals" element={withSuspense(<P.AyushSurgicals />)} />
            <Route path="/shop/track" element={withSuspense(<P.TrackOrder />)} />
            <Route path="/shop/prescription" element={withSuspense(<P.PrescriptionUpload />)} />
            <Route path="/shop/treatment-kits" element={withSuspense(<P.TreatmentKits />)} />
            <Route path="/shop/:id" element={withSuspense(<P.ProductDetail />)} />
            <Route path="/health-conditions" element={withSuspense(<P.HealthConditions />)} />
            <Route path="/health-conditions/:slug" element={withSuspense(<P.HealthConditionDetail />)} />
            <Route path="/treatments/acupuncture" element={withSuspense(<P.AcupunctureHub />)} />
            <Route path="/acupuncture" element={withSuspense(<P.AcupunctureHub />)} />
            <Route path="/treatments/tung-points" element={withSuspense(<P.TungPoints />)} />
            <Route path="/tung-points" element={withSuspense(<P.TungPoints />)} />
            <Route path="/treatments/acupuncture-300-diseases" element={withSuspense(<P.Acupuncture300Diseases />)} />
            <Route path="/treatments/acupuncture-50-diseases" element={withSuspense(<P.Acupuncture50Diseases />)} />
            <Route path="/treatments/acupuncture-homeopathy" element={withSuspense(<P.AcupunctureHomeopathy />)} />
            <Route path="/treatments/acupoints-uses" element={withSuspense(<P.AcupointsAndUses />)} />
            <Route path="/acupuncture/points" element={withSuspense(<P.AcupointsAndUses />)} />
            <Route path="/acupuncture/homeopathy" element={withSuspense(<P.AcupunctureHomeopathy />)} />
            <Route path="/acupuncture/50-diseases" element={withSuspense(<P.Acupuncture50Diseases />)} />
            <Route path="/acupuncture/300-diseases" element={withSuspense(<P.Acupuncture300Diseases />)} />
            <Route path="/treatments/:slug" element={withSuspense(<P.TreatmentSystem />)} />
            <Route path="/homeopathy" element={withSuspense(<P.HomeopathyHub />)} />
            <Route path="/homeopathy/repertory" element={withSuspense(<P.HomeopathyRepertory />)} />
            <Route path="/homeopathy/materia-medica" element={withSuspense(<P.MateriaMedica />)} />
            <Route path="/homeopathy/materia-medica/:abbreviation" element={withSuspense(<P.MateriaMedica />)} />
            <Route path="/homeopathy/cases" element={withSuspense(<P.HomeopathyCases />)} />
            <Route path="/homeopathy/case/new" element={withSuspense(<P.CaseTakingForm />)} />
            <Route path="/homeopathy/case/:id" element={withSuspense(<P.HomeopathyCases />)} />
            <Route path="/cart" element={withSuspense(<P.Cart />)} />
            <Route path="/checkout" element={withSuspense(<P.Checkout />)} />
            <Route path="/partner" element={withSuspense(<P.Partner />)} />
            <Route path="/partner/apply" element={withSuspense(<P.PartnerApply />)} />
            <Route path="/bulk" element={withSuspense(<P.Bulk />)} />
            <Route path="/therapies" element={withSuspense(<P.Therapies />)} />
            <Route path="/therapists" element={withSuspense(<P.Therapists />)} />
            <Route path="/therapists/:id" element={withSuspense(<P.TherapistDetail />)} />
            <Route path="/therapist/browse" element={withSuspense(<P.TherapistBrowse />)} />
            <Route path="/therapist/:id" element={withSuspense(<P.TherapistDetail />)} />
            <Route path="/therapist/auth" element={withSuspense(<P.TherapistAuth />)} />
            <Route path="/therapist" element={withSuspense(<P.TherapistLayout />)}>
              <Route index element={withSuspense(<P.TherapistDashboard />)} />
              <Route path="sessions" element={withSuspense(<P.TherapistSessions />)} />
              <Route path="availability" element={withSuspense(<P.TherapistAvailability />)} />
              <Route path="earnings" element={withSuspense(<P.TherapistEarnings />)} />
              <Route path="profile" element={withSuspense(<P.TherapistProfile />)} />
              <Route path="support" element={withSuspense(<P.TherapistSupport />)} />
            </Route>
            <Route path="/therapy-plans/:planId/book" element={withSuspense(<P.BookTherapySession />)} />
            <Route path="/therapy-booking/:sessionId" element={withSuspense(<P.TherapyBooking />)} />
            <Route path="/venue/browse" element={withSuspense(<P.VenueBrowse />)} />
            <Route path="/venue/auth" element={withSuspense(<P.VenueAuth />)} />
            <Route path="/venue" element={withSuspense(<P.VenueLayout />)}>
              <Route index element={withSuspense(<P.VenueDashboard />)} />
              <Route path="rooms" element={withSuspense(<P.VenueRooms />)} />
              <Route path="bookings" element={withSuspense(<P.VenueBookings />)} />
              <Route path="revenue" element={withSuspense(<P.VenueRevenue />)} />
              <Route path="profile" element={withSuspense(<P.VenueProfile />)} />
            </Route>
            <Route path="/admin/auth" element={withSuspense(<P.AdminAuth />)} />
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

            <Route path="/queue-display/:branchId" element={withSuspense(<P.QueueDisplayScreen />)} />


            <Route path="/diagnosis" element={withSuspense(<P.Diagnosis />)} />
            <Route path="/diagnosis/symptoms" element={withSuspense(<P.SymptomChecker />)} />
            <Route path="/diagnosis/prakriti" element={withSuspense(<P.PrakritiIntro />)} />
            <Route path="/diagnosis/prakriti/run" element={withSuspense(<P.PrakritiRun />)} />
            <Route path="/diagnosis/prakriti/result/:id" element={withSuspense(<P.PrakritiResult />)} />
            <Route path="/diagnosis/:slug" element={withSuspense(<P.AssessmentIntro />)} />
            <Route path="/diagnosis/:slug/run" element={withSuspense(<P.AssessmentRun />)} />
            <Route path="/diagnosis/:slug/result" element={withSuspense(<P.AssessmentResult />)} />
            <Route path="/feed" element={withSuspense(<P.Feed />)} />
            <Route path="/feed/:id" element={withSuspense(<P.FeedPost />)} />
            <Route path="/learning" element={withSuspense(<P.LearningLayout />)}>
              <Route index element={withSuspense(<P.Courses />)} />
              <Route path="courses" element={withSuspense(<P.Courses />)} />
              <Route path="webinars" element={withSuspense(<P.Webinars />)} />
              <Route path="quiz" element={withSuspense(<P.Quizzes />)} />
              <Route path="blogs" element={withSuspense(<P.Blogs />)} />
              <Route path="library" element={withSuspense(<P.Library />)} />
            </Route>
            <Route path="/library" element={withSuspense(<P.Library />)} />
            <Route path="/learning/courses/:slug" element={withSuspense(<P.CourseDetail />)} />
            <Route path="/learning/courses/:slug/quiz" element={withSuspense(<P.CourseQuiz />)} />
            <Route path="/learning/blogs/:slug" element={withSuspense(<P.BlogDetail />)} />
            <Route path="/learning/certificates/:id" element={withSuspense(<P.Certificate />)} />
            
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
            <Route path="/doctor/auth" element={withSuspense(<P.DoctorAuth />)} />
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
            <Route path="/atmri-help" element={withSuspense(<P.AtmriHelp />)} />
            <Route path="/atmri-help/cases" element={withSuspense(<P.AtmriCasesList />)} />
            <Route path="/atmri-help/cases/:id" element={withSuspense(<P.AtmriCaseDetail />)} />
            <Route path="/atmri-help/apply" element={withSuspense(<P.AtmriApply />)} />
            <Route path="/atmri-help/pledge" element={withSuspense(<P.AtmriDoctorPledge />)} />
            <Route path="/atmri-help/hospitals" element={withSuspense(<P.AtmriPartnerHospitals />)} />
            <Route path="/atmri-help/campaigns" element={withSuspense(<P.AtmriComingSoon title="Active Campaigns" />)} />
            <Route path="/atmri-help/csr" element={withSuspense(<P.AtmriComingSoon title="CSR Partnerships" />)} />
            <Route path="/atmri-help/impact" element={withSuspense(<P.AtmriComingSoon title="Impact Dashboard" />)} />
            <Route path="/atmri-help/leaderboard" element={withSuspense(<P.AtmriComingSoon title="Doctor Leaderboard" />)} />
            {/* /ayush-help aliases */}
            <Route path="/ayush-help" element={withSuspense(<P.AtmriHelp />)} />
            <Route path="/ayush-help/cases" element={withSuspense(<P.AtmriCasesList />)} />
            <Route path="/ayush-help/cases/:id" element={withSuspense(<P.AtmriCaseDetail />)} />
            <Route path="/ayush-help/apply" element={withSuspense(<P.AtmriApply />)} />
            <Route path="/ayush-help/pledge" element={withSuspense(<P.AtmriDoctorPledge />)} />
            <Route path="/ayush-help/hospitals" element={withSuspense(<P.AtmriPartnerHospitals />)} />
            <Route path="/ayush-help/campaigns" element={withSuspense(<P.AtmriComingSoon title="Active Campaigns" />)} />
            <Route path="/ayush-help/csr" element={withSuspense(<P.AtmriComingSoon title="CSR Partnerships" />)} />
            <Route path="/ayush-help/impact" element={withSuspense(<P.AtmriComingSoon title="Impact Dashboard" />)} />
            <Route path="/ayush-help/leaderboard" element={withSuspense(<P.AtmriComingSoon title="Doctor Leaderboard" />)} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="/food-as-medicine" element={withSuspense(<P.FoodAsMedicine />)} />
           <Route path="/food-as-medicine/:slug" element={withSuspense(<P.FoodAsMedicine />)} />
           <Route path="/essential-drugs" element={withSuspense(<P.EssentialDrugs />)} />
           <Route path="/essential-drugs/:slug" element={withSuspense(<P.EssentialDrugDetail />)} />
           <Route path="/essential-siddha-drugs" element={withSuspense(<P.EssentialSiddhaDrugs />)} />
           <Route path="/essential-siddha-drugs/:slug" element={withSuspense(<P.EssentialSiddhaDrugDetail />)} />
           <Route path="/essential-unani-drugs" element={withSuspense(<P.EssentialUnaniDrugs />)} />
           <Route path="/essential-unani-drugs/:slug" element={withSuspense(<P.EssentialUnaniDrugDetail />)} />
           <Route path="/essential-homeopathy-drugs" element={withSuspense(<P.EssentialHomeopathyDrugs />)} />
           <Route path="/essential-homeopathy-drugs/:slug" element={withSuspense(<P.EssentialHomeopathyDrugDetail />)} />
            <Route path="/gamification/certificates/:id" element={withSuspense(<P.CertificateView />)} />
            <Route path="/gamification" element={withSuspense(<P.GamificationLayout />)}>
              <Route index element={withSuspense(<P.GamificationDashboard />)} />
              <Route path="points" element={withSuspense(<P.MyPoints />)} />
              <Route path="badges" element={withSuspense(<P.MyBadges />)} />
              <Route path="certificates" element={withSuspense(<P.MyCertificates />)} />
              <Route path="challenges" element={withSuspense(<P.Challenges />)} />
              <Route path="leaderboard" element={withSuspense(<P.Leaderboard />)} />
              <Route path="wall" element={withSuspense(<P.AppreciationWall />)} />
              <Route path="rewards" element={withSuspense(<P.GamRewards />)} />
            </Route>
           <Route path="*" element={withSuspense(<P.NotFound />)} />
  </Routes>
);
