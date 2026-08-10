import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { RoleContext } from "./types";

/**
 * Auto-detects the user's role context based on:
 * 1. The referring URL (which portal they came from)
 * 2. Their user_roles in the database
 * 3. Fallback to "general"
 */
export function useTaskTrackerRole(): { role: RoleContext; isLoading: boolean } {
  const location = useLocation();
  const [role, setRole] = useState<RoleContext>("general");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First: check referrer from URL state or sessionStorage
    const referrer = sessionStorage.getItem("task_tracker_referrer");
    const fromUrl = detectFromUrl(referrer || document.referrer || "");

    if (fromUrl) {
      setRole(fromUrl);
      setIsLoading(false);
      return;
    }

    // Second: check the user's roles in the database
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) {
          setRole("general");
          setIsLoading(false);
          return;
        }

        const { data: roles } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (roles && roles.length > 0) {
          const roleNames = roles.map((r: any) => r.role);
          if (roleNames.includes("doctor")) setRole("doctor");
          else if (roleNames.includes("student")) setRole("student");
          else if (roleNames.includes("hms_admin") || roleNames.includes("hms_staff")) setRole("hms");
          else if (roleNames.includes("patient")) setRole("patient");
          else setRole("general");
        }
      } catch {
        setRole("general");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { role, isLoading };
}

function detectFromUrl(url: string): RoleContext | null {
  if (url.includes("/doctor")) return "doctor";
  if (url.includes("/vaidya")) return "doctor";
  if (url.includes("/therapist")) return "doctor";
  if (url.includes("/dashboard") || url.includes("/patient")) return "patient";
  if (url.includes("/student")) return "student";
  if (url.includes("/hms") || url.includes("/admin") || url.includes("/provider") || url.includes("/beyond")) return "hms";
  return null;
}

/**
 * Call this before navigating to /task-tracker to set the referrer context
 */
export function setTaskTrackerReferrer(from: string) {
  sessionStorage.setItem("task_tracker_referrer", from);
}
