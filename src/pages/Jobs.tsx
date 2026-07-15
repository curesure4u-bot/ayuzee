import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, IndianRupee, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type JobListing = {
  id: string;
  organization_name: string;
  organization_type: string | null;
  job_title: string;
  specialization: string | null;
  location_city: string | null;
  location_state: string | null;
  job_type: string | null;
  experience_years_min: number | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  apply_email: string | null;
  apply_url: string | null;
  created_at: string;
};

const jobTypeLabels: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contractual: "Contractual",
  visiting: "Visiting",
  internship: "Internship",
};

const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const daysAgo = (iso: string) => {
  usePageSEO({ title: "Ayurveda Jobs Board — Ayuzee" });
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
};

const Jobs = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState("all");
  const [specialization, setSpecialization] = useState("all");
  const [state, setState] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { const today = new Date().toISOString().slice(0, 10);
    (supabase as any)
      .from("job_listings")
      .select("*")
      .eq("is_active", true)
      .eq("is_approved", true)
      .or(`expires_at.is.null,expires_at.gt.${today}`)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: JobListing[] | null }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, []);

  const specializations = useMemo(() => Array.from(new Set(jobs.map((j) => j.specialization).filter(Boolean) as string[])).sort(), [jobs]);
  const states = useMemo(() => Array.from(new Set(jobs.map((j) => j.location_state).filter(Boolean) as string[])).sort(), [jobs]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const q = search.trim().toLowerCase();
    if (jobType !== "all" && job.job_type !== jobType) return false;
    if (specialization !== "all" && job.specialization !== specialization) return false;
    if (state !== "all" && job.location_state !== state) return false;
    if (!q) return true;
    return [job.job_title, job.organization_name, job.specialization, job.location_city, job.location_state]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  }), [jobs, jobType, specialization, state, search]);

  const applyHref = (job: JobListing) => job.apply_url || (job.apply_email ? `mailto:${job.apply_email}?subject=${encodeURIComponent(`Application for ${job.job_title}`)}` : "#");

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        <section className="border-b border-border bg-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3">AYUSH Careers</Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">Ayurveda Jobs Board</h1>
                <p className="mt-3 text-lg text-muted-foreground">Find your next role in AYUSH healthcare</p>
              </div>
              <Button asChild variant="hero"><Link to="/jobs/post">Post a Job</Link></Button>
            </div>
          </div>
        </section>

        <section className="container py-8">
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-4 md:grid-cols-4">
              <div>
                <Label className="text-xs">Job type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="visiting">Visiting</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contractual">Contractual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All</SelectItem>{specializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All</SelectItem>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Search by keyword</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Role, city, employer" />
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? <div className="py-16 text-center text-muted-foreground">Loading jobs…</div> : filtered.length === 0 ? (
            <Card className="p-12 text-center"><Briefcase className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-medium">No matching jobs found</p></Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((job) => (
                <Card id={`job-${job.id}`} key={job.id} className="scroll-mt-40 transition-smooth hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{job.organization_name}</span>
                          {job.organization_type && <Badge variant="outline" className="capitalize">{job.organization_type}</Badge>}
                          {job.job_type && <Badge variant="secondary">{jobTypeLabels[job.job_type] ?? job.job_type}</Badge>}
                        </div>
                        <h2 className="font-display text-2xl font-semibold">{job.job_title}</h2>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{[job.location_city, job.location_state].filter(Boolean).join(", ") || "Location flexible"}</span>
                          <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.experience_years_min ?? 0}+ years</span>
                          {(job.salary_min || job.salary_max) && <span className="inline-flex items-center gap-1"><IndianRupee className="h-4 w-4" />{job.salary_min ? formatINR(job.salary_min) : "Open"} - {job.salary_max ? formatINR(job.salary_max) : "Open"}</span>}
                          <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{daysAgo(job.created_at)}</span>
                        </div>
                        {job.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>}
                      </div>
                      <Button asChild variant="hero" className="shrink-0"><a href={applyHref(job)} target={job.apply_url ? "_blank" : undefined} rel="noreferrer">Apply Now</a></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Jobs;
