import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { accountActions } from '@/features/accounts/accountService';
import { accountError } from '@/features/accounts/model';
import '@/features/accounts/accounts.css';
export function ForgotPasswordDialog({ trigger, defaultEmail = '' }: { trigger: ReactNode; defaultEmail?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false), [email, setEmail] = useState(defaultEmail), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [sent, setSent] = useState(false);
  const pending = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await accountActions.requestReset(email); setSent(true); }
    catch (failure) { setError(accountError(failure)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value && !pending.current) { setEmail(defaultEmail); setError(''); setSent(false); } }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="motion-reduce:animate-none">
      <DialogHeader><DialogTitle className="text-2xl">Reset your password</DialogTitle><DialogDescription className="text-base">Request a secure email link to choose a new password.</DialogDescription></DialogHeader>
      {sent ? <p role="status" className="account-feedback">If an account exists for this address, a reset link will be sent. Check your inbox and spam folder.</p> : <form className="account-form" onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}><legend className="sr-only">Password reset email</legend>
          <label className="account-field" htmlFor={id}>Email address<input id={id} type="email" autoComplete="email" autoCapitalize="none" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} /></label>
          <button className="account-button" type="submit">{busy ? 'Requesting link…' : 'Send reset link'}</button>
        </fieldset>
      </form>}
      {error && <p role="alert" className="account-feedback">{error}</p>}
    </DialogContent>
  </Dialog>;
}
