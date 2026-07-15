import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHmsAccess = () => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [centerType, setCenterType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (active) {
          setHasAccess(false);
          setLoading(false);
        }
        return;
      }
      const { data } = await (supabase as any)
        .from("doctors")
        .select("hms_access, hms_branch, hms_center_type")
        .eq("user_id", uid)
        .maybeSingle();
      if (!active) return;
      setHasAccess(Boolean(data?.hms_access));
      setBranch(data?.hms_branch ?? null);
      setCenterType(data?.hms_center_type ?? null);
      setLoading(false);
    };
    check();
    return () => {
      active = false;
    };
  }, []);

  return { hasAccess, branch, centerType, loading };
};
