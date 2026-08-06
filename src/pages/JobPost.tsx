import { FormEvent, useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Building2, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AIJobDescriptionGenerator } from "@/components/jobs/AIJobDescriptionGenerator";

/* ─── AYUSH Departments (mirrors ayush_departments table) ─── */
const AYUSH_DEPARTMENTS = [
  "Kayachikitsa (General Medicine)",
  "Shalya Tantra (Surgery)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Prasuti & Stree Roga (OBG)",
  "Kaumarbhritya (Pediatrics)",
  "Panchakarma",
  "Dravyaguna (Pharmacology)",
  "Rasashastra & Bhaishajya Kalpana (Pharmaceutics)",
  "Swasthavritta (Preventive Medicine)",
  "Roga Nidana (Pathology)",
  "Rachana Sharira (Anatomy)",
  "Kriya Sharira (Physiology)",
  "Agad Tantra (Forensic Medicine & Toxicology)",
  "Samhita & Siddhanta",
  "Organon of Medicine (Homeopathy)",
  "Repertory (Homeopathy)",
  "Materia Medica (Homeopathy)",
  "Homeopathic Pharmacy",
  "Practice of Medicine (Homeopathy)",
  "Unani Medicine",
  "Siddha Medicine",
  "Naturopathy & Drugless Therapy",
  "Yoga Therapy",
  "Panchakarma Therapist",
  "Yoga Instructor",
  "Naturopathy Therapist",
  "AYUSH Nurse",
  "AYUSH Pharmacy Assistant",
  "Lab Technician (AYUSH)",
  "Paramedical Staff (OPD/IPD)",
  "Panchakarma Technician",
  "Physiotherapy (AYUSH)",
];

const POSTER_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "college", label: "College / University" },
  { value: "pharma", label: "Pharma / Manufacturing" },
  { value: "agency", label: "Recruitment Agency" },
  { value: "doctor", label: "Doctor (Own Clinic)" },
  { value: "therapist", label: "Therapist / Therapy Center" },
  { value: "paramedical", label: "Paramedical Facility" },
  { value: "government", label: "Government Body" },
  { value: "wellness_resort", label: "Wellness Resort / Spa" },
  { value: "research_institute", label: "Research Institute" },
];

const ORGANIZATION_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "resort", label: "Resort / Wellness Center" },
  { value: "pharma", label: "Pharma Company" },
  { value: "college", label: "College / University" },
  { value: "research", label: "Research Institute" },
  { value: "therapy_center", label: "Therapy Center / Panchakarma" },
  { value: "paramedical", label: "Paramedical / Nursing Home" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const initialForm = {
  organization_name: "",
  organization_type: "hospital",
  poster_type: "hospital",
  job_title: "",
  specialization: "",
  department: "",
  location_city: "",
  location_state: "",
  job_type: "full_time",
  experience_years_min: "0",
  salary_min: "",
  salary_max: "",
  vacancies: "1",
  description: "",
  requirements: "",
  apply_email: "",
  apply_url: "",
  expires_at: "",
  is_direct_employer: true,
  agency_name: "",
  is_government: false,
  government_body: "",
};

const JobPost = () => {
  usePageSEO({ title: "Post a Job — Ayuzee" });
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [verificationLevel, setVerificationLevel] = useState(0);
  const [canPost, setCanPost] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Roles allowed to post jobs
  const ALLOWED_POSTER_ROLES = ["admin", "super_admin", "doctor", "venue_owner", "provider", "product_admin"];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      // Check user roles
      const { data: roleRows } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      const roles = (roleRows || []).map((r: { role: string }) => r.role);
      setUserRoles(roles);

      // Check if user has an allowed role OR is a verified employer
      const hasAllowedRole = roles.some((r: string) => ALLOWED_POSTER_ROLES.includes(r));

      // Check if employer is verified
      const { data: verification } = await (supabase as any)
        .from("employer_verifications")
        .select("verification_level, verification_status")
        .eq("user_id", uid)
        .eq("verification_status", "verified")
        .maybeSingle();

      if (verification) {
        setVerificationLevel(verification.verification_level ?? 0);
        setCanPost(true); // Verified employers can always post
      } else {
        setCanPost(hasAllowedRole);
      }

      setChecking(false);
    });
  }, [navigate]);

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setSaving(true);

    const payload = {
      posted_by: userId,
      organization_name: form.organization_name,
      organization_type: form.organization_type,
      poster_type: form.poster_type,
      job_title: form.job_title,
      specialization: form.specialization || null,
      department: form.department || null,
      location_city: form.location_city || null,
      location_state: form.location_state || null,
      job_type: form.job_type,
      experience_years_min: Number(form.experience_years_min || 0),
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      vacancies: form.vacancies ? Number(form.vacancies) : 1,
      description: form.description || null,
      requirements: form.requirements || null,
      apply_email: form.apply_email || null,
      apply_url: form.apply_url || null,
      expires_at: form.expires_at || null,
      is_direct_employer: form.is_direct_employer,
      agency_name: !form.is_direct_employer ? (form.agency_name || null) : null,
      is_government: form.is_government,
      government_body: form.is_government ? (form.government_body || null) : null,
      is_active: true,
      // Auto-approve for Level 4 verified employers
      is_approved: verificationLevel >= 4,
      is_verified_employer: verificationLevel >= 2,
      verification_level: verificationLevel,
      source: "direct",
    };

    const { error } = await (supabase as any).from("job_listings").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      verificationLevel >= 4
        ? "Job posted and auto-approved (Trusted Partner)"
        : "Job posted successfully! It will appear after admin review."
    );
    navigate("/jobs");
  };

  if (checking) return <div className="container py-20 text-center text-muted-foreground">Checking your account...</div>;

  // Block users who don't have permission to post
  if (!canPost) {
    return (
      <main className="container max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Posting Not Allowed</h1>
          <p className="mt-3 text-muted-foreground">
            Only verified hospitals, clinics, doctors, and employers can post job openings on Ayuzee.
          </p>
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
            <p className="font-semibold mb-2">Who can post jobs?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Registered Doctors (verified on Ayuzee)</li>
              <li>Hospital & Clinic owners (Venue Partners)</li>
              <li>Verified Employers (via employer verification)</li>
              <li>Admins</li>
            </ul>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {userRoles.includes("student") || userRoles.includes("patient") ? (
              <>
                <Button asChild variant="hero"><a href="/jobs">Browse Jobs Instead</a></Button>
                <Button asChild variant="outline"><a href="/jobs/profile">Create Job Seeker Profile</a></Button>
              </>
            ) : (
              <>
                <Button asChild variant="hero"><a href="/doctor/auth">Register as Doctor</a></Button>
                <Button asChild variant="outline"><a href="/venue/auth">Register as Venue/Hospital</a></Button>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Already an employer? <a href="/auth" className="text-primary underline">Sign in</a> with your registered account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl py-10">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-semibold">Post a Job</h1>
        <p className="mt-2 text-muted-foreground">
          New posts are reviewed by Ayuzee before appearing publicly.
          {verificationLevel >= 4 && " As a Trusted Partner, your jobs are auto-approved."}
        </p>
      </div>

      {/* Verification status banner */}
      {verificationLevel === 0 && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your employer profile is not verified. Jobs from unverified accounts require admin approval and may take 24-48 hours to appear.{" "}
            <a href="/jobs/verify" className="font-semibold underline">Verify your organization</a> for faster approvals.
          </AlertDescription>
        </Alert>
      )}
      {verificationLevel >= 2 && verificationLevel < 4 && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 flex items-center gap-2">
            <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">
              Verified Level {verificationLevel}
            </Badge>
            Your organization is verified. Jobs still need admin approval but are prioritized.
          </AlertDescription>
        </Alert>
      )}
      {verificationLevel >= 4 && (
        <Alert className="mb-6 border-primary/30 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Trusted Partner
            </Badge>
            Your jobs are auto-approved and go live immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Poster Identity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Who are you?
          </CardTitle>
          <CardDescription>This helps us categorize your listing and verify legitimacy.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>You are posting as</Label>
              <Select value={form.poster_type} onValueChange={(v) => update("poster_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSTER_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Are you hiring directly?</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {form.is_direct_employer ? "You are the employer" : "You are a recruitment agency or consultant"}
                </p>
              </div>
              <Switch
                checked={form.is_direct_employer}
                onCheckedChange={(v) => update("is_direct_employer", v)}
              />
            </div>
            {!form.is_direct_employer && (
              <div className="md:col-span-2">
                <Label>Agency / Consultant name</Label>
                <Input
                  value={form.agency_name}
                  onChange={(e) => update("agency_name", e.target.value)}
                  placeholder="e.g., AYUSH Placements Pvt. Ltd."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Job listing details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Organization name</Label>
              <Input required value={form.organization_name} onChange={(e) => update("organization_name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Organization type</Label>
              <Select value={form.organization_type} onValueChange={(v) => update("organization_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((ot) => (
                    <SelectItem key={ot.value} value={ot.value}>{ot.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job title</Label>
              <Input required value={form.job_title} onChange={(e) => update("job_title", e.target.value)} className="mt-1" placeholder="e.g., Senior Panchakarma Consultant" />
            </div>
            <div>
              <Label>Department / Specialization</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None / General</SelectItem>
                  {AYUSH_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional specialization tags</Label>
              <Input
                value={form.specialization}
                onChange={(e) => update("specialization", e.target.value)}
                placeholder="e.g., Kshar Sutra, Agnikarma, Marma"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">Comma-separated skills or sub-specializations</p>
            </div>
            <div>
              <Label>Number of vacancies</Label>
              <Input type="number" min="1" value={form.vacancies} onChange={(e) => update("vacancies", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} className="mt-1" placeholder="e.g., Kochi" />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.location_state} onValueChange={(v) => update("location_state", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any / Remote</SelectItem>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job type</Label>
              <Select value={form.job_type} onValueChange={(v) => update("job_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contractual">Contractual</SelectItem>
                  <SelectItem value="visiting">Visiting</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minimum experience (years)</Label>
              <Input type="number" min="0" value={form.experience_years_min} onChange={(e) => update("experience_years_min", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Salary min (INR/month)</Label>
              <Input type="number" min="0" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} className="mt-1" placeholder="e.g., 30000" />
            </div>
            <div>
              <Label>Salary max (INR/month)</Label>
              <Input type="number" min="0" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} className="mt-1" placeholder="e.g., 80000" />
            </div>

            {/* Government job section */}
            <div className="md:col-span-2 flex items-center gap-4 rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex-1">
                <Label className="text-base font-semibold">Is this a Government job?</Label>
                <p className="text-xs text-muted-foreground mt-1">UPSC, State PSC, CGHS, ECHS, Municipal, AYUSH Ministry positions</p>
              </div>
              <Switch
                checked={form.is_government}
                onCheckedChange={(v) => update("is_government", v)}
              />
            </div>
            {form.is_government && (
              <div className="md:col-span-2">
                <Label>Government body</Label>
                <Input
                  value={form.government_body}
                  onChange={(e) => update("government_body", e.target.value)}
                  placeholder="e.g., UPSC, Kerala PSC, CGHS, Municipal Corporation"
                  className="mt-1"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label>Job description</Label>
                <AIJobDescriptionGenerator
                  jobTitle={form.job_title}
                  department={form.department}
                  organizationType={form.organization_type}
                  organizationName={form.organization_name}
                  specialization={form.specialization}
                  jobType={form.job_type}
                  experienceMin={form.experience_years_min}
                  onApply={({ description, requirements }) => {
                    setForm((prev) => ({
                      ...prev,
                      description: description || prev.description,
                      requirements: requirements || prev.requirements,
                    }));
                  }}
                />
              </div>
              <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1" placeholder="Describe the role, responsibilities, and work environment..." />
            </div>
            <div className="md:col-span-2">
              <Label>Requirements & qualifications</Label>
              <Textarea rows={4} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} className="mt-1" placeholder="e.g., BAMS/MD (Ayu) from recognized university, 3+ years clinical experience..." />
            </div>
            <div>
              <Label>Apply email</Label>
              <Input type="email" value={form.apply_email} onChange={(e) => update("apply_email", e.target.value)} className="mt-1" placeholder="hr@hospital.com" />
            </div>
            <div>
              <Label>Apply URL (external link)</Label>
              <Input type="url" value={form.apply_url} onChange={(e) => update("apply_url", e.target.value)} className="mt-1" placeholder="https://hospital.com/careers" />
            </div>
            <div>
              <Label>Expires at</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-end justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={saving}>{saving ? "Posting..." : "Post Job"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex gap-3 p-4">
          <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Who can post jobs on Ayuzee?</p>
            <ul className="list-disc pl-4 space-y-1 text-blue-800">
              <li>Verified Hospitals & Clinics (AYUSH-registered)</li>
              <li>Colleges & Universities (UGC/NCISM affiliated)</li>
              <li>Pharma companies with valid Drug License</li>
              <li>Doctors hiring for their own practice</li>
              <li>Government bodies (UPSC, State PSC, CGHS)</li>
              <li>AYUSH-specific recruitment agencies (limited quota)</li>
            </ul>
            <p className="mt-2 text-xs text-blue-700">
              Verified employers get priority review. <a href="/jobs/verify" className="font-semibold underline">Get verified</a> to unlock auto-approval and a "Verified" badge on your listings.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default JobPost;
