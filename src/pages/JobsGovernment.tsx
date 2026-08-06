import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, ExternalLink, IndianRupee, Landmark, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GovJob = {
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
  government_body: string | null;
  vacancies: number | null;
  application_deadline: string | null;
  source: string | null;
  source_url: string | null;
  is_verified_employer: boolean | null;
};

const GOVERNMENT_BODIES = [
  "UPSC",
  "State PSC",
  "CGHS",
  "ECHS",
  "AYUSH Ministry",
  "Municipal Corporation",
  "Railways",
  "Defence",
  "State Health Department",
  "Autonomous Bodies",
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const daysUntil = (dateStr: string) => {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "Expired";
  if (days === 0) return "Last day!";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

const JobsGovernment = () => {
  usePageSEO({ title: "Government AYUSH Jobs — UPSC, PSC, CGHS | Ayuzee" });
  const [jobs, setJobs] = useState<GovJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("all");
  const [body, setBody] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    (supabase as any)
      .from("job_listings")
      .select("*")
      .eq("is_active", true)
      .eq("is_approved", true)
      .eq("is_government", true)
      .or(`expires_at.is.null,expires_at.gt.${today}`)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: GovJob[] | null }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, []);

  const states = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location_state).filter(Boolean) as string[])).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.trim().toLowerCase();
      if (state !== "all" && job.location_state !== state) return false;
      if (body !== "all" && job.government_body !== body) return false;
      if (!q) return true;
      return [job.job_title, job.organization_name, job.government_body, job.department, job.location_state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [jobs, state, body, search]);

  const applyHref = (job: GovJob) =>
    job.apply_url || job.source_url || (job.apply_email ? `mailto:${job.apply_email}` : "#");

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-r from-purple-50 to-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <Landmark className="h-3 w-3" /> Government Sector
                </Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">Government AYUSH Jobs</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  UPSC, State PSC, CGHS, ECHS, AYUSH Ministry and other government positions for AYUSH professionals.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs">All Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/alerts">Set Govt Alert</Link></Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="container py-8">
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-4 md:grid-cols-3">
              <div>
                <Label className="text-xs">Government body</Label>
                <Select value={body} onValueChange={setBody}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All bodies</SelectItem>
                    {GOVERNMENT_BODIES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Role, body, department" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading government jobs...</div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Landmark className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No government AYUSH jobs found</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon or set up an alert for government positions.</p>
              <Button asChild variant="hero" className="mt-4"><Link to="/jobs/alerts">Create Govt Job Alert</Link></Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">{filtered.length} government position{filtered.length > 1 ? "s" : ""} found</p>
              {filtered.map((job) => (
                <Card key={job.id} className="transition-smooth hover:shadow-lg border-l-4 border-l-purple-400">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 gap-1">
                            <Landmark className="h-3 w-3" />{job.government_body || "Government"}
                          </Badge>
                          {job.is_verified_employer && (
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 gap-1">
                              <ShieldCheck className="h-3 w-3" />Verified
                            </Badge>
                          )}
                          {job.source && job.source !== "direct" && (
                            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600 gap-1">
                              <ExternalLink className="h-3 w-3" />{job.source.replace("_", " ")}
                            </Badge>
                          )}
                          {job.application_deadline && (
                            <Badge
                              variant={daysUntil(job.application_deadline) === "Expired" ? "destructive" : "secondary"}
                              className="gap-1"
                            >
                              <CalendarDays className="h-3 w-3" />{daysUntil(job.application_deadline)}
                            </Badge>
                          )}
                        </div>
                        <h2 className="font-display text-2xl font-semibold">{job.job_title}</h2>
                        <p className="mt-1 font-medium text-foreground/80">{job.organization_name}</p>
                        {job.department && <p className="mt-1 text-sm text-primary/80">{job.department}</p>}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {[job.location_city, job.location_state].filter(Boolean).join(", ") || "All India"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />{job.experience_years_min ?? 0}+ years
                          </span>
                          {(job.salary_min || job.salary_max) && (
                            <span className="inline-flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {job.salary_min ? formatINR(job.salary_min) : "Open"} - {job.salary_max ? formatINR(job.salary_max) : "Open"}
                            </span>
                          )}
                          {job.vacancies && job.vacancies > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" />{job.vacancies} vacancies
                            </span>
                          )}
                        </div>
                        {job.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>}
                      </div>
                      <Button asChild variant="hero" className="shrink-0">
                        <a href={applyHref(job)} target="_blank" rel="noreferrer">
                          Apply Now
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* External sources info */}
          <Card className="mt-8 border-purple-200 bg-purple-50/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-purple-900 mb-2">Sources We Monitor</h3>
              <div className="grid gap-2 text-sm text-purple-800 sm:grid-cols-2 lg:grid-cols-3">
                <span>🏛️ UPSC Official Notifications</span>
                <span>📋 State PSC AYUSH Vacancies</span>
                <span>🏥 CGHS / ECHS Panel Positions</span>
                <span>🌿 AYUSH Ministry Recruitments</span>
                <span>🏢 NCS (National Career Service)</span>
                <span>🏘️ Municipal / Panchayat Posts</span>
              </div>
              <p className="mt-3 text-xs text-purple-700">
                Jobs are aggregated from official government portals. Some positions may redirect to external application forms.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default JobsGovernment;
