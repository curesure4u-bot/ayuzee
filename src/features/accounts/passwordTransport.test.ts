import { afterEach, expect, it, vi } from 'vitest';
import { sendRecoveryPassword } from './passwordTransport';
afterEach(()=>vi.unstubAllGlobals());
it('binds the password write to the supplied recovery JWT and exposes no target-user override',async()=>{
  const request=vi.fn().mockResolvedValue(new Response('{}',{status:200})); vi.stubGlobal('fetch',request);
  await sendRecoveryPassword('https://fixture.invalid','public-key','recovery-jwt-a','synthetic-new-password');
  const [url, options]=request.mock.calls[0]; expect(String(url)).toBe('https://fixture.invalid/auth/v1/user');
  expect(options.method).toBe('PUT'); expect(options.headers.Authorization).toBe('Bearer recovery-jwt-a');
  expect(JSON.parse(options.body)).toEqual({password:'synthetic-new-password'});
});
it('normalises Auth error codes without exposing raw response details',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({error_code:'weak_password',msg:'untrusted provider details'}),{status:422})));
  await expect(sendRecoveryPassword('https://fixture.invalid','public','jwt','password')).rejects.toMatchObject({code:'weak_password',status:422,message:'Password update failed'});
});
