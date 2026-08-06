import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle2, Clock, Download, Eye, FileText, Loader2, UserCheck, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MyJob = {
  id: string;
  job_title: string;
  organization_name: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  applications_count?: number;
};

type Applicant = {
  id: string;
  user_id: string;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  resume_url: string | null;
  cover_note: string | null;
  status: string;
  created_at: string;
  viewed_at: string | null;
  shortlisted_at: string | null;
  seeker_profile_id: string | null;
  // joined
  job_seeker_profiles?: {
    headline: string | null;
    degree: string | null;
    department: string | null;
    experience_years: number | null;
    skills: string[] | null;
    current_organization: string | null;
  } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800 border-blue-200" },
  viewed: { label: "Viewed", color: "bg-slate-100 text-slate-700 border-slate-200" },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-800 border-green-200" },
  interview: { label: "Interview", color: "bg-purple-100 text-purple-800 border-purple-200" },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const JobEmployerATS = () => {
  usePageSEO({ title: "My Job Postings — Employer ATS | Ayuzee" });
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myJobs, setMyJobs] = useState<MyJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadMyJobs();
  }, []);

  const loadMyJobs = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth", { replace: true }); return; }
    const uid = session.session.user.id;
    setUserId(uid);

    const { data, error } = await (supabase as any)
      .from("job_listings")
      .select("id, job_title, organization_name, is_active, is_approved, created_at")
      .eq("posted_by", uid)
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }
    setMyJobs(data ?? []);

    // Auto-select first job
    if (data && data.length > 0) {
      setSelectedJob(data[0].id);
      loadApplicants(data[0].id);
    }
    setLoading(false);
  };

  const loadApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    const { data, error } = await (supabase as any)
      .from("job_applications")
      .select("*, job_seeker_profiles(headline, degree, department, experience_years, skills, current_organization)")
      .eq("job_listing_id", jobId)
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    setApplicants(data ?? []);
    setLoadingApplicants(false);
  };

  const selectJob = (jobId: string) => {
    setSelectedJob(jobId);
    setStatusFilter("all");
    loadApplicants(jobId);
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const patch: Record<string, any> = { status: newStatus };
    if (newStatus === "viewed") patch.viewed_at = new Date().toISOString();
    if (newStatus === "shortlisted") patch.shortlisted_at = new Date().toISOString();
    if (newStatus === "rejected") patch.rejected_at = new Date().toISOString();

    const { error } = await (supabase as any)
      .from("job_applications")
      .update(patch)
      .eq("id", applicationId);

    if (error) { toast.error(error.message); return; }
    toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    setApplicants((prev) =>
      prev.map((a) => a.id === applicationId ? { ...a, status: newStatus, ...patch } : a)
    );
  };

  const filteredApplicants = useMemo(() => {
    if (statusFilter === "all") return applicants;
    return applicants.filter((a) => a.status === statusFilter);
  }, [applicants, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applicants.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [applicants]);

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">Employer Panel</Badge>
                <h1 className="font-display text-3xl font-semibold">Applicant Tracking</h1>
                <p className="mt-1 text-muted-foreground">Manage applications for your job postings</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs/candidates">Search Candidates</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/post">Post New Job</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {myJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 font-display text-xl font-semibold">No jobs posted yet</h2>
              <p className="mt-2 text-muted-foreground">Post your first job to start receiving applications.</p>
              <Button asChild variant="hero" className="mt-6"><Link to="/jobs/post">Post a Job</Link></Button>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Job list sidebar */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">My Job Postings ({myJobs.length})</p>
                {myJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => selectJob(job.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedJob === job.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{job.job_title}</p>
                    <p className="text-xs text-muted-foreground truncate">{job.organization_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={job.is_approved ? "secondary" : "outline"} className="text-[10px]">
                        {job.is_approved ? "Live" : "Pending"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Applicants panel */}
              <div>
                {selectedJob && (
                  <>
                    {/* Status filter pills */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          statusFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                        }`}
                      >
                        All ({applicants.length})
                      </button>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const count = statusCounts[key] || 0;
                        if (count === 0) return null;
                        return (
                          <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              statusFilter === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                            }`}
                          >
                            {cfg.label} ({count})
                          </button>
                        );
                      })}
                    </div>

                    {loadingApplicants ? (
                      <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
                    ) : filteredApplicants.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-3 font-medium">No applicants {statusFilter !== "all" ? `with status "${STATUS_CONFIG[statusFilter]?.label}"` : "yet"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Applications will appear here as candidates apply.</p>
                      </Card>
                    ) : (
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Profile</TableHead>
                              <TableHead>Applied</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredApplicants.map((app) => {
                              const profile = app.job_seeker_profiles;
                              return (
                                <TableRow key={app.id}>
                                  <TableCell>
                                    <p className="font-medium">{app.applicant_name || "—"}</p>
                                    <p className="text-xs text-muted-foreground">{app.applicant_email}</p>
                                    {app.applicant_phone && <p className="text-xs text-muted-foreground">{app.applicant_phone}</p>}
                                  </TableCell>
                                  <TableCell>
                                    {profile ? (
                                      <div className="space-y-0.5">
                                        {profile.degree && <p className="text-xs font-medium">{profile.degree}</p>}
                                        {profile.department && <p className="text-xs text-muted-foreground">{profile.department}</p>}
                                        {profile.experience_years !== null && <p className="text-xs text-muted-foreground">{profile.experience_years} yrs exp</p>}
                                        {profile.skills && profile.skills.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {profile.skills.slice(0, 3).map((s) => (
                                              <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{s}</span>
                                            ))}
                                            {profile.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{profile.skills.length - 3}</span>}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No profile</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <p className="text-xs">{new Date(app.created_at).toLocaleDateString("en-IN")}</p>
                                    {app.cover_note && (
                                      <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2 max-w-32">{app.cover_note}</p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[app.status]?.color || ""}`}>
                                      {STATUS_CONFIG[app.status]?.label || app.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      {app.resume_url && (
                                        <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="View Resume">
                                          <a href={app.resume_url} target="_blank" rel="noreferrer"><Download className="h-3.5 w-3.5" /></a>
                                        </Button>
                                      )}
                                      {app.status === "applied" && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" title="Mark Viewed" onClick={() => updateStatus(app.id, "viewed")}>
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {(app.status === "applied" || app.status === "viewed") && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Shortlist" onClick={() => updateStatus(app.id, "shortlisted")}>
                                          <UserCheck className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {app.status === "shortlisted" && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-600" title="Schedule Interview" onClick={() => updateStatus(app.id, "interview")}>
                                          <Clock className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {app.status === "interview" && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Mark Hired" onClick={() => updateStatus(app.id, "hired")}>
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {app.status !== "rejected" && app.status !== "hired" && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Reject" onClick={() => updateStatus(app.id, "rejected")}>
                                          <XCircle className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobEmployerATS;
