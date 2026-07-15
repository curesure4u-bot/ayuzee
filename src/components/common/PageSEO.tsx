import { usePageSEO, type PageSEOConfig } from "@/hooks/usePageSEO";

export const PageSEO = (props: PageSEOConfig) => {
  usePageSEO(props);
  return null;
};
