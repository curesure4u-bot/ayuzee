import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DoctorDirectory } from '../../../src/features/professionals/DoctorDirectory';
import { DIRECTORY_PAGE_SIZE } from '../../../src/features/professionals/directoryModel';
import type { DirectorySource, PublicDoctor } from '../../../src/features/professionals/directoryModel';
import '../../../src/index.css';

const names = ['Ananya Example', 'Vikram Sample', 'Meera Example', 'Arjun Sample', 'Kavya Example', 'Ravi Sample', 'Priya Example', 'Dev Sample', 'Nila Example', 'Kiran Sample', 'Tara Example', 'Hari Sample', 'Maya Example', 'Amal Sample', 'Leela Example', 'Sanjay Sample', 'Riya Example', 'Asha Sample'];
const profiles: PublicDoctor[] = names.map((name, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, name: `Dr ${name}`,
  specialization: ['Ayurveda practitioner', 'Yoga and lifestyle care', 'Siddha practitioner'][index % 3],
  category: ['Ayurveda', 'Yoga', 'Siddha'][index % 3], city: ['Chennai', 'Bengaluru', 'Madurai'][index % 3],
  clinic: 'Fictional Care Centre', experience: index % 5 === 0 ? null : index + 3, fee: 300 + (index % 4) * 200,
  rating: index % 5 === 0 ? null : 4 + (index % 5) / 10, reviews: index % 5 === 0 ? 0 : 10 + index,
  video: index % 2 === 0, inClinic: true, languages: index % 3 === 1 ? ['English', 'Kannada'] : ['Tamil', 'English'], verified: index % 4 !== 0,
}));
const source: DirectorySource = {
  async list(filters, signal) {
    signal.throwIfAborted();
    const rows = profiles.filter(doctor => doctor.name.toLowerCase().includes(filters.query.toLowerCase())
      && (doctor.city ?? '').toLowerCase().includes(filters.city.toLowerCase())
      && (filters.category === 'All' || doctor.category === filters.category)
      && (filters.mode !== 'video' || doctor.video) && (filters.mode !== 'in_clinic' || doctor.inClinic)
      && (filters.maxFee === null || (doctor.fee !== null && doctor.fee <= filters.maxFee)));
    rows.sort((a, b) => {
      const key = filters.sort === 'experience' ? 'experience' : filters.sort.startsWith('fee') ? 'fee' : 'rating';
      const x = a[key], y = b[key];
      if (x === null) return y === null ? a.id.localeCompare(b.id) : 1;
      if (y === null) return -1;
      return (filters.sort === 'fee_low' ? x - y : y - x) || a.id.localeCompare(b.id);
    });
    const first = (filters.page - 1) * DIRECTORY_PAGE_SIZE;
    return { doctors: rows.slice(first, first + DIRECTORY_PAGE_SIZE), total: rows.length };
  },
};
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><BrowserRouter>
  <header className="border-b border-border"><nav aria-label="Review navigation" className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"><Link to="/doctors" className="font-display text-3xl font-semibold text-primary">Ayuzee<span className="ml-3 font-sans text-sm font-normal text-muted-foreground">Directory design review</span></Link><a href="#main-content" className="rounded-xl border border-border px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Skip to content</a></nav></header>
  <Routes><Route path="/doctors" element={<DoctorDirectory source={source} review />} /><Route path="*" element={<main id="main-content" className="container py-16"><h1 className="text-3xl">This area is outside the directory review</h1><p className="mt-4 text-lg">No appointment or callback has been created.</p><Link className="mt-6 inline-block text-lg text-primary underline" to="/doctors">Return to the directory</Link></main>} /></Routes>
</BrowserRouter></QueryClientProvider>);
