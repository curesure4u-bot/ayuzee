import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Briefcase, CheckCircle2, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminJob = {
  id: string;
  organization_name: string;
  organization_type: string | null;
  job_title: string;
  location_city: string | null;
  location_state: string | null;
  job_type: string | null;
  is_active: boolean | null;
  is_approved: boolean | null;
  created_at: string;
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("job_listings").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setJobs(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Admin Jobs — Ayuzee";
    load();
  }, []);

  const updateJob = async (id: string, patch: Partial<AdminJob>, message: string) => {
    const { error } = await (supabase as any).from("job_listings").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(message);
    load();
  };

  const deleteJob = async (id: string) => {
    const { error } = await (supabase as any).from("job_listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Job deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Jobs</h1>
        <p className="text-sm text-muted-foreground">Review and moderate AYUSH job listings.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Job listings</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading jobs…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell><p className="font-medium">{job.job_title}</p><p className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString("en-IN")}</p></TableCell>
                    <TableCell><p>{job.organization_name}</p><p className="text-xs capitalize text-muted-foreground">{job.organization_type}</p></TableCell>
                    <TableCell>{[job.location_city, job.location_state].filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1"><Badge variant={job.is_approved ? "secondary" : "outline"}>{job.is_approved ? "Approved" : "Pending"}</Badge><Badge variant={job.is_active ? "outline" : "destructive"}>{job.is_active ? "Active" : "Rejected"}</Badge></div></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateJob(job.id, { is_approved: true, is_active: true }, "Job approved")}><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => updateJob(job.id, { is_approved: false, is_active: false }, "Job rejected")}><XCircle className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteJob(job.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No jobs submitted yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobs;
