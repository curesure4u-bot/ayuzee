import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Superadmin email — always has full access regardless of table
const SUPERADMIN_EMAIL = "curesure4u@gmail.com";

export interface DispenzaAccess {
  hasPremiumAccess: boolean;
  hasClinicAccess: boolean;
  loading: boolean;
  accessType: "premium" | "clinic" | "both" | "none";
  userEmail: string | null;
}

export const useDispenzaAccess = (): DispenzaAccess => {
  const [state, setState] = useState<DispenzaAccess>({
    hasPremiumAccess: false,
    hasClinicAccess: false,
    loading: true,
    accessType: "none",
    userEmail: null,
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const email = user.email.toLowerCase();

        // Superadmin always has full access
        if (email === SUPERADMIN_EMAIL) {
          setState({
            hasPremiumAccess: true,
            hasClinicAccess: true,
            loading: false,
            accessType: "both",
            userEmail: email,
          });
          return;
        }

        // Check dispenza_premium_access table
        const { data, error } = await supabase
          .from("dispenza_premium_access")
          .select("access_type, is_active, expires_at")
          .eq("email", email)
          .eq("is_active", true)
          .maybeSingle();

        if (error || !data) {
          setState({
            hasPremiumAccess: false,
            hasClinicAccess: false,
            loading: false,
            accessType: "none",
            userEmail: email,
          });
          return;
        }

        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setState({
            hasPremiumAccess: false,
            hasClinicAccess: false,
            loading: false,
            accessType: "none",
            userEmail: email,
          });
          return;
        }

        // Grant access based on type
        const accessType = data.access_type as "premium" | "clinic" | "both";
        setState({
          hasPremiumAccess: accessType === "premium" || accessType === "both",
          hasClinicAccess: accessType === "clinic" || accessType === "both",
          loading: false,
          accessType,
          userEmail: email,
        });
      } catch (err) {
        console.error("Dispenza access check failed:", err);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAccess();
  }, []);

  return state;
};
