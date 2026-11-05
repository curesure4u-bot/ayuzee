import { authFetch } from './authFetch';

// The recovery write carries its own verified JWT, rather than whichever
// account happens to be current when the global SDK obtains its auth lock.
export async function sendRecoveryPassword(baseUrl: string, publicKey: string, accessToken: string, password: string) {
  const response = await authFetch(new URL('/auth/v1/user', baseUrl), {
    method: 'PUT', headers: { apikey: publicKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const failure: unknown = await response.json().catch(() => null);
    const code = failure && typeof failure === 'object'
      ? ('code' in failure ? String(failure.code) : 'error_code' in failure ? String(failure.error_code) : '') : '';
    throw Object.assign(new Error('Password update failed'), { code, status: response.status });
  }
}
