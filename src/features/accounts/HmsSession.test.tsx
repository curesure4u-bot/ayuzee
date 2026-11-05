import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { AccountSnapshot } from './sessionStore';
import { useHmsAccess } from '@/hooks/useHmsAccess';
import { sessionFor, deferred } from '@/test/accountFixtures';

const mock = vi.hoisted(() => ({ state: {} as AccountSnapshot, read: vi.fn(), eq: vi.fn() }));
vi.mock('./accountService', () => ({ useAccountSession: () => mock.state }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ select: () => ({ eq: (...args: unknown[]) => { mock.eq(...args); return { maybeSingle: mock.read }; } }) }) } }));
const permissions = () => ({ hms_access:true,is_approved:true,is_suspended:false,hms_role:'branch_doctor',hms_branch:'A',hms_center_type:null,
  hms_branches:['A'],hms_modules:['opd'],vaidya_access:false,hms_access_expiry:null });
beforeEach(() => {
  vi.resetAllMocks(); mock.state={session:sessionFor('a'),account:{roles:['doctor'],fullName:'Synthetic',requestedRole:'doctor',completedAt:null},loading:false,error:null,revision:1};
  mock.read.mockResolvedValue({data:permissions(),error:null});
});
afterEach(cleanup);
function hook() {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
  return renderHook(useHmsAccess,{wrapper:({children}:{children:ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>});
}
it('reads the active account and grants only explicit modules',async()=>{
  const view=hook(); await waitFor(()=>expect(view.result.current.hasAccess).toBe(true));
  expect(mock.eq).toHaveBeenCalledWith('user_id','a'); expect(view.result.current.modules).toEqual(['opd']);
});
it('does not expand an empty permission list to all role defaults',async()=>{
  mock.read.mockResolvedValue({data:{...permissions(),hms_role:'owner',hms_modules:[]},error:null});
  const view=hook(); await waitFor(()=>expect(view.result.current.loading).toBe(false)); expect(view.result.current.modules).toEqual([]);
});
it('rejects expired, invalid, suspended and unapproved permissions',async()=>{
  for(const changed of [{hms_access_expiry:'invalid'},{hms_access_expiry:'2000-01-01'},{is_suspended:true},{is_approved:false}]){
    mock.read.mockResolvedValueOnce({data:{...permissions(),...changed},error:null});
    const view=hook(); await waitFor(()=>expect(view.result.current.loading).toBe(false)); expect(view.result.current.hasAccess).toBe(false); view.unmount();
  }
});
it('does not expose the previous account while a new doctor lookup is pending',async()=>{
  const view=hook(); await waitFor(()=>expect(view.result.current.hasAccess).toBe(true));
  const next=deferred<{data:null;error:null}>(); mock.read.mockReturnValueOnce(next.promise);
  mock.state={...mock.state,session:sessionFor('b'),revision:2}; view.rerender();
  expect(view.result.current.hasAccess).toBe(false); expect(view.result.current.modules).toEqual([]);
  await act(async()=>next.resolve({data:null,error:null})); expect(view.result.current.hasAccess).toBe(false);
});
