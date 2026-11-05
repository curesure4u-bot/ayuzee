import '@testing-library/jest-dom/vitest';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import type {AccountSnapshot} from '@/features/accounts/sessionStore';
import {sessionFor} from '@/test/accountFixtures';
import {accountRoles,roleLabels} from '@/features/access/roles';
import {previewForPath} from '@/lib/previewPolicy';
import {CheckoutRoute} from './CheckoutRoutes';
const mock=vi.hoisted(()=>({state:{} as AccountSnapshot,source:{inspect:vi.fn(),orders:vi.fn()},payment:vi.fn(),clear:vi.fn()}));
vi.mock('@/features/accounts/accountService',()=>({useAccountSession:()=>mock.state,clearPrivateQueries:mock.clear,accountStore:{refresh:vi.fn()}}));
vi.mock('./paymentStatusService',()=>({paymentStatusSource:()=>mock.payment}));
vi.mock('./checkoutService',()=>({checkoutSource:()=>mock.source}));
function state(roles=['patient']):AccountSnapshot{return{session:sessionFor('buyer'),account:{roles,fullName:'Synthetic Buyer',requestedRole:'patient',completedAt:'2026-11-04'},loading:false,error:null,revision:1};}
function show(path='/cart',screenName:'cart'|'checkout'|'orders'='cart'){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={[path]}><CheckoutRoute screen={screenName}/></MemoryRouter></QueryClientProvider>);}
beforeEach(()=>{vi.clearAllMocks();mock.state=state();});afterEach(cleanup);
describe('checkout workspace boundary',()=>{
 it.each(accountRoles)('allows %s to see their own empty shopping cart',role=>{mock.state=state([role]);show();expect(screen.getByRole('heading',{name:'Your cart is empty'})).toBeInTheDocument();expect(screen.queryByText(/assigned patients|patient records/i)).not.toBeInTheDocument();});
 it('requires an explicit choice among actual grants and never defaults to a different role',async()=>{mock.state=state(['doctor','patient']);show();expect(screen.getByRole('heading',{name:'Choose your shopping workspace'})).toBeInTheDocument();expect(screen.getByRole('button',{name:roleLabels.doctor})).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Administrator'})).not.toBeInTheDocument();expect(mock.source.inspect).not.toHaveBeenCalled();await userEvent.click(screen.getByRole('button',{name:'Doctor'}));expect(screen.getByRole('heading',{name:'Your cart is empty'})).toBeInTheDocument();});
 it.each(['doctor','super_admin','unknown',''])('denies an ungranted workspace %s before a child API is mounted',role=>{show('/checkout/orders?workspace='+role,'orders');expect(screen.getByRole('heading')).toHaveTextContent('not available');expect(mock.source.orders).not.toHaveBeenCalled();expect(mock.payment).not.toHaveBeenCalled();});
 it.each(['loading','error','signed-out','unconfirmed','expired','incomplete'] as const)('denies cart/order data while identity is %s',kind=>{if(kind==='loading')mock.state.loading=true;if(kind==='error')mock.state.error='Unavailable';if(kind==='signed-out')mock.state.session=null;if(kind==='unconfirmed')mock.state.session!.user.email_confirmed_at=undefined;if(kind==='expired')mock.state.session!.expires_at=1;if(kind==='incomplete')mock.state.account!.completedAt=null;show('/checkout/orders','orders');expect(screen.queryByRole('heading',{name:'Your reservations'})).not.toBeInTheDocument();expect(mock.source.orders).not.toHaveBeenCalled();expect(mock.payment).not.toHaveBeenCalled();});
 it('keeps cart, checkout and order-history routes behind the functional release boundary',()=>{for(const path of ['/cart','/checkout','/checkout/orders'])expect(previewForPath(path)).toBeTruthy();});
});
