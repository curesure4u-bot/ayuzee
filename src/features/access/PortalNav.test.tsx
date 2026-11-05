import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {MemoryRouter} from 'react-router-dom';
import {sessionFor} from '@/test/accountFixtures';
import type {AccountSnapshot} from '@/features/accounts/sessionStore';
import {PortalNav,WorkspaceNavigationLinks} from './PortalNav';
import {accountRoles,roleLabels} from './roles';
import {features,roleFeatures} from './policy';
const mock=vi.hoisted(()=>({state:{} as AccountSnapshot}));
vi.mock('@/features/accounts/accountService',()=>({useAccountSession:()=>mock.state}));
beforeEach(()=>{mock.state={session:sessionFor('a'),account:{roles:['patient'],fullName:'Synthetic Account',requestedRole:'patient',completedAt:'2026-11-04'},loading:false,error:null,revision:1};});
afterEach(cleanup);
function show(path='/doctors') {return render(<MemoryRouter initialEntries={[path]}><PortalNav/><nav aria-label="Footer workspace"><WorkspaceNavigationLinks/></nav></MemoryRouter>);}
describe('shared role navigation',()=>{
 it.each(accountRoles)('header and footer expose only %s workspace tools',role=>{
  mock.state.account!.roles=[role];show();
  for(const name of ['Your workspace','Footer workspace']){
   const nav=within(screen.getByRole('navigation',{name}));
   expect(nav.getByRole('link',{name:`${roleLabels[role]} workspace`})).toHaveAttribute('href',`/workspace/${role}`);
   const links=nav.getAllByRole('link');
   expect(links.map(a=>a.getAttribute('href'))).toEqual([`/workspace/${role}`,...roleFeatures[role].map(id=>`/workspace/${role}/${id}`)]);
   for(const id of roleFeatures[role])expect(nav.getByRole('link',{name:features[id].title})).toBeInTheDocument();
  }
 });
 it('does not combine doctor and patient tools until a workspace is chosen',()=>{
  mock.state.account!.roles=['patient','doctor'];show();
  expect(screen.getAllByRole('link',{name:'Choose your workspace'})).toHaveLength(2);
  expect(screen.queryByRole('link',{name:'Assigned patients'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'My health records'})).not.toBeInTheDocument();
 });
 it('honors a granted active workspace in the URL',()=>{
  mock.state.account!.roles=['patient','doctor'];show('/workspace/doctor');
  expect(screen.getAllByRole('link',{name:'Assigned patients'})).toHaveLength(2);
  expect(screen.queryByRole('link',{name:'My health records'})).not.toBeInTheDocument();
 });
 it.each(['loading','error','expired','unconfirmed','incomplete','unknown','anonymous'])('has no private tool links for %s',state=>{
  if(state==='loading')mock.state.loading=true;
  if(state==='error')mock.state.error='Unavailable';
  if(state==='expired')mock.state.session!.expires_at=1;
  if(state==='unconfirmed')mock.state.session!.user.email_confirmed_at=undefined;
  if(state==='incomplete')mock.state.account!.completedAt=null;
  if(state==='unknown')mock.state.account!.roles=['invented'];
  if(state==='anonymous')mock.state.session=null;
  show();expect(screen.queryByRole('link',{name:'My health records'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Assigned patients'})).not.toBeInTheDocument();
 });
 it('mobile menu supports Escape and restores keyboard focus',()=>{
  show();const toggle=screen.getByRole('button',{name:'Menu'});fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded','true');fireEvent.keyDown(document,{key:'Escape'});
  expect(toggle).toHaveAttribute('aria-expanded','false');expect(toggle).toHaveFocus();
 });
 it('account changes remove old workspace links immediately',()=>{
  const view=show();mock.state={...mock.state,session:sessionFor('b'),account:{...mock.state.account!,roles:['doctor']},revision:2};
  view.rerender(<MemoryRouter><PortalNav/></MemoryRouter>);
  expect(screen.queryByRole('link',{name:'My health records'})).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Assigned patients'})).toBeInTheDocument();
 });
});
