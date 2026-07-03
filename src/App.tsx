import { lazy, Suspense } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { RouteSEO } from "@/components/common/RouteSEO";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { hasAnalyticsConsent } from "@/lib/consent";
import { initMonitoring } from "@/lib/monitoring";

const SiteNav = lazy(() => import("@/components/site/SiteNav").then((m) => ({ default: m.SiteNav })));

const AnalyticsBootstrap = () => {
  useEffect(() => {
    if (hasAnalyticsConsent()) initMonitoring();
  }, []);
  return null;
};

const AdminAwareNav = () => {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/homeo") ||
    /^\/consultation\/[^/]+\/room$/.test(location.pathname);
  if (hideNav) return null;
  return (
    <Suspense fallback={null}>
      <SiteNav appLevel />
    </Suspense>
  );
};

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <AnalyticsBootstrap />
      <ScrollToTop />
      <RouteSEO />
      <AdminAwareNav />
      <AppRoutes />
      <CookieConsentBanner />
    </BrowserRouter>
  </AppProviders>
);

export default App;
