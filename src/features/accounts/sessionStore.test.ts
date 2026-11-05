import { describe, expect, it, vi } from 'vitest';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';
import { createAccountStore, type AccountDetails } from './sessionStore';
import { deferred, sessionFor } from '@/test/accountFixtures';

const details = (roles = ['patient']): AccountDetails => ({ roles, fullName: 'Synthetic Account', requestedRole: 'patient', completedAt: null });
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function fixture() {
  let emit!: (event: AuthChangeEvent, session: Session | null) => void;
  const unsubscribe = vi.fn();
  const getSession = vi.fn<() => Promise<Session | null>>().mockResolvedValue(sessionFor('a'));
  const loadAccount = vi.fn<(id: string) => Promise<AccountDetails>>().mockResolvedValue(details());
  const listen = vi.fn((callback: typeof emit) => { emit = callback; return unsubscribe; });
  const clearPrivateData = vi.fn();
  const store = createAccountStore({ getSession, loadAccount, listen, clearPrivateData });
  return { store, getSession, loadAccount, listen, unsubscribe, clearPrivateData, emit: (event: AuthChangeEvent, session: Session | null) => emit(event, session) };
}
describe('shared account identity', () => {
  it('shares one subscription and one account load across consumers', async () => {
    const f = fixture(); const offA = f.store.subscribe(vi.fn()), offB = f.store.subscribe(vi.fn());
    await flush();
    expect(f.listen).toHaveBeenCalledTimes(1); expect(f.getSession).toHaveBeenCalledTimes(1); expect(f.loadAccount).toHaveBeenCalledTimes(1);
    offA(); expect(f.unsubscribe).not.toHaveBeenCalled(); offB(); expect(f.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it('does not call the database inside the auth callback or duplicate identical sign-ins', async () => {
    const f = fixture(); const off = f.store.subscribe(vi.fn()); await flush();
    f.loadAccount.mockClear(); f.emit('SIGNED_IN', sessionFor('a')); expect(f.loadAccount).not.toHaveBeenCalled();
    await flush(); expect(f.loadAccount).not.toHaveBeenCalled(); off();
  });
  it('ignores an old initial session after a newer auth event', async () => {
    const f = fixture(), old = deferred<Session | null>(); f.getSession.mockReturnValueOnce(old.promise);
    const off = f.store.subscribe(vi.fn()); f.emit('SIGNED_IN', sessionFor('b')); await flush(); old.resolve(sessionFor('a')); await flush();
    expect(f.store.getSnapshot().session?.user.id).toBe('b'); expect(f.loadAccount).toHaveBeenCalledTimes(1); off();
  });
  it('drops privileged roles immediately on account change and rejects late results', async () => {
    const f = fixture(), old = deferred<AccountDetails>(); f.loadAccount.mockReturnValueOnce(old.promise);
    const off = f.store.subscribe(vi.fn()); await flush(); f.emit('SIGNED_IN', sessionFor('b')); await flush();
    old.resolve(details(['admin'])); await flush();
    expect(f.store.getSnapshot().session?.user.id).toBe('b'); expect(f.store.getSnapshot().account?.roles).toEqual(['patient']); off();
  });
  it('does not restore an account after sign-out while a request is pending', async () => {
    const f = fixture(), old = deferred<AccountDetails>(); f.loadAccount.mockReturnValueOnce(old.promise);
    const off = f.store.subscribe(vi.fn()); await flush(); f.emit('SIGNED_OUT', null); await flush(); old.resolve(details(['admin'])); await flush();
    expect(f.store.getSnapshot().session).toBeNull(); expect(f.store.getSnapshot().account).toBeNull(); off();
  });
  it('rechecks revoked roles and exposes no old roles during refresh', async () => {
    const f = fixture(); f.loadAccount.mockResolvedValueOnce(details(['admin'])); const off = f.store.subscribe(vi.fn()); await flush();
    const next = deferred<AccountDetails>(); f.loadAccount.mockReturnValueOnce(next.promise); f.emit('USER_UPDATED', sessionFor('a')); await flush();
    expect(f.store.getSnapshot().account).toBeNull(); next.resolve(details()); await flush();
    expect(f.store.getSnapshot().account?.roles).toEqual(['patient']); off();
  });
  it('fails closed on permission errors', async () => {
    const f = fixture(); f.loadAccount.mockRejectedValueOnce(new Error('synthetic outage')); const off = f.store.subscribe(vi.fn()); await flush();
    expect(f.store.getSnapshot().account).toBeNull(); expect(f.store.getSnapshot().error).toContain('could not be loaded'); off();
  });
  it('does not seed a new subscriber with the previous account snapshot', async () => {
    const f = fixture(); f.loadAccount.mockResolvedValueOnce(details(['admin'])); const off = f.store.subscribe(vi.fn()); await flush(); off();
    expect(f.store.getSnapshot().account).toBeNull(); expect(f.store.getSnapshot().loading).toBe(true);
    f.getSession.mockResolvedValueOnce(null); const next = f.store.subscribe(vi.fn()); await flush(); expect(f.store.getSnapshot().session).toBeNull(); next();
  });
  it('removes private query data even if a cancelled request resolves late', async () => {
    const client = new QueryClient(), pending = deferred<string>();
    const query = client.fetchQuery({ queryKey: ['private', 'a'], queryFn: () => pending.promise }).catch(() => undefined);
    const store = createAccountStore({ getSession: async () => null, listen: () => () => {}, loadAccount: async () => details(),
      clearPrivateData: () => { void client.cancelQueries(); client.clear(); } });
    store.clear(); pending.resolve('private-data'); await query; await flush(); expect(client.getQueryData(['private','a'])).toBeUndefined();
  });
  it('does not accept a stale manual session refresh over a new identity', async () => {
    const f = fixture(); f.getSession.mockResolvedValueOnce(null); const off = f.store.subscribe(vi.fn()); await flush();
    const old = deferred<Session | null>(); f.getSession.mockReturnValueOnce(old.promise); const refresh = f.store.refresh();
    f.emit('SIGNED_IN', sessionFor('b')); await flush(); old.resolve(sessionFor('a')); await refresh;
    expect(f.store.getSnapshot().session?.user.id).toBe('b'); off();
  });
});
