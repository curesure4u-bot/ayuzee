/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const Dashboard = lazyPage(() => import("@/pages/Dashboard"));
export const MyOrders = lazyPage(() => import("@/pages/patient/PatientOrders"));
export const PatientAddresses = lazyPage(() => import("@/pages/patient/PatientAddresses"));
export const PatientAppointmentsList = lazyPage(() => import("@/pages/patient/PatientAppointmentsList"));
export const PatientBank = lazyPage(() => import("@/pages/patient/PatientBank"));
export const PatientGuidance = lazyPage(() => import("@/pages/patient/PatientGuidance"));
export const PatientHelp = lazyPage(() => import("@/pages/patient/PatientHelp"));
export const PatientLayout = lazyPage(() => import("@/pages/patient/PatientLayout"));
export const PatientProfile = lazyPage(() => import("@/pages/patient/PatientProfile"));
export const PatientSavedMedicines = lazyPage(() => import("@/pages/patient/PatientSavedMedicines"));
export const PatientSavedPosts = lazyPage(() => import("@/pages/patient/PatientSavedPosts"));
export const PatientWallet = lazyPage(() => import("@/pages/patient/PatientWallet"));
