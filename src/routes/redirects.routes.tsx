import { Navigate, Route } from "react-router-dom";

/** Canonical SEO redirects — legacy /acupuncture/* paths → /treatments/* */
export const redirectRoutes = (
  <>
    <Route path="/acupuncture" element={<Navigate to="/treatments/acupuncture" replace />} />
    <Route path="/tung-points" element={<Navigate to="/treatments/tung-points" replace />} />
    <Route path="/acupuncture/points" element={<Navigate to="/treatments/acupoints-uses" replace />} />
    <Route path="/acupuncture/homeopathy" element={<Navigate to="/treatments/acupuncture-homeopathy" replace />} />
    <Route path="/acupuncture/50-diseases" element={<Navigate to="/treatments/acupuncture-50-diseases" replace />} />
    <Route path="/acupuncture/300-diseases" element={<Navigate to="/treatments/acupuncture-300-diseases" replace />} />
  </>
);
