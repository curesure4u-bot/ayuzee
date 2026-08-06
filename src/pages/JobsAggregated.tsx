import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Briefcase, ExternalLink, Globe, IndianRupee, Landmark, MapPin, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AggregatedJob = {
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
  apply_url: string | null;
  created_at: string;
  source: string | null;
  source_url: string | null;
  is_government: boolean | null;
  government_body: string | null;
  is_verified_employer: boolean | null;
  is_direct_employer: boolean | null;
};

const SOURCE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  ncs: { label: "NCS (Govt Portal)", icon: "🏛️", color: "border-blue-300 bg-blue-50 text-blue-700" },
  ayush_ministry: { label: "AYUSH Ministry", icon: "🌿", color: "border-green-300 bg-green-50 text-green-700" },
  state_portal: { label: "State Portal", icon: "📋", color: "border-purple-300 bg-purple-50 text-purple-700" },
  linkedin: { label: "LinkedIn", icon: "💼", color: "border-sky-300 bg-sky-50 text-sky-700" },
  practo: { label: "Practo", icon: "🏥", color: "border-teal-300 bg-teal-50 text-teal-700" },
  indiamart: { label: "IndiaMART", icon: "🏪", color: "border-orange-300 bg-orange-50 text-orange-700" },
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const JobsAggregated = () => {
  usePageSEO({ title: "Aggregated AYUSH Jobs — External Portals | Ayuzee" });
  const [jobs, setJobs] = useState<AggregatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    (supabase as any)
      .from("job_listings")
      .select("*")
      .eq("is_active", true)
      .eq("is_approved", true)
      .neq("source", "direct")
      .or(`expires_at.is.null,expires_at.gt.${today}`)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: AggregatedJob[] | null }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.source).filter(Boolean) as string[])).sort(),
    [jobs]
  );

  const states = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location_state).filter(Boolean) as string[])).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.trim().toLowerCase();
      if (sourceFilter !== "all" && job.source !== sourceFilter) return false;
      if (state !== "all" && job.location_state !== state) return false;
      if (!q) return true;
      return [job.job_title, job.organization_name, job.department, job.location_state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [jobs, sourceFilter, state, search]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      if (j.source) counts[j.source] = (counts[j.source] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-r from-slate-50 to-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <Globe className="h-3 w-3" /> Multi-Portal Aggregation
                </Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">Aggregated AYUSH Jobs</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  AYUSH jobs pulled from NCS, AYUSH Ministry, State portals, LinkedIn, and other platforms — all in one place.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs">Direct Jobs</Link></Button>
                <Button asChild variant="outline"><Link to="/jobs/government">Govt Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/alerts">Set Alert</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {/* Source tabs / overview */}
          {sources.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSourceFilter("all")}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-smooth ${
                  sourceFilter === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                All Sources ({jobs.length})
              </button>
              {sources.map((src) => {
                const info = SOURCE_LABELS[src] || { label: src, icon: "📄", color: "border-slate-300 bg-slate-50 text-slate-700" };
                return (
                  <button
                    key={src}
                    onClick={() => setSourceFilter(src)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-smooth ${
                      sourceFilter === src
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {info.icon} {info.label} ({sourceCounts[src] || 0})
                  </button>
                );
              })}
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-4 md:grid-cols-2">
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
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Role, employer, department" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading aggregated jobs...</div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No aggregated jobs found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                External jobs are synced periodically. Check back soon or browse direct postings.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button asChild variant="outline"><Link to="/jobs">Browse Direct Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/alerts">Create Alert</Link></Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length} job{filtered.length > 1 ? "s" : ""} from external portals
              </p>
              {filtered.map((job) => {
                const sourceInfo = SOURCE_LABELS[job.source || ""] || { label: job.source, icon: "📄", color: "border-slate-300 bg-slate-50 text-slate-600" };
                return (
                  <Card key={job.id} className="transition-smooth hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`gap-1 ${sourceInfo.color}`}>
                              <ExternalLink className="h-3 w-3" />{sourceInfo.icon} {sourceInfo.label}
                            </Badge>
                            {job.is_government && (
                              <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 gap-1">
                                <Landmark className="h-3 w-3" />{job.government_body || "Govt"}
                              </Badge>
                            )}
                            {job.is_verified_employer && (
                              <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 gap-1">
                                <ShieldCheck className="h-3 w-3" />Verified
                              </Badge>
                            )}
                            {job.job_type && (
                              <Badge variant="secondary">{job.job_type.replace("_", "-")}</Badge>
                            )}
                          </div>
                          <h2 className="font-display text-xl font-semibold">{job.job_title}</h2>
                          <p className="mt-1 font-medium text-foreground/80">{job.organization_name}</p>
                          {job.department && <p className="mt-1 text-sm text-primary/80">{job.department}</p>}
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {[job.location_city, job.location_state].filter(Boolean).join(", ") || "India"}
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
                          </div>
                          {job.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>}
                        </div>
                        <Button asChild variant="hero" className="shrink-0 gap-2">
                          <a href={job.apply_url || job.source_url || "#"} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" /> View on Source
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info about aggregation */}
          <Card className="mt-8 border-slate-200 bg-slate-50/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">About Aggregated Jobs</h3>
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <p className="font-medium mb-1">What are aggregated jobs?</p>
                  <p className="text-xs text-slate-600">
                    These are AYUSH positions collected from external job portals and government websites.
                    They redirect to the original posting for application.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Sources we pull from</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>🏛️ NCS (National Career Service) — ncs.gov.in</li>
                    <li>🌿 AYUSH Ministry — ayush.gov.in</li>
                    <li>📋 State Health Departments</li>
                    <li>💼 LinkedIn Jobs (AYUSH tagged)</li>
                    <li>🏥 Practo, IndiaMART listings</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Jobs are synced daily. For the most up-to-date information, visit the source directly.
                Want your portal listed? <a href="mailto:contact@ayuzee.com" className="font-semibold underline">Contact us</a>.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default JobsAggregated;
