import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyInfo {
  legal_name: string;
  brand_name: string;
  email: string;
  support_email: string;
  grievance_email: string;
  phone: string;
  address: string;
  hours: string;
}

export interface CompanyContent {
  title: string;
  body: string;
}

export const fetchCompanyLegal = async (slug: string) => {
  const [contentRes, infoRes] = await Promise.all([
    (supabase as any).from("company_content").select("title, body").eq("slug", slug).maybeSingle(),
    (supabase as any)
      .from("company_info")
      .select("legal_name, brand_name, email, support_email, grievance_email, phone, address, hours")
      .maybeSingle(),
  ]);

  return {
    content: (contentRes.data ?? null) as CompanyContent | null,
    info: (infoRes.data ?? null) as CompanyInfo | null,
  };
};

export function useCompanyLegal(slug: string) {
  const [content, setContent] = useState<CompanyContent | null>(null);
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCompanyLegal(slug).then(({ content: c, info: i }) => {
      if (cancelled) return;
      setContent(c);
      setInfo(i);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { content, info, loading };
}
