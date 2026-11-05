import{z}from'zod';
export const walletUnit=z.enum(['INR_PAISE','COIN']);
const integer=z.string().regex(/^-?[1-9][0-9]{0,9}$/).refine(x=>BigInt(x)>=-1000000000n&&BigInt(x)<=1000000000n);
export const walletStatus=z.object({unit:walletUnit,initialized:z.boolean(),balance:z.string().regex(/^(0|[1-9][0-9]{0,15})$/).refine(x=>BigInt(x)<=9000000000000000n).nullable(),entries:z.array(z.object({id:z.string().uuid(),amount:integer,purpose:z.enum(['fixture_credit','fixture_debit']),created_at:z.string().datetime({offset:true})}).strict().refine(x=>x.purpose==='fixture_credit'?BigInt(x.amount)>0:BigInt(x.amount)<0)).max(20),hasMore:z.boolean()}).strict().refine(x=>x.initialized?x.balance!==null:x.balance===null&&x.entries.length===0&&!x.hasMore);
export type WalletStatus=z.infer<typeof walletStatus>;
export interface WalletSource{status(unit:z.infer<typeof walletUnit>,page:number,signal?:AbortSignal):Promise<WalletStatus>;}
