import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DoctorRow = Tables<"doctors">;

export const useDoctor = () => {
  const [doctor, setDoctor] = useState<DoctorRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctor = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("doctors").select("*").eq("user_id", uid).maybeSingle();
    setDoctor(data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  return { doctor, userId, loading, refresh: fetchDoctor };
};
