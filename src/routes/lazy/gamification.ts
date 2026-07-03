/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const AppreciationWall = lazyPage(() => import("@/pages/gamification/AppreciationWall"));
export const CertificateView = lazyPage(() => import("@/pages/gamification/CertificateView"));
export const Challenges = lazyPage(() => import("@/pages/gamification/Challenges"));
export const GamRewards = lazyPage(() => import("@/pages/gamification/Rewards"));
export const GamificationDashboard = lazyPage(() => import("@/pages/gamification/GamificationDashboard"));
export const GamificationLayout = lazyPage(() => import("@/pages/gamification/GamificationLayout"));
export const Leaderboard = lazyPage(() => import("@/pages/gamification/Leaderboard"));
export const MyBadges = lazyPage(() => import("@/pages/gamification/MyBadges"));
export const MyCertificates = lazyPage(() => import("@/pages/gamification/MyCertificates"));
export const MyPoints = lazyPage(() => import("@/pages/gamification/MyPoints"));
