import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccountActions, type AccountAuth } from './actions';
import { accountError, dashboardPathForRole, primaryRole } from './model';
import { sessionFor } from '@/test/accountFixtures';

function fixture() {
  const session = sessionFor('a');
  const api = {
    signUp: vi.fn().mockResolvedValue({ data: { user: session.user, session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    resend: vi.fn().mockResolvedValue({ error: null }), resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session, redirectType: 'recovery' }, error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: { session }, error: null }), setSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: session.user }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }), signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  let clock = 1000;
  const scrubLink = vi.fn(), clearPrivateData = vi.fn();
  const actions = createAccountActions({ auth: api as unknown as AccountAuth, origin: () => 'https://app.example.invalid',
    storage: () => sessionStorage, scrubLink, clearPrivateData, now: () => clock,
    updatePassword: async (accessToken, password) => {
      expect(accessToken).toBe(session.access_token);
      const { error } = await api.updateUser({ password }); if (error) throw error;
    } });
  return { actions, api, session, scrubLink, clearPrivateData, advance: (ms: number) => { clock += ms; } };
}
beforeEach(() => sessionStorage.clear());
describe('account workflow actions', () => {
  it('treats a returned user without a session as awaiting verification', async () => {
    const f = fixture(); expect(await f.actions.signup({ email: ' A@example.invalid ', password: 'sufficient-length', fullName: 'Synthetic A', requestedRole: 'doctor' })).toBe('verification-required');
    const input = f.api.signUp.mock.calls[0][0];
    expect(input.email).toBe('a@example.invalid'); expect(input.options.emailRedirectTo).toBe('https://app.example.invalid/auth/callback');
    expect(input.options.data).toEqual({ full_name: 'Synthetic A', requested_account_type: 'doctor' });
    expect(input.options.data).not.toHaveProperty('role');
  });
  it('supports confirmation-disabled signup without waiting for a missing email', async () => {
    const f = fixture(); f.api.signUp.mockResolvedValueOnce({ data: { session: f.session }, error: null });
    expect(await f.actions.signup({ email: 'a@example.invalid', password: 'sufficient-length', fullName: 'Synthetic A', requestedRole: 'patient' })).toBe('signed-in');
  });
  it('uses explicit confirmation and recovery redirects and preserves server failures', async () => {
    const f = fixture(); await f.actions.resend('a@example.invalid'); await f.actions.requestReset('a@example.invalid');
    expect(f.api.resetPasswordForEmail).toHaveBeenCalledWith('a@example.invalid', { redirectTo: 'https://app.example.invalid/reset-password' });
    const failure = { status: 429, code: 'over_email_send_rate_limit' }; f.api.resend.mockResolvedValueOnce({ error: failure });
    await expect(f.actions.resend('a@example.invalid')).rejects.toBe(failure); expect(accountError(failure)).toContain('wait a few minutes');
  });
  it('redeems a one-use PKCE link once and scrubs URL credentials before network work', async () => {
    const f = fixture(); f.api.exchangeCodeForSession.mockImplementationOnce(async () => {
      expect(f.scrubLink).toHaveBeenCalledTimes(1); return { data: { session: f.session, redirectType: 'recovery' }, error: null };
    });
    const first = f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic&next=https://attacker.invalid');
    expect(f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic&next=https://attacker.invalid')).toBe(first);
    expect(await first).toBe('recovery'); expect(f.api.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(f.actions.canReset(f.session)).toBe(true); expect(sessionStorage.getItem('ayuzee:password-recovery')).not.toContain('synthetic-refresh');
  });
  it('handles legacy implicit recovery and confirmation token-hash links', async () => {
    const f = fixture(); expect(await f.actions.completeEmailLink('https://app.example.invalid/reset-password#access_token=synthetic&refresh_token=synthetic&type=recovery')).toBe('recovery');
    expect(f.api.setSession).toHaveBeenCalledTimes(1);
    expect(await f.actions.completeEmailLink('https://app.example.invalid/auth/callback?token_hash=synthetic&type=signup')).toBe('signup');
    expect(f.actions.canReset(f.session)).toBe(false);
  });
  it('does not treat a normal sign-in or signup confirmation as password recovery', async () => {
    const f = fixture(); await expect(f.actions.resetPassword('sufficient-password','sufficient-password')).rejects.toMatchObject({ code: 'otp_expired' });
    f.api.exchangeCodeForSession.mockResolvedValueOnce({ data: { session: f.session, redirectType: null }, error: null });
    expect(await f.actions.completeEmailLink('https://app.example.invalid/auth/callback?code=signup')).toBe('signup');
    expect(f.actions.canReset(f.session)).toBe(false); expect(f.api.updateUser).not.toHaveBeenCalled();
  });
  it('invalidates expired links and recovery proof for a different account', async () => {
    const f = fixture(); await f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic');
    expect(f.actions.canReset(sessionFor('b'))).toBe(false); f.advance(16*60_000); expect(f.actions.canReset(f.session)).toBe(false);
    await expect(f.actions.completeEmailLink('https://app.example.invalid/reset-password?error=access_denied&error_code=otp_expired')).rejects.toMatchObject({ code: 'otp_expired' });
  });
  it('rejects a callback whose verified user differs from the exchanged session', async () => {
    const f = fixture(); f.api.getUser.mockResolvedValueOnce({ data: { user: sessionFor('b').user }, error: null });
    await expect(f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic')).rejects.toMatchObject({ code: 'otp_expired' });
    expect(f.actions.canReset(f.session)).toBe(false);
  });
  it('keeps a failed password update retryable and clears proof only after success', async () => {
    const f = fixture(); await f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic');
    f.api.updateUser.mockResolvedValueOnce({ error: { code: 'weak_password' } });
    await expect(f.actions.resetPassword('sufficient-password','sufficient-password')).rejects.toMatchObject({ code: 'weak_password' });
    expect(f.actions.canReset(f.session)).toBe(true);
    await f.actions.resetPassword('new-password-value','new-password-value'); expect(f.actions.canReset(f.session)).toBe(false); expect(f.clearPrivateData).toHaveBeenCalled();
  });
  it('validates confirmation before sending a password update', async () => {
    const f = fixture(); await expect(f.actions.resetPassword('new-password-value','different')).rejects.toThrow('do not match'); expect(f.api.updateUser).not.toHaveBeenCalled();
  });
  it('aborts before a password write if the account changed during verification',async()=>{
    const f=fixture(); await f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic');
    f.api.getUser.mockImplementationOnce(async()=>{ f.api.getSession.mockResolvedValue({data:{session:sessionFor('b')},error:null}); return {data:{user:f.session.user},error:null}; });
    await expect(f.actions.resetPassword('new-password-value','new-password-value')).rejects.toMatchObject({code:'account_changed'});
    expect(f.api.updateUser).not.toHaveBeenCalled(); expect(f.clearPrivateData).not.toHaveBeenCalled();
  });
  it('cannot change or sign out the new account if identity changes during the recovery write',async()=>{
    const f=fixture(); await f.actions.completeEmailLink('https://app.example.invalid/reset-password?code=synthetic');
    f.api.updateUser.mockImplementationOnce(async()=>{ f.api.getSession.mockResolvedValue({data:{session:sessionFor('b')},error:null}); return {error:null}; });
    await expect(f.actions.resetPassword('new-password-value','new-password-value')).rejects.toMatchObject({code:'account_changed_after_reset'});
    expect(f.clearPrivateData).not.toHaveBeenCalled(); await f.actions.signout('a'); expect(f.api.signOut).not.toHaveBeenCalled();
  });
  it('clears private state even when provider sign-out fails', async () => {
    const f = fixture(); f.api.signOut.mockResolvedValueOnce({ error: { code: 'synthetic_outage' } });
    await expect(f.actions.signout()).rejects.toMatchObject({ code: 'synthetic_outage' }); expect(f.clearPrivateData).toHaveBeenCalledTimes(1);
  });
  it('maps each existing account type to its own destination', () => {
    expect(dashboardPathForRole('student')).toBe('/workspace/student'); expect(dashboardPathForRole('provider')).toBe('/workspace/provider');
    expect(dashboardPathForRole('venue_owner')).toBe('/workspace/venue_owner'); expect(primaryRole(['super_admin'])).toBe('super_admin');
    expect(primaryRole(['unrecognised-request'])).toBeNull(); expect(dashboardPathForRole(null)).toBe('/account');
  });
});
