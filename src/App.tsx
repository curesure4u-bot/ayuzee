import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { SiteNav } from "@/components/site/SiteNav";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Doctors from "./pages/Doctors.tsx";
import DoctorDetail from "./pages/DoctorDetail.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Partner from "./pages/Partner.tsx";
import Bulk from "./pages/Bulk.tsx";
import DoctorAuth from "./pages/doctor/DoctorAuth.tsx";
import DoctorLayout from "./pages/doctor/DoctorLayout.tsx";
import DoctorProfile from "./pages/doctor/sections/DoctorProfile.tsx";
import DoctorHome from "./pages/doctor/DoctorHome.tsx";
import DoctorOrders from "./pages/doctor/sections/DoctorOrders.tsx";
import DoctorMedicines from "./pages/doctor/sections/DoctorMedicines.tsx";
import DoctorSavedPosts from "./pages/doctor/sections/DoctorSavedPosts.tsx";
import AyuzeeMoney from "./pages/doctor/sections/AyuzeeMoney.tsx";
import DoctorAddresses from "./pages/doctor/sections/DoctorAddresses.tsx";
import DoctorBank from "./pages/doctor/sections/DoctorBank.tsx";
import DoctorClinic from "./pages/doctor/sections/DoctorClinic.tsx";
import DoctorRewards from "./pages/doctor/sections/DoctorRewards.tsx";
import DoctorCategory from "./pages/doctor/sections/DoctorCategory.tsx";
import DoctorCompany from "./pages/doctor/sections/DoctorCompany.tsx";
import { DoctorSupport } from "./pages/doctor/sections/Placeholders.tsx";
import PatientAppointments from "./pages/doctor/sections/PatientAppointments.tsx";
import MyPatients from "./pages/doctor/sections/MyPatients.tsx";
import PatientFeedback from "./pages/doctor/sections/PatientFeedback.tsx";
import PatientOrders from "./pages/doctor/sections/PatientOrders.tsx";
import DoctorPayouts from "./pages/doctor/sections/DoctorPayouts.tsx";
import AboutAyuzeePartner from "./pages/doctor/sections/AboutAyuzeePartner.tsx";
import PartnerApply from "./pages/PartnerApply.tsx";
import VaidyaLayout from "./pages/vaidya/VaidyaLayout.tsx";
import VaidyaHome from "./pages/vaidya/VaidyaHome.tsx";
import AllPatients from "./pages/vaidya/sections/AllPatients.tsx";
import Consultations from "./pages/vaidya/sections/Consultations.tsx";
import FollowUps from "./pages/vaidya/sections/FollowUps.tsx";
import UpcomingAppointments from "./pages/vaidya/sections/UpcomingAppointments.tsx";
import Leads from "./pages/vaidya/sections/Leads.tsx";
import Inventory from "./pages/vaidya/sections/Inventory.tsx";
import BillsPage from "./pages/vaidya/sections/Bills.tsx";
import PartnerNetwork from "./pages/vaidya/sections/PartnerNetwork.tsx";
import TherapyPlans from "./pages/vaidya/sections/TherapyPlans.tsx";
import TherapyCatalog from "./pages/vaidya/sections/TherapyCatalog.tsx";
import Therapies from "./pages/Therapies.tsx";
import AdminTherapies from "./pages/admin/AdminTherapies.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminDoctors from "./pages/admin/AdminDoctors.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminAppointments from "./pages/admin/AdminAppointments.tsx";
import AdminSessions from "./pages/admin/AdminSessions.tsx";
import AdminPrescriptions from "./pages/admin/AdminPrescriptions.tsx";
import AdminCommissions from "./pages/admin/AdminCommissions.tsx";
import AdminPayments from "./pages/admin/AdminPayments.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminSafety from "./pages/admin/AdminSafety.tsx";
import AdminNotifications from "./pages/admin/AdminNotifications.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminBlogs from "./pages/admin/AdminBlogs.tsx";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder.tsx";
import Diagnosis from "./pages/Diagnosis.tsx";
import PrakritiIntro from "./pages/diagnosis/PrakritiIntro.tsx";
import PrakritiRun from "./pages/diagnosis/PrakritiRun.tsx";
import PrakritiResult from "./pages/diagnosis/PrakritiResult.tsx";
import SymptomChecker from "./pages/diagnosis/SymptomChecker.tsx";
import AssessmentIntro from "./pages/diagnosis/AssessmentIntro.tsx";
import AssessmentRun from "./pages/diagnosis/AssessmentRun.tsx";
import AssessmentResult from "./pages/diagnosis/AssessmentResult.tsx";
import HmsPrakriti from "./pages/vaidya/sections/HmsPrakriti.tsx";
import DeveloperApi from "./pages/vaidya/sections/DeveloperApi.tsx";
import Feed from "./pages/Feed.tsx";
import FeedPost from "./pages/FeedPost.tsx";
import LearningLayout from "./pages/Learning.tsx";
import Courses from "./pages/learning/Courses.tsx";
import CourseDetail from "./pages/learning/CourseDetail.tsx";
import CourseQuiz from "./pages/learning/CourseQuiz.tsx";
import Certificate from "./pages/learning/Certificate.tsx";
import Webinars from "./pages/learning/Webinars.tsx";
import Quizzes from "./pages/learning/Quizzes.tsx";
import Blogs from "./pages/learning/Blogs.tsx";
import BlogDetail from "./pages/learning/BlogDetail.tsx";
import DoctorBlogs from "./pages/doctor/sections/DoctorBlogs.tsx";
import DoctorFeed from "./pages/doctor/sections/DoctorFeed.tsx";
import AdminLearning from "./pages/admin/AdminLearning.tsx";
import Clinics from "./pages/Clinics.tsx";
import Offers from "./pages/shop/Offers.tsx";
import Jobs from "./pages/Jobs.tsx";
import JobPost from "./pages/JobPost.tsx";
import Search from "./pages/Search.tsx";
import Referral from "./pages/Referral.tsx";
import LoginPicker from "./pages/LoginPicker.tsx";
import ProviderAuth from "./pages/provider/ProviderAuth.tsx";
import ProviderHome from "./pages/provider/ProviderHome.tsx";
import PatientLayout from "./pages/patient/PatientLayout.tsx";
import PatientProfile from "./pages/patient/PatientProfile.tsx";
import PatientAppointmentsList from "./pages/patient/PatientAppointmentsList.tsx";
import PatientPlaceholder from "./pages/patient/PatientPlaceholder.tsx";
import PatientSavedPosts from "./pages/patient/PatientSavedPosts.tsx";
import MyOrders from "./pages/patient/PatientOrders.tsx";
import PatientAddresses from "./pages/patient/PatientAddresses.tsx";
import PatientBank from "./pages/patient/PatientBank.tsx";
import PatientSavedMedicines from "./pages/patient/PatientSavedMedicines.tsx";
import PatientWallet from "./pages/patient/PatientWallet.tsx";
import PatientHelp from "./pages/patient/PatientHelp.tsx";
import HealthConditions from "./pages/health/HealthConditions.tsx";
import HealthConditionDetail from "./pages/health/HealthConditionDetail.tsx";
import AdminHealthConditions from "./pages/admin/AdminHealthConditions.tsx";
import AdminConditionLeads from "./pages/admin/AdminConditionLeads.tsx";
import AdminTreatmentSystems from "./pages/admin/AdminTreatmentSystems.tsx";
import AdminAuth from "./pages/admin/AdminAuth.tsx";
import AdminManagement from "./pages/admin/AdminManagement.tsx";
import AdminTherapists from "./pages/admin/AdminTherapists.tsx";
import AdminVenues from "./pages/admin/AdminVenues.tsx";
import AdminStudents from "./pages/admin/AdminStudents.tsx";
import AdminRevenueSplit from "./pages/admin/AdminRevenueSplit.tsx";
import AdminJobs from "./pages/admin/AdminJobs.tsx";
import TreatmentSystem from "./pages/treatments/TreatmentSystem.tsx";
import BookTherapySession from "./pages/patient/BookTherapySession.tsx";
import TherapyBooking from "./pages/TherapyBooking.tsx";
import Therapists from "./pages/therapists/Therapists.tsx";
import TherapistDetail from "./pages/therapists/TherapistDetail.tsx";
import TherapistBrowse from "./pages/TherapistBrowse.tsx";
import VenueBrowse from "./pages/VenueBrowse.tsx";
import TherapistAuth from "./pages/therapist/TherapistAuth.tsx";
import TherapistLayout from "./pages/therapist/TherapistLayout.tsx";
import TherapistDashboard from "./pages/therapist/TherapistDashboard.tsx";
import TherapistSessions from "./pages/therapist/TherapistSessions.tsx";
import TherapistEarnings from "./pages/therapist/TherapistEarnings.tsx";
import TherapistProfile from "./pages/therapist/TherapistProfile.tsx";
import TherapistAvailability from "./pages/therapist/TherapistAvailability.tsx";
import TherapistSupport from "./pages/therapist/TherapistSupport.tsx";
import VenueAuth from "./pages/venue/VenueAuth.tsx";
import VenueLayout from "./pages/venue/VenueLayout.tsx";
import VenueDashboard from "./pages/venue/VenueDashboard.tsx";
import VenueRooms from "./pages/venue/VenueRooms.tsx";
import VenueBookings from "./pages/venue/VenueBookings.tsx";
import VenueRevenue from "./pages/venue/VenueRevenue.tsx";
import VenueProfile from "./pages/venue/VenueProfile.tsx";
import StudentAuth from "./pages/student/StudentAuth.tsx";
import StudentLayout from "./pages/student/StudentLayout.tsx";
import StudentDashboard from "./pages/student/StudentDashboard.tsx";
import StudentCourses from "./pages/student/StudentCourses.tsx";
import StudentWebinars from "./pages/student/StudentWebinars.tsx";
import StudentJobs from "./pages/student/StudentJobs.tsx";
import StudentResearch from "./pages/student/StudentResearch.tsx";
import StudentCertificates from "./pages/student/StudentCertificates.tsx";
import StudentProfilePage from "./pages/student/StudentProfile.tsx";
import ShopByCondition from "./pages/shop/ShopByCondition.tsx";
import ConditionProducts from "./pages/shop/ConditionProducts.tsx";
import PanchakarmaShop from "./pages/shop/PanchakarmaShop.tsx";
import AyushSurgicals from "./pages/shop/AyushSurgicals.tsx";
import TrackOrder from "./pages/shop/TrackOrder.tsx";
import PrescriptionUpload from "./pages/shop/PrescriptionUpload.tsx";
import TreatmentKits from "./pages/shop/TreatmentKits.tsx";
import AtmriHelp from "./pages/atmri-help/AtmriHelp.tsx";
import AtmriCasesList from "./pages/atmri-help/CasesList.tsx";
import AtmriCaseDetail from "./pages/atmri-help/CaseDetail.tsx";
import AtmriApply from "./pages/atmri-help/Apply.tsx";
import AtmriDoctorPledge from "./pages/atmri-help/DoctorPledge.tsx";
import AtmriPartnerHospitals from "./pages/atmri-help/PartnerHospitals.tsx";
import AdminAtmriHelp from "./pages/admin/AdminAtmriHelp.tsx";
import AtmriComingSoon from "./pages/atmri-help/ComingSoon.tsx";

const queryClient = new QueryClient();

const AdminAwareNav = () => {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/homeo");
  return hideNav ? null : <SiteNav appLevel />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminAwareNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPicker />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/provider/auth" element={<ProviderAuth />} />
            <Route path="/provider" element={<ProviderHome />} />
            <Route path="/student/auth" element={<StudentAuth />} />
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="webinars" element={<StudentWebinars />} />
              <Route path="jobs" element={<StudentJobs />} />
              <Route path="research" element={<StudentResearch />} />
              <Route path="certificates" element={<StudentCertificates />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>
            <Route path="/dashboard" element={<PatientLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="appointments" element={<PatientAppointmentsList />} />
              <Route path="saved-medicines" element={<PatientSavedMedicines />} />
              <Route path="saved-posts" element={<PatientSavedPosts />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="addresses" element={<PatientAddresses />} />
              <Route path="wallet" element={<PatientWallet />} />
              <Route path="bank" element={<PatientBank />} />
              <Route path="help" element={<PatientHelp />} />
            </Route>
            <Route path="/referral" element={<Referral />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/search" element={<Search />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/post" element={<JobPost />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/conditions" element={<ShopByCondition />} />
            <Route path="/shop/conditions/:slug" element={<ConditionProducts />} />
            <Route path="/shop/panchakarma" element={<PanchakarmaShop />} />
            <Route path="/shop/surgicals" element={<AyushSurgicals />} />
            <Route path="/shop/track" element={<TrackOrder />} />
            <Route path="/shop/prescription" element={<PrescriptionUpload />} />
            <Route path="/shop/treatment-kits" element={<TreatmentKits />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/health-conditions" element={<HealthConditions />} />
            <Route path="/health-conditions/:slug" element={<HealthConditionDetail />} />
            <Route path="/treatments/:slug" element={<TreatmentSystem />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/partner/apply" element={<PartnerApply />} />
            <Route path="/bulk" element={<Bulk />} />
            <Route path="/therapies" element={<Therapies />} />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/therapists/:id" element={<TherapistDetail />} />
            <Route path="/therapist/browse" element={<TherapistBrowse />} />
            <Route path="/therapist/:id" element={<TherapistDetail />} />
            <Route path="/therapist/auth" element={<TherapistAuth />} />
            <Route path="/therapist" element={<TherapistLayout />}>
              <Route index element={<TherapistDashboard />} />
              <Route path="sessions" element={<TherapistSessions />} />
              <Route path="availability" element={<TherapistAvailability />} />
              <Route path="earnings" element={<TherapistEarnings />} />
              <Route path="profile" element={<TherapistProfile />} />
              <Route path="support" element={<TherapistSupport />} />
            </Route>
            <Route path="/therapy-plans/:planId/book" element={<BookTherapySession />} />
            <Route path="/therapy-booking/:sessionId" element={<TherapyBooking />} />
            <Route path="/venue/browse" element={<VenueBrowse />} />
            <Route path="/venue/auth" element={<VenueAuth />} />
            <Route path="/venue" element={<VenueLayout />}>
              <Route index element={<VenueDashboard />} />
              <Route path="rooms" element={<VenueRooms />} />
              <Route path="bookings" element={<VenueBookings />} />
              <Route path="revenue" element={<VenueRevenue />} />
              <Route path="profile" element={<VenueProfile />} />
            </Route>
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="admins" element={<AdminManagement />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="sessions" element={<AdminSessions />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="prescriptions" element={<AdminPrescriptions />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="commissions" element={<AdminCommissions />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="safety" element={<AdminSafety />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="therapies" element={<AdminTherapies />} />
              <Route path="learning" element={<AdminLearning />} />
              <Route path="health-conditions" element={<AdminHealthConditions />} />
              <Route path="treatment-systems" element={<AdminTreatmentSystems />} />
              <Route path="condition-leads" element={<AdminConditionLeads />} />
              <Route path="therapists" element={<AdminTherapists />} />
              <Route path="venues" element={<AdminVenues />} />
              <Route path="therapy-sessions" element={<AdminSessions />} />
              <Route path="revenue-split" element={<AdminRevenueSplit />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="atmri-help" element={<AdminAtmriHelp />} />
            </Route>
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/diagnosis/symptoms" element={<SymptomChecker />} />
            <Route path="/diagnosis/prakriti" element={<PrakritiIntro />} />
            <Route path="/diagnosis/prakriti/run" element={<PrakritiRun />} />
            <Route path="/diagnosis/prakriti/result/:id" element={<PrakritiResult />} />
            <Route path="/diagnosis/:slug" element={<AssessmentIntro />} />
            <Route path="/diagnosis/:slug/run" element={<AssessmentRun />} />
            <Route path="/diagnosis/:slug/result" element={<AssessmentResult />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/feed/:id" element={<FeedPost />} />
            <Route path="/learning" element={<LearningLayout />}>
              <Route index element={<Courses />} />
              <Route path="courses" element={<Courses />} />
              <Route path="webinars" element={<Webinars />} />
              <Route path="quiz" element={<Quizzes />} />
              <Route path="blogs" element={<Blogs />} />
            </Route>
            <Route path="/learning/courses/:slug" element={<CourseDetail />} />
            <Route path="/learning/courses/:slug/quiz" element={<CourseQuiz />} />
            <Route path="/learning/blogs/:slug" element={<BlogDetail />} />
            <Route path="/learning/certificates/:id" element={<Certificate />} />
            
            <Route path="/vaidya" element={<VaidyaLayout />}>
              <Route index element={<VaidyaHome />} />
              <Route path="patients" element={<AllPatients />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="follow-up" element={<FollowUps />} />
              <Route path="upcoming" element={<UpcomingAppointments />} />
              <Route path="leads" element={<Leads />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="bills" element={<BillsPage type="patient_bill" />} />
              <Route path="direct-selling" element={<BillsPage type="direct_selling" />} />
              <Route path="network" element={<PartnerNetwork />} />
              <Route path="therapy-plans" element={<TherapyPlans />} />
              <Route path="therapy-catalog" element={<TherapyCatalog />} />
              <Route path="prakriti" element={<HmsPrakriti />} />
              <Route path="developer" element={<DeveloperApi />} />
            </Route>
            <Route path="/doctor/auth" element={<DoctorAuth />} />
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorHome />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="patients" element={<MyPatients />} />
              <Route path="feedback" element={<PatientFeedback />} />
              <Route path="patient-orders" element={<PatientOrders />} />
              <Route path="orders" element={<DoctorOrders />} />
              <Route path="medicines" element={<DoctorMedicines />} />
              <Route path="saved" element={<DoctorSavedPosts />} />
              <Route path="feed" element={<DoctorFeed />} />
              <Route path="blogs" element={<DoctorBlogs />} />
              <Route path="ayuzee-money" element={<AyuzeeMoney />} />
              <Route path="addresses" element={<DoctorAddresses />} />
              <Route path="bank" element={<DoctorBank />} />
              <Route path="rewards" element={<DoctorRewards />} />
              <Route path="clinic" element={<DoctorClinic />} />
              <Route path="category" element={<DoctorCategory />} />
              <Route path="company" element={<DoctorCompany />} />
              <Route path="payouts" element={<DoctorPayouts />} />
              <Route path="about-partner" element={<AboutAyuzeePartner />} />
              <Route path="support" element={<DoctorSupport />} />
            </Route>
            <Route path="/atmri-help" element={<AtmriHelp />} />
            <Route path="/atmri-help/cases" element={<AtmriCasesList />} />
            <Route path="/atmri-help/cases/:id" element={<AtmriCaseDetail />} />
            <Route path="/atmri-help/apply" element={<AtmriApply />} />
            <Route path="/atmri-help/pledge" element={<AtmriDoctorPledge />} />
            <Route path="/atmri-help/hospitals" element={<AtmriPartnerHospitals />} />
            <Route path="/atmri-help/campaigns" element={<AtmriComingSoon title="Active Campaigns" />} />
            <Route path="/atmri-help/csr" element={<AtmriComingSoon title="CSR Partnerships" />} />
            <Route path="/atmri-help/impact" element={<AtmriComingSoon title="Impact Dashboard" />} />
            <Route path="/atmri-help/leaderboard" element={<AtmriComingSoon title="Doctor Leaderboard" />} />
            {/* /ayush-help aliases */}
            <Route path="/ayush-help" element={<AtmriHelp />} />
            <Route path="/ayush-help/cases" element={<AtmriCasesList />} />
            <Route path="/ayush-help/cases/:id" element={<AtmriCaseDetail />} />
            <Route path="/ayush-help/apply" element={<AtmriApply />} />
            <Route path="/ayush-help/pledge" element={<AtmriDoctorPledge />} />
            <Route path="/ayush-help/hospitals" element={<AtmriPartnerHospitals />} />
            <Route path="/ayush-help/campaigns" element={<AtmriComingSoon title="Active Campaigns" />} />
            <Route path="/ayush-help/csr" element={<AtmriComingSoon title="CSR Partnerships" />} />
            <Route path="/ayush-help/impact" element={<AtmriComingSoon title="Impact Dashboard" />} />
            <Route path="/ayush-help/leaderboard" element={<AtmriComingSoon title="Doctor Leaderboard" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
