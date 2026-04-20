import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/partner/apply" element={<PartnerApply />} />
            <Route path="/bulk" element={<Bulk />} />
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
            </Route>
            <Route path="/doctor/auth" element={<DoctorAuth />} />
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorProfile />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="patients" element={<MyPatients />} />
              <Route path="feedback" element={<PatientFeedback />} />
              <Route path="patient-orders" element={<PatientOrders />} />
              <Route path="orders" element={<DoctorOrders />} />
              <Route path="medicines" element={<DoctorMedicines />} />
              <Route path="saved" element={<DoctorSavedPosts />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
