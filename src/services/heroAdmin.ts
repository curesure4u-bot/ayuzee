/**
 * Hero Admin — Jasir Sajidh's super-admin access system
 * Email: jasirsajidh8@gmail.com
 * 
 * This grants full bypass access to all Beyond.Praxis and Student modules
 * without needing role-based checks. Hero Admin can manage users, content,
 * community, and settings across the entire platform.
 */

import { supabase } from "@/integrations/supabase/client";

// Hero Admin emails — both have full platform access
export const HERO_ADMIN_EMAIL = "jasirsajidh8@gmail.com";
export const SUPER_ADMIN_EMAILS = ["jasirsajidh8@gmail.com", "curesure4u@gmail.com"];

/**
 * Check if the current logged-in user is a Hero/Super Admin
 */
export async function isHeroAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  return SUPER_ADMIN_EMAILS.includes(data.session.user.email || "");
}

/**
 * Synchronous check using cached session
 */
export function isHeroAdminEmail(email: string | undefined | null): boolean {
  return SUPER_ADMIN_EMAILS.includes(email || "");
}

/**
 * Get current user session with hero admin flag
 */
export async function getSessionWithHeroCheck(): Promise<{
  userId: string | null;
  email: string | null;
  isHero: boolean;
  isAuthenticated: boolean;
}> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    return { userId: null, email: null, isHero: false, isAuthenticated: false };
  }
  const email = data.session.user.email || null;
  return {
    userId: data.session.user.id,
    email,
    isHero: email === HERO_ADMIN_EMAIL,
    isAuthenticated: true,
  };
}
