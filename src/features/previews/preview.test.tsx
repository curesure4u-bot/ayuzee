import'@testing-library/jest-dom/vitest';
import{afterEach,describe,expect,it,vi}from'vitest';
import{cleanup,render,screen}from'@testing-library/react';
import{MemoryRouter}from'react-router-dom';
import{FeaturePreviewBoundary}from'@/components/common/FeaturePreview';
import{PreservedFeaturePreview}from'./PreservedFeaturePreview';
import{featurePreviews}from'./catalog';
import{previewSupabase}from'@/integrations/preview/client';
import App from'@/App';
vi.mock('@/integrations/supabase/client',()=>{throw Error('Public previews imported the live backend client');});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe('explicit preserved previews',()=>{
 it('boots the complete application preview without loading a live backend client',async()=>{vi.spyOn(window,'scrollTo').mockImplementation(()=>{});window.history.replaceState(null,'','/bulk');render(<App/>);expect(await screen.findByRole('heading',{level:1})).toHaveTextContent('Bulk buying');window.history.replaceState(null,'','/');});
 it('loads the public home without importing unreleased account or launch services',async()=>{vi.spyOn(window,'scrollTo').mockImplementation(()=>{});window.history.replaceState(null,'','/');render(<App/>);expect(await screen.findByRole('heading',{level:1})).toHaveTextContent('Welcome to Ayuzee');expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();});
 it('shows intended use while preventing the protected child from mounting',()=>{const child=vi.fn(()=>{throw Error('A protected backend consumer mounted');});render(<MemoryRouter initialEntries={['/bulk']}><FeaturePreviewBoundary>{(()=>{const Child=child;return <Child/>;})()}</FeaturePreviewBoundary></MemoryRouter>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Bulk buying');expect(screen.getByText(/bulk purchase quantities/)).toBeInTheDocument();expect(child).not.toHaveBeenCalled();expect(screen.queryByRole('textbox')).not.toBeInTheDocument();});
 it('keeps retained screen entrypoints read only with no action form',()=>{render(<MemoryRouter><PreservedFeaturePreview featureId={featurePreviews[0].featureId}/></MemoryRouter>);expect(screen.getByText(/does not load private records/)).toBeInTheDocument();expect(screen.queryByRole('button')).not.toBeInTheDocument();expect(screen.queryByRole('textbox')).not.toBeInTheDocument();});
 it('returns an unavailable API result entirely locally for reads and RPCs',async()=>{const fetch=vi.fn(()=>{throw Error('An external network request was attempted');});vi.stubGlobal('fetch',fetch);const read=await previewSupabase.from('profiles').select('user_id');expect(read.data).toBeNull();expect(read.error?.code).toBe('FEATURE_PREVIEW');expect(read.status).toBe(501);const rpc=await previewSupabase.rpc('get_account_onboarding');expect(rpc.data).toBeNull();expect(rpc.error?.code).toBe('FEATURE_PREVIEW');expect(fetch).not.toHaveBeenCalled();expect(Object.keys(previewSupabase).sort()).toEqual(['from','rpc']);expect(Object.isFrozen(previewSupabase)).toBe(true);});
});
