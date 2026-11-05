// Bound Auth requests without changing timeouts for unrelated database workflows.
export const AUTH_REQUEST_TIMEOUT_MS = 20_000;
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (!url.pathname.startsWith('/auth/v1/')) return fetch(input, init);
  const controller = new AbortController();
  const callerSignal = init?.signal ?? (input instanceof Request ? input.signal : null);
  const abort = () => controller.abort();
  if (callerSignal?.aborted) abort();
  else callerSignal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, AUTH_REQUEST_TIMEOUT_MS);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); callerSignal?.removeEventListener('abort', abort); }
}
