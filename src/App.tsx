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
            <Route path="/doctor/auth" element={<DoctorAuth />} />
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorProfile />} />
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
