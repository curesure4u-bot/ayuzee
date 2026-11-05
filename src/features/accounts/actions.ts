import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requestedType, validatePassword, type AccountType } from './model';

export type AccountAuth = Pick<SupabaseClient['auth'], 'signUp' | 'signInWithPassword' | 'resend' |
  'resetPasswordForEmail' | 'exchangeCodeForSession' | 'setSession' | 'verifyOtp' | 'getSession' |
  'getUser' | 'signOut'>;
const emailSchema = z.string().trim().email().max(255).transform(value => value.toLowerCase());
const recoveryKey = 'ayuzee:password-recovery';
const invalidLink = () => Object.assign(new Error('Invalid or expired email link'), { code: 'otp_expired' });
interface ActionDependencies {
  auth: AccountAuth;
  origin(): string;
  storage(): Storage;
  scrubLink(): void;
  clearPrivateData(): void;
  updatePassword(accessToken: string, password: string): Promise<void>;
  now?: () => number;
}
export function createAccountActions(deps: ActionDependencies) {
  const now = deps.now ?? Date.now;
  function forgetRecovery() {
    try { deps.storage().removeItem(recoveryKey); } catch { /* Logout must still clear private state and contact Auth. */ }
  }
  let linkFlight: { href: string; promise: Promise<'recovery' | 'signup'> } | null = null;
  const redirect = (path: string) => new URL(path, deps.origin()).href;
  function saveRecovery(session: Session) {
    deps.storage().setItem(recoveryKey, JSON.stringify({ userId: session.user.id, expiresAt: now() + 15 * 60_000 }));
  }
  function canReset(session: Session | null): boolean {
    try {
      const proof: unknown = JSON.parse(deps.storage().getItem(recoveryKey) ?? 'null');
      if (!proof || typeof proof !== 'object' || !('userId' in proof) || !('expiresAt' in proof)) return false;
      return Boolean(session && proof.userId === session.user.id && typeof proof.expiresAt === 'number' && proof.expiresAt > now()
        && (!session.expires_at || session.expires_at * 1000 > now()));
    } catch { return false; }
  }
  async function exchangeLink(href: string): Promise<'recovery' | 'signup'> {
    forgetRecovery();
    const url = new URL(href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const errorCode = url.searchParams.get('error_code') ?? hash.get('error_code');
    const type = hash.get('type') ?? url.searchParams.get('type');
    const code = url.searchParams.get('code');
    const access = hash.get('access_token'), refresh = hash.get('refresh_token');
    const tokenHash = url.searchParams.get('token_hash');
    // Remove credentials/errors from browser history before awaiting any network.
    deps.scrubLink();
    if (errorCode || url.searchParams.has('error') || hash.has('error')) throw invalidLink();
    let session: Session | null = null;
    let recovery = false;
    if (code) {
      const { data, error } = await deps.auth.exchangeCodeForSession(code);
      if (error) throw error;
      session = data.session;
      recovery = 'redirectType' in data && data.redirectType === 'recovery';
    } else if (tokenHash && (type === 'recovery' || type === 'signup')) {
      const { data, error } = await deps.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) throw error;
      session = data.session; recovery = type === 'recovery';
    } else if (access && refresh && (type === 'recovery' || type === 'signup')) {
      const { data, error } = await deps.auth.setSession({ access_token: access, refresh_token: refresh });
      if (error) throw error;
      session = data.session; recovery = type === 'recovery';
    } else { throw invalidLink(); }
    if (!session) throw invalidLink();
    const { data: verified, error } = await deps.auth.getUser();
    if (error || verified.user?.id !== session.user.id) throw invalidLink();
    if (recovery) saveRecovery(session);
    else forgetRecovery();
    return recovery ? 'recovery' : 'signup';
  }
  return {
    async signup(input: { email: string; password: string; fullName: string; requestedRole: AccountType }) {
      const email = emailSchema.parse(input.email);
      const passwordError = validatePassword(input.password);
      const name = input.fullName.trim();
      if (passwordError || name.length < 2 || name.length > 100) throw new Error('Invalid account fields');
      const { data, error } = await deps.auth.signUp({ email, password: input.password,
        options: { emailRedirectTo: redirect('/auth/callback'), data: { full_name: name,
          requested_account_type: requestedType(input.requestedRole) } } });
      if (error) throw error;
      return data.session ? 'signed-in' as const : 'verification-required' as const;
    },
    async signin(email: string, password: string) {
      const { error } = await deps.auth.signInWithPassword({ email: emailSchema.parse(email), password });
      if (error) throw error;
    },
    async resend(email: string) {
      const { error } = await deps.auth.resend({ type: 'signup', email: emailSchema.parse(email), options: { emailRedirectTo: redirect('/auth/callback') } });
      if (error) throw error;
    },
    async requestReset(email: string) {
      const { error } = await deps.auth.resetPasswordForEmail(emailSchema.parse(email), { redirectTo: redirect('/reset-password') });
      if (error) throw error;
    },
    completeEmailLink(href: string) {
      // StrictMode/re-render must not redeem a one-use code twice.
      if (linkFlight?.href === href) return linkFlight.promise;
      linkFlight = { href, promise: exchangeLink(href) };
      return linkFlight.promise;
    },
    canReset,
    async recoveryReady() {
      const { data, error } = await deps.auth.getSession();
      if (error) throw error;
      return canReset(data.session);
    },
    async resetPassword(password: string, confirmation: string) {
      const message = validatePassword(password, confirmation);
      if (message) throw new Error(message);
      const { data, error } = await deps.auth.getSession();
      if (error || !canReset(data.session)) throw invalidLink();
      const { data: verified, error: userError } = await deps.auth.getUser(data.session!.access_token);
      if (userError || verified.user?.id !== data.session?.user.id) throw invalidLink();
      // Bind the write to the verified recovery JWT. A concurrent sign-in must
      // never redirect an SDK updateUser() call to a different account.
      const target = data.session!;
      const { data: before } = await deps.auth.getSession();
      if (before.session?.user.id !== target.user.id) throw Object.assign(new Error('Account changed'), { code: 'account_changed' });
      await deps.updatePassword(target.access_token, password);
      const { data: after } = await deps.auth.getSession();
      if (after.session && after.session.user.id !== target.user.id) throw Object.assign(new Error('Original password updated; account changed'), { code: 'account_changed_after_reset' });
      forgetRecovery();
      deps.clearPrivateData();
      return target.user.id;
    },
    async signout(expectedUserId?: string) {
      if (expectedUserId) {
        const { data, error } = await deps.auth.getSession();
        if (error) throw error;
        if (data.session?.user.id !== expectedUserId) return;
      }
      deps.clearPrivateData();
      forgetRecovery();
      const { error } = await deps.auth.signOut();
      if (error) throw error;
    },
  };
}
