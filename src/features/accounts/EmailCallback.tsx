import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AccountShell } from './AccountShell';
import { accountActions } from './accountService';
import { accountError } from './model';

export default function EmailCallback() {
  const location = useLocation();
  return <CallbackLink key={location.key} />;
}
function CallbackLink() {
  const [href] = useState(() => window.location.href);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    void accountActions.completeEmailLink(href).then(kind => {
      if (active) navigate(kind === 'recovery' ? '/reset-password' : '/account', { replace: true });
    }).catch(failure => { if (active) setError(accountError(failure)); });
    return () => { active = false; };
  }, [href, navigate]);
  return <AccountShell title={error ? 'This link could not be verified' : 'Checking your email link'} description={error ? 'You can request a fresh link and try again.' : 'Please keep this page open while we verify the link.'}>
    <div className="account-stack">
      {error ? <><p role="alert" className="account-feedback">{error}</p><Link className="account-button" to="/auth?mode=resend">Request confirmation email</Link><Link className="account-button secondary" to="/auth?mode=reset">Request password reset</Link></> : <p role="status">Verifying your link…</p>}
      <Link className="account-text-link" to="/auth?mode=login">Back to sign in</Link>
    </div>
  </AccountShell>;
}
