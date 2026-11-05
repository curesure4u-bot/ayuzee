import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import Workspace from '../../../src/features/access/Workspace';
import { accountRoles, grantedAccountRoles, roleLabels, workspacePath } from '../../../src/features/access/roles';
import { chooseScenario, useAccountSession } from './accountService.fixture';
import AccessibilityReport from './AccessibilityReport';
import { PortalNav } from '../../../src/features/access/PortalNav';
import { Footer } from '../../../src/components/site/Footer';
import '../../../src/index.css';

export function FixtureControls() {
  const navigate = useNavigate(); const [scenario, setScenario] = useState('patient');
  return <aside aria-label="Local review controls" style={{ padding: '16px 24px', background: '#fff4d6', color: '#382b00', fontSize: 16 }}>
    <p><strong>Local review · synthetic accounts only.</strong> No hosted services or real patient data.</p>
    <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>Review as
      <select style={{ minHeight: 48, maxWidth: '100%', padding: 10, border: '1px solid #756844', borderRadius: 8 }} value={scenario} onChange={event => {
        const value = event.target.value; setScenario(value); chooseScenario(value);
        navigate(workspacePath(value === 'multiple' ? 'patient' : accountRoles.find(role => role === value) ?? 'patient'));
      }}>
        {accountRoles.map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}
        {['multiple', 'loading', 'error', 'signed-out', 'unknown', 'revoked'].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    <Link to="/navigation" style={{display:'inline-flex',minHeight:48,alignItems:'center',textDecoration:'underline'}}>Review shared header and footer</Link>
  </aside>;
}
export function FixtureAccount() {
  const state = useAccountSession();
  return <main style={{ padding: 32, fontSize: 18 }}><h1>Your available workspaces</h1>
    {grantedAccountRoles(state.account?.roles ?? []).map(role => <p key={role}><Link style={{ display: 'inline-flex', minHeight: 48, alignItems: 'center', textDecoration: 'underline' }} to={workspacePath(role)}>Open {roleLabels[role]} workspace</Link></p>)}
  </main>;
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><FixtureControls /><Routes>
  <Route path="/workspace/*" element={<Workspace />} />
  <Route path="/account" element={<FixtureAccount />} />
  <Route path="/navigation" element={<div className="navigation-review"><PortalNav/><main id="main-content" className="container py-16"><h1 className="text-3xl font-semibold">Your care and community</h1><p className="mt-4 text-lg">Navigation review with a synthetic account. Service actions remain previews.</p></main><Footer appLevel/></div>} />
  <Route path="*" element={<main style={{ padding: 32 }}><h1>Local review</h1><Link to="/workspace/patient">Return to the workspace review</Link></main>} />
</Routes><AccessibilityReport /></BrowserRouter>);
