import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, IndianRupee, Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Job = {
  id: string;
  organization_name: string;
  job_title: string;
  job_type: string | null;
  specialization: string | null;
  location_city: string | null;
  location_state: string | null;
  salary_min: number | null;
  salary_max: number | null;
  experience_years_min: number | null;
};

const StudentJobs = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobType, setJobType] = useState("all");
  const [specialization, setSpecialization] = useState("all");
  const [state, setState] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ applicant_name: "", applicant_email: "", applicant_phone: "", cover_note: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    setEmail(sessionData.session?.user.email ?? "");

    const [jobRes, profileRes, appRes] = await Promise.all([
      supabase.from("job_listings").select("*").eq("is_active", true).eq("is_approved", true).order("created_at", { ascending: false }),
      uid ? (supabase as any).from("student_profiles").select("full_name, phone").eq("user_id", uid).maybeSingle() : Promise.resolve({ data: null }),
      uid ? (supabase as any).from("job_applications").select("*, job_listings(*)").eq("user_id", uid).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ]);

    setJobs((jobRes.data ?? []) as Job[]);
    setApplications(appRes.data ?? []);
    setForm((current) => ({ ...current, applicant_name: profileRes.data?.full_name ?? "", applicant_phone: profileRes.data?.phone ?? "", applicant_email: sessionData.session?.user.email ?? "" }));
    setLoading(false);
  };

  const jobTypes = useMemo(() => ["all", ...Array.from(new Set(jobs.map((job) => job.job_type).filter(Boolean)))], [jobs]);
  const specializations = useMemo(() => ["all", ...Array.from(new Set(jobs.map((job) => job.specialization).filter(Boolean)))], [jobs]);
  const states = useMemo(() => ["all", ...Array.from(new Set(jobs.map((job) => job.location_state).filter(Boolean)))], [jobs]);
  const appliedJobIds = useMemo(() => new Set(applications.map((app) => app.job_id || app.job_listing_id)), [applications]);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const matchesType = jobType === "all" || job.job_type === jobType;
    const matchesSpec = specialization === "all" || job.specialization === specialization;
    const matchesState = state === "all" || job.location_state === state;
    const haystack = [job.organization_name, job.job_title, job.specialization, job.location_city, job.location_state].filter(Boolean).join(" ").toLowerCase();
    return matchesType && matchesSpec && matchesState && (!keyword.trim() || haystack.includes(keyword.toLowerCase()));
  }), [jobs, jobType, specialization, state, keyword]);

  const openApply = (job: Job) => {
    setSelectedJob(job);
    setForm((current) => ({ ...current, applicant_email: current.applicant_email || email }));
  };

  const submitApplication = async () => {
    if (!userId || !selectedJob) return;
    const { error } = await (supabase as any).from("job_applications").insert({
      job_id: selectedJob.id,
      user_id: userId,
      applicant_name: form.applicant_name,
      applicant_email: form.applicant_email,
      applicant_phone: form.applicant_phone,
      cover_note: form.cover_note || null,
      status: "applied",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Application submitted");
    setSelectedJob(null);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Student Job Board</h1><p className="mt-2 text-muted-foreground">Find internships, hospital roles, research openings, and clinic jobs.</p></div>
      <Tabs defaultValue="jobs" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2"><TabsTrigger value="jobs">Open Jobs</TabsTrigger><TabsTrigger value="applications">My Applications</TabsTrigger></TabsList>
        <TabsContent value="jobs" className="space-y-5">
          <Card><CardContent className="grid gap-3 p-4 lg:grid-cols-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search jobs" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div><Select value={jobType} onValueChange={setJobType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{jobTypes.map((item) => <SelectItem key={String(item)} value={String(item)}>{item === "all" ? "All job types" : item}</SelectItem>)}</SelectContent></Select><Select value={specialization} onValueChange={setSpecialization}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{specializations.map((item) => <SelectItem key={String(item)} value={String(item)}>{item === "all" ? "All specializations" : item}</SelectItem>)}</SelectContent></Select><Select value={state} onValueChange={setState}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{states.map((item) => <SelectItem key={String(item)} value={String(item)}>{item === "all" ? "All states" : item}</SelectItem>)}</SelectContent></Select></CardContent></Card>
          {filteredJobs.length === 0 ? <Empty text="No approved jobs match these filters." /> : <div className="grid gap-5 lg:grid-cols-2">{filteredJobs.map((job) => <JobCard key={job.id} job={job} applied={appliedJobIds.has(job.id)} onApply={() => openApply(job)} />)}</div>}
        </TabsContent>
        <TabsContent value="applications">{applications.length === 0 ? <Empty text="Applications you submit will appear here." /> : <div className="grid gap-4">{applications.map((app) => <ApplicationCard key={app.id} app={app} />)}</div>}</TabsContent>
      </Tabs>

      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for {selectedJob?.job_title}</DialogTitle><DialogDescription>{selectedJob?.organization_name}</DialogDescription></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.applicant_phone} onChange={(e) => setForm({ ...form, applicant_phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Cover note</Label><Textarea value={form.cover_note} onChange={(e) => setForm({ ...form, cover_note: e.target.value })} placeholder="Optional note for the recruiter" /></div>
          </div>
          <DialogFooter><Button onClick={submitApplication}>Submit Application</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const JobCard = ({ job, applied, onApply }: { job: Job; applied: boolean; onApply: () => void }) => <Card><CardContent className="p-5"><div className="flex flex-wrap gap-2"><Badge>{job.job_type || "Full-time"}</Badge>{job.specialization && <Badge variant="outline">{job.specialization}</Badge>}</div><h3 className="mt-3 font-display text-xl">{job.job_title}</h3><p className="mt-1 font-medium">{job.organization_name}</p><div className="mt-4 grid gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{[job.location_city, job.location_state].filter(Boolean).join(", ") || "India"}</span><span className="flex items-center gap-2"><IndianRupee className="h-4 w-4" />{job.salary_min || job.salary_max ? `${job.salary_min || 0} - ${job.salary_max || "Open"}` : "Salary not disclosed"}</span><span>{job.experience_years_min || 0}+ years experience</span></div><Button className="mt-5" disabled={applied} onClick={onApply}>{applied ? "Applied" : "Apply Now"}</Button></CardContent></Card>;
const ApplicationCard = ({ app }: { app: any }) => <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">{app.job_listings?.job_title || "Job application"}</h3><p className="text-sm text-muted-foreground">{app.job_listings?.organization_name || "Ayuzee employer"} · {new Date(app.created_at).toLocaleDateString("en-IN")}</p></div><Badge variant={app.status === "rejected" ? "destructive" : app.status === "shortlisted" ? "default" : "outline"}>{app.status}</Badge></CardContent></Card>;
const Empty = ({ text }: { text: string }) => <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground"><BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-primary/50" />{text}</div>;
const Loading = () => <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

export default StudentJobs;
