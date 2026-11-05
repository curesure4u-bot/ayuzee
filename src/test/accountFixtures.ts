import type { Session } from '@supabase/supabase-js';
export function sessionFor(id: string, accessToken = id): Session {
  return { access_token: accessToken, refresh_token: 'synthetic-refresh', expires_in: 3600,
    token_type: 'bearer', expires_at: 4102444800,
    user: { id, aud: 'authenticated', app_metadata: {}, user_metadata: {},
      created_at: '2026-01-01T00:00:00Z', email: `${id}@example.invalid`, email_confirmed_at: '2026-01-01T00:00:00Z' } };
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
