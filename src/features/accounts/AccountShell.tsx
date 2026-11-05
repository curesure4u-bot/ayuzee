import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './accounts.css';

export function AccountShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [title]);
  return <main className="account-shell gradient-soft">
    <div className="account-container">
      <Link to="/" className="account-brand">Ayuzee <span>Return home</span></Link>
      <section className="account-card" aria-labelledby="account-heading">
        <p className="account-eyebrow">Your Ayuzee account</p>
        <h1 id="account-heading" ref={heading} tabIndex={-1}>{title}</h1>
        <p className="account-description">{description}</p>
        {children}
      </section>
      <p className="account-help">Need help? <Link to="/contact">Contact Ayuzee</Link></p>
    </div>
  </main>;
}
