import{z}from'zod';
import{productSchema}from'./model';
export const cartLineSchema=z.object({product_id:z.string().uuid().transform(v=>v.toLowerCase()),quantity:z.number().int().min(1).max(99)}).strict();
export type CartLine=z.infer<typeof cartLineSchema>;
export const cartSchema=z.array(cartLineSchema).max(20).superRefine((items,c)=>{if(new Set(items.map(i=>i.product_id)).size!==items.length)c.addIssue({code:'custom',message:'Duplicate product lines'});});
export const addressSchema=z.object({full_name:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^\+?[0-9]{10,15}$/,'Enter a phone number with 10–15 digits.'),address_line1:z.string().trim().min(4).max(200),address_line2:z.string().trim().max(200),city:z.string().trim().min(2).max(80),state:z.string().trim().min(2).max(80),pincode:z.string().regex(/^[1-9][0-9]{5}$/,'Enter a six-digit delivery postcode.')}).strict();
export type DeliveryAddress=z.infer<typeof addressSchema>;
const amount=z.number().int().min(0).max(1000000000);
export const pricingShape={currency:z.literal('INR'),tax_mode:z.literal('included'),coupon_code:z.string().max(32).nullable(),postal_code:z.string().regex(/^[1-9][0-9]{5}$/),lines:z.array(z.object({product_id:z.string().uuid(),name:z.string().max(160),quantity:z.number().int().min(1).max(99),unit_paise:amount,line_paise:amount}).strict()).min(1).max(20),subtotal_paise:amount,discount_paise:amount,shipping_paise:amount,total_paise:amount.refine(n=>n>0)};
function consistent(p:z.infer<z.ZodObject<typeof pricingShape>>){return new Set(p.lines.map(l=>l.product_id)).size===p.lines.length&&p.lines.every(l=>l.unit_paise>0&&l.line_paise===l.unit_paise*l.quantity)&&p.subtotal_paise===p.lines.reduce((s,l)=>s+l.line_paise,0)&&p.discount_paise<=p.subtotal_paise&&p.total_paise===p.subtotal_paise-p.discount_paise+p.shipping_paise;}
export const pricingSchema=z.object(pricingShape).strict().refine(consistent,'Incomplete or inconsistent server pricing');
export const quoteSchema=z.object({...pricingShape,id:z.string().uuid(),expires_at:z.string().datetime({offset:true})}).strict().refine(consistent,'Incomplete or inconsistent server quote');
export type CheckoutQuote=z.infer<typeof quoteSchema>;
export const receiptSchema=z.object({order_id:z.string().uuid(),quote_id:z.string().uuid(),request_key:z.string().uuid(),payment_status:z.enum(['unpaid','paid','refunded','failed']),order_status:z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','returned']),reservation_state:z.enum(['held','released','expired','committed']),expires_at:z.string().datetime({offset:true}),pricing:pricingSchema}).strict();
export type Reservation=z.infer<typeof receiptSchema>;
export const inspectionSchema=z.object({lines:z.array(cartLineSchema.extend({product:productSchema.nullable(),issue:z.enum(['unavailable','prescription','stock']).nullable()}).strict()).max(20)}).strict();
export const intentSchema=z.object({quote_id:z.string().uuid(),request_key:z.string().uuid()}).strict();
export type ReservationIntent=z.infer<typeof intentSchema>;
export type CheckoutAction='inspect'|'quote'|'reserve'|'recover'|'status'|'release'|'orders';
export type JsonValue=null|string|number|boolean|JsonValue[]|{[key:string]:JsonValue};
export type CheckoutPayload=Record<string,JsonValue>;
export interface CheckoutSource{
 orders(page:number,signal?:AbortSignal):Promise<{reservations:Reservation[];hasMore:boolean}>;
 inspect(items:CartLine[],signal?:AbortSignal):Promise<z.infer<typeof inspectionSchema>>;
 quote(items:CartLine[],postal:string,coupon:string,signal?:AbortSignal):Promise<CheckoutQuote>;
 reserve(intent:ReservationIntent,address:DeliveryAddress):Promise<Reservation>;
 recover(intent:ReservationIntent):Promise<{reservation:Reservation|null;quote:CheckoutQuote|null}>;
 status(orderId:string,signal?:AbortSignal):Promise<Reservation>;
 release(orderId:string):Promise<Reservation>;
}
export const checkoutMessages:Record<string,string>={P5100:'Checkout is not available until pricing and delivery rules are configured.',P5101:'A product is no longer available. Review your cart.',P5102:'There is not enough stock. Review quantities and try again.',P5103:'A product requires prescription review before purchase.',P5104:'This quote has expired. Request and review a new quote.',P5105:'Prices or delivery rules changed. Request and review a new quote.',P5106:'The delivery postcode changed. Request a new quote.',P5107:'This coupon is unavailable or its conditions are not met.',P5108:'This coupon has reached its available limit.',P5109:'This request may already belong to another order attempt. Check its result before continuing.',P5110:'Delivery is not available for this postcode.', '42501':'Your access could not be verified. Sign in again or choose an assigned workspace.','22023':'Check your cart, quantities and delivery details.','55P03':'The service is busy. Please check your order result before retrying.'};
export class CheckoutError extends Error{constructor(public code:string){super(checkoutMessages[code]??'The result could not be confirmed. Check the order result before retrying.');this.name='CheckoutError';}get definitive(){return ['P5100','P5101','P5102','P5103','P5104','P5105','P5106','P5107','P5108','P5110'].includes(this.code);}}
export const cartIdentity=(items:CartLine[])=>JSON.stringify(cartSchema.parse(items).map(i=>({...i})).sort((a,b)=>a.product_id.localeCompare(b.product_id)));
