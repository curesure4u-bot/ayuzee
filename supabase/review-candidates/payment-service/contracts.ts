import {z} from 'zod';
export const providerOrder=z.object({id:z.string().regex(/^order_[A-Za-z0-9]{3,80}$/),entity:z.literal('order'),receipt:z.string().uuid(),amount:z.number().int().positive().max(1e9),currency:z.literal('INR'),status:z.enum(['created','attempted','paid'])});
export const providerPayment=z.object({id:z.string().regex(/^pay_[A-Za-z0-9]{3,80}$/),entity:z.literal('payment'),order_id:z.string().regex(/^order_[A-Za-z0-9]{3,80}$/),amount:z.number().int().positive().max(1e9),currency:z.literal('INR'),status:z.enum(['created','authorized','captured','refunded','failed']),captured:z.boolean(),amount_refunded:z.number().int().nonnegative()});
export const attemptSchema=z.object({id:z.string().uuid(),order_id:z.string().uuid(),user_id:z.string().uuid().nullable(),workspace:z.string(),session_id:z.string().uuid(),integration:z.string().regex(/^rzp_test_[A-Za-z0-9]{3,80}$/),amount_paise:z.coerce.number().int().positive().max(1e9),currency:z.literal('INR'),state:z.enum(['queued','creating','uncertain','ready','verified','review_required']),provider_order_id:z.string().nullable(),claim_token:z.string().uuid().nullable(),created_at:z.string(),updated_at:z.string()});
export type Attempt=z.infer<typeof attemptSchema>;
export type ProviderOrder=z.infer<typeof providerOrder>;
export type ProviderPayment=z.infer<typeof providerPayment>;
export interface PaymentProvider{
 createOrder(input:{amount:number;currency:'INR';receipt:string}):Promise<unknown>;
 order(id:string):Promise<unknown>;
 payment(id:string):Promise<unknown>;
 ordersByReceipt(receipt:string):Promise<unknown[]>;
 paymentsForOrder(id:string):Promise<unknown[]>;
}
export interface WorkerRepository{call(action:string,payload:Record<string,unknown>):Promise<unknown>;}
export class PaymentError extends Error{constructor(public code:string){super(code);this.name='PaymentError';}}
export const callbackSchema=z.object({order_id:z.string().uuid(),workspace:z.string().min(1).max(40),razorpay_order_id:z.string().regex(/^order_[A-Za-z0-9]{3,80}$/),razorpay_payment_id:z.string().regex(/^pay_[A-Za-z0-9]{3,80}$/),razorpay_signature:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
