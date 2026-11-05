import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AccountShell } from './AccountShell';
import { accountActions, useAccountSession } from './accountService';
import { accountError, accountLabels, accountTypes, requestedType, validatePassword, type AccountType } from './model';

type Mode = 'login' | 'signup' | 'reset' | 'resend';
export default function AccountAuth({ initialRole = 'patient', loginOnly = false }: { initialRole?: AccountType; loginOnly?: boolean }) {
  const [params, setParams] = useSearchParams();
  const mode: Mode = ['signup', 'reset', 'resend'].includes(params.get('mode') ?? '')
    ? (loginOnly && params.get('mode') === 'signup' ? 'login' : params.get('mode') as Mode) : 'login';
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [fullName, setName] = useState('');
  const [type, setType] = useState<AccountType>(requestedType(params.get('role') ?? initialRole));
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const pending = useRef(false);
  const navigate = useNavigate();
  const state = useAccountSession();
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) feedback.current?.focus(); }, [error]);
  useEffect(() => { if (state.session && !busy) navigate('/account', { replace: true }); }, [state.session, busy, navigate]);
  function changeMode(next: Mode) {
    if (pending.current) return;
    setError(''); setNotice(''); setPassword('');
    setParams({ mode: next, role: type }, { replace: true });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const validEmail = z.string().trim().email().max(255).safeParse(email);
    let validation = validEmail.success ? '' : 'Enter a valid email address.';
    if (mode === 'signup') validation ||= validatePassword(password) ?? (fullName.trim().length < 2 || fullName.trim().length > 100 ? 'Enter your name using 2 to 100 characters.' : '');
    if (mode === 'login' && !password) validation ||= 'Enter your password.';
    if (validation) { setError(validation); return; }
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup') {
        const result = await accountActions.signup({ email, password, fullName, requestedRole: type });
        setPassword('');
        if (result === 'signed-in') navigate('/account', { replace: true });
        else setNotice('Check your inbox and spam folder. If this address is eligible, follow the confirmation email to finish your account. Already registered? Sign in or reset your password.');
      } else if (mode === 'login') {
        await accountActions.signin(email, password); setPassword(''); navigate('/account', { replace: true });
      } else if (mode === 'reset') {
        await accountActions.requestReset(email);
        setNotice('If an account exists for this email, a password reset link will be sent. Check your inbox and spam folder.');
      } else {
        await accountActions.resend(email);
        setNotice('If confirmation is still needed, a new email will be sent. Check your inbox and spam folder.');
      }
    } catch (failure) { setError(accountError(failure)); }
    finally { pending.current = false; setBusy(false); }
  }
  const title = ({ login: 'Welcome back', signup: 'Create your account', reset: 'Reset your password', resend: 'Confirm your email' })[mode];
  if (state.loading && !state.session) return <AccountShell title="Checking sign-in" description="Please wait while we check your account."><p role="status">Checking sign-in status…</p></AccountShell>;
  if (state.session && !busy) return <AccountShell title="Opening your account" description="Your account is signed in."><p role="status">Opening your account…</p></AccountShell>;
  return <AccountShell title={title} description={mode === 'signup' ? 'Start with your email. You can finish your profile after confirming it.' : mode === 'login' ? 'Sign in with your email and password.' : 'Enter your email address to request a new link.'}>
    {!loginOnly && ['login','signup'].includes(mode) && <div className="account-switch" aria-label="Account action">
      <button type="button" aria-pressed={mode === 'login'} disabled={busy} onClick={() => changeMode('login')}>Sign in</button>
      <button type="button" aria-pressed={mode === 'signup'} disabled={busy} onClick={() => changeMode('signup')}>Create account</button>
    </div>}
    {loginOnly && <p className="account-note">Use an existing account. Access is checked after you sign in.</p>}
    <form className="account-form" onSubmit={submit} aria-busy={busy} aria-describedby="account-feedback">
      <fieldset disabled={busy}>
        <legend className="sr-only">{title}</legend>
        {mode === 'signup' && <>
          <label className="account-field">Full name<input name="fullName" autoComplete="name" required minLength={2} maxLength={100} value={fullName} onChange={event => setName(event.target.value)} /></label>
          <label className="account-field">Account type<select value={type} onChange={event => setType(requestedType(event.target.value))}>{accountTypes.map(role => <option key={role} value={role}>{accountLabels[role]}</option>)}</select></label>
          <p className="account-note">Professional and student access requires review. Choosing an account type does not grant permissions.</p>
        </>}
        <label className="account-field">Email address<input name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} /></label>
        {['login','signup'].includes(mode) && <>
          <label className="account-field">Password<input name="password" type={visible ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={mode === 'signup' ? 'password-hint' : undefined} /></label>
          {mode === 'signup' && <p id="password-hint" className="account-note">Use 8 to 72 characters. You can paste a password from your password manager.</p>}
          <label className="account-check"><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)} />Show password</label>
        </>}
        <button className="account-button" type="submit">{busy ? (mode === 'login' ? 'Signing in…' : 'Please wait…') : ({ login: 'Sign in', signup: 'Create account', reset: 'Send reset link', resend: 'Send confirmation email' })[mode]}</button>
      </fieldset>
      <div id="account-feedback" ref={feedback} tabIndex={-1} role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={error || notice ? 'account-feedback' : 'sr-only'}>{error || notice}</div>
    </form>
    <div className="account-stack">
      {mode === 'login' && <button className="account-text-link" disabled={busy} onClick={() => changeMode('reset')}>Forgot your password?</button>}
      {mode !== 'resend' && (mode !== 'signup' || Boolean(notice)) && <button className="account-text-link" disabled={busy} onClick={() => changeMode('resend')}>Need another confirmation email?</button>}
      {!['login','signup'].includes(mode) && <button className="account-text-link" disabled={busy} onClick={() => changeMode('login')}>Back to sign in</button>}
      {mode !== 'signup' && <Link className="account-text-link" to="/login">Choose another account type</Link>}
    </div>
  </AccountShell>;
}
