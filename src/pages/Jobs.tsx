import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, ExternalLink, IndianRupee, Landmark, MapPin, Search, Share2, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OneClickApply } from "@/components/jobs/OneClickApply";

type JobListing = {
  id: string;
  organization_name: string;
  organization_type: string | null;
  job_title: string;
  specialization: string | null;
  department: string | null;
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
  is_direct_employer: boolean | null;
  agency_name: string | null;
  is_verified_employer: boolean | null;
  is_government: boolean | null;
  government_body: string | null;
  source: string | null;
  vacancies: number | null;
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
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
};

const Jobs = () => {
  usePageSEO({ title: "Ayurveda Jobs Board — Ayuzee" });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobType, setJobType] = useState("all");
  const [department, setDepartment] = useState("all");
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
  const departments = useMemo(() => Array.from(new Set(jobs.map((j) => j.department).filter(Boolean) as string[])).sort(), [jobs]);
  const states = useMemo(() => Array.from(new Set(jobs.map((j) => j.location_state).filter(Boolean) as string[])).sort(), [jobs]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const q = search.trim().toLowerCase();
    if (jobType !== "all" && job.job_type !== jobType) return false;
    if (department !== "all" && job.department !== department) return false;
    if (specialization !== "all" && job.specialization !== specialization) return false;
    if (state !== "all" && job.location_state !== state) return false;
    if (!q) return true;
    return [job.job_title, job.organization_name, job.specialization, job.department, job.location_city, job.location_state]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  }), [jobs, jobType, department, specialization, state, search]);

  const applyHref = (job: JobListing) => job.apply_url || (job.apply_email ? `mailto:${job.apply_email}?subject=${encodeURIComponent(`Application for ${job.job_title}`)}` : "#");

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">India's #1 AYUSH Job Platform</Badge>
              <h1 className="font-display text-4xl font-bold md:text-5xl lg:text-6xl">
                Find Your Dream <span className="text-primary">AYUSH Job</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {jobs.length > 0 ? `${jobs.length}+ active openings` : "Thousands of openings"} for doctors, therapists & paramedical staff across India.
              </p>

              {/* Search bar */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-12 text-base rounded-xl border-2 border-border focus:border-primary"
                    placeholder="Search role, city, or employer..."
                  />
                </div>
                <Button variant="hero" size="lg" className="h-12 px-8 rounded-xl">
                  Search Jobs
                </Button>
              </div>

              {/* Quick links */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Hospital", "Clinic", "Teaching", "Government", "Therapist", "Paramedical"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setJobType(tag.toLowerCase()); window.scrollTo({ top: 600, behavior: "smooth" }); }}
                    className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats counter */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
              <div className="rounded-xl border border-border bg-background p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{jobs.length || "500"}+</p>
                <p className="text-xs text-muted-foreground mt-1">Active Jobs</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{departments.length || "20"}+</p>
                <p className="text-xs text-muted-foreground mt-1">Departments</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{states.length || "28"}+</p>
                <p className="text-xs text-muted-foreground mt-1">States</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground mt-1">Free to Apply</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA row for seekers/employers */}
        <section className="border-b border-border bg-background">
          <div className="container py-6">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link to="/jobs/profile" className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 font-medium text-primary hover:bg-primary/10 transition">
                📋 Create Job Profile
              </Link>
              <Link to="/jobs/ai-match" className="rounded-full border border-border px-4 py-2 font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition">
                🤖 AI Job Match
              </Link>
              <Link to="/jobs/alerts" className="rounded-full border border-border px-4 py-2 font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition">
                🔔 Job Alerts
              </Link>
              <Link to="/jobs/salary-insights" className="rounded-full border border-border px-4 py-2 font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition">
                📊 Salary Insights
              </Link>
              <Link to="/jobs/employer" className="rounded-full border border-border px-4 py-2 font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition">
                🏥 Employer Panel
              </Link>
              <Link to="/jobs/post" className="rounded-full border border-primary bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition">
                + Post a Job
              </Link>
            </div>
          </div>
        </section>

        {/* Filters + Job Listings */}
        <section className="container py-8">
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-4 md:grid-cols-5">
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
                <Label className="text-xs">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
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
                          {job.is_direct_employer === true && <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Direct Hire</Badge>}
                          {job.is_direct_employer === false && <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">Via Agency{job.agency_name ? `: ${job.agency_name}` : ""}</Badge>}
                          {job.is_verified_employer && <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>}
                          {job.is_government && <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 gap-1"><Landmark className="h-3 w-3" />Govt{job.government_body ? ` · ${job.government_body}` : ""}</Badge>}
                          {job.source && job.source !== "direct" && <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600 gap-1"><ExternalLink className="h-3 w-3" />{job.source.replace("_", " ")}</Badge>}
                        </div>
                        <h2 className="font-display text-2xl font-semibold">{job.job_title}</h2>
                        {job.department && <p className="mt-1 text-sm font-medium text-primary/80">{job.department}</p>}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{[job.location_city, job.location_state].filter(Boolean).join(", ") || "Location flexible"}</span>
                          <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.experience_years_min ?? 0}+ years</span>
                          {(job.salary_min || job.salary_max) && <span className="inline-flex items-center gap-1"><IndianRupee className="h-4 w-4" />{job.salary_min ? formatINR(job.salary_min) : "Open"} - {job.salary_max ? formatINR(job.salary_max) : "Open"}</span>}
                          {job.vacancies && job.vacancies > 1 && <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{job.vacancies} vacancies</span>}
                          <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{daysAgo(job.created_at)}</span>
                        </div>
                        {job.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <OneClickApply jobId={job.id} jobTitle={job.job_title} organizationName={job.organization_name} />
                        <Button asChild variant="outline" size="sm">
                          <a href={applyHref(job)} target={job.apply_url ? "_blank" : undefined} rel="noreferrer">External Apply</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/10">
                          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ayuzee.com/jobs#job-${job.id}`)}&title=${encodeURIComponent(job.job_title)}&summary=${encodeURIComponent(`${job.organization_name} is hiring: ${job.job_title}${job.location_state ? ` in ${job.location_state}` : ""}. Apply on Ayuzee.`)}`} target="_blank" rel="noreferrer"><Share2 className="h-3.5 w-3.5" />LinkedIn</a>
                        </Button>
                      </div>
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
