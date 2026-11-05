import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, Stethoscope, Video } from 'lucide-react';
import { categories, directoryParams, readDirectoryFilters, DIRECTORY_PAGE_SIZE, DIRECTORY_MAX_PAGE } from './directoryModel';
import type { DirectorySource, PublicDoctor } from './directoryModel';

const field = 'mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const action = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
function DoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const initials = doctor.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-label={doctor.name}>
    <div className="flex items-start gap-4">
      <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">{initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="break-words text-xl font-semibold">{doctor.name}</h2>
          {doctor.verified && <span className="inline-flex items-center gap-1 text-sm font-medium text-primary"><BadgeCheck aria-hidden="true" className="h-4 w-4" />Verified profile</span>}
        </div>
        <p className="mt-1 text-base text-muted-foreground">{doctor.specialization || doctor.category || 'Specialization not published'}</p>
        {(doctor.city || doctor.clinic) && <p className="mt-2 flex items-start gap-1.5 text-base"><MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />{[doctor.clinic, doctor.city].filter(Boolean).join(', ')}</p>}
      </div>
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-base">
      <div><dt className="text-muted-foreground">Experience</dt><dd className="mt-1 font-semibold">{doctor.experience === null ? 'Not published' : `${doctor.experience} years`}</dd></div>
      <div><dt className="text-muted-foreground">Consultation fee</dt><dd className="mt-1 font-semibold">{doctor.fee === null ? 'Not published' : money.format(doctor.fee)}</dd></div>
    </dl>
    {doctor.languages.length > 0 && <p className="mt-4 text-base text-muted-foreground">Speaks {doctor.languages.join(', ')}</p>}
    {doctor.reviews !== null && doctor.reviews > 0 && doctor.rating !== null && <p className="mt-3 text-base">{doctor.rating.toFixed(1)} out of 5 · {doctor.reviews} {doctor.reviews === 1 ? 'review' : 'reviews'}</p>}
    <div className="mt-4 flex flex-wrap gap-2 text-sm">
      {doctor.video && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-2 text-primary"><Video aria-hidden="true" className="h-4 w-4" />Video consultations</span>}
      {doctor.inClinic && <span className="rounded-full bg-muted px-3 py-2">In-clinic consultations</span>}
    </div>
    <Link to={`/doctors/${encodeURIComponent(doctor.id)}`} className={`${action} mt-5 border border-border`}>View profile<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
  </article>;
}

export function DoctorDirectory({ source, review = false }: { source: DirectorySource; review?: boolean }) {
  const [params, setParams] = useSearchParams();
  const filters = readDirectoryFilters(params);
  const serialized = params.toString();
  const [draft, setDraft] = useState(filters);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasSubmitted = useRef(false);
  useEffect(() => { setDraft(readDirectoryFilters(new URLSearchParams(serialized))); }, [serialized]);
  const result = useQuery({
    queryKey: ['public-doctor-directory', filters],
    queryFn: ({ signal }) => source.list(filters, signal),
    staleTime: 60_000, retry: false,
  });
  useEffect(() => {
    if (hasSubmitted.current && !result.isFetching) heading.current?.focus();
  }, [result.isFetching, serialized]);
  const apply = (next: typeof filters) => { hasSubmitted.current = true; setParams(directoryParams(next)); };
  const total = result.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const outOfRange = !result.isPending && !result.isError && filters.page > lastPage;
  const first = (filters.page - 1) * DIRECTORY_PAGE_SIZE + 1;
  const showResults = !result.isFetching && !result.isError && !outOfRange;

  return <main id="main-content" className="min-h-screen bg-background pb-16">
    {review && <aside className="border-b border-amber-300 bg-amber-50 px-5 py-3 text-center text-base text-amber-950">Design review · fictional profiles only · no live accounts, appointments or provider calls</aside>}
    <section className="border-b border-border bg-primary/5">
      <div className="container py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Find your care</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">Find an AYUSH doctor<br className="hidden sm:block" /> who fits your needs.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Explore professional profiles by name, location and type of care. Compare the information that matters to you.</p>
        <p className="mt-3 text-base text-muted-foreground">Online booking is being prepared. Appointment availability is not shown in this directory.</p>
      </div>
    </section>
    <div className="container mt-8 grid items-start gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-primary" />Refine your search</h2>
        <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); apply({ ...draft, page: 1 }); }} aria-label="Search doctors">
          <label className="block text-base font-medium">Doctor’s name<input className={field} type="search" name="q" maxLength={80} value={draft.query} onChange={event => setDraft({ ...draft, query: event.target.value })} autoComplete="off" placeholder="Search by name" /></label>
          <label className="block text-base font-medium">City<input className={field} name="city" maxLength={80} value={draft.city} onChange={event => setDraft({ ...draft, city: event.target.value })} placeholder="Enter a city" autoComplete="address-level2" /></label>
          <label className="block text-base font-medium">Type of care<select className={field} name="category" value={draft.category} onChange={event => setDraft({ ...draft, category: categories.find(value => value === event.target.value) ?? 'All' })}>{categories.map(value => <option key={value} value={value}>{value === 'All' ? 'All systems of care' : value}</option>)}</select></label>
          <label className="block text-base font-medium">Consultation type<select className={field} name="mode" value={draft.mode} onChange={event => setDraft({ ...draft, mode: event.target.value === 'video' ? 'video' : event.target.value === 'in_clinic' ? 'in_clinic' : 'any' })}><option value="any">Any consultation type</option><option value="video">Video consultation</option><option value="in_clinic">In-clinic consultation</option></select></label>
          <label className="block text-base font-medium">Maximum fee<select className={field} value={draft.maxFee === null ? '' : String(draft.maxFee)} onChange={event => setDraft({ ...draft, maxFee: event.target.value === '' ? null : Number(event.target.value) })}><option value="">Any fee</option>{[300, 500, 1000, 2000].map(fee => <option key={fee} value={fee}>Up to {money.format(fee)}</option>)}</select></label>
          <button className={`${action} w-full bg-primary text-primary-foreground`} type="submit"><Search aria-hidden="true" className="h-5 w-5" />Search doctors</button>
          <button className={`${action} w-full border border-border`} type="button" onClick={() => apply(readDirectoryFilters(new URLSearchParams()))}>Clear filters</button>
        </form>
      </aside>
      <section aria-labelledby="directory-results" aria-busy={result.isFetching}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="directory-results" ref={heading} tabIndex={-1} className="rounded text-2xl font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Doctor directory</h2>
            <p role="status" aria-live="polite" className="mt-2 text-base text-muted-foreground">{result.isFetching ? 'Searching the directory…' : result.isError ? 'Directory unavailable' : outOfRange ? 'This results page is no longer available.' : total === 0 ? 'No matching profiles' : `Showing ${first}–${Math.min(first + (result.data?.doctors.length ?? 0) - 1, total)} of ${total} profiles`}</p>
          </div>
          <label className="block text-base font-medium">Sort by<select className={`${field} min-w-48`} value={filters.sort} onChange={event => apply({ ...filters, sort: readDirectoryFilters(new URLSearchParams({ sort: event.target.value })).sort, page: 1 })}><option value="rating">Highest rated</option><option value="experience">Most experienced</option><option value="fee_low">Fee: low to high</option><option value="fee_high">Fee: high to low</option></select></label>
        </div>
        {result.isFetching && <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-lg">Loading matching profiles. Please wait.</div>}
        {!result.isFetching && result.isError && <div role="alert" className="mt-6 rounded-2xl border border-destructive/30 bg-card p-7"><h3 className="text-xl font-semibold">We couldn’t load the directory</h3><p className="mt-3 text-lg text-muted-foreground">Please check your connection and try again.</p><button type="button" className={`${action} mt-5 border border-border`} onClick={() => void result.refetch()}>Try again</button></div>}
        {showResults && total === 0 && <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8"><Stethoscope aria-hidden="true" className="h-9 w-9 text-primary" /><h3 className="mt-4 text-xl font-semibold">No profiles match this search</h3><p className="mt-3 text-lg text-muted-foreground">Try another name or city, or clear your filters to explore the directory.</p><button type="button" className={`${action} mt-5 border border-border`} onClick={() => apply(readDirectoryFilters(new URLSearchParams()))}>Show all doctors</button></div>}
        {outOfRange && <div className="mt-6 rounded-2xl border border-border p-7"><p className="text-lg">The results may have changed since this link was saved.</p><button type="button" className={`${action} mt-5 border border-border`} onClick={() => apply({ ...filters, page: 1 })}>Return to first page</button></div>}
        {showResults && total > 0 && <><div className="mt-6 grid gap-5 xl:grid-cols-2">{result.data?.doctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}</div>
          <nav aria-label="Directory pagination" className="mt-7 flex flex-wrap items-center justify-between gap-3"><button type="button" disabled={filters.page <= 1} className={`${action} border border-border`} onClick={() => apply({ ...filters, page: filters.page - 1 })}><ChevronLeft aria-hidden="true" className="h-4 w-4" />Previous</button><span className="text-base">Page {filters.page} of {lastPage}</span><button type="button" disabled={filters.page >= lastPage || filters.page >= DIRECTORY_MAX_PAGE} className={`${action} border border-border`} onClick={() => apply({ ...filters, page: filters.page + 1 })}>Next<ChevronRight aria-hidden="true" className="h-4 w-4" /></button></nav>
          {lastPage > DIRECTORY_MAX_PAGE && <p className="mt-3 text-base text-muted-foreground">Please narrow your search to explore more relevant results.</p>}</>}
        <div className="mt-8 rounded-2xl bg-primary/5 p-6"><h3 className="text-lg font-semibold">Need a little guidance?</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Visit our contact page for published contact information. Callback requests and online booking are not available in this preview.</p><Link to="/contact" className={`${action} mt-3 px-0 text-primary underline underline-offset-4`}>View contact details<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      </section>
    </div>
  </main>;
}
