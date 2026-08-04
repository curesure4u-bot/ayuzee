import { Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { RouteFallback } from "@/components/common/PageLoader";
import VaidyaPanchakarmaGuard from "@/components/vaidya/VaidyaPanchakarmaGuard";
import * as P from "@/routes/lazyPages";

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const TherapistIdRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/therapists/${id}`} replace />;
};


export const AppRoutes = () => (
  <Routes>
<Route path="/" element={withSuspense(<P.Index />)} />
            <Route path="/astg/musculoskeletal" element={withSuspense(<P.MusculoskeletalReference />)} />
            <Route path="/astg/musculoskeletal/:id" element={withSuspense(<P.MusculoskeletalDiseaseDetail />)} />
            <Route path="/about-us" element={withSuspense(<P.AboutUs />)} />
            <Route path="/contact" element={withSuspense(<P.Contact />)} />
            <Route path="/press" element={withSuspense(<P.Press />)} />
            <Route path="/refund-policy" element={withSuspense(<P.RefundPolicy />)} />
            <Route path="/privacy-policy" element={withSuspense(<P.PrivacyPolicy />)} />
            <Route path="/terms-of-use" element={withSuspense(<P.TermsOfUse />)} />
            <Route path="/medical-disclaimer" element={withSuspense(<P.MedicalDisclaimer />)} />
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
              <Route path="daily-quiz" element={withSuspense(<P.StudentDailyQuiz />)} />
              <Route path="my-progress" element={withSuspense(<P.StudentGamification />)} />
              <Route path="subject-quiz" element={withSuspense(<P.StudentSubjectQuiz />)} />
              <Route path="colleges" element={withSuspense(<P.StudentCollegeDirectory />)} />
              <Route path="chapters" element={withSuspense(<P.StudentCollegeChapters />)} />
              <Route path="chapters/:chapterId" element={withSuspense(<P.StudentChapterDetail />)} />
              <Route path="competitions" element={withSuspense(<P.StudentQuizCompetitions />)} />
              <Route path="competitions/:competitionId" element={withSuspense(<P.StudentCompetitionArena />)} />
              <Route path="case-studies" element={withSuspense(<P.StudentCaseStudyLibrary />)} />
              <Route path="case-studies/:caseStudyId" element={withSuspense(<P.StudentCaseStudyDetail />)} />
              <Route path="coin-store" element={withSuspense(<P.StudentCoinStore />)} />
              <Route path="study-planner" element={withSuspense(<P.StudentStudyPlanner />)} />
              <Route path="mentorship" element={withSuspense(<P.StudentMentorConnect />)} />
              <Route path="study-groups" element={withSuspense(<P.StudentStudyGroups />)} />
              <Route path="study-groups/:groupId" element={withSuspense(<P.StudentStudyGroups />)} />
              <Route path="ask-vaidya" element={withSuspense(<P.StudentAskVaidya />)} />
              <Route path="internship-journal" element={withSuspense(<P.StudentInternshipJournal />)} />
              <Route path="internship-marketplace" element={withSuspense(<P.StudentInternshipMarketplace />)} />
              <Route path="research-collaboration" element={withSuspense(<P.StudentResearchCollaboration />)} />
              <Route path="startup-incubator" element={withSuspense(<P.StudentStartupIncubator />)} />
              <Route path="freelance-gigs" element={withSuspense(<P.StudentFreelanceGigs />)} />
              <Route path="marma-explorer" element={withSuspense(<P.StudentMarmaExplorer />)} />
              <Route path="drug-interactions" element={withSuspense(<P.StudentDrugInteractionChecker />)} />
              <Route path="panchakarma-simulator" element={withSuspense(<P.StudentPanchakarmaSimulator />)} />
              <Route path="herb-identifier" element={withSuspense(<P.StudentHerbIdentifier />)} />
              <Route path="pulse-reading" element={withSuspense(<P.StudentPulseReadingPractice />)} />
              <Route path="question-bank" element={withSuspense(<P.StudentQuestionBankManager />)} />
              <Route path="admin-panel" element={withSuspense(<P.StudentAdminPanel />)} />
              <Route path="weekly-challenge" element={withSuspense(<P.StudentWeeklyChallenge />)} />
            </Route>
            <Route path="/dashboard" element={withSuspense(<P.PatientLayout />)}>
              <Route index element={withSuspense(<P.Dashboard />)} />
              <Route path="profile" element={withSuspense(<P.PatientProfile />)} />
              <Route path="appointments" element={withSuspense(<P.PatientAppointmentsList />)} />
              <Route path="saved-medicines" element={withSuspense(<P.PatientSavedMedicines />)} />
              <Route path="saved-posts" element={withSuspense(<P.PatientSavedPosts />)} />
              <Route path="orders" element={withSuspense(<P.MyOrders />)} />
              <Route path="medicine-diary" element={withSuspense(<P.MedicineAdherence />)} />
              <Route path="addresses" element={withSuspense(<P.PatientAddresses />)} />
              <Route path="wallet" element={withSuspense(<P.PatientWallet />)} />
              <Route path="bank" element={withSuspense(<P.PatientBank />)} />
              <Route path="help" element={withSuspense(<P.PatientHelp />)} />
              <Route path="guidance" element={withSuspense(<P.PatientGuidance />)} />
              <Route path="mala-reports" element={withSuspense(<P.PatientMalaReports />)} />
              <Route path="ashtavidha-reports" element={withSuspense(<P.PatientAshtavidhaReports />)} />
              <Route path="spine-reports" element={withSuspense(<P.PatientSpineReports />)} />
              <Route path="diet-charts/:id" element={withSuspense(<P.PatientDietChart />)} />
              <Route path="panchakarma" element={withSuspense(<P.PatientPanchakarmaJourney />)} />
              <Route path="health-locker" element={withSuspense(<P.PatientHealthLocker />)} />
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
            <Route path="/jobs/alerts" element={withSuspense(<P.JobAlerts />)} />
            <Route path="/jobs/ai-match" element={withSuspense(<P.JobAIMatch />)} />
            <Route path="/jobs/government" element={withSuspense(<P.JobsGovernment />)} />
            <Route path="/jobs/aggregated" element={withSuspense(<P.JobsAggregated />)} />
            <Route path="/jobs/salary-insights" element={withSuspense(<P.JobSalaryInsights />)} />
            <Route path="/jobs/career-roadmap" element={withSuspense(<P.JobCareerRoadmap />)} />
            <Route path="/jobs/profile" element={withSuspense(<P.JobSeekerProfile />)} />
            <Route path="/jobs/employer" element={withSuspense(<P.JobEmployerATS />)} />
            <Route path="/jobs/candidates" element={withSuspense(<P.JobCandidateSearch />)} />
            <Route path="/jobs/my-applications" element={withSuspense(<P.JobMyApplications />)} />
            <Route path="/jobs/:id" element={withSuspense(<P.JobDetail />)} />
            <Route path="/shop" element={withSuspense(<P.Shop />)} />
            <Route path="/shop/conditions" element={withSuspense(<P.ShopByCondition />)} />
            <Route path="/shop/conditions/:slug" element={withSuspense(<P.ConditionProducts />)} />
            <Route path="/shop/panchakarma" element={withSuspense(<P.PanchakarmaShop />)} />
            <Route path="/shop/surgicals" element={withSuspense(<P.AyushSurgicals />)} />
            <Route path="/shop/track" element={withSuspense(<P.TrackOrder />)} />
            <Route path="/shop/prescription" element={withSuspense(<P.PrescriptionUpload />)} />
            <Route path="/shop/prescription-cart" element={withSuspense(<P.PrescriptionCart />)} />
            <Route path="/shop/compare" element={withSuspense(<P.PriceCompare />)} />
            <Route path="/shop/interactions" element={withSuspense(<P.DrugInteractionChecker />)} />
            <Route path="/shop/subscribe" element={withSuspense(<P.MedicineSubscriptionPage />)} />
            <Route path="/shop/treatment-kits" element={withSuspense(<P.TreatmentKits />)} />
            <Route path="/verify-medicine" element={withSuspense(<P.VerifyMedicine />)} />
            <Route path="/shop/:id" element={withSuspense(<P.ProductDetail />)} />
            <Route path="/health-conditions" element={withSuspense(<P.HealthConditions />)} />
            <Route path="/health-conditions/:slug" element={withSuspense(<P.HealthConditionDetail />)} />
            <Route path="/treatments/acupuncture" element={withSuspense(<P.AcupunctureHub />)} />
            <Route path="/acupuncture" element={<Navigate to="/treatments/acupuncture" replace />} />
            <Route path="/treatments/tung-points" element={withSuspense(<P.TungPoints />)} />
            <Route path="/tung-points" element={<Navigate to="/treatments/tung-points" replace />} />
            <Route path="/treatments/acupuncture-300-diseases" element={withSuspense(<P.Acupuncture300Diseases />)} />
            <Route path="/treatments/acupuncture-50-diseases" element={withSuspense(<P.Acupuncture50Diseases />)} />
            <Route path="/treatments/acupuncture-homeopathy" element={withSuspense(<P.AcupunctureHomeopathy />)} />
            <Route path="/treatments/acupoints-uses" element={withSuspense(<P.AcupointsAndUses />)} />
            <Route path="/acupuncture/points" element={<Navigate to="/treatments/acupoints-uses" replace />} />
            <Route path="/acupuncture/homeopathy" element={<Navigate to="/treatments/acupuncture-homeopathy" replace />} />
            <Route path="/acupuncture/50-diseases" element={<Navigate to="/treatments/acupuncture-50-diseases" replace />} />
            <Route path="/acupuncture/300-diseases" element={<Navigate to="/treatments/acupuncture-300-diseases" replace />} />
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
            <Route path="/therapist/:id" element={<TherapistIdRedirect />} />
            <Route path="/therapist/auth" element={withSuspense(<P.TherapistAuth />)} />
            <Route path="/therapist" element={withSuspense(<P.TherapistLayout />)}>
              <Route index element={withSuspense(<P.TherapistDashboard />)} />
              <Route path="sessions" element={withSuspense(<P.TherapistSessions />)} />
              <Route path="panchakarma-session/:id" element={withSuspense(<P.TherapistPanchakarmaSession />)} />
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
              <Route path="products/builder" element={withSuspense(<P.AdminProductBuilder />)} />
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
              <Route path="astg-group-editor" element={withSuspense(<P.ASTGGroupEditor />)} />
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
              <Route path="panchakarma-venues" element={withSuspense(<P.AdminPanchakarmaVenueReview />)} />
              <Route path="panchakarma" element={withSuspense(<P.AdminPanchakarmaDashboard />)} />
              <Route path="therapy-sessions" element={withSuspense(<P.AdminSessions />)} />
              <Route path="revenue-split" element={withSuspense(<P.AdminRevenueSplit />)} />
              <Route path="jobs" element={withSuspense(<P.AdminJobs />)} />
              <Route path="atmri-help" element={withSuspense(<P.AdminAtmriHelp />)} />
              <Route path="roadmap" element={withSuspense(<P.AdminRoadmap />)} />
              <Route path="essential-drugs" element={withSuspense(<P.AdminEssentialDrugs />)} />
              <Route path="food-database" element={withSuspense(<P.AdminFoodDatabase />)} />
              <Route path="essential-siddha-drugs" element={withSuspense(<P.AdminEssentialSiddhaDrugs />)} />
              <Route path="essential-unani-drugs" element={withSuspense(<P.AdminEssentialUnaniDrugs />)} />
              <Route path="essential-homeopathy-drugs" element={withSuspense(<P.AdminEssentialHomeopathyDrugs />)} />
              <Route path="backlinks" element={withSuspense(<P.AdminBacklinks />)} />
              <Route path="hms-access" element={withSuspense(<P.AdminHmsAccess />)} />
              <Route path="verification-queue" element={withSuspense(<P.AdminVerificationQueue />)} />
              <Route path="review-moderation" element={withSuspense(<P.AdminReviewModeration />)} />
              <Route path="article-approval" element={withSuspense(<P.AdminArticleApproval />)} />
              <Route path="clinic-certification" element={withSuspense(<P.AdminClinicCertification />)} />
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
              <Route path="pharmacy-orders" element={<Navigate to="/admin/prescriptions" replace />} />
              <Route path="ip-admissions" element={<Navigate to="/admin/master-management/ip-admission-types" replace />} />
              <Route path="ward-status" element={<Navigate to="/admin/master-management/wards" replace />} />
            </Route>

            <Route path="/queue-display/:branchId" element={withSuspense(<P.QueueDisplayScreen />)} />


            <Route path="/diagnosis" element={withSuspense(<P.Diagnosis />)} />
            <Route path="/diagnosis/symptoms" element={withSuspense(<P.SymptomChecker />)} />
            <Route path="/diagnosis/gut-health" element={withSuspense(<P.GutHealthAssessment />)} />
            <Route path="/diagnosis/mutra-bindu" element={withSuspense(<P.MutraBinduPariksha />)} />
            <Route path="/diagnosis/jihva" element={withSuspense(<P.JihvaPariksha />)} />
            <Route path="/diagnosis/netra" element={withSuspense(<P.NetraPariksha />)} />
            <Route path="/diagnosis/spine" element={withSuspense(<P.SpineAssessment />)} />
            <Route path="/spine" element={withSuspense(<P.SpineAyushLanding />)} />
            <Route path="/ayurveda-advisor" element={withSuspense(<P.AyurvedaAdvisor />)} />
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
            <Route path="/ebooks" element={withSuspense(<P.EBookLibrary />)} />
            <Route path="/learning/courses/:slug" element={withSuspense(<P.CourseDetail />)} />
            <Route path="/learning/courses/:slug/quiz" element={withSuspense(<P.CourseQuiz />)} />
            <Route path="/learning/blogs/:slug" element={withSuspense(<P.BlogDetail />)} />
            <Route path="/learning/certificates/:id" element={withSuspense(<P.Certificate />)} />
            <Route path="/learning/daily-quiz" element={withSuspense(<P.StudentDailyQuiz />)} />
            <Route path="/learning/my-progress" element={withSuspense(<P.StudentGamification />)} />
            
            {/* HMS Portal (standalone) */}
            <Route path="/hms/auth" element={withSuspense(<P.HmsPortalAuth />)} />
            <Route path="/hms" element={withSuspense(<P.HmsPortalLayout />)}>
              <Route index element={withSuspense(<P.HmsPortalDashboard />)} />
              <Route path="opd" element={withSuspense(<P.HmsPortalOpd />)} />
              <Route path="ipd" element={withSuspense(<P.HmsPortalIpd />)} />
              <Route path="patients" element={withSuspense(<P.HmsPortalPatients />)} />

              {/* AI-Integrated Patient Module */}
              <Route path="patient/register" element={withSuspense(<P.HmsPatientRegistration />)} />
              <Route path="patient/register-with-bill" element={withSuspense(<P.HmsPatientRegistration />)} />
              <Route path="patient/find" element={withSuspense(<P.HmsPatientFind />)} />
              <Route path="patient/manage-op" element={withSuspense(<P.HmsManageOP />)} />
              <Route path="patient/dashboard/:patientId?" element={withSuspense(<P.HmsPatientDashboard />)} />
              <Route path="patient/vitals/:patientId?" element={withSuspense(<P.HmsPatientVitals />)} />
              <Route path="patient/casesheet/:patientId?" element={withSuspense(<P.HmsAyurvedaCaseSheet />)} />
              <Route path="patient/prescription/:patientId?" element={withSuspense(<P.HmsPatientPrescription />)} />
              <Route path="patient/bills/:patientId?" element={withSuspense(<P.HmsPatientBills />)} />
              <Route path="patient/profile/:patientId?" element={withSuspense(<P.HmsPatientProfile />)} />
              <Route path="patient/mrd/:patientId?" element={withSuspense(<P.HmsPatientMRD />)} />
              <Route path="patient/messages/:patientId?" element={withSuspense(<P.HmsPatientMessages />)} />
              <Route path="patient/appointments/:patientId?" element={withSuspense(<P.HmsPatientAppointments />)} />
              <Route path="patient/ip-summary/:patientId?" element={withSuspense(<P.HmsPatientIPSummary />)} />

              <Route path="appointments" element={withSuspense(<P.HmsPortalAppointments />)} />
              <Route path="consultations" element={withSuspense(<P.HmsPortalConsultations />)} />
              <Route path="emr" element={withSuspense(<P.HmsPortalEmr />)} />
              <Route path="radiology" element={withSuspense(<P.HmsPortalRadiology />)} />
              <Route path="billing" element={withSuspense(<P.HmsPortalBilling />)} />
              <Route path="billing/insurance" element={withSuspense(<P.HmsPortalInsurance />)} />
              <Route path="accounts" element={withSuspense(<P.HmsPortalAccounts />)} />
              <Route path="accounts/revenue" element={withSuspense(<P.HmsAccRevenueDashboard />)} />
              <Route path="accounts/collection" element={withSuspense(<P.HmsAccPaymentCollection />)} />
              <Route path="accounts/expenses" element={withSuspense(<P.HmsAccExpenses />)} />
              <Route path="accounts/payroll" element={withSuspense(<P.HmsAccPayroll />)} />
              <Route path="accounts/gst" element={withSuspense(<P.HmsAccGST />)} />
              <Route path="accounts/tds" element={withSuspense(<P.HmsAccTDS />)} />
              <Route path="accounts/insurance" element={withSuspense(<P.HmsAccInsurance />)} />
              <Route path="accounts/day-end" element={withSuspense(<P.HmsAccDayEnd />)} />
              <Route path="accounts/refund-advance" element={withSuspense(<P.HmsAccRefundAdvance />)} />
              <Route path="accounts/financial-reports" element={withSuspense(<P.HmsAccFinancialReports />)} />
              <Route path="accounts/bank-ai" element={withSuspense(<P.HmsAccBankAI />)} />
              <Route path="accounts/reconciliation" element={withSuspense(<P.HmsAccReconciliation />)} />
              <Route path="accounts/cash-flow" element={withSuspense(<P.HmsAccCashFlow />)} />
              <Route path="accounts/cashier" element={withSuspense(<P.HmsAccCashier />)} />
              <Route path="accounts/sales-analytics" element={withSuspense(<P.HmsAccSalesAnalytics />)} />
              <Route path="accounts/target-achieved" element={withSuspense(<P.HmsAccTargetAchieved />)} />
              <Route path="accounts/incentive" element={withSuspense(<P.HmsAccIncentive />)} />
              <Route path="accounts/staff-credits" element={withSuspense(<P.HmsAccStaffCredits />)} />
              <Route path="accounts/supplier-franchise" element={withSuspense(<P.HmsAccSupplierFranchise />)} />
              <Route path="accounts/followup" element={withSuspense(<P.HmsAccFollowUp />)} />
              <Route path="accounts/crm" element={withSuspense(<P.HmsAccCRM />)} />
              <Route path="accounts/dashboard" element={withSuspense(<P.HmsAccDashboard />)} />
              <Route path="accounts/state-fund" element={withSuspense(<P.HmsAccStateFund />)} />
              <Route path="accounts/tally" element={withSuspense(<P.HmsAccTallyExport />)} />
              <Route path="mis" element={withSuspense(<P.HmsPortalMIS />)} />
              <Route path="sna-formulary" element={withSuspense(<P.HmsPortalSnaFormulary />)} />
              <Route path="classical-prescriptions" element={withSuspense(<P.HmsClassicalPrescriptions />)} />
              <Route path="mis/ai" element={withSuspense(<P.HmsMisAI />)} />
              <Route path="mis/filters" element={withSuspense(<P.HmsMisFilters />)} />
              <Route path="mis/collection" element={withSuspense(<P.HmsMisCollection />)} />
              <Route path="mis/accounts" element={withSuspense(<P.HmsMisAccounts />)} />
              <Route path="mis/test-orders" element={withSuspense(<P.HmsMisTestOrders />)} />
              <Route path="mis/stocks" element={withSuspense(<P.HmsMisStocks />)} />
              <Route path="mis/operational" element={withSuspense(<P.HmsMisOperational />)} />
              <Route path="mis/org" element={withSuspense(<P.HmsMisOrg />)} />
              <Route path="pharmacy" element={withSuspense(<P.HmsPortalPharmacyAdvanced />)} />
              <Route path="lab" element={withSuspense(<P.HmsPortalLab />)} />
              <Route path="procedures" element={withSuspense(<P.HmsPortalProcedures />)} />
              <Route path="ayurveda" element={withSuspense(<P.HmsPortalAyurveda />)} />
              <Route path="siddha" element={withSuspense(<P.HmsPortalSiddha />)} />
              <Route path="homeopathy" element={withSuspense(<P.HmsPortalHomeopathy />)} />
              <Route path="unani" element={withSuspense(<P.HmsPortalUnani />)} />
              <Route path="yoga" element={withSuspense(<P.HmsPortalYoga />)} />
              <Route path="panchakarma" element={withSuspense(<P.HmsPortalPanchakarma />)} />
              <Route path="panchakarma/schedule" element={withSuspense(<P.HmsPortalPanchakarmaSchedule />)} />
              <Route path="panchakarma/packages" element={withSuspense(<P.HmsPortalPanchakarmaPackages />)} />
              <Route path="ayush/panchakarma-therapy" element={withSuspense(<P.HmsAyushPanchakarmaTherapy />)} />
              <Route path="ayush/diet-pathya" element={withSuspense(<P.HmsAyushDietPathya />)} />
              <Route path="ayush/wellness-score" element={withSuspense(<P.HmsAyushWellnessScore />)} />
              <Route path="ayush/ritucharya" element={withSuspense(<P.HmsAyushRitucharya />)} />
              <Route path="ayush/formulations" element={withSuspense(<P.HmsAyushFormulations />)} />
              <Route path="manufacturing" element={withSuspense(<P.HmsPortalManufacturing />)} />
              <Route path="inventory" element={withSuspense(<P.HmsPortalInventory />)} />

              {/* Stock & Pharmacy Module (DocDoc-style) */}
              <Route path="stock" element={withSuspense(<P.HmsStockLayout />)}>
                <Route index element={withSuspense(<P.HmsStockDashboard />)} />
                <Route path="master/manufacturer" element={withSuspense(<P.HmsStockManufacturer />)} />
                <Route path="master/marketed-by" element={withSuspense(<P.HmsStockMarketedBy />)} />
                <Route path="master/category" element={withSuspense(<P.HmsStockCategory />)} />
                <Route path="master/sub-category" element={withSuspense(<P.HmsStockSubCategory />)} />
                <Route path="master/pharmacological-name" element={withSuspense(<P.HmsStockPharmName />)} />
                <Route path="master/indication" element={withSuspense(<P.HmsStockIndication />)} />
                <Route path="master/frames" element={withSuspense(<P.HmsStockFrames />)} />
                <Route path="master/lens" element={withSuspense(<P.HmsStockLens />)} />
                <Route path="product" element={withSuspense(<P.HmsStockProductList />)} />
                <Route path="product/new" element={withSuspense(<P.HmsStockProductForm />)} />
                <Route path="product/builder" element={withSuspense(<P.HmsStockProductBuilder />)} />
                <Route path="purchase/quotation" element={withSuspense(<P.HmsStockQuotationNew />)} />
                <Route path="purchase/quotation/manage" element={withSuspense(<P.HmsStockQuotationManage />)} />
                <Route path="purchase/po" element={withSuspense(<P.HmsStockPOManage />)} />
                <Route path="purchase/po/new" element={withSuspense(<P.HmsStockPONew />)} />
                <Route path="purchase/po/manage" element={withSuspense(<P.HmsStockPOManage />)} />
                <Route path="purchase/po/find" element={withSuspense(<P.HmsStockPOFind />)} />
                <Route path="purchase/grn" element={withSuspense(<P.HmsStockGRNManage />)} />
                <Route path="purchase/grn/new" element={withSuspense(<P.HmsStockGRNNew />)} />
                <Route path="purchase/grn/manage" element={withSuspense(<P.HmsStockGRNManage />)} />
                <Route path="purchase/grn/drafts" element={withSuspense(<P.HmsStockGRNManage />)} />
                <Route path="purchase/goods-return" element={withSuspense(<P.HmsStockGoodsReturnManage />)} />
                <Route path="purchase/goods-return/new" element={withSuspense(<P.HmsStockGoodsReturnNew />)} />
                <Route path="purchase/goods-return/manage" element={withSuspense(<P.HmsStockGoodsReturnManage />)} />
                <Route path="purchase/goods-return/drafts" element={withSuspense(<P.HmsStockGoodsReturnManage />)} />
                <Route path="sale/new" element={withSuspense(<P.HmsStockSaleNew />)} />
                <Route path="sale/manage" element={withSuspense(<P.HmsStockSaleManage />)} />
                <Route path="sale/prescription" element={withSuspense(<P.HmsStockManagePrescription />)} />
                <Route path="sale/return" element={withSuspense(<P.HmsStockSaleReturnManage />)} />
                <Route path="sale/return/new" element={withSuspense(<P.HmsStockSaleReturnNew />)} />
                <Route path="sale/return/manage" element={withSuspense(<P.HmsStockSaleReturnManage />)} />
                <Route path="sale/return/counter" element={withSuspense(<P.HmsStockSaleReturnManage />)} />
                <Route path="indent/new" element={withSuspense(<P.HmsStockIndentNew />)} />
                <Route path="indent/manage" element={withSuspense(<P.HmsStockIndentManage />)} />
                <Route path="indent/gdn/new" element={withSuspense(<P.HmsStockGDNNew />)} />
                <Route path="indent/gdn/manage" element={withSuspense(<P.HmsStockGDNManage />)} />
                <Route path="indent/return" element={withSuspense(<P.HmsStockReturnIndentManage />)} />
                <Route path="indent/return/new" element={withSuspense(<P.HmsStockReturnIndentNew />)} />
                <Route path="indent/return/manage" element={withSuspense(<P.HmsStockReturnIndentManage />)} />
                <Route path="indent/return/empty-store" element={withSuspense(<P.HmsStockReturnIndentNew />)} />
                <Route path="issue" element={withSuspense(<P.HmsStockIssueManage />)} />
                <Route path="issue/new" element={withSuspense(<P.HmsStockIssueNew />)} />
                <Route path="issue/manage" element={withSuspense(<P.HmsStockIssueManage />)} />
                <Route path="issue/ward-request" element={withSuspense(<P.HmsStockSaleManage />)} />
                <Route path="adjustment" element={withSuspense(<P.HmsStockAdjustment />)} />
                <Route path="product-flow" element={withSuspense(<P.HmsStockProductFlow />)} />
                <Route path="expense" element={withSuspense(<P.HmsStockExpense />)} />
                <Route path="due" element={withSuspense(<P.HmsStockDue />)} />
                <Route path="invoice/pharmacy" element={withSuspense(<P.HmsStockPharmacyInvoice />)} />
                <Route path="credit/supplier" element={withSuspense(<P.HmsStockCreditSupplier />)} />
                <Route path="credit/patient" element={withSuspense(<P.HmsStockCreditPatient />)} />
                <Route path="cancel/sale-bill" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="cancel/return-bill" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="cancel/purchase-order" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="cancel/grn" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="cancel/goods-return" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="cancel/issue" element={withSuspense(<P.HmsStockCancelOperations />)} />
                <Route path="ai/reorder" element={withSuspense(<P.HmsStockAISmartReorder />)} />
                <Route path="ai/expiry" element={withSuspense(<P.HmsStockAIExpiry />)} />
                <Route path="ai/qr-tools" element={withSuspense(<P.HmsStockQRTools />)} />
              </Route>

              <Route path="ai-assist" element={withSuspense(<P.HmsPortalAiAssist />)} />

              {/* Lab & Diagnostics Module (DocDoc Investigation) */}
              <Route path="lab-diagnostics" element={withSuspense(<P.HmsLabLayout />)}>
                <Route index element={withSuspense(<P.HmsLabDashboard />)} />
                <Route path="target" element={withSuspense(<P.HmsLabDashboard />)} />
                <Route path="analytics" element={withSuspense(<P.HmsLabDashboard />)} />
                <Route path="master/group" element={withSuspense(<P.HmsLabGroupMaster />)} />
                <Route path="master/medicine" element={withSuspense(<P.HmsLabMedicineMaster />)} />
                <Route path="master/organism" element={withSuspense(<P.HmsLabOrganismMaster />)} />
                <Route path="master/smear" element={withSuspense(<P.HmsLabSmearMaster />)} />
                <Route path="master/department" element={withSuspense(<P.HmsLabDepartmentMaster />)} />
                <Route path="master/sample" element={withSuspense(<P.HmsLabSampleMaster />)} />
                <Route path="accession" element={withSuspense(<P.HmsLabAccession />)} />
                <Route path="test" element={withSuspense(<P.HmsLabTestManagement />)} />
                <Route path="profile" element={withSuspense(<P.HmsLabProfileManagement />)} />
                <Route path="order" element={withSuspense(<P.HmsLabManageOrder />)} />
                <Route path="order-request" element={withSuspense(<P.HmsLabManageOrder />)} />
                <Route path="order-status" element={withSuspense(<P.HmsLabOrderStatus />)} />
                <Route path="home-collection" element={withSuspense(<P.HmsLabHomeCollection />)} />
                <Route path="outsource" element={withSuspense(<P.HmsLabOutsource />)} />
                <Route path="refout" element={withSuspense(<P.HmsLabRefout />)} />
                <Route path="qc" element={withSuspense(<P.HmsLabQC />)} />
                <Route path="barcode" element={withSuspense(<P.HmsLabBarcode />)} />
                <Route path="worklist" element={withSuspense(<P.HmsLabWorklist />)} />
                <Route path="camp" element={withSuspense(<P.HmsLabCamp />)} />
                <Route path="ai" element={withSuspense(<P.HmsLabAI />)} />
                <Route path="result-entry" element={withSuspense(<P.HmsLabResultEntry />)} />
                <Route path="reports" element={withSuspense(<P.HmsLabReportGeneration />)} />
                <Route path="machine-interface" element={withSuspense(<P.HmsLabMachineInterface />)} />
                <Route path="tat-monitoring" element={withSuspense(<P.HmsLabTATMonitoring />)} />
                <Route path="billing" element={withSuspense(<P.HmsLabBilling />)} />
                <Route path="referral-commission" element={withSuspense(<P.HmsLabReferralCommission />)} />
                <Route path="patient-portal" element={withSuspense(<P.HmsLabPatientPortal />)} />
                <Route path="audit-trail" element={withSuspense(<P.HmsLabAuditTrail />)} />
                <Route path="nabl-compliance" element={withSuspense(<P.HmsLabNABLCompliance />)} />
                <Route path="reagent-inventory" element={withSuspense(<P.HmsLabReagentInventory />)} />
                <Route path="radiology" element={withSuspense(<P.HmsLabRadiology />)} />
                <Route path="multi-location" element={withSuspense(<P.HmsLabMultiLocation />)} />
                <Route path="abdm-lab" element={withSuspense(<P.HmsLabABDM />)} />
                <Route path="b2b-portal" element={withSuspense(<P.HmsLabB2BPortal />)} />
                <Route path="smart-reports" element={withSuspense(<P.HmsLabSmartReports />)} />
                <Route path="auto-comms" element={withSuspense(<P.HmsLabAutoComms />)} />
                <Route path="exceptions" element={withSuspense(<P.HmsLabExceptions />)} />
                <Route path="appointments" element={withSuspense(<P.HmsLabAppointments />)} />
                <Route path="packages" element={withSuspense(<P.HmsLabPackages />)} />
                <Route path="doctor-portal" element={withSuspense(<P.HmsLabDoctorPortal />)} />
                <Route path="nadi-pariksha" element={withSuspense(<P.HmsLabNadiPariksha />)} />
                <Route path="ayush-diagnostics" element={withSuspense(<P.HmsLabAyushHub />)} />
                <Route path="sample-tracking" element={withSuspense(<P.HmsLabSampleTracking />)} />
                <Route path="rate-plans" element={withSuspense(<P.HmsLabRatePlans />)} />
                <Route path="online-payment" element={withSuspense(<P.HmsLabOnlinePayment />)} />
                <Route path="report-templates" element={withSuspense(<P.HmsLabReportTemplates />)} />
                <Route path="mis-reports" element={withSuspense(<P.HmsLabMIS />)} />
                <Route path="patient-crm" element={withSuspense(<P.HmsLabPatientCRM />)} />
              </Route>

              <Route path="hr" element={withSuspense(<P.HmsPortalHr />)} />
              <Route path="reports" element={withSuspense(<P.HmsPortalReports />)} />
              <Route path="research" element={withSuspense(<P.HmsPortalResearch />)} />
              <Route path="public-health" element={withSuspense(<P.HmsPortalPublicHealth />)} />
              <Route path="ai-scribe" element={withSuspense(<P.HmsPortalAiScribe />)} />
              <Route path="abdm" element={withSuspense(<P.HmsPortalAbdm />)} />
              <Route path="cdss" element={withSuspense(<P.HmsPortalCdss />)} />
              <Route path="phr" element={withSuspense(<P.HmsPortalPhr />)} />
              <Route path="developer" element={withSuspense(<P.HmsPortalDevPortal />)} />
              <Route path="whatsapp" element={withSuspense(<P.HmsPortalWhatsapp />)} />
              <Route path="command-center" element={withSuspense(<P.HmsPortalCommandCenter />)} />
              <Route path="records-analyser" element={withSuspense(<P.HmsPortalRecordsAnalyser />)} />
              <Route path="masters" element={withSuspense(<P.HmsPortalMasters />)} />
              <Route path="masters/users" element={withSuspense(<P.HmsPortalUserMaster />)} />
              <Route path="masters/roles" element={withSuspense(<P.HmsPortalRoleMaster />)} />
              <Route path="masters/investigations" element={withSuspense(<P.HmsPortalInvestigationMaster />)} />
              <Route path="masters/treatments" element={withSuspense(<P.HmsPortalTreatmentMaster />)} />
              <Route path="masters/packages" element={withSuspense(<P.HmsPortalPackageMaster />)} />
              <Route path="masters/departments" element={withSuspense(<P.HmsPortalDepartmentMaster />)} />
              <Route path="masters/stores" element={withSuspense(<P.HmsPortalStoreMaster />)} />
              <Route path="masters/products" element={withSuspense(<P.HmsPortalProductMaster />)} />
              <Route path="masters/wards" element={withSuspense(<P.HmsPortalWardBedMaster />)} />
              <Route path="masters/billing-tax" element={withSuspense(<P.HmsPortalBillingTaxMaster />)} />
              <Route path="masters/templates" element={withSuspense(<P.HmsPortalTemplateMaster />)} />
              <Route path="masters/machines" element={withSuspense(<P.HmsPortalMachineMaster />)} />
              <Route path="masters/rate-plans" element={withSuspense(<P.HmsPortalRatePlanMaster />)} />
              <Route path="masters/b2b-insurance" element={withSuspense(<P.HmsPortalB2BInsuranceMaster />)} />
              <Route path="masters/settlement" element={withSuspense(<P.HmsPortalSettlementMaster />)} />
              <Route path="masters/patients" element={withSuspense(<P.HmsPortalPatientMaster />)} />
              <Route path="masters/areas" element={withSuspense(<P.HmsPortalAreaMaster />)} />
              <Route path="masters/content" element={withSuspense(<P.HmsPortalContentMaster />)} />
              <Route path="masters/forms" element={withSuspense(<P.HmsPortalFormMaster />)} />
              <Route path="masters/counters" element={withSuspense(<P.HmsPortalCounterMaster />)} />
              <Route path="masters/tax" element={withSuspense(<P.HmsPortalTaxMaster />)} />
              <Route path="masters/suggestions" element={withSuspense(<P.HmsPortalSuggestionMaster />)} />
              <Route path="masters/token-display" element={withSuspense(<P.HmsPortalTokenDisplayMaster />)} />
              <Route path="masters/email-content" element={withSuspense(<P.HmsPortalEmailContentMaster />)} />
              <Route path="masters/labels" element={withSuspense(<P.HmsPortalLabelMaster />)} />
              <Route path="masters/service-providers" element={withSuspense(<P.HmsPortalServiceProviderMaster />)} />
              <Route path="masters/data-import" element={withSuspense(<P.HmsPortalDataImportMigration />)} />
              <Route path="masters/ip-admission" element={withSuspense(<P.HmsPortalIpAdmissionMaster />)} />
              <Route path="masters/reports" element={withSuspense(<P.HmsPortalReportMaster />)} />
              <Route path="masters/trusted-ip" element={withSuspense(<P.HmsPortalTrustedIpMaster />)} />
              <Route path="masters/whatsapp-content" element={withSuspense(<P.HmsPortalWhatsappContentMaster />)} />
              <Route path="masters/currency" element={withSuspense(<P.HmsPortalCurrencyMaster />)} />
              <Route path="blood-bank" element={withSuspense(<P.HmsPortalBloodBank />)} />
              <Route path="ot" element={withSuspense(<P.HmsPortalOt />)} />
              <Route path="ambulance" element={withSuspense(<P.HmsPortalAmbulance />)} />
              <Route path="assets" element={withSuspense(<P.HmsPortalAssets />)} />
              <Route path="nursing" element={withSuspense(<P.HmsPortalNursing />)} />
              <Route path="shift-roster" element={withSuspense(<P.HmsPortalShiftRoster />)} />
              <Route path="indent" element={withSuspense(<P.HmsPortalIndent />)} />
              <Route path="diet-kitchen" element={withSuspense(<P.HmsPortalDietKitchen />)} />
              <Route path="nabh" element={withSuspense(<P.HmsPortalNabh />)} />
              <Route path="queue-display" element={withSuspense(<P.HmsPortalQueueDisplay />)} />
              <Route path="online-booking" element={withSuspense(<P.HmsPortalOnlineBooking />)} />
              <Route path="e-prescription" element={withSuspense(<P.HmsPatientPrescription />)} />
              <Route path="feedback" element={withSuspense(<P.HmsPortalFeedback />)} />
              <Route path="teleconsult" element={withSuspense(<P.HmsPortalTeleconsult />)} />
              <Route path="referral" element={withSuspense(<P.HmsPortalReferral />)} />
              <Route path="pk-consent" element={withSuspense(<P.HmsPortalPkConsent />)} />
              <Route path="loyalty" element={withSuspense(<P.HmsPortalLoyalty />)} />
              <Route path="icd-coding" element={withSuspense(<P.HmsPortalIcdCoding />)} />
              <Route path="treatment-timeline" element={withSuspense(<P.HmsPortalTreatmentTimeline />)} />
              <Route path="outcome-scales" element={withSuspense(<P.HmsPortalOutcomeScales />)} />
              <Route path="namaste-coding" element={withSuspense(<P.HmsPortalNamaste />)} />
              <Route path="proms" element={withSuspense(<P.HmsPortalProms />)} />
              <Route path="audit-trail" element={withSuspense(<P.HmsPortalAuditTrail />)} />
              <Route path="governance" element={withSuspense(<P.HmsPortalGovernance />)} />
              <Route path="conflict-detection" element={withSuspense(<P.HmsPortalConflictDetection />)} />
              <Route path="waitlist" element={withSuspense(<P.HmsPortalWaitlist />)} />
              <Route path="treatment-view" element={withSuspense(<P.HmsPortalTreatmentView />)} />

              {/* Enhanced HMS Modules */}
              <Route path="gamification-kpi" element={withSuspense(<P.HmsPortalGamificationKpi />)} />
              <Route path="checklist" element={withSuspense(<P.HmsPortalChecklist />)} />
              <Route path="ai-hub" element={withSuspense(<P.HmsPortalAiHub />)} />
              <Route path="drug-interactions" element={withSuspense(<P.HmsPortalDrugInteractions />)} />
              <Route path="classical-references" element={withSuspense(<P.HmsPortalClassicalReferences />)} />
              <Route path="owner-dashboard" element={withSuspense(<P.HmsOwnerDashboard />)} />
              <Route path="data-analytics" element={withSuspense(<P.HmsPortalDataAnalytics />)} />
              <Route path="integrative-medicine" element={withSuspense(<P.HmsPortalIntegrativeMedicine />)} />
              <Route path="chatbot" element={withSuspense(<P.HmsPortalChatbot />)} />
              <Route path="branch-performance" element={withSuspense(<P.HmsPortalBranchPerformance />)} />

              {/* Doctor Clinical Tools (AI-powered) */}
              <Route path="doctor-followups" element={withSuspense(<P.HmsDoctorFollowups />)} />
              <Route path="doctor-inbox" element={withSuspense(<P.HmsDoctorInbox />)} />
              <Route path="doctor-diet" element={withSuspense(<P.HmsDoctorDiet />)} />
              <Route path="doctor-yoga" element={withSuspense(<P.HmsDoctorYoga />)} />
              <Route path="doctor-education" element={withSuspense(<P.HmsDoctorEducation />)} />
              <Route path="doctor-referral" element={withSuspense(<P.HmsDoctorReferral />)} />
              <Route path="doctor-prakriti" element={withSuspense(<P.HmsDoctorPrakriti />)} />
              <Route path="doctor-gut-health" element={withSuspense(<P.HmsDoctorGutHealth />)} />
              <Route path="doctor-spine" element={withSuspense(<P.HmsDoctorSpine />)} />
              <Route path="doctor-jihva" element={withSuspense(<P.HmsDoctorJihva />)} />
              <Route path="doctor-formulary" element={withSuspense(<P.HmsDoctorFormulary />)} />
              <Route path="doctor-astg" element={withSuspense(<P.HmsDoctorAstg />)} />
              <Route path="doctor-kpi" element={withSuspense(<P.HmsDoctorKpi />)} />
              <Route path="doctor-revenue" element={withSuspense(<P.HmsDoctorRevenue />)} />
              <Route path="doctor-lab-order" element={withSuspense(<P.HmsDoctorLabOrder />)} />
              <Route path="doctor-procedures" element={withSuspense(<P.HmsDoctorProcedures />)} />
              <Route path="doctor-templates" element={withSuspense(<P.HmsDoctorTemplates />)} />
              <Route path="doctor-rx-favorites" element={withSuspense(<P.HmsDoctorRxFavorites />)} />
              <Route path="doctor-drug-alert" element={withSuspense(<P.HmsDoctorDrugAlert />)} />
              <Route path="doctor-patient-brief" element={withSuspense(<P.HmsDoctorPatientBrief />)} />
              <Route path="doctor-consent" element={withSuspense(<P.HmsDoctorConsent />)} />
              <Route path="doctor-regional-rx" element={withSuspense(<P.HmsDoctorRegionalRx />)} />
              <Route path="doctor-calculators" element={withSuspense(<P.HmsDoctorCalculators />)} />
              <Route path="doctor-soap-notes" element={withSuspense(<P.HmsDoctorSoapNotes />)} />
              <Route path="doctor-discharge" element={withSuspense(<P.HmsDoctorDischarge />)} />
              <Route path="doctor-voice-rx" element={withSuspense(<P.HmsDoctorVoiceRx />)} />
              <Route path="doctor-cme" element={withSuspense(<P.HmsDoctorCme />)} />
              <Route path="doctor-feedback-view" element={withSuspense(<P.HmsDoctorFeedbackView />)} />
              <Route path="doctor-case-discussion" element={withSuspense(<P.HmsDoctorCaseDiscussion />)} />
              <Route path="doctor-chat" element={withSuspense(<P.HmsDoctorChat />)} />
              <Route path="doctor-retention" element={withSuspense(<P.HmsDoctorRetention />)} />
              <Route path="doctor-research" element={withSuspense(<P.HmsDoctorResearch />)} />
              <Route path="doctor-procedure-notes" element={withSuspense(<P.HmsDoctorProcedureNotesNew />)} />
              <Route path="doctor-timeline" element={withSuspense(<P.HmsDoctorTimeline />)} />
              <Route path="doctor-leave" element={withSuspense(<P.HmsDoctorLeave />)} />
              <Route path="spine-ayush" element={withSuspense(<P.HmsSpineAyush />)} />
              <Route path="spine-modules" element={withSuspense(<P.HmsSpineAyushModules />)} />
              <Route path="spine-modules/:moduleId" element={withSuspense(<P.HmsSpineAyushModuleDetail />)} />
              <Route path="spine-therapies" element={withSuspense(<P.HmsSpineIntegrativeTherapies />)} />
              <Route path="spine-therapies/:therapyId" element={withSuspense(<P.HmsSpineTherapyDetail />)} />
              <Route path="spine-community" element={withSuspense(<P.HmsSpineCommunityCoaching />)} />
              <Route path="spine-therapy-session" element={withSuspense(<P.HmsSpineTherapySession />)} />
              <Route path="spine-patient-recovery" element={withSuspense(<P.HmsSpinePatientRecovery />)} />
              <Route path="spine-level1-session" element={withSuspense(<P.HmsSpineLevel1Session />)} />
              <Route path="spine-level2-session" element={withSuspense(<P.HmsSpineLevel2Session />)} />
              <Route path="spine-community-pipeline" element={withSuspense(<P.HmsSpineCommunityPipeline />)} />
              <Route path="spine-ayush-native" element={withSuspense(<P.HmsSpineAyushNativeModules />)} />
              <Route path="spine-quick-protocol" element={withSuspense(<P.HmsSpineQuickProtocol />)} />
              <Route path="spine-ai-tools" element={withSuspense(<P.HmsSpineAITools />)} />
              <Route path="nadi-tarangini" element={withSuspense(<P.HmsNadiTarangini />)} />
              <Route path="iridology" element={withSuspense(<P.HmsIridology />)} />
              <Route path="darkfield-microscopy" element={withSuspense(<P.HmsDarkfieldMicroscopy />)} />
              <Route path="thermography" element={withSuspense(<P.HmsThermography />)} />
              <Route path="hrv-analysis" element={withSuspense(<P.HmsHrvAnalysis />)} />
              <Route path="gut-microbiome" element={withSuspense(<P.HmsGutMicrobiome />)} />
              <Route path="appointment-slot-config" element={withSuspense(<P.HmsAppointmentSlotConfig />)} />
              <Route path="op-ip-transfer" element={withSuspense(<P.HmsOpIpTransfer />)} />
              <Route path="discharge-workflow" element={withSuspense(<P.HmsDischargeWorkflow />)} />
              <Route path="insurance-preauth" element={withSuspense(<P.HmsInsurancePreauth />)} />
              <Route path="post-visit-summary" element={withSuspense(<P.HmsPostVisitSummary />)} />
              <Route path="op-therapy-transfer" element={withSuspense(<P.HmsOpTherapyTransfer />)} />
              <Route path="revenue-cycle" element={withSuspense(<P.HmsRevenueCycle />)} />
              <Route path="department-pl" element={withSuspense(<P.HmsDepartmentPL />)} />
              <Route path="digital-checkin" element={withSuspense(<P.HmsDigitalCheckin />)} />
              <Route path="patient-app" element={withSuspense(<P.HmsPatientApp />)} />
              <Route path="language-config" element={withSuspense(<P.HmsLanguageConfig />)} />
              <Route path="ai-copilot" element={withSuspense(<P.HmsAiCopilot />)} />
              <Route path="abdm-uhi" element={withSuspense(<P.HmsAbdmUhi />)} />
              <Route path="iot-vitals" element={withSuspense(<P.HmsIotVitals />)} />
              <Route path="population-health" element={withSuspense(<P.HmsPopulationHealth />)} />
              <Route path="voice-interface" element={withSuspense(<P.HmsVoiceInterface />)} />
              <Route path="access-control" element={withSuspense(<P.HmsAccessControl />)} />
              <Route path="partner-portal" element={withSuspense(<P.HmsPartnerPortal />)} />

              {/* Stock Advanced Operations */}
              <Route path="stock-inter-branch" element={withSuspense(<P.HmsStockInterBranch />)} />
              <Route path="stock-batch-tracking" element={withSuspense(<P.HmsStockBatchTracking />)} />
              <Route path="stock-ecommerce" element={withSuspense(<P.HmsStockEcommerce />)} />
              <Route path="stock-dead-stock" element={withSuspense(<P.HmsStockDeadStock />)} />
              <Route path="stock-rack-location" element={withSuspense(<P.HmsStockRackLocation />)} />

              {/* Stock Priority 2 — Competitive Advantage */}
              <Route path="stock-physical-verification" element={withSuspense(<P.HmsStockPhysicalVerification />)} />
              <Route path="stock-drug-schedule" element={withSuspense(<P.HmsStockDrugSchedule />)} />
              <Route path="stock-abc-analysis" element={withSuspense(<P.HmsStockAbcAnalysis />)} />
              <Route path="stock-substitute-suggestion" element={withSuspense(<P.HmsStockSubstituteSuggestion />)} />
              <Route path="stock-order-fulfillment" element={withSuspense(<P.HmsStockOrderFulfillment />)} />

              {/* Stock Priority 3 — AYUSH-specific */}
              <Route path="stock-pk-oil-tracker" element={withSuspense(<P.HmsStockPkOilTracker />)} />
              <Route path="stock-seasonal-demand" element={withSuspense(<P.HmsStockSeasonalDemand />)} />
              <Route path="stock-manufacturing-batch" element={withSuspense(<P.HmsStockManufacturingBatch />)} />
              <Route path="stock-central-store" element={withSuspense(<P.HmsStockCentralStore />)} />

              {/* Stock Priority A — Compliance */}
              <Route path="stock-drug-license" element={withSuspense(<P.HmsStockDrugLicense />)} />
              <Route path="stock-expiry-return" element={withSuspense(<P.HmsStockExpiryReturn />)} />
              <Route path="stock-gst-returns" element={withSuspense(<P.HmsStockGstReturns />)} />
              <Route path="stock-barcode" element={withSuspense(<P.HmsStockBarcodeManager />)} />
              <Route path="stock-reorder-level" element={withSuspense(<P.HmsStockReorderLevel />)} />

              {/* Stock Priority B — Competitive Edge */}
              <Route path="stock-purchase-rate" element={withSuspense(<P.HmsStockPurchaseRate />)} />
              <Route path="stock-short-book" element={withSuspense(<P.HmsStockShortBook />)} />
              <Route path="stock-audit-trail" element={withSuspense(<P.HmsStockAuditTrail />)} />
              <Route path="stock-near-expiry" element={withSuspense(<P.HmsStockNearExpiry />)} />
              <Route path="stock-vendor-rating" element={withSuspense(<P.HmsStockVendorRating />)} />

              {/* Stock Priority C — AYUSH Differentiators */}
              <Route path="stock-herb-procurement" element={withSuspense(<P.HmsStockHerbProcurement />)} />
              <Route path="stock-yoga-kshema" element={withSuspense(<P.HmsStockYogaKshema />)} />
              <Route path="stock-patient-dispensing" element={withSuspense(<P.HmsStockPatientDispensing />)} />

              {/* Stock Scale — Tier 1-3 */}
              <Route path="stock-purchase-return" element={withSuspense(<P.HmsStockPurchaseReturn />)} />
              <Route path="stock-wastage" element={withSuspense(<P.HmsStockWastage />)} />
              <Route path="stock-indent-approval" element={withSuspense(<P.HmsStockIndentApproval />)} />
              <Route path="stock-rate-contract" element={withSuspense(<P.HmsStockRateContract />)} />
              <Route path="stock-eway-bill" element={withSuspense(<P.HmsStockEwayBill />)} />
              <Route path="stock-insurance" element={withSuspense(<P.HmsStockInsurance />)} />
              <Route path="stock-supplier-payment" element={withSuspense(<P.HmsStockSupplierPayment />)} />
              <Route path="stock-kit-assembly" element={withSuspense(<P.HmsStockKitAssembly />)} />
              <Route path="stock-drug-interaction" element={withSuspense(<P.HmsStockDrugInteraction />)} />
              <Route path="stock-temp-humidity" element={withSuspense(<P.HmsStockTempHumidity />)} />
              <Route path="stock-courier-dispatch" element={withSuspense(<P.HmsStockCourierDispatch />)} />
              <Route path="stock-medicine-mixing" element={withSuspense(<P.HmsStockMedicineMixing />)} />
              <Route path="stock-dose-calculator" element={withSuspense(<P.HmsStockDoseCalculator />)} />
              <Route path="stock-homeopathy" element={withSuspense(<P.HmsStockHomeopathy />)} />

              {/* Stock Daily Operations */}
              <Route path="stock-quick-dispensing" element={withSuspense(<P.HmsStockQuickDispensing />)} />
              <Route path="stock-branch-transfer" element={withSuspense(<P.HmsStockBranchTransfer />)} />
              <Route path="stock-patient-return" element={withSuspense(<P.HmsStockPatientReturn />)} />
              <Route path="stock-daily-summary" element={withSuspense(<P.HmsStockDailySummary />)} />

              {/* Stock Multi-Branch Intelligence */}
              <Route path="stock-redistribution" element={withSuspense(<P.HmsStockRedistribution />)} />
              <Route path="stock-franchise-portal" element={withSuspense(<P.HmsStockFranchisePortal />)} />
              <Route path="stock-consumption" element={withSuspense(<P.HmsStockConsumption />)} />
              <Route path="stock-supplier-sla" element={withSuspense(<P.HmsStockSupplierSLA />)} />

              {/* Stock Patient-Centric (Tier 3) */}
              <Route path="stock-rx-sync" element={withSuspense(<P.HmsStockRxSync />)} />
              <Route path="stock-subscription" element={withSuspense(<P.HmsStockSubscription />)} />
              <Route path="stock-return-policy" element={withSuspense(<P.HmsStockReturnPolicy />)} />

              {/* Stock Future-Ready (Tier 4) */}
              <Route path="stock-ondc" element={withSuspense(<P.HmsStockOndc />)} />
              <Route path="stock-epharmacy" element={withSuspense(<P.HmsStockEpharmacy />)} />
              <Route path="stock-ndps" element={withSuspense(<P.HmsStockNdps />)} />

              {/* MocDoc-style Operations Modules */}
              <Route path="task-management" element={withSuspense(<P.HmsPortalTaskManagement />)} />
              <Route path="address-book" element={withSuspense(<P.HmsPortalAddressBook />)} />
              <Route path="staff-attendance" element={withSuspense(<P.HmsPortalStaffAttendance />)} />
              <Route path="cssd-linen" element={withSuspense(<P.HmsPortalCssdLinen />)} />
              <Route path="marketing" element={withSuspense(<P.HmsPortalMarketing />)} />
              <Route path="patient/timeline" element={withSuspense(<P.HmsPatientTimeline />)} />
              <Route path="patient/prakriti-profile" element={withSuspense(<P.HmsPatientPrakritiProfile />)} />
              <Route path="patient/family" element={withSuspense(<P.HmsPatientFamily />)} />
              <Route path="patient/abha" element={withSuspense(<P.HmsPatientABHA />)} />
              <Route path="patient/ai-brief" element={withSuspense(<P.HmsPatientAIBrief />)} />
              <Route path="patient/allergies" element={withSuspense(<P.HmsPatientAllergies />)} />
              <Route path="patient/treatment-plan" element={withSuspense(<P.HmsPatientTreatmentPlan />)} />
              <Route path="patient/photos" element={withSuspense(<P.HmsPatientPhotos />)} />
              <Route path="patient/discharge" element={withSuspense(<P.HmsPatientDischarge />)} />
              <Route path="patient/compliance" element={withSuspense(<P.HmsPatientCompliance />)} />
              <Route path="patient/journey" element={withSuspense(<P.HmsPatientJourney />)} />
              <Route path="patient/risk-score" element={withSuspense(<P.HmsPatientRiskScore />)} />
              <Route path="patient/mental-health" element={withSuspense(<P.HmsPatientMentalHealth />)} />
              <Route path="patient/remote-monitoring" element={withSuspense(<P.HmsPatientRemoteMonitor />)} />
              <Route path="patient/ai-coach" element={withSuspense(<P.HmsPatientAICoach />)} />
              <Route path="patient/genomic" element={withSuspense(<P.HmsPatientGenomic />)} />
              <Route path="patient/daily-logger" element={withSuspense(<P.HmsPatientDailyLogger />)} />
              <Route path="patient/goals" element={withSuspense(<P.HmsPatientGoals />)} />
              <Route path="patient/community" element={withSuspense(<P.HmsPatientCommunity />)} />
              <Route path="patient/subscription" element={withSuspense(<P.HmsPatientSubscription />)} />
              <Route path="patient/leads" element={withSuspense(<P.HmsPatientLeadCapture />)} />
              <Route path="patient/call-center" element={withSuspense(<P.HmsPatientCallCenter />)} />
              <Route path="patient/voice-agent" element={withSuspense(<P.HmsPatientVoiceAgent />)} />
              <Route path="patient/noshow-analytics" element={withSuspense(<P.HmsPatientNoshowAnalytics />)} />
              <Route path="doctor/post-op" element={withSuspense(<P.HmsDoctorPostOp />)} />
              <Route path="doctor/ai-scribe" element={withSuspense(<P.HmsDoctorAIScribe />)} />
              <Route path="doctor/protocols" element={withSuspense(<P.HmsDoctorProtocols />)} />
              <Route path="doctor/revenue" element={withSuspense(<P.HmsDoctorRevenueExt />)} />
              <Route path="doctor/queue-analytics" element={withSuspense(<P.HmsDoctorQueueAnalytics />)} />
              <Route path="doctor/cdss" element={withSuspense(<P.HmsDoctorCDSS />)} />
              <Route path="doctor/templates" element={withSuspense(<P.HmsDoctorQuickTemplates />)} />
              <Route path="doctor/certificates" element={withSuspense(<P.HmsDoctorCertificates />)} />
              <Route path="doctor/procedure-notes" element={withSuspense(<P.HmsDoctorProcedureNotes />)} />
              <Route path="doctor/second-opinion" element={withSuspense(<P.HmsDoctorSecondOpinion />)} />
              <Route path="doctor/cme" element={withSuspense(<P.HmsDoctorCME />)} />
              <Route path="doctor/handoff" element={withSuspense(<P.HmsDoctorHandoff />)} />
              <Route path="doctor/consent" element={withSuspense(<P.HmsDoctorConsentBuilder />)} />
              <Route path="doctor/ai-dx" element={withSuspense(<P.HmsDoctorAIDx />)} />
              <Route path="doctor/calendar" element={withSuspense(<P.HmsDoctorCalendar />)} />
              <Route path="doctor/annotation" element={withSuspense(<P.HmsDoctorAnnotation />)} />
              <Route path="doctor/roga-nidana" element={withSuspense(<P.HmsDoctorRogaNidana />)} />
              <Route path="doctor/pk-prescription" element={withSuspense(<P.HmsDoctorPKPrescription />)} />
              <Route path="doctor/yoga-rx" element={withSuspense(<P.HmsDoctorYogaRx />)} />
              <Route path="doctor/dravya-guna" element={withSuspense(<P.HmsDoctorDravyaGuna />)} />
              <Route path="doctor/prakriti-rx" element={withSuspense(<P.HmsDoctorPrakritiRx />)} />
              <Route path="credit-settlement" element={withSuspense(<P.HmsPortalCreditSettlement />)} />
              <Route path="entity-log" element={withSuspense(<P.HmsPortalEntityLog />)} />
              <Route path="work-schedule" element={withSuspense(<P.HmsPortalWorkSchedule />)} />
              <Route path="invite-friends" element={withSuspense(<P.HmsPortalInviteFriends />)} />

              <Route path="housekeeping" element={withSuspense(<P.HmsPortalHousekeeping />)} />
              <Route path="reservation" element={withSuspense(<P.HmsPortalReservation />)} />
              <Route path="canteen" element={withSuspense(<P.HmsPortalCanteen />)} />
              <Route path="maintenance" element={withSuspense(<P.HmsPortalMaintenance />)} />
              <Route path="multi-currency" element={withSuspense(<P.HmsPortalMultiCurrency />)} />
              <Route path="branch-dashboard" element={withSuspense(<P.HmsPortalBranchDashboard />)} />
              <Route path="branch-management" element={withSuspense(<P.HmsPortalBranchManagement />)} />
              <Route path="bridge" element={withSuspense(<P.HmsPortalBridge />)} />

              {/* MocDoc-Inspired Feature Enhancements */}
              <Route path="triage" element={withSuspense(<P.HmsPortalTriage />)} />
              <Route path="patient-merge" element={withSuspense(<P.HmsPortalPatientMerge />)} />
              <Route path="ward-store" element={withSuspense(<P.HmsPortalWardStore />)} />
              <Route path="eod-reports" element={withSuspense(<P.HmsPortalEodReports />)} />
              <Route path="security-controls" element={withSuspense(<P.HmsPortalSecurityControls />)} />

              {/* MocDoc Micro-Gap Features */}
              <Route path="patient-card" element={withSuspense(<P.HmsPortalPatientCard />)} />
              <Route path="notification-history" element={withSuspense(<P.HmsPortalNotificationHistory />)} />
              <Route path="appointment-calendar" element={withSuspense(<P.HmsPortalAppointmentCalendar />)} />
              <Route path="copay-calculator" element={withSuspense(<P.HmsPortalCopayCalculator />)} />

              {/* MocDoc Effectiveness Enhancements */}
              <Route path="qr-attendance" element={withSuspense(<P.HmsPortalQrAttendance />)} />
              <Route path="pan-validation" element={withSuspense(<P.HmsPortalPanValidation />)} />
              <Route path="lab-critical-results" element={withSuspense(<P.HmsPortalLabCriticalResults />)} />
              <Route path="estimate-approval" element={withSuspense(<P.HmsPortalEstimateApproval />)} />
              <Route path="geo-seo-pages" element={withSuspense(<P.HmsPortalGeoSeoPages />)} />

              {/* Eka.care-Inspired Features */}
              <Route path="document-parser" element={withSuspense(<P.HmsPortalDocumentParser />)} />
              <Route path="medassist" element={withSuspense(<P.HmsPortalMedAssist />)} />
              <Route path="open-api" element={withSuspense(<P.HmsPortalOpenApi />)} />
              <Route path="wearable-sync" element={withSuspense(<P.HmsPortalWearableSync />)} />
              <Route path="mcp-server" element={withSuspense(<P.HmsPortalMcpServer />)} />
              <Route path="voice-agent" element={withSuspense(<P.HmsPortalVoiceAgent />)} />
              <Route path="print-configuration" element={withSuspense(<P.HmsPortalPrintConfiguration />)} />
              <Route path="widget-generator" element={withSuspense(<P.HmsPortalWidgetGenerator />)} />
              <Route path="switch-entity" element={withSuspense(<P.HmsPortalSwitchEntity />)} />
              <Route path="doctor-management" element={withSuspense(<P.HmsPortalDoctorManagement />)} />
              <Route path="therapist-management" element={withSuspense(<P.HmsPortalTherapistManagement />)} />
              <Route path="therapy-appointments" element={withSuspense(<P.HmsPortalTherapyAppointments />)} />
              <Route path="consultation-hub" element={withSuspense(<P.HmsPortalConsultationHub />)} />
              <Route path="settings" element={withSuspense(<P.HmsPortalSettings />)} />
            </Route>

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
              <Route path="swasthavritta/new" element={withSuspense(<P.SwasthavrittaAssessment />)} />
              <Route path="swasthavritta/:assessmentId/review" element={withSuspense(<P.SwasthavrittaReview />)} />
              <Route path="diet-charts/new" element={withSuspense(<P.DietChartEditor />)} />
              <Route path="diet-charts/:id" element={withSuspense(<P.DietChartEditor />)} />
              <Route element={<VaidyaPanchakarmaGuard />}>
                <Route path="panchakarma" element={withSuspense(<P.Panchakarma />)} />
                <Route path="panchakarma/schedule" element={withSuspense(<P.PanchakarmaSchedule />)} />
                <Route path="panchakarma/bookings" element={withSuspense(<P.PanchakarmaBookings />)} />
                <Route path="panchakarma/course/new" element={withSuspense(<P.PanchakarmaCourseNew />)} />
                <Route path="panchakarma/course/from-consent" element={withSuspense(<P.PanchakarmaCourseFromConsent />)} />
                <Route path="panchakarma/post-care" element={withSuspense(<P.PanchakarmaPostCareQueue />)} />
                <Route path="panchakarma/adverse-events" element={withSuspense(<P.PanchakarmaAdverseEvents />)} />
                <Route path="panchakarma/venues" element={withSuspense(<P.PanchakarmaVenues />)} />
                <Route path="panchakarma/venues/rooms" element={withSuspense(<P.PanchakarmaVenueRooms />)} />
              </Route>
              <Route path="posture" element={withSuspense(<P.PosturePage />)} />
              <Route path="spine-reports" element={withSuspense(<P.SpineReviewQueue />)} />
              <Route path="hijama" element={withSuspense(<P.HijamaPage />)} />
              <Route path="parasurgical" element={withSuspense(<P.ParaSurgicalDashboard />)} />
              <Route path="parasurgical/new" element={withSuspense(<P.ParaSurgicalNewCase />)} />
              <Route path="parasurgical/:id" element={withSuspense(<P.ParaSurgicalCaseDetail />)} />
              <Route path="ayurveda-prescription" element={withSuspense(<P.AyurvedaPrescription />)} />
              <Route path="ayuzee-formulary" element={withSuspense(<P.HmsPortalSnaFormulary />)} />
              <Route path="classical-prescriptions" element={withSuspense(<P.HmsClassicalPrescriptions />)} />
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
              <Route path="gut-health-queue" element={withSuspense(<P.GutHealthReviewQueue />)} />
              <Route path="mutra-bindu-queue" element={withSuspense(<P.MutraBinduReviewQueue />)} />
              <Route path="jihva-queue" element={withSuspense(<P.JihvaReviewQueue />)} />
              <Route path="self-assessment-queue" element={withSuspense(<P.SelfAssessmentReviewQueue />)} />
              <Route path="ashtavidha" element={withSuspense(<P.AshtavidhaPareeksha />)} />
              <Route path="ashtavidha/mala" element={withSuspense(<P.MalaPareeksha />)} />
              <Route path="ashtavidha/mala/dashboard" element={withSuspense(<P.MalaDashboard />)} />
              <Route path="verification" element={withSuspense(<P.DoctorVerification />)} />
              <Route path="patient-reviews" element={withSuspense(<P.DoctorPatientReviews />)} />
              <Route path="articles" element={withSuspense(<P.DoctorArticles />)} />
              <Route path="treatment-outcomes" element={withSuspense(<P.DoctorTreatmentOutcomes />)} />
              <Route path="clinic-certification" element={withSuspense(<P.DoctorClinicCertification />)} />
              <Route path="case-referrals" element={withSuspense(<P.DoctorCaseReferrals />)} />
              <Route path="cme-credits" element={withSuspense(<P.DoctorCMECredits />)} />
              <Route path="dispensing" element={withSuspense(<P.DoctorDispensingDashboard />)} />
              <Route path="onboarding" element={withSuspense(<P.DoctorOnboardingChecklist />)} />
              <Route path="earnings" element={withSuspense(<P.DoctorEarnings />)} />
              <Route path="notifications" element={withSuspense(<P.DoctorNotificationPreferences />)} />
              <Route path="activity" element={withSuspense(<P.DoctorActivityFeed />)} />
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
              <Route path="doctor-achievements" element={withSuspense(<P.DoctorAchievements />)} />
              <Route path="patient-achievements" element={withSuspense(<P.PatientAchievements />)} />
              <Route path="student-achievements" element={withSuspense(<P.StudentAchievements />)} />
              <Route path="therapist-achievements" element={withSuspense(<P.TherapistAchievements />)} />
              <Route path="venue-achievements" element={withSuspense(<P.ServiceProviderAchievements />)} />
              <Route path="pharma-achievements" element={withSuspense(<P.PharmaAchievements />)} />
              <Route path="hms-achievements" element={withSuspense(<P.HmsStaffAchievements />)} />
              <Route path="unified-leaderboard" element={withSuspense(<P.UnifiedLeaderboard />)} />
              <Route path="shout-outs" element={withSuspense(<P.ShoutOuts />)} />
            </Route>
           <Route path="*" element={withSuspense(<P.NotFound />)} />
  </Routes>
);
