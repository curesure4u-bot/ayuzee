import { Link } from 'react-router-dom';
import { AccountShell } from './AccountShell';
import { accountEntryPath, accountLabels, accountTypes } from './model';
export default function AccountPicker() {
  return <AccountShell title="Welcome to Ayuzee" description="Choose the account type that fits you. You will use the same email sign-in process.">
    <div className="account-stack">{accountTypes.map(type => <Link className="account-button secondary" key={type} to={accountEntryPath(type)}>{accountLabels[type]}</Link>)}
      <Link className="account-text-link" to="/admin/auth">Administrator sign in</Link>
      <p className="account-note">Professional and student access requests require review.</p>
    </div>
  </AccountShell>;
}
