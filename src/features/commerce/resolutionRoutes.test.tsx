import '@testing-library/jest-dom/vitest';
import{afterEach,beforeEach,describe,expect,it,vi}from'vitest';
import{cleanup,render,screen}from'@testing-library/react';
import userEvent from'@testing-library/user-event';
import{MemoryRouter}from'react-router-dom';
import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
import type{AccountSnapshot}from'@/features/accounts/sessionStore';
import{sessionFor}from'@/test/accountFixtures';
import{accountRoles}from'@/features/access/roles';
import{previewForPath}from'@/lib/previewPolicy';
import{ResolutionRoute}from'./ResolutionRoutes';
const mock=vi.hoisted(()=>({state:{}as AccountSnapshot,source:{queue:vi.fn(),detail:vi.fn(),status:vi.fn()},clear:vi.fn()}));
vi.mock('@/features/accounts/accountService',()=>({useAccountSession:()=>mock.state,clearPrivateQueries:mock.clear,accountStore:{refresh:vi.fn()}}));
vi.mock('./resolutionService',()=>({resolutionSource:()=>mock.source}));
const state=(roles=['patient']):AccountSnapshot=>({session:sessionFor('fixture-buyer'),account:{roles,fullName:'Synthetic User',requestedRole:'patient',completedAt:'2026-11-04'},loading:false,error:null,revision:1});
function show(operations=true,path=operations?'/shop/refunds':'/shop/resolution'){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><MemoryRouter initialEntries={[path]}><ResolutionRoute operations={operations}/></MemoryRouter></QueryClientProvider>);}
beforeEach(()=>{vi.clearAllMocks();mock.state=state();mock.source.queue.mockResolvedValue({orders:[],hasMore:false});});afterEach(cleanup);
describe('refund workspace routes',()=>{
 it.each(accountRoles)('limits operation screens for %s to explicit refund grants',async role=>{mock.state=state([role]);show();if(['orders_admin','admin','super_admin'].includes(role)){expect(screen.getByRole('heading',{name:'Cancellation & refunds.'})).toBeInTheDocument();expect(mock.source.queue).not.toHaveBeenCalled();}else{expect(screen.getByRole('heading')).toHaveTextContent('not available');expect(mock.source.queue).not.toHaveBeenCalled();}expect(mock.source.detail).not.toHaveBeenCalled();});
 it.each(accountRoles)('allows %s to open their own delivery lookup without operational controls',role=>{mock.state=state([role]);show(false);expect(screen.getByRole('heading',{name:'Cancellation & refunds.'})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Start packing'})).not.toBeInTheDocument();expect(mock.source.queue).not.toHaveBeenCalled();expect(mock.source.status).not.toHaveBeenCalled();});
 it('multi-role accounts explicitly select only an assigned operations workspace',async()=>{mock.state=state(['patient','orders_admin']);show();expect(screen.getByRole('heading',{name:'Choose your refund operations workspace'})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Patient'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Administrator'})).not.toBeInTheDocument();await userEvent.click(screen.getByRole('button',{name:'Orders administrator'}));expect(screen.getByRole('heading',{name:'Cancellation & refunds.'})).toBeInTheDocument();});
 it.each(['loading','error','signed-out','unconfirmed','expired','incomplete']as const)('denies private order data while identity is %s',kind=>{mock.state=state(['super_admin']);if(kind==='loading')mock.state.loading=true;if(kind==='error')mock.state.error='Unavailable';if(kind==='signed-out')mock.state.session=null;if(kind==='unconfirmed')mock.state.session!.user.email_confirmed_at=undefined;if(kind==='expired')mock.state.session!.expires_at=1;if(kind==='incomplete')mock.state.account!.completedAt=null;show();expect(mock.source.queue).not.toHaveBeenCalled();expect(mock.source.detail).not.toHaveBeenCalled();});
 it('a pasted admin role cannot elevate a patient',()=>{show(true,'/shop/refunds?workspace=admin');expect(screen.getByRole('heading')).toHaveTextContent('not available');expect(mock.source.queue).not.toHaveBeenCalled();});
 it('new operations and tracking routes retain the functional release boundary',()=>{expect(previewForPath('/shop/refunds')).toBeTruthy();expect(previewForPath('/shop/resolution')).toBeTruthy();});
});
