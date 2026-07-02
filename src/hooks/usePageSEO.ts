import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setSEO, type SEOOptions } from "@/lib/seo";
import { DEFAULT_DESCRIPTION, formatPageTitle } from "@/lib/seo.constants";

export type PageSEOConfig = {
  title: string;
  description?: string;
  canonicalPath?: string;
} & SEOOptions;

export const usePageSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogType,
  ogImage,
  jsonLd,
  noIndex,
}: PageSEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    setSEO(formatPageTitle(title), description, canonicalPath ?? location.pathname, {
      ogType,
      ogImage,
      jsonLd,
      noIndex,
    });
  }, [title, description, canonicalPath, location.pathname, ogType, ogImage, jsonLd, noIndex]);
};
