/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const AdminAuth = lazyPage(() => import("@/pages/admin/AdminAuth"));
export const Auth = lazyPage(() => import("@/pages/Auth"));
export const DoctorAuth = lazyPage(() => import("@/pages/doctor/DoctorAuth"));
export const LoginPicker = lazyPage(() => import("@/pages/LoginPicker"));
export const ProviderAuth = lazyPage(() => import("@/pages/provider/ProviderAuth"));
export const ProviderHome = lazyPage(() => import("@/pages/provider/ProviderHome"));
export const ResetPassword = lazyPage(() => import("@/pages/ResetPassword"));
export const StudentAuth = lazyPage(() => import("@/pages/student/StudentAuth"));
export const TherapistAuth = lazyPage(() => import("@/pages/therapist/TherapistAuth"));
export const VenueAuth = lazyPage(() => import("@/pages/venue/VenueAuth"));
