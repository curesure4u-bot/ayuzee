export const SITE_NAME = "Ayuzee";
export const SITE_URL = "https://ayuzee.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_DESCRIPTION =
  "Book verified Ayurvedic doctors, buy authentic AYUSH medicines, and explore holistic therapies online with Ayuzee.";

export const DEFAULT_TITLE = `${SITE_NAME} — Authentic Ayurveda, Modern Wellness`;

export const formatPageTitle = (pageTitle: string) =>
  pageTitle.includes(SITE_NAME) ? pageTitle : `${pageTitle} — ${SITE_NAME}`;
