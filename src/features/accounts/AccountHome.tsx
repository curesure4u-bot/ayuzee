import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccountShell } from './AccountShell';
import { accountActions, accountStore, completeOnboarding, useAccountSession } from './accountService';
import { accountError, accountLabels, accountTypes, dashboardPathForRole, primaryRole, requestedType } from './model';
import { grantedAccountRoles } from '@/features/access/roles';

export default function AccountHome() {
  const state = useAccountSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const pending = useRef(false);
  const completedFocus = useRef('');
  const completedKey = state.account?.completedAt ? `${state.session?.user.id}:${state.account.completedAt}` : '';
  const grantedRoles = grantedAccountRoles(state.account?.roles ?? []);
  useEffect(() => {
    if (completedKey && completedKey !== completedFocus.current) {
      completedFocus.current = completedKey;
      document.getElementById('account-heading')?.focus();
    }
  }, [completedKey]);
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await accountActions.signout(); navigate('/auth?mode=login', { replace: true }); }
    catch { setError('Sign-out could not be confirmed. Your private view has been cleared. Please retry signing out.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <AccountShell title="Your account" description="Manage your profile and account access.">
    <div className="account-stack">
      {error && <p role="alert" className="account-feedback">{error}</p>}
      {state.loading ? <p role="status">Loading your account…</p> : state.error ? <>
        <p role="alert" className="account-feedback">{state.error}</p>
        <button className="account-button" onClick={() => { void accountStore.refresh().catch(() => setError('Please try again.')); }}>Retry account loading</button>
      </> : !state.session ? <Link className="account-button" to="/auth?mode=login">Sign in</Link>
        : !state.session.user.email_confirmed_at ? <><p role="status">Confirm your email to continue.</p><Link className="account-button" to="/auth?mode=resend">Request confirmation email</Link></>
        : state.account && !state.account.completedAt ? <Onboarding key={state.session.user.id} fullName={state.account.fullName || String(state.session.user.user_metadata.full_name ?? '')} role={requestedType(state.session.user.user_metadata.requested_account_type)} />
        : state.account && <>
          <p>Welcome, {state.account.fullName}.</p>
          {state.account.requestedRole !== 'patient' && !state.account.roles.includes(state.account.requestedRole) && primaryRole(state.account.roles) !== 'admin'
            ? <p role="status" className="account-feedback">Your {accountLabels[state.account.requestedRole]} access request is saved for review. Additional access will appear here when it is granted.</p> : null}
          {grantedRoles.length > 1 && <h2 className="text-2xl font-semibold">Choose your workspace</h2>}
          {grantedRoles.length ? grantedRoles.map(role =>
            <Link key={role} className="account-button" to={dashboardPathForRole(role)}>Open {accountLabels[role]} area</Link>)
            : <p role="status" className="account-feedback">No workspace access is assigned yet. Contact Ayuzee if you expected access.</p>}
        </>}
      <button className="account-button secondary" disabled={busy} onClick={logout}>{busy ? 'Signing out…' : 'Sign out'}</button>
    </div>
  </AccountShell>;
}
function Onboarding({ fullName, role }: { fullName: string; role: string }) {
  const [name, setName] = useState(fullName), [type, setType] = useState(requestedType(role));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const pending = useRef(false);
  async function save(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    if (name.trim().length < 2 || name.trim().length > 100) { setError('Enter your name using 2 to 100 characters.'); return; }
    pending.current = true; setBusy(true); setError('');
    try { await completeOnboarding(name.trim(), type); }
    catch (failure) { setError(accountError(failure)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <form className="account-form" onSubmit={save} aria-busy={busy}>
    <h2 className="text-2xl font-semibold">Finish your profile</h2>
    <fieldset disabled={busy}>
      <legend className="sr-only">Basic account information</legend>
      <label className="account-field">Full name<input name="fullName" autoComplete="name" value={name} required minLength={2} maxLength={100} onChange={event => setName(event.target.value)} /></label>
      <label className="account-field">Account type<select value={type} onChange={event => setType(requestedType(event.target.value))}>{accountTypes.map(value => <option key={value} value={value}>{accountLabels[value]}</option>)}</select></label>
      <p className="account-note">Your profile stays private. Professional and student access requests require review and do not grant permissions automatically.</p>
      <button className="account-button" type="submit">{busy ? 'Saving your profile…' : 'Save and continue'}</button>
    </fieldset>
    {error && <p role="alert" className="account-feedback">{error}</p>}
  </form>;
}
