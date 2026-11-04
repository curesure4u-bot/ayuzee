import { BrowserRouter } from "react-router-dom";
import { PublicPreviewNav } from "@/components/common/PublicPreviewNav";
import { RouteSEO } from "@/components/common/RouteSEO";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { FeaturePreviewBoundary } from "@/components/common/FeaturePreview";

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <ScrollToTop />
      <RouteSEO />
      <FeaturePreviewBoundary>
        <PublicPreviewNav />
        <AppRoutes />
      </FeaturePreviewBoundary>
    </BrowserRouter>
  </AppProviders>
);

export default App;
