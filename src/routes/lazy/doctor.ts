/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const ASTGBookmarks = lazyPage(() => import("@/pages/doctor/ASTGBookmarks"));
export const ASTGDiseaseDetail = lazyPage(() => import("@/pages/doctor/ASTGDiseaseDetail"));
export const ASTGReference = lazyPage(() => import("@/pages/doctor/ASTGReference"));
export const AboutAyuzeePartner = lazyPage(() => import("@/pages/doctor/sections/AboutAyuzeePartner"));
export const AfiDiseaseIndex = lazyPage(() => import("@/pages/doctor/AfiDiseaseIndex"));
export const AfiFormulaDetail = lazyPage(() => import("@/pages/doctor/AfiFormulaDetail"));
export const AfiFormulary = lazyPage(() => import("@/pages/doctor/AfiFormulary"));
export const AfiIngredientFormulations = lazyPage(() => import("@/pages/doctor/AfiIngredientFormulations"));
export const AyuzeeMoney = lazyPage(() => import("@/pages/doctor/sections/AyuzeeMoney"));
export const ClassicalFormulary = lazyPage(() => import("@/pages/doctor/ClassicalFormulary"));
export const DoctorAddresses = lazyPage(() => import("@/pages/doctor/sections/DoctorAddresses"));
export const DoctorBank = lazyPage(() => import("@/pages/doctor/sections/DoctorBank"));
export const DoctorBlogs = lazyPage(() => import("@/pages/doctor/sections/DoctorBlogs"));
export const DoctorCategory = lazyPage(() => import("@/pages/doctor/sections/DoctorCategory"));
export const DoctorClinic = lazyPage(() => import("@/pages/doctor/sections/DoctorClinic"));
export const DoctorCompany = lazyPage(() => import("@/pages/doctor/sections/DoctorCompany"));
export const DoctorFeed = lazyPage(() => import("@/pages/doctor/sections/DoctorFeed"));
export const DoctorHome = lazyPage(() => import("@/pages/doctor/DoctorHome"));
export const DoctorLayout = lazyPage(() => import("@/pages/doctor/DoctorLayout"));
export const DoctorMedicines = lazyPage(() => import("@/pages/doctor/sections/DoctorMedicines"));
export const DoctorOrders = lazyPage(() => import("@/pages/doctor/sections/DoctorOrders"));
export const DoctorPayouts = lazyPage(() => import("@/pages/doctor/sections/DoctorPayouts"));
export const DoctorProfile = lazyPage(() => import("@/pages/doctor/sections/DoctorProfile"));
export const DoctorRewards = lazyPage(() => import("@/pages/doctor/sections/DoctorRewards"));
export const DoctorSavedPosts = lazyPage(() => import("@/pages/doctor/sections/DoctorSavedPosts"));
export const DoctorSupport = lazyPage(() =>
  import("@/pages/doctor/sections/Placeholders").then((m) => ({ default: m.DoctorSupport })),
);
export const FormularyPrescription = lazyPage(() => import("@/pages/doctor/FormularyPrescription"));
export const IngredientEncyclopedia = lazyPage(() => import("@/pages/doctor/IngredientEncyclopedia"));
export const MyPatients = lazyPage(() => import("@/pages/doctor/sections/MyPatients"));
export const PatientAppointments = lazyPage(() => import("@/pages/doctor/sections/PatientAppointments"));
export const PatientFeedback = lazyPage(() => import("@/pages/doctor/sections/PatientFeedback"));
export const PatientOrders = lazyPage(() => import("@/pages/doctor/sections/PatientOrders"));
