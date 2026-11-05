import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AccountShell } from './AccountShell';
import { accountActions } from './accountService';
import { accountError, validatePassword } from './model';

export default function PasswordRecovery() {
  const location = useLocation();
  return <RecoveryLink key={location.key} />;
}
function RecoveryLink() {
  const [href] = useState(() => window.location.href);
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'updated'>('checking');
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false), [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const resetUser = useRef<string>();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    async function prepare() {
      const url = new URL(href);
      const hasLink = url.searchParams.has('code') || url.searchParams.has('token_hash') || url.searchParams.has('error') || url.searchParams.has('error_code') || Boolean(url.hash);
      if (hasLink && await accountActions.completeEmailLink(href) !== 'recovery') return false;
      return accountActions.recoveryReady();
    }
    void prepare().then(ready => { if (active) setStatus(ready ? 'ready' : 'invalid'); }).catch(failure => {
      if (active) { setError(accountError(failure)); setStatus('invalid'); }
    });
    return () => { active = false; };
  }, [href]);
  async function signout() { await accountActions.signout(resetUser.current); setSignedOut(true); }
  async function cancelRecovery() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await accountActions.signout(); navigate('/auth?mode=login', { replace: true }); }
    catch { setError('Sign-out could not be confirmed. Check your connection and retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current || status !== 'ready') return;
    const message = validatePassword(password, confirm);
    if (message) { setError(message); return; }
    pending.current = true; setBusy(true); setError('');
    try {
      resetUser.current = await accountActions.resetPassword(password, confirm);
      setPassword(''); setConfirm(''); setStatus('updated');
      try { await signout(); }
      catch { setError('Your password has changed, but sign-out could not be confirmed. Retry signing out below.'); }
    } catch (failure) {
      setError(accountError(failure));
      if (typeof failure === 'object' && failure && 'code' in failure && String(failure.code).startsWith('account_changed')) setStatus('invalid');
    }
    finally { pending.current = false; setBusy(false); }
  }
  async function retrySignout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await signout(); }
    catch { setError('Sign-out could not be confirmed. Check your connection and retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <AccountShell title={status === 'updated' ? 'Your password has changed' : 'Set a new password'} description={status === 'updated' ? 'Use your new password the next time you sign in.' : 'Use the secure link from your password reset email.'}>
    <div className="account-stack">
      {error && <p role="alert" className="account-feedback">{error}</p>}
      {status === 'checking' ? <p role="status">Checking your reset link…</p> : status === 'invalid' ? <>
        {!error && <p role="status" className="account-feedback">This link is missing, invalid or expired. Request a new reset email and open it in this browser.</p>}
        <Link className="account-button" to="/auth?mode=reset">Request a new reset link</Link>
      </> : status === 'updated' ? signedOut ? <Link className="account-button" to="/auth?mode=login">Sign in with your new password</Link>
        : <button className="account-button" disabled={busy} onClick={retrySignout}>{busy ? 'Signing out…' : 'Retry signing out'}</button>
        : <form onSubmit={submit} className="account-form" aria-busy={busy}>
          <fieldset disabled={busy}>
            <legend className="sr-only">New password</legend>
            <label className="account-field">New password<input name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} maxLength={72} aria-describedby="new-password-hint" /></label>
            <p id="new-password-hint" className="account-note">Use 8 to 72 characters. Choose a password you have not used before.</p>
            <label className="account-field">Confirm new password<input name="confirm" type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} required minLength={8} maxLength={72} /></label>
            <label className="account-check"><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)} />Show passwords</label>
            <button className="account-button" type="submit">{busy ? 'Updating your password…' : 'Update password'}</button>
          </fieldset>
        </form>}
      {status === 'ready' ? <button className="account-text-link" disabled={busy} onClick={cancelRecovery}>Cancel and sign out</button>
        : status !== 'updated' && <Link className="account-text-link" to="/auth?mode=login">Return to account access</Link>}
    </div>
  </AccountShell>;
}
