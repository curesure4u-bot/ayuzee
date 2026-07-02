import { BrowserRouter, useLocation } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { RouteSEO } from "@/components/common/RouteSEO";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";
import { ScrollToTop } from "@/components/common/ScrollToTop";

const AdminAwareNav = () => {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/homeo") ||
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
    </BrowserRouter>
  </AppProviders>
);

export default App;
