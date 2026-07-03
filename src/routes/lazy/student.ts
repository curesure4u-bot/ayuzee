/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const StudentCertificates = lazyPage(() => import("@/pages/student/StudentCertificates"));
export const StudentCourses = lazyPage(() => import("@/pages/student/StudentCourses"));
export const StudentDashboard = lazyPage(() => import("@/pages/student/StudentDashboard"));
export const StudentJobs = lazyPage(() => import("@/pages/student/StudentJobs"));
export const StudentLayout = lazyPage(() => import("@/pages/student/StudentLayout"));
export const StudentProfilePage = lazyPage(() => import("@/pages/student/StudentProfile"));
export const StudentResearch = lazyPage(() => import("@/pages/student/StudentResearch"));
export const StudentWebinars = lazyPage(() => import("@/pages/student/StudentWebinars"));
