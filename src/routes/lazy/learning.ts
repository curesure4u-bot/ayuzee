/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const BlogDetail = lazyPage(() => import("@/pages/learning/BlogDetail"));
export const Blogs = lazyPage(() => import("@/pages/learning/Blogs"));
export const Certificate = lazyPage(() => import("@/pages/learning/Certificate"));
export const CourseDetail = lazyPage(() => import("@/pages/learning/CourseDetail"));
export const CourseQuiz = lazyPage(() => import("@/pages/learning/CourseQuiz"));
export const Courses = lazyPage(() => import("@/pages/learning/Courses"));
export const LearningLayout = lazyPage(() => import("@/pages/Learning"));
export const Library = lazyPage(() => import("@/pages/learning/Library"));
export const Quizzes = lazyPage(() => import("@/pages/learning/Quizzes"));
export const Webinars = lazyPage(() => import("@/pages/learning/Webinars"));
