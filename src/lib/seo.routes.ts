import type { SEOOptions } from "@/lib/seo";

export type RouteSEOEntry = {
  title: string;
  description?: string;
  canonicalPath?: string;
} & SEOOptions;

const PUBLIC_ROUTE_SEO: Record<string, RouteSEOEntry> = {
  "/about-us": {
    title: "About Us",
    description: "Learn about Ayuzee — India's trusted AYUSH healthcare platform connecting patients with verified doctors and authentic medicines.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Get in touch with the Ayuzee team for support, partnerships, or general enquiries.",
  },
  "/careers": {
    title: "Careers",
    description: "Join Ayuzee and help bring authentic Ayurveda and AYUSH healthcare to millions across India.",
  },
  "/blog": {
    title: "Blog",
    description: "AYUSH wellness articles, Ayurveda tips, and health insights from verified practitioners on Ayuzee.",
    ogType: "article",
  },
  "/cart": {
    title: "Shopping Cart",
    description: "Review your AYUSH medicines and wellness products before checkout on Ayuzee.",
    noIndex: true,
  },
  "/checkout": {
    title: "Checkout",
    description: "Secure checkout for authentic AYUSH medicines and wellness products.",
    noIndex: true,
  },
  "/auth": {
    title: "Sign In",
    description: "Sign in to your Ayuzee account to book doctors, track orders, and manage your wellness journey.",
    noIndex: true,
  },
  "/login": {
    title: "Login",
    description: "Choose your Ayuzee portal — patient, doctor, clinic, or partner login.",
    noIndex: true,
  },
  "/clinics": {
    title: "Find a Clinic",
    description: "Discover verified Ayurveda and AYUSH clinics near you on Ayuzee.",
  },
  "/jobs": {
    title: "Ayurveda Jobs Board",
    description: "Browse Ayurveda, Homeopathy, and AYUSH healthcare jobs across India.",
  },
  "/feed": {
    title: "Community Feed",
    description: "Wellness stories, doctor insights, and AYUSH health updates from the Ayuzee community.",
  },
  "/partner": {
    title: "Partner with Ayuzee",
    description: "Grow your AYUSH practice or business by partnering with India's leading wellness platform.",
  },
  "/bulk": {
    title: "Bulk Purchase",
    description: "Order AYUSH medicines and wellness products in bulk for clinics, hospitals, and retailers.",
  },
  "/diagnosis": {
    title: "AI Health Diagnosis",
    description: "Discover your Prakriti constitution and explore AI-assisted AYUSH health assessments on Ayuzee.",
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description: "How Ayuzee collects, uses, and protects your personal and health information.",
  },
  "/terms-of-use": {
    title: "Terms of Use",
    description: "Terms and conditions for using the Ayuzee AYUSH healthcare platform.",
  },
  "/refund-policy": {
    title: "Refund Policy",
    description: "Ayuzee refund and cancellation policy for orders, consultations, and services.",
  },
  "/medical-disclaimer": {
    title: "Medical Disclaimer",
    description: "Important medical disclaimer for information, products, and consultations available on Ayuzee.",
  },
};

const PREFIX_ROUTE_SEO: { prefix: string; entry: RouteSEOEntry }[] = [
  {
    prefix: "/health-conditions/",
    entry: {
      title: "Health Condition",
      description: "AYUSH treatment guidance and verified doctor recommendations for your health condition.",
    },
  },
  {
    prefix: "/learning/blogs/",
    entry: {
      title: "Article",
      description: "Read expert AYUSH wellness articles on Ayuzee.",
      ogType: "article",
    },
  },
];

export const getRouteSEO = (pathname: string): RouteSEOEntry | null => {
  if (PUBLIC_ROUTE_SEO[pathname]) return PUBLIC_ROUTE_SEO[pathname];

  for (const { prefix, entry } of PREFIX_ROUTE_SEO) {
    if (pathname.startsWith(prefix)) return entry;
  }

  return null;
};
