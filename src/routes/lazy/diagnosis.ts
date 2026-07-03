/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const AssessmentIntro = lazyPage(() => import("@/pages/diagnosis/AssessmentIntro"));
export const AssessmentResult = lazyPage(() => import("@/pages/diagnosis/AssessmentResult"));
export const AssessmentRun = lazyPage(() => import("@/pages/diagnosis/AssessmentRun"));
export const Diagnosis = lazyPage(() => import("@/pages/Diagnosis"));
export const PrakritiIntro = lazyPage(() => import("@/pages/diagnosis/PrakritiIntro"));
export const PrakritiResult = lazyPage(() => import("@/pages/diagnosis/PrakritiResult"));
export const PrakritiRun = lazyPage(() => import("@/pages/diagnosis/PrakritiRun"));
export const SymptomChecker = lazyPage(() => import("@/pages/diagnosis/SymptomChecker"));
