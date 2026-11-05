import { describe, expect, it } from 'vitest';
import { readFilters, draftSchema, safePostLink, allowedAudiences } from './model';
import { createCommunitySource } from './gateway';
import { reviewViewers } from '../../../tests/browser/community/reviewSource';
describe('community contracts',()=>{
 it('bounds URL inputs and uses safe defaults',()=>{const f=readFilters(new URLSearchParams('q='+ 'a'.repeat(200)+'&page=-1&kind=admin&audience=unknown&sort=bad'));expect(f.query).toHaveLength(100);expect(f.page).toBe(1);expect(f.kind).toBe('all');expect(f.audience).toBe('public');expect(f.sort).toBe('recent');});
 it('rejects unsafe or oversized drafts and duplicate poll choices',()=>{const base={title:'Safe title',body:'A sufficiently long message.',kind:'poll',audience:'public',options:['First','Second']};expect(draftSchema.safeParse(base).success).toBe(true);for(const patch of [{options:['Same','same']},{options:['Only one']},{options:['']},{body:'Short'},{title:'x'},{body:'x'.repeat(4001)}])expect(draftSchema.safeParse({...base,...patch}).success).toBe(false);});
 it('audience controls do not offer another role’s private area',()=>{expect(allowedAudiences(reviewViewers.patient)).toEqual(['public','patient']);expect(allowedAudiences(reviewViewers.doctor)).toEqual(['public','doctor']);});
 it('notification links are derived from validated post ids',()=>{expect(safePostLink('https://evil.invalid')).toBeNull();expect(safePostLink('javascript:alert(1)')).toBeNull();expect(safePostLink(null)).toBeNull();expect(safePostLink(reviewViewers.patient.id)).toBe('/feed/'+reviewViewers.patient.id);});
 it('transport errors cannot be interpreted as a successful write',async()=>{const s=createCommunitySource(async()=>({data:{},error:{message:'secret database detail'}}),'patient');await expect(s.request('save')).rejects.toThrow('could not be completed');});
 it('workspace payload cannot override the selected context',async()=>{let observed:unknown;const s=createCommunitySource(async(_action,payload)=>{observed=payload;return{data:{},error:null};},'patient');await s.request('feed',{workspace:'admin'});expect(observed).toEqual({workspace:'patient'});});
 it('malformed write acknowledgements are not counted as successful saves',async()=>{const s=createCommunitySource(async()=>({data:{success:false},error:null}),'patient');await expect(s.request('save')).rejects.toThrow();await expect(s.request('like')).rejects.toThrow();});
 it('cancelled and late responses are discarded',async()=>{const c=new AbortController();const s=createCommunitySource(async()=>{c.abort();return{data:{},error:null};},'patient');await expect(s.request('feed',{},c.signal)).rejects.toHaveProperty('name','AbortError');});
});
