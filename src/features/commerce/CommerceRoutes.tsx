import {useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {usePageSEO} from '@/hooks/usePageSEO';
import {useAccountSession} from '@/features/accounts/accountService';
import {WorkspaceGuard} from '@/features/access/Workspace';
import {Catalog,CatalogDetail} from './Catalog';
import {ProductManagement} from './ProductManagement';
import {commerceSource,publicCatalog} from './service';
export function CatalogRoute(){usePageSEO({title:'Product catalog',description:'Browse published product information on Ayuzee.',noIndex:true});return <Catalog source={publicCatalog} embedded allowCart/>;}
export function CatalogDetailRoute(){usePageSEO({title:'Product information',description:'Published product details on Ayuzee.',noIndex:true});return <CatalogDetail source={publicCatalog} embedded allowCart/>;}
export function ProductManagementRoute(){
 usePageSEO({title:'Catalog workspace',noIndex:true});const state=useAccountSession();const [params]=useSearchParams();const requested=params.get('workspace');
 const grants=(state.account?.roles??[]).filter(role=>['manufacturer','product_admin','admin','super_admin'].includes(role));const role=requested??(state.account?.roles.length===1&&grants.length===1?grants[0]:undefined);
 const source=useMemo(()=>commerceSource(role),[role]);const eligible=role!==undefined&&['manufacturer','product_admin','admin','super_admin'].includes(role);
 return <WorkspaceGuard role={eligible?role:undefined}>{eligible&&<ProductManagement key={`${state.session?.user.id}:${role}:${state.revision}`} contextKey={`${state.session?.user.id}:${role}:${state.revision}`} source={source} embedded/>}</WorkspaceGuard>;
}
