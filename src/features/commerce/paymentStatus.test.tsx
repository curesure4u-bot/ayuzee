import '@testing-library/jest-dom/vitest';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {createPaymentStatusSource,type PaymentStatus} from './paymentStatus';
import {PaymentStatusPanel} from './PaymentStatusPanel';
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc:vi.fn()}}));
const orderId='20000000-0000-4000-8000-000000000001';
const status=(state:PaymentStatus['state']):PaymentStatus=>({id:'20000000-0000-4000-8000-000000000002',order_id:orderId,amount_paise:24900,currency:'INR',mode:'test',state,provider_order_id:'order_fixture',captured:state==='verified'||state==='review_required',review_required:state==='review_required'});
function show(value:PaymentStatus|null){render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><PaymentStatusPanel source={async()=>value} orderId={orderId} contextKey="buyer" amountPaise={24900}/></QueryClientProvider>);}
afterEach(cleanup);
describe('owned payment status',()=>{
 it('a callback or uncertain result is never displayed as paid',async()=>{show(status('uncertain'));expect(await screen.findByRole('heading',{name:'Payment is not confirmed yet'})).toBeInTheDocument();expect(screen.queryByText(/Payment verified and stock committed/)).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:/pay now/i})).not.toBeInTheDocument();});
 it('shows verified payment only from a matching authoritative result',async()=>{show(status('verified'));expect(await screen.findByText('Payment verified and stock committed for this order.')).toBeInTheDocument();});
 it('captured funds awaiting review do not promise fulfilment or a refund',async()=>{show(status('review_required'));expect(await screen.findByRole('heading',{name:'Captured funds need review'})).toBeInTheDocument();expect(screen.getByRole('status')).toHaveTextContent('does not confirm fulfilment or a refund');});
 it('no attempt is an explicit state',async()=>{show(null);expect(await screen.findByText('No payment attempt has been started for this order.')).toBeInTheDocument();});
 it('identity mismatches, inconsistent paid states and private extra fields are rejected',async()=>{for(const attempt of [{...status('verified'),order_id:'20000000-0000-4000-8000-000000000003'},{...status('verified'),captured:false},{...status('verified'),claim_token:'private'}]){const source=createPaymentStatusSource(async()=>({data:{attempt},error:null}));await expect(source(orderId)).rejects.toBeTruthy();}});
 it('a wrong amount never becomes a successful status',async()=>{show({...status('verified'),amount_paise:1});expect(await screen.findByRole('alert')).toHaveTextContent('could not be confirmed');expect(screen.queryByText(/Payment verified and stock committed/)).not.toBeInTheDocument();});
 it('a failed status can be retried without starting a new payment',async()=>{let failed=true;const source=vi.fn(async()=>{if(failed)throw Error('Unavailable');return status('verified');});render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><PaymentStatusPanel source={source} orderId={orderId} contextKey="buyer" amountPaise={24900}/></QueryClientProvider>);await screen.findByRole('alert');failed=false;await userEvent.click(screen.getByRole('button',{name:'Check payment status'}));expect(await screen.findByText('Payment verified and stock committed for this order.')).toBeInTheDocument();expect(source).toHaveBeenCalledTimes(2);});
});
