import { lazy } from "react";

// The launch layout stays available for later acceptance without initializing
// its backend imports on the public information page.
export const LaunchHome = lazy(() => import("./LaunchHome"));
export { PublicPreviewHome as default } from "@/components/common/PublicPreviewHome";
