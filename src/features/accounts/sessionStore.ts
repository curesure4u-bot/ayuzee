import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { AccountType } from './model';

export interface AccountDetails {
  roles: string[];
  fullName: string;
  requestedRole: AccountType;
  completedAt: string | null;
}
export interface AccountSnapshot {
  session: Session | null;
  account: AccountDetails | null;
  loading: boolean;
  error: string | null;
  revision: number;
}
interface SessionDependencies {
  getSession(): Promise<Session | null>;
  listen(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void;
  loadAccount(userId: string): Promise<AccountDetails>;
  clearPrivateData(): void;
}
const initial = (): AccountSnapshot => ({ session: null, account: null, loading: true, error: null, revision: 0 });

// A single observer owns identity. Epochs reject stale results after account
// changes, refresh, logout and the final consumer unmounting.
export function createAccountStore(deps: SessionDependencies) {
  let state = initial();
  let epoch = 0;
  let stop: (() => void) | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: AccountSnapshot) => { state = next; listeners.forEach(listener => listener()); };
  const clear = () => { epoch++; deps.clearPrivateData(); publish({ ...initial(), loading: false, revision: epoch }); };
  async function accept(session: Session | null, force = false) {
    if (!session) { clear(); return; }
    const sameIdentity = state.session?.user.id === session.user.id && state.session?.access_token === session.access_token;
    if (!force && sameIdentity && state.account) return;
    if (!force && sameIdentity && state.loading) return;
    const ticket = ++epoch;
    deps.clearPrivateData();
    publish({ session, account: null, loading: true, error: null, revision: ticket });
    try {
      const account = await deps.loadAccount(session.user.id);
      if (ticket === epoch) publish({ session, account, loading: false, error: null, revision: ticket });
    } catch {
      if (ticket === epoch) publish({ session, account: null, loading: false, error: 'Your account details could not be loaded. Please retry.', revision: ticket });
    }
  }
  function start() {
    let observed = false;
    let active = true;
    const unlisten = deps.listen((event, session) => {
      observed = true;
      // Return from Supabase's auth callback before starting database requests.
      queueMicrotask(() => { if (active) void accept(session, event === 'USER_UPDATED'); });
    });
    const onFocus = () => { if (state.session) void accept(state.session, true); };
    if (typeof window !== 'undefined') window.addEventListener('focus', onFocus);
    void deps.getSession().then(session => {
      if (active && !observed) void accept(session);
    }).catch(() => {
      if (active && !observed) publish({ ...initial(), loading: false, error: 'Sign-in status could not be checked. Please retry.', revision: epoch });
    });
    return () => {
      active = false; unlisten(); epoch++;
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus);
      deps.clearPrivateData(); state = initial();
    };
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!stop) stop = start();
      return () => { listeners.delete(listener); if (!listeners.size) { stop?.(); stop = null; } };
    },
    clear,
    async refresh() {
      if (state.session) return accept(state.session, true);
      const ticket = epoch;
      const session = await deps.getSession();
      if (ticket === epoch) await accept(session, true);
    },
  };
}
