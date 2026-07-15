import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_DESCRIPTION, formatPageTitle } from "@/lib/seo.constants";
import { getRouteSEO } from "@/lib/seo.routes";

export const RouteSEO = () => {
  const location = useLocation();

  useEffect(() => {
    const config = getRouteSEO(location.pathname);
    if (!config) return;

    import("@/lib/seo").then(({ setSEO }) => {
      setSEO(
        formatPageTitle(config.title),
        config.description ?? DEFAULT_DESCRIPTION,
        config.canonicalPath ?? location.pathname,
        config,
      );
    });
  }, [location.pathname]);

  return null;
};
