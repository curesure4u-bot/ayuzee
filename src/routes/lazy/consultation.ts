/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const ConsultationRoom = lazyPage(() => import("@/pages/consultation/ConsultationRoom"));
export const ConsultationSummary = lazyPage(() => import("@/pages/consultation/ConsultationSummary"));
export const PostConsultationFeedback = lazyPage(() => import("@/pages/consultation/PostConsultationFeedback"));
export const PreConsultationForm = lazyPage(() => import("@/pages/consultation/PreConsultationForm"));
