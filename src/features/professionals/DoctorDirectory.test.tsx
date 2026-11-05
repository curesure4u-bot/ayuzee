import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DoctorDirectory } from './DoctorDirectory';
import type { DirectoryPage, DirectorySource, PublicDoctor } from './directoryModel';
import { previewForPath } from '@/lib/previewPolicy';

const doctor: PublicDoctor = { id: '00000000-0000-4000-8000-000000000001', name: 'Dr Example', specialization: 'Ayurveda', category: 'Ayurveda', city: 'Chennai', clinic: null, experience: null, fee: 0, rating: null, reviews: 0, video: true, inClinic: true, languages: ['Tamil'], verified: false };
function Location() {
  const location = useLocation(); const navigate = useNavigate();
  return <><output aria-label="Current URL">{location.search}</output><button onClick={() => navigate(-1)}>Back</button></>;
}
const show = (source: DirectorySource, path = '/doctors') => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter initialEntries={[path]}><DoctorDirectory source={source} /><Location /></MemoryRouter></QueryClientProvider>);
afterEach(cleanup);
describe('doctor discovery workflow', () => {
  it('labels controls, preserves missing facts and removes fabricated operational claims', async () => {
    show({ list: async () => ({ doctors: [doctor], total: 1 }) });
    const card = await screen.findByRole('article', { name: 'Dr Example' });
    expect(within(card).getByText('Not published')).toBeInTheDocument();
    expect(within(card).getByText('₹0.00')).toBeInTheDocument();
    expect(within(card).queryByText('Verified profile')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Doctor’s name')).toHaveAttribute('type', 'search');
    expect(screen.queryByText(/Available Now|Next available at|Views|100% Verified/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Request callback/ })).not.toBeInTheDocument();
    expect(previewForPath('/doctors')).toBeTruthy();
  });
  it('applies server filters, resets pagination and restores browser-back state', async () => {
    const list = vi.fn<DirectorySource['list']>().mockResolvedValue({ doctors: [doctor], total: 13 });
    show({ list }, '/doctors?page=2&city=Chennai'); await screen.findByRole('article');
    fireEvent.change(screen.getByLabelText('Doctor’s name'), { target: { value: 'New name' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Madurai' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search doctors' }));
    await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'New name', city: 'Madurai', page: 1 }), expect.any(AbortSignal)));
    expect(screen.getByLabelText('Current URL')).not.toHaveTextContent('page=2');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByLabelText('City')).toHaveValue('Chennai'));
    expect(screen.getByLabelText('Doctor’s name')).toHaveValue('');
  });
  it('recovers from a failed request without displaying a successful empty directory', async () => {
    const list = vi.fn<DirectorySource['list']>().mockRejectedValueOnce(new Error('synthetic failure')).mockResolvedValueOnce({ doctors: [doctor], total: 1 });
    show({ list }); expect(await screen.findByRole('alert')).toHaveTextContent('couldn’t load');
    expect(screen.queryByText('No profiles match this search')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('article')).toBeInTheDocument();
  });
  it('aborts an obsolete search and ignores its late result', async () => {
    let resolveOld!: (value: DirectoryPage) => void; let oldSignal!: AbortSignal;
    const list: DirectorySource['list'] = (filters, signal) => filters.query === 'old'
      ? new Promise(resolve => { resolveOld = resolve; oldSignal = signal; })
      : Promise.resolve({ doctors: [{ ...doctor, name: 'Dr Current' }], total: 1 });
    show({ list }, '/doctors?q=old'); await waitFor(() => expect(oldSignal).toBeDefined());
    fireEvent.change(screen.getByLabelText('Doctor’s name'), { target: { value: 'current' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search doctors' }));
    expect(await screen.findByRole('article', { name: 'Dr Current' })).toBeInTheDocument();
    expect(oldSignal.aborted).toBe(true);
    resolveOld({ doctors: [{ ...doctor, name: 'Dr Old' }], total: 1 });
    await waitFor(() => expect(screen.queryByRole('article', { name: 'Dr Old' })).not.toBeInTheDocument());
  });
  it('provides distinct empty and stale-page recovery states', async () => {
    const list = vi.fn<DirectorySource['list']>().mockResolvedValue({ doctors: [], total: 0 });
    const view = show({ list }); expect(await screen.findByText('No profiles match this search')).toBeInTheDocument();
    view.unmount(); show({ list }, '/doctors?page=2');
    expect(await screen.findByRole('button', { name: 'Return to first page' })).toBeInTheDocument();
    expect(screen.queryByText(/Showing 13/)).not.toBeInTheDocument();
  });
  it('paginates through the source and focuses the updated result heading', async () => {
    const list = vi.fn<DirectorySource['list']>().mockResolvedValue({ doctors: [doctor], total: 13 });
    show({ list }); await screen.findByRole('article');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal)));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Doctor directory' })).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
