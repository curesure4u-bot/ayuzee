/** Auto-generated — run `node scripts/generate-lazy-barrels.mjs` */
import { lazyPage } from "@/routes/lazy/lazyPage";

export const VenueBookings = lazyPage(() => import("@/pages/venue/VenueBookings"));
export const VenueDashboard = lazyPage(() => import("@/pages/venue/VenueDashboard"));
export const VenueLayout = lazyPage(() => import("@/pages/venue/VenueLayout"));
export const VenueProfile = lazyPage(() => import("@/pages/venue/VenueProfile"));
export const VenueRevenue = lazyPage(() => import("@/pages/venue/VenueRevenue"));
export const VenueRooms = lazyPage(() => import("@/pages/venue/VenueRooms"));
