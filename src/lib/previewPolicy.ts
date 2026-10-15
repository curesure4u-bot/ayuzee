export const informationalRoutes = [
  "/", "/about-us", "/contact", "/press", "/careers",
  "/privacy-policy", "/terms-of-use", "/refund-policy", "/medical-disclaimer",
] as const;

export function previewForPath(pathname: string): string | null {
  let path: string;
  try {
    const decoded = decodeURIComponent(pathname).replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    path = new URL(decoded, "https://preview.invalid").pathname.replace(/\/$/, "").toLowerCase() || "/";
  } catch {
    return "This area";
  }
  if (informationalRoutes.some(route => route === path) || path === "/blog" || path.startsWith("/blog/") || path === "/guides" || path.startsWith("/guides/")) return null;
  const root = path.split("/")[1];
  if (["auth", "login", "reset-password", "onboarding"].includes(root)) return "Account access";
  if (["shop", "checkout", "cart", "wallet", "payments", "orders", "membership", "gamification"].includes(root)) return "Shopping and payments";
  if (["hms", "vaidya", "patient", "spine", "homeo", "therapist", "venue", "consultation", "diagnosis", "assessment", "health-locker", "abdm", "therapy-booking"].includes(root)) return "Care and clinical tools";
  if (["community", "feed", "doctor", "student", "beyond"].includes(root)) return "Community and member tools";
  return "This area";
}
