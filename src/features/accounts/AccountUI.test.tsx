import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { deferred, sessionFor } from '@/test/accountFixtures';
import type { AccountSnapshot } from './sessionStore';
import AccountAuth from './AccountAuth';
import AccountHome from './AccountHome';
import PasswordRecovery from './PasswordRecovery';
import AccountPicker from './AccountPicker';
import AccountRouteNavigation from './AccountRouteNavigation';
import { previewForPath } from '@/lib/previewPolicy';
import { HmsRoleGuard } from '@/components/hms/HmsRoleGuard';

const mock = vi.hoisted(() => ({ signup: vi.fn(), signin: vi.fn(), resend: vi.fn(), requestReset: vi.fn(),
  recoveryReady: vi.fn(), completeEmailLink: vi.fn(), resetPassword: vi.fn(), signout: vi.fn(), complete: vi.fn(), refresh: vi.fn(), state: {} as AccountSnapshot }));
vi.mock('./accountService', () => ({ accountActions: mock, accountStore: { refresh: mock.refresh },
  completeOnboarding: mock.complete, useAccountSession: () => mock.state }));
const base = (): AccountSnapshot => ({ session: null, account: null, loading: false, error: null, revision: 1 });
const show = (node: React.ReactNode, route = '/auth') => render(<MemoryRouter initialEntries={[route]}>{node}</MemoryRouter>);
beforeEach(() => { vi.resetAllMocks(); mock.state = base(); window.history.replaceState({}, '', '/reset-password'); });
afterEach(cleanup);
describe('accessible account screens', () => {
  it('shows an actual initial loading state before offering the sign-in form', () => {
    mock.state.loading = true; show(<AccountAuth />); expect(screen.getByRole('status')).toHaveTextContent('Checking sign-in'); expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
  it('labels signup fields and shows email verification without claiming a session exists', async () => {
    mock.signup.mockResolvedValue('verification-required'); show(<AccountAuth initialRole="student" />, '/auth?mode=signup');
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Synthetic Name' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.invalid' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'synthetic-password' } });
    fireEvent.submit(screen.getByLabelText('Full name').closest('form')!);
    await waitFor(() => expect(mock.signup).toHaveBeenCalledWith(expect.objectContaining({ requestedRole: 'student' })));
    expect(await screen.findByRole('status')).toHaveTextContent('Check your inbox'); expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });
  it('prevents repeated submissions and keeps a readable server failure with retry', async () => {
    const pending = deferred<void>(); mock.signin.mockReturnValueOnce(pending.promise); show(<AccountAuth />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'a@example.invalid' } }); fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'synthetic' } });
    const form = screen.getByLabelText('Email address').closest('form')!;
    fireEvent.submit(form); fireEvent.submit(form); expect(mock.signin).toHaveBeenCalledTimes(1); expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    pending.reject({ status: 429 }); expect(await screen.findByRole('alert')).toHaveTextContent('wait a few minutes'); expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Sign in', pressed: true })).toBeEnabled();
  });
  it('offers a working password visibility control without losing the field label', () => {
    show(<AccountAuth />); const field = screen.getByLabelText('Password'); expect(field).toHaveAttribute('type','password');
    fireEvent.click(screen.getByLabelText('Show password')); expect(field).toHaveAttribute('type','text'); expect(field).toHaveAttribute('autocomplete','current-password');
  });
  it('restores incomplete onboarding and never grants the requested professional role', async () => {
    mock.state = { ...base(), session: sessionFor('a'), account: { roles: ['patient'], fullName: 'Existing Name', requestedRole: 'patient', completedAt: null } };
    mock.complete.mockResolvedValue(undefined); show(<AccountHome />);
    expect(screen.getByLabelText('Full name')).toHaveValue('Existing Name'); fireEvent.change(screen.getByLabelText('Account type'), { target: { value: 'doctor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' })); await waitFor(() => expect(mock.complete).toHaveBeenCalledWith('Existing Name','doctor'));
    expect(screen.queryByRole('link', { name: /Open Doctor/ })).not.toBeInTheDocument();
  });
  it('keeps a pending professional request separate from granted navigation', () => {
    mock.state = { ...base(), session: sessionFor('a'), account: { roles: ['patient'], fullName: 'Name', requestedRole: 'doctor', completedAt: '2026-10-17' } };
    show(<AccountHome />); expect(screen.getByRole('status')).toHaveTextContent('saved for review'); expect(screen.getByRole('link', { name: 'Open Patient area' })).toHaveAttribute('href','/workspace/patient');
  });
  it('routes students and venue owners to distinct account entrypoints', () => {
    show(<AccountPicker />); expect(screen.getByRole('link', { name: 'Student' })).toHaveAttribute('href','/student/auth');
    expect(screen.getByRole('link', { name: 'Venue owner' })).toHaveAttribute('href','/venue/auth');
  });
  it('offers only granted workspaces and never turns unknown roles into patient access', () => {
    mock.state = { ...base(), session: sessionFor('a'), account: { roles: ['custom-admin'], fullName: 'Name', requestedRole: 'patient', completedAt: '2026-11-03' } };
    show(<AccountHome />); expect(screen.getByRole('status')).toHaveTextContent('No workspace access');
    expect(screen.queryByRole('link', { name: /Open .* area/ })).not.toBeInTheDocument();
  });
  it('lets a multi-role user choose without merging administrator responsibilities', () => {
    mock.state = { ...base(), session: sessionFor('a'), account: { roles: ['patient', 'product_admin'], fullName: 'Name', requestedRole: 'patient', completedAt: '2026-11-03' } };
    show(<AccountHome />); expect(screen.getByRole('link', { name: 'Open Patient area' })).toHaveAttribute('href', '/workspace/patient');
    expect(screen.getByRole('link', { name: 'Open Product administrator area' })).toHaveAttribute('href', '/workspace/product_admin');
    expect(screen.queryByRole('link', { name: 'Open Administrator area' })).not.toBeInTheDocument();
  });
  it('keeps the account header simple without enabling any new release routes',()=>{
    show(<AccountRouteNavigation />,'/auth/callback'); expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    for(const path of ['/account','/auth/callback','/reset-password','/student/auth']) expect(previewForPath(path)).toBeTruthy();
  });
  it('replaces missing and expired recovery links with a fresh-link action', async () => {
    mock.recoveryReady.mockResolvedValue(false); show(<PasswordRecovery />);
    expect(await screen.findByRole('link', { name: 'Request a new reset link' })).toHaveAttribute('href','/auth?mode=reset'); expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });
  it('distinguishes a changed password from a later sign-out failure', async () => {
    mock.recoveryReady.mockResolvedValue(true); mock.resetPassword.mockResolvedValue(undefined); mock.signout.mockRejectedValueOnce(new Error('synthetic outage'));
    show(<PasswordRecovery />); fireEvent.change(await screen.findByLabelText('New password'), { target: { value: 'new-synthetic-password' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'new-synthetic-password' } }); fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('heading', { name: 'Your password has changed' })).toBeInTheDocument(); expect(screen.getByRole('alert')).toHaveTextContent('sign-out could not be confirmed');
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument(); mock.signout.mockResolvedValueOnce(undefined); fireEvent.click(screen.getByRole('button',{name:'Retry signing out'}));
    expect(await screen.findByRole('link',{name:'Sign in with your new password'})).toHaveAttribute('href','/auth?mode=login'); expect(mock.resetPassword).toHaveBeenCalledTimes(1);
  });
  it('does not reuse HMS roles after the account changes or while permission loading fails', () => {
    mock.state = { ...base(), session: sessionFor('a'), account: { roles: ['admin'], fullName:'Admin', requestedRole:'patient', completedAt:null } };
    const view=show(<HmsRoleGuard allowedRoles={['admin']}><p>Private area</p></HmsRoleGuard>); expect(screen.getByText('Private area')).toBeInTheDocument();
    mock.state={...base(),session:sessionFor('b'),error:'Unavailable'}; view.rerender(<MemoryRouter><HmsRoleGuard allowedRoles={['admin']}><p>Private area</p></HmsRoleGuard></MemoryRouter>);
    expect(screen.queryByText('Private area')).not.toBeInTheDocument();
  });
});
