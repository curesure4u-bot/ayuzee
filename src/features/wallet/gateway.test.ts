import{describe,expect,it,vi}from'vitest';
import{createWalletSource}from'./gateway';
import{walletStatus}from'./model';
const seed={unit:'INR_PAISE',initialized:true,balance:'9000000000000000',entries:[],hasMore:false};
describe('read-only wallet contract',()=>{
 it('keeps large exact balances as strings and exposes only a status method',async()=>{const transport=vi.fn().mockResolvedValue({data:seed,error:null});const api=createWalletSource(transport,'doctor');expect(Object.keys(api)).toEqual(['status']);expect((await api.status('INR_PAISE',1)).balance).toBe('9000000000000000');expect(transport).toHaveBeenCalledWith({workspace:'doctor',unit:'INR_PAISE',page:1},undefined);});
 it('rejects private fields, unit substitution, impossible balances and fabricated initialization',async()=>{for(const patch of[{owner_id:'secret'},{unit:'COIN'},{balance:'-1'},{initialized:false}])await expect(createWalletSource(async()=>({data:{...seed,...patch},error:null}),'patient').status('INR_PAISE',1)).rejects.toThrow();});
 it('rejects invalid page requests and aborted requests before transport',async()=>{const transport=vi.fn(),api=createWalletSource(transport,'patient');await expect(api.status('INR_PAISE',0)).rejects.toThrow();const c=new AbortController();c.abort();await expect(api.status('INR_PAISE',1,c.signal)).rejects.toThrow();expect(transport).not.toHaveBeenCalled();});
 it('refuses a failed fetch rather than substituting a zero balance',async()=>{await expect(createWalletSource(async()=>({data:null,error:{code:'42501'}}),'patient').status('INR_PAISE',1)).rejects.toThrow('could not be checked');});
 it('validates currency and signed transaction direction',()=>{expect(walletStatus.safeParse({...seed,entries:[{id:'30000000-0000-4000-8000-000000000001',amount:'-100',purpose:'fixture_credit',created_at:'2026-11-05T01:00:00Z'}]}).success).toBe(false);});
});
