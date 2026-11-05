import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AccessibilityReport from './AccessibilityReport';
import AccountAuth from '../../../src/features/accounts/AccountAuth';
import AccountHome from '../../../src/features/accounts/AccountHome';
import EmailCallback from '../../../src/features/accounts/EmailCallback';
import PasswordRecovery from '../../../src/features/accounts/PasswordRecovery';
import AccountPicker from '../../../src/features/accounts/AccountPicker';
import '../../../src/index.css';

createRoot(document.getElementById('root')!).render(<BrowserRouter>
  <aside style={{ padding: '12px 16px', background: '#fff4d6', color: '#382b00', fontSize: 16 }}>
    Local test fixture · synthetic accounts only · no provider calls.
    <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <Link to="/auth?mode=signup">Signup</Link><Link to="/auth/callback?code=signup">Simulate confirmation</Link>
      <Link to="/reset-password?code=recovery">Simulate recovery</Link><Link to="/reset-password?error_code=otp_expired">Expired link</Link>
    </nav>
  </aside>
  <Routes>
    <Route path="/auth" element={<AccountAuth />} /><Route path="/auth/callback" element={<EmailCallback />} />
    <Route path="/account" element={<AccountHome />} /><Route path="/reset-password" element={<PasswordRecovery />} />
    <Route path="/login" element={<AccountPicker />} /><Route path="*" element={<p>Unreleased area preview</p>} />
  </Routes>
  <AccessibilityReport />
</BrowserRouter>);
