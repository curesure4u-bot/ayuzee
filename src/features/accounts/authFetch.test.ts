import { afterEach, expect, it, vi } from 'vitest';
import { authFetch, AUTH_REQUEST_TIMEOUT_MS } from './authFetch';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it('aborts a stalled Auth request after the real request timeout',async()=>{
  vi.useFakeTimers();
  let signal: AbortSignal | undefined;
  vi.stubGlobal('fetch',vi.fn((_input:unknown,init:RequestInit)=>new Promise((_resolve,reject)=>{
    signal=init.signal!; signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')));
  })));
  const failure=authFetch('https://fixture.invalid/auth/v1/token').catch(error=>error);
  await vi.advanceTimersByTimeAsync(AUTH_REQUEST_TIMEOUT_MS);
  expect(signal?.aborted).toBe(true); expect((await failure).name).toBe('AbortError');
});
it('preserves caller cancellation and leaves database request options unchanged',async()=>{
  const response=new Response('ok'); const fetchMock=vi.fn().mockResolvedValue(response); vi.stubGlobal('fetch',fetchMock);
  const controller=new AbortController(); controller.abort();
  await authFetch('https://fixture.invalid/auth/v1/user',{signal:controller.signal});
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  const options={method:'GET'}; await authFetch('https://fixture.invalid/rest/v1/profiles',options);
  expect(fetchMock).toHaveBeenLastCalledWith('https://fixture.invalid/rest/v1/profiles',options);
});
