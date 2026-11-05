import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { accountStore, clearPrivateQueries, useAccountSession } from '@/features/accounts/accountService';
import { grantedAccountRoles, roleLabels, workspacePath, type AccountRole } from './roles';
import { features, mayEnterWorkspace, mayViewFeature, roleFeatures, type FeatureId } from './policy';
import { identityFromAccount } from './accountIdentity';
import './workspace.css';

function Message({ title, children }: { title: string; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const { pathname } = useLocation();
  useEffect(() => { heading.current?.focus(); }, [title, pathname]);
  return <main className="workspace-message"><section>
    <Link className="workspace-brand" to="/">Ayuzee</Link>
    <h1 ref={heading} tabIndex={-1}>{title}</h1>
    {children}
  </section></main>;
}

// This boundary must decide before rendering children, including effects and
// lazy data screens. The URL chooses context; it never creates a grant.
export function WorkspaceGuard({ role, feature, children }: { role: unknown; feature?: unknown; children: ReactNode }) {
  const state = useAccountSession();
  const identity = identityFromAccount(state);
  const context = identity ? `${identity.userId}:${String(role)}:${state.revision}` : '';
  useLayoutEffect(() => { clearPrivateQueries(); }, [context]);
  if (state.loading) return <Message title="Checking your access"><p role="status">Loading your account permissions…</p></Message>;
  if (state.error) return <Message title="Access could not be checked">
    <p role="alert">Your workspace permissions could not be loaded. Please try again.</p>
    <button onClick={() => { void accountStore.refresh().catch(() => undefined); }}>Retry access check</button>
    <Link to="/account">Return to your account</Link>
  </Message>;
  if (!state.session) return <Message title="Sign in to continue"><p>Your workspace is available after signing in.</p><Link to="/auth?mode=login">Sign in</Link></Message>;
  if (!identity) return <Message title="Your account needs attention"><p>Complete your account setup or sign in again to continue.</p><Link to="/account">Return to your account</Link></Message>;
  if (!mayEnterWorkspace(identity, role) || (feature !== undefined && !mayViewFeature(identity, role, feature))) {
    return <Message title="This area is not available in your workspace">
      <p>You don’t have access to this area. Return to your account to choose an available workspace.</p>
      <Link to="/account">Choose an available workspace</Link><Link to="/contact">Contact Ayuzee</Link>
    </Message>;
  }
  return <div key={context}>{children}</div>;
}

function WorkspaceContent({ role, feature }: { role: AccountRole; feature?: FeatureId }) {
  const state = useAccountSession();
  const navigate = useNavigate();
  const location = useLocation();
  const heading = useRef<HTMLHeadingElement>(null);
  const grants = grantedAccountRoles(state.account?.roles ?? []);
  const visibleFeatures = roleFeatures[role];
  useEffect(() => { heading.current?.focus(); }, [location.pathname]);
  function switchWorkspace(value: string) {
    const granted = grants.find(item => item === value);
    if (granted && granted !== role) {
      clearPrivateQueries();
      navigate(workspacePath(granted));
    }
  }
  const label = roleLabels[role];
  const title = feature ? features[feature].title : `${label} workspace`;
  return <div className="workspace">
    <a className="workspace-skip" href="#workspace-main">Skip to workspace content</a>
    <header className="workspace-header">
      <Link className="workspace-brand" to="/">Ayuzee<span>Care, connected.</span></Link>
      <div className="workspace-account"><span>{state.account?.fullName || 'Your account'}</span><Link to="/account">Account & sign out</Link></div>
    </header>
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <p className="workspace-eyebrow">Your workspace</p>
        {grants.length > 1 ? <label className="workspace-switch">Switch workspace
          <select value={role} onChange={event => switchWorkspace(event.target.value)}>
            {grants.map(grant => <option key={grant} value={grant}>{roleLabels[grant]}</option>)}
          </select>
        </label> : <p className="workspace-role">{label}</p>}
        <nav aria-label={`${label} workspace`}>
          <NavLink end to={workspacePath(role)}>Overview</NavLink>
          {visibleFeatures.map(id => <NavLink key={id} to={`${workspacePath(role)}/${id}`}>{features[id].title}</NavLink>)}
        </nav>
        <div className="workspace-shared"><p className="workspace-eyebrow">Explore Ayuzee</p>
          <Link to="/about-us">About Ayuzee</Link><Link to="/guides">Help & guides</Link><Link to="/contact">Contact us</Link>
        </div>
      </aside>
      <main id="workspace-main" tabIndex={-1} className="workspace-main">
        <p className="workspace-eyebrow">{label} / {feature ? 'Your tools' : 'Overview'}</p>
        <h1 ref={heading} tabIndex={-1}>{title}</h1>
        <p className="workspace-intro">{feature ? features[feature].description : 'A focused place for the tools and information relevant to your role.'}</p>
        <div className="workspace-notice"><span className="workspace-status">Preview</span>
          <p>We’re preparing these services. Service actions are not available here yet.</p>
        </div>
        {feature ? <section className="workspace-feature" aria-labelledby="workspace-feature-title">
          <h2 id="workspace-feature-title">This service is being prepared</h2>
          <p>There are no records or service actions available in this preview. Contact Ayuzee if you need help.</p>
          <Link to={workspacePath(role)}>Return to your overview</Link>
        </section> : <>
          <div className="workspace-section-heading"><h2>Your tools</h2><span>{visibleFeatures.length} areas</span></div>
          <div className="workspace-cards">
            {visibleFeatures.map(id => <Link key={id} className="workspace-tool" to={`${workspacePath(role)}/${id}`}>
              <span className="workspace-tool-top"><span className="workspace-tool-icon" aria-hidden="true"><LayoutGrid size={24} strokeWidth={1.5} /></span><span className="workspace-status">Preview</span></span>
              <h3>{features[id].title}</h3><p>{features[id].description}</p><span className="workspace-tool-link">View this area <span aria-hidden="true">→</span></span>
            </Link>)}
          </div>
          <section className="workspace-help"><h2>Need a different workspace?</h2>
            <p>Only access assigned to your account appears here. Contact Ayuzee if you think something is missing.</p><Link to="/contact">Get help with access</Link>
          </section>
        </>}
        <footer className="workspace-footer">Ayuzee · Your health, your community.</footer>
      </main>
    </div>
  </div>;
}

export default function Workspace() {
  const { pathname } = useLocation();
  const match = /^\/workspace\/([^/]+)(?:\/([^/]+))?\/?$/.exec(pathname);
  const role: unknown = match?.[1];
  const feature: unknown = match?.[2];
  const state = useAccountSession();
  const identity = identityFromAccount(state);
  // The guard owns denial/loading states; never coerce URL strings into roles.
  const content = mayEnterWorkspace(identity, role) && (feature === undefined || mayViewFeature(identity, role, feature))
    ? <WorkspaceContent role={role} feature={feature === undefined ? undefined : feature as FeatureId} /> : null;
  return <WorkspaceGuard role={role} feature={feature}>{content}</WorkspaceGuard>;
}
