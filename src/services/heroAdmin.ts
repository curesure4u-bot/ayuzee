/**
 * Hero Admin — Jasir Sajidh's super-admin access system
 * Email: jasirsajidh8@gmail.com
 * 
 * This grants full bypass access to all Beyond.Praxis and Student modules
 * without needing role-based checks. Hero Admin can manage users, content,
 * community, and settings across the entire platform.
 */

import { supabase } from "@/integrations/supabase/client";

// Hero Admin email — this is the single source of truth
export const HERO_ADMIN_EMAIL = "jasirsajidh8@gmail.com";

/**
 * Check if the current logged-in user is the Hero Admin
 */
export async function isHeroAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  return data.session.user.email === HERO_ADMIN_EMAIL;
}

/**
 * Synchronous check using cached session (for use in already-loaded layouts)
 */
export function isHeroAdminEmail(email: string | undefined | null): boolean {
  return email === HERO_ADMIN_EMAIL;
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
