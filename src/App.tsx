import { BrowserRouter, useLocation } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { RouteSEO } from "@/components/common/RouteSEO";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { FAQChatbot } from "@/components/site/FAQChatbot";
import { VoiceAssistant } from "@/components/site/VoiceAssistant";
import TelegramFloat from "@/components/common/TelegramFloat";
import GlobalSearch from "@/components/GlobalSearch";
import AiAssistant from "@/components/AiAssistant";
import NotificationCenter from "@/components/NotificationCenter";

const NotificationBellFixed = () => {
  const location = useLocation();
  // Hide on admin/hms pages that have their own notification systems
  if (location.pathname.startsWith("/admin")) return null;
  return (
    <div className="fixed top-3 right-16 z-50 hidden lg:block">
      <NotificationCenter />
    </div>
  );
};

const AdminAwareNav = () => {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/homeo") ||
    location.pathname.startsWith("/hms") ||
    /^\/consultation\/[^/]+\/room$/.test(location.pathname);
  return hideNav ? null : <SiteNav appLevel />;
};

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <ScrollToTop />
      <RouteSEO />
      <AdminAwareNav />
      <AppRoutes />
      <FAQChatbot />
      <VoiceAssistant />
      <TelegramFloat />
      <GlobalSearch />
      <AiAssistant />
      <NotificationBellFixed />
    </BrowserRouter>
  </AppProviders>
);

export default App;
