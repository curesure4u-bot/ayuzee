import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import type { AccountSnapshot } from '@/features/accounts/sessionStore';
import { sessionFor } from '@/test/accountFixtures';
import { previewForPath } from '@/lib/previewPolicy';
import Workspace, { WorkspaceGuard } from './Workspace';
import { accountRoles, roleLabels } from './roles';

const mock = vi.hoisted(() => ({ state: {} as AccountSnapshot, clear: vi.fn(), refresh: vi.fn() }));
vi.mock('@/features/accounts/accountService', () => ({ useAccountSession: () => mock.state, clearPrivateQueries: mock.clear, accountStore: { refresh: mock.refresh } }));
const stateFor = (roles = ['patient']): AccountSnapshot => ({ session: sessionFor('a'), account: { roles, fullName: 'Synthetic Person', requestedRole: 'patient', completedAt: '2026-11-03' }, loading: false, error: null, revision: 1 });
function BrowserControls() { const navigate = useNavigate(); return <><button onClick={() => navigate(-1)}>Browser back</button><Link to="/workspace/doctor/doctor.cases">Restricted direct link</Link></>; }
function show(route = '/workspace/patient') {
  return render(<MemoryRouter initialEntries={[route]}><BrowserControls /><Routes><Route path="/workspace/*" element={<Workspace />} /><Route path="/account" element={<h1>Account access</h1>} /></Routes></MemoryRouter>);
}
beforeEach(() => { vi.clearAllMocks(); mock.state = stateFor(); mock.refresh.mockResolvedValue(undefined); });
afterEach(cleanup);

describe('role-specific workspace', () => {
  it.each(accountRoles)('provides a named workspace for %s with no unrelated clinical shortcuts', role => {
    mock.state = stateFor([role]); show(`/workspace/${role}`);
    expect(screen.getByRole('heading', { level: 1, name: `${roleLabels[role]} workspace` })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: `${roleLabels[role]} workspace` })).toBeInTheDocument();
    if (role !== 'doctor') expect(screen.queryByRole('link', { name: 'Assigned patients' })).not.toBeInTheDocument();
    if (role !== 'patient') expect(screen.queryByRole('link', { name: 'My health records' })).not.toBeInTheDocument();
  });
  it('denies pasted doctor links for a patient before protected children mount', () => {
    const mount = vi.fn(); function PrivateData() { useEffect(mount, []); return <p>Private record</p>; }
    render(<MemoryRouter><WorkspaceGuard role="doctor"><PrivateData /></WorkspaceGuard></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('not available'); expect(mount).not.toHaveBeenCalled();
    expect(screen.queryByText('Private record')).not.toBeInTheDocument();
  });
  it('uses the same decision for menus, cards and direct feature routes', () => {
    mock.state = stateFor(['product_admin']); show('/workspace/product_admin/admin.accounts');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('not available');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
  it('switches among granted workspaces, clears private queries, and supports browser back', async () => {
    mock.state = stateFor(['patient', 'doctor']); show();
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Patient', 'Doctor']);
    fireEvent.change(screen.getByLabelText('Switch workspace'), { target: { value: 'doctor' } });
    expect(await screen.findByRole('heading', { level: 1, name: 'Doctor workspace' })).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'My health records' })).not.toBeInTheDocument(); expect(mock.clear).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Browser back' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Patient workspace' })).toBeInTheDocument();
  });
  it('removes a revoked role and previous-account content immediately on rerender', () => {
    mock.state = stateFor(['doctor']); const view = show('/workspace/doctor');
    mock.state = { ...stateFor(['patient']), session: sessionFor('b'), revision: 2 };
    view.rerender(<MemoryRouter initialEntries={['/workspace/doctor']}><Workspace /></MemoryRouter>);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument(); expect(screen.queryByText('Synthetic Person')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('not available');
  });
  it.each(['loading', 'error', 'unconfirmed', 'incomplete', 'expired', 'signed-out'] as const)('renders no privileged content for %s', kind => {
    mock.state = stateFor(['super_admin']);
    if (kind === 'loading') mock.state.loading = true;
    if (kind === 'error') mock.state.error = 'Unavailable';
    if (kind === 'unconfirmed') mock.state.session!.user.email_confirmed_at = undefined;
    if (kind === 'incomplete') mock.state.account!.completedAt = null;
    if (kind === 'expired') mock.state.session!.expires_at = 1;
    if (kind === 'signed-out') mock.state.session = null;
    show('/workspace/super_admin'); expect(screen.queryByRole('navigation')).not.toBeInTheDocument(); expect(screen.queryByText('Access governance')).not.toBeInTheDocument();
  });
  it('offers retry on verification failure and never falls back to patient tools', async () => {
    mock.state.error = 'Unavailable'; show(); fireEvent.click(screen.getByRole('button', { name: 'Retry access check' }));
    await waitFor(() => expect(mock.refresh).toHaveBeenCalledOnce()); expect(screen.queryByText('My appointments')).not.toBeInTheDocument();
  });
  it.each(['/workspace/unknown', '/workspace/patient/constructor', '/workspace/patient/doctor.cases', '/workspace/patient/extra/path'])('fails closed for %s', path => {
    show(path); expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('not available');
  });
  it('keeps the functional release boundary closed for every new workspace', () => {
    for (const role of accountRoles) expect(previewForPath(`/workspace/${role}`)).toBeTruthy();
  });
  it('shows an honest preview instead of records or a simulated service action', () => {
    show('/workspace/patient/patient.records');
    expect(screen.getByRole('heading', { level: 1, name: 'My health records' })).toHaveFocus();
    expect(screen.getByText(/no records or service actions/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save|book|approve/i })).not.toBeInTheDocument();
  });
});
