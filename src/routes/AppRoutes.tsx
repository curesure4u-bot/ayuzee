import { useEffect, useState, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { RouteFallback } from "@/components/common/PageLoader";
import { redirectRoutes } from "@/routes/redirects.routes";
import { authRoutes } from "@/routes/auth.routes";
import { shopRoutes } from "@/routes/shop.routes";
import { diagnosisRoutes } from "@/routes/diagnosis.routes";
import { publicRoutes, notFoundRoute } from "@/routes/public.routes";
import { useGamificationRoutes } from "@/routes/gamification.routes";

/** Portal route trees loaded after first paint to shrink the initial bundle. */
const PORTAL_ROUTE_LOADERS: Array<() => Promise<ReactNode>> = [
  () => import("@/routes/student.routes").then((m) => m.studentRoutes),
  () => import("@/routes/patient.routes").then((m) => m.patientRoutes),
  () => import("@/routes/consultation.routes").then((m) => m.consultationRoutes),
  () => import("@/routes/therapist.routes").then((m) => m.therapistRoutes),
  () => import("@/routes/venue.routes").then((m) => m.venueRoutes),
  () => import("@/routes/admin.routes").then((m) => m.adminRoutes),
  () => import("@/routes/learning.routes").then((m) => m.learningRoutes),
  () => import("@/routes/vaidya.routes").then((m) => m.vaidyaRoutes),
  () => import("@/routes/doctor.routes").then((m) => m.doctorRoutes),
  () => import("@/routes/atmri.routes").then((m) => m.atmriRoutes),
  () => import("@/routes/homeo.routes").then((m) => m.homeoRoutes),
];

export const AppRoutes = () => {
  const [portalRoutes, setPortalRoutes] = useState<ReactNode>(null);
  const gamificationRoutes = useGamificationRoutes();

  useEffect(() => {
    let cancelled = false;
    Promise.all(PORTAL_ROUTE_LOADERS.map((load) => load())).then((chunks) => {
      if (cancelled) return;
      setPortalRoutes(<>{chunks}</>);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Routes>
      {redirectRoutes}
      {authRoutes}
      {shopRoutes}
      {diagnosisRoutes}
      {publicRoutes}
      {portalRoutes}
      {gamificationRoutes}
      {portalRoutes ? notFoundRoute : <Route path="*" element={<RouteFallback />} />}
    </Routes>
  );
};
