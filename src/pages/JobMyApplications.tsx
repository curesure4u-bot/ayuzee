import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, CalendarDays, CheckCircle2, Clock, Eye, FileText, Loader2, MapPin, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Application = {
  id: string;
  status: string;
  created_at: string;
  viewed_at: string | null;
  shortlisted_at: string | null;
  cover_note: string | null;
  job_listings: {
    id: string;
    job_title: string;
    organization_name: string;
    location_city: string | null;
    location_state: string | null;
    job_type: string | null;
    salary_min: number | null;
    salary_max: number | null;
    department: string | null;
  } | null;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  applied: { label: "Applied", icon: FileText, color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  viewed: { label: "Viewed by Employer", icon: Eye, color: "text-slate-700", bgColor: "bg-slate-50 border-slate-200" },
  shortlisted: { label: "Shortlisted", icon: CheckCircle2, color: "text-green-700", bgColor: "bg-green-50 border-green-200" },
  interview: { label: "Interview Scheduled", icon: Clock, color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  hired: { label: "Hired!", icon: CheckCircle2, color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  rejected: { label: "Not Selected", icon: XCircle, color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  withdrawn: { label: "Withdrawn", icon: XCircle, color: "text-gray-500", bgColor: "bg-gray-50 border-gray-200" },
};

const JobMyApplications = () => {
  usePageSEO({ title: "My Applications — Ayuzee Jobs" });
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth", { replace: true }); return; }
    const uid = session.session.user.id;

    const { data, error } = await (supabase as any)
      .from("job_applications")
      .select("id, status, created_at, viewed_at, shortlisted_at, cover_note, job_listings(id, job_title, organization_name, location_city, location_state, job_type, salary_min, salary_max, department)")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setApplications(data ?? []);
    setLoading(false);
  };

  const activeApps = applications.filter((a) => !["rejected", "withdrawn", "hired"].includes(a.status));
  const closedApps = applications.filter((a) => ["rejected", "withdrawn", "hired"].includes(a.status));

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">Job Seeker</Badge>
                <h1 className="font-display text-3xl font-semibold">My Applications</h1>
                <p className="mt-1 text-muted-foreground">Track the status of jobs you've applied to.</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs/profile">My Profile</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs">Find More Jobs</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 font-display text-xl font-semibold">No applications yet</h2>
              <p className="mt-2 text-muted-foreground">Start applying to AYUSH jobs and track your progress here.</p>
              <Button asChild variant="hero" className="mt-6"><Link to="/jobs">Browse Jobs</Link></Button>
            </Card>
          ) : (
            <>
              {/* Summary stats */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-xs text-muted-foreground">Total Applied</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{applications.filter((a) => a.status === "viewed").length}</p>
                    <p className="text-xs text-muted-foreground">Viewed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{applications.filter((a) => a.status === "shortlisted" || a.status === "interview").length}</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{applications.filter((a) => a.status === "hired").length}</p>
                    <p className="text-xs text-muted-foreground">Hired</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="active">Active ({activeApps.length})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({closedApps.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active"><ApplicationList apps={activeApps} /></TabsContent>
                <TabsContent value="closed"><ApplicationList apps={closedApps} /></TabsContent>
                <TabsContent value="all"><ApplicationList apps={applications} /></TabsContent>
              </Tabs>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const ApplicationList = ({ apps }: { apps: Application[] }) => {
  if (apps.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No applications in this category.</p>;
  }

  return (
    <div className="grid gap-4">
      {apps.map((app) => {
        const job = app.job_listings;
        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
        const StatusIcon = cfg.icon;

        return (
          <Card key={app.id} className="transition-smooth hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link to={`/jobs/${job?.id || ""}`} className="font-display text-lg font-semibold hover:text-primary transition">
                      {job?.job_title || "Job Application"}
                    </Link>
                    <Badge variant="outline" className={`gap-1 ${cfg.bgColor} ${cfg.color} text-[10px]`}>
                      <StatusIcon className="h-3 w-3" />{cfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{job?.organization_name || "Employer"}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {job?.location_state && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{[job.location_city, job.location_state].filter(Boolean).join(", ")}</span>}
                    {job?.department && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.department}</span>}
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />Applied {new Date(app.created_at).toLocaleDateString("en-IN")}</span>
                  </div>

                  {/* Timeline */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] text-blue-800">Applied</span>
                    {app.viewed_at && <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">Viewed {new Date(app.viewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                    {app.shortlisted_at && <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-800">Shortlisted {new Date(app.shortlisted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                    {app.status === "interview" && <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] text-purple-800">Interview</span>}
                    {app.status === "hired" && <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 font-bold">Hired!</span>}
                    {app.status === "rejected" && <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-700">Not selected</span>}
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to={`/jobs/${job?.id || ""}`}>View Job</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default JobMyApplications;
