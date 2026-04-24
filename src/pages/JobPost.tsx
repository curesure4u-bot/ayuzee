import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialForm = {
  organization_name: "",
  organization_type: "hospital",
  job_title: "",
  specialization: "",
  location_city: "",
  location_state: "",
  job_type: "full_time",
  experience_years_min: "0",
  salary_min: "",
  salary_max: "",
  description: "",
  requirements: "",
  apply_email: "",
  apply_url: "",
  expires_at: "",
};

const JobPost = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    document.title = "Post a Job — Ayuzee";
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserId(data.session.user.id);
      setChecking(false);
    });
  }, [navigate]);

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setSaving(true);
    const payload = {
      ...form,
      posted_by: userId,
      specialization: form.specialization || null,
      location_city: form.location_city || null,
      location_state: form.location_state || null,
      experience_years_min: Number(form.experience_years_min || 0),
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      description: form.description || null,
      requirements: form.requirements || null,
      apply_email: form.apply_email || null,
      apply_url: form.apply_url || null,
      expires_at: form.expires_at || null,
      is_active: true,
      is_approved: false,
    };
    const { error } = await (supabase as any).from("job_listings").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job posted successfully");
    navigate("/jobs");
  };

  if (checking) return <div className="container py-20 text-center text-muted-foreground">Checking your account…</div>;

  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-semibold">Post a Job</h1>
        <p className="mt-2 text-muted-foreground">New posts are reviewed by Ayuzee before appearing publicly.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Job listing details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
            <div><Label>Organization name</Label><Input required value={form.organization_name} onChange={(e) => update("organization_name", e.target.value)} /></div>
            <div><Label>Organization type</Label><Select value={form.organization_type} onValueChange={(v) => update("organization_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["hospital","clinic","resort","pharma","college","research"].map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Job title</Label><Input required value={form.job_title} onChange={(e) => update("job_title", e.target.value)} /></div>
            <div><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => update("specialization", e.target.value)} placeholder="Ayurveda, Panchakarma, Kayachikitsa" /></div>
            <div><Label>City</Label><Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} /></div>
            <div><Label>State</Label><Input value={form.location_state} onChange={(e) => update("location_state", e.target.value)} /></div>
            <div><Label>Job type</Label><Select value={form.job_type} onValueChange={(v) => update("job_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full_time">Full-time</SelectItem><SelectItem value="part_time">Part-time</SelectItem><SelectItem value="contractual">Contractual</SelectItem><SelectItem value="visiting">Visiting</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent></Select></div>
            <div><Label>Minimum experience</Label><Input type="number" min="0" value={form.experience_years_min} onChange={(e) => update("experience_years_min", e.target.value)} /></div>
            <div><Label>Salary min</Label><Input type="number" min="0" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} /></div>
            <div><Label>Salary max</Label><Input type="number" min="0" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Requirements</Label><Textarea rows={4} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} /></div>
            <div><Label>Apply email</Label><Input type="email" value={form.apply_email} onChange={(e) => update("apply_email", e.target.value)} /></div>
            <div><Label>Apply URL</Label><Input type="url" value={form.apply_url} onChange={(e) => update("apply_url", e.target.value)} /></div>
            <div><Label>Expires at</Label><Input type="date" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} /></div>
            <div className="flex items-end justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate("/jobs")}>Cancel</Button><Button type="submit" variant="hero" disabled={saving}>{saving ? "Posting…" : "Post Job"}</Button></div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default JobPost;
