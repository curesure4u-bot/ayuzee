import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle2, Eye, EyeOff, FileText, Loader2, Save, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const DEGREES = [
  "BAMS", "BHMS", "BUMS", "BNYS", "B.Pharm (Ayurveda)",
  "MD (Ayurveda)", "MS (Ayurveda)", "MD (Homeopathy)", "MD (Unani)",
  "PhD (Ayurveda)", "PhD (Homeopathy)", "Diploma in Yoga", "Diploma in Naturopathy",
  "Panchakarma Therapist Certificate", "AYUSH Nursing Diploma", "Other",
];

const DEPARTMENTS = [
  "Kayachikitsa (General Medicine)", "Shalya Tantra (Surgery)",
  "Shalakya Tantra (ENT & Ophthalmology)", "Prasuti & Stree Roga (OBG)",
  "Kaumarbhritya (Pediatrics)", "Panchakarma", "Dravyaguna (Pharmacology)",
  "Rasashastra & Bhaishajya Kalpana", "Swasthavritta (Preventive Medicine)",
  "Roga Nidana (Pathology)", "Organon of Medicine (Homeopathy)",
  "Materia Medica (Homeopathy)", "Unani Medicine", "Siddha Medicine",
  "Naturopathy", "Yoga Therapy", "Panchakarma Therapist",
  "AYUSH Nursing", "Pharmacy", "Lab Technician", "Paramedical",
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

type SeekerProfile = {
  id?: string;
  full_name: string;
  headline: string;
  phone: string;
  email: string;
  gender: string;
  degree: string;
  college: string;
  university: string;
  graduation_year: string;
  additional_qualifications: string;
  department: string;
  skills: string;
  experience_years: string;
  current_designation: string;
  current_organization: string;
  registration_number: string;
  registration_council: string;
  preferred_job_type: string;
  preferred_states: string[];
  expected_salary_min: string;
  expected_salary_max: string;
  willing_to_relocate: boolean;
  notice_period: string;
  is_actively_looking: boolean;
  visibility: string;
  resume_url: string;
  resume_filename: string;
};

const emptyProfile: SeekerProfile = {
  full_name: "", headline: "", phone: "", email: "", gender: "",
  degree: "", college: "", university: "", graduation_year: "",
  additional_qualifications: "", department: "", skills: "",
  experience_years: "0", current_designation: "", current_organization: "",
  registration_number: "", registration_council: "",
  preferred_job_type: "full_time", preferred_states: [],
  expected_salary_min: "", expected_salary_max: "",
  willing_to_relocate: false, notice_period: "immediate",
  is_actively_looking: true, visibility: "public",
  resume_url: "", resume_filename: "",
};

function calcCompleteness(p: SeekerProfile): number {
  const fields = [
    p.full_name, p.headline, p.phone, p.degree, p.college,
    p.department, p.skills, p.experience_years, p.registration_number,
    p.expected_salary_min, p.resume_url,
  ];
  const filled = fields.filter((f) => f && f.trim() !== "" && f !== "0").length;
  return Math.round((filled / fields.length) * 100);
}

const JobSeekerProfile = () => {
  usePageSEO({ title: "My Job Profile — Ayuzee" });
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState<SeekerProfile>(emptyProfile);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth", { replace: true }); return; }
    const uid = session.session.user.id;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("job_seeker_profiles")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (data) {
      setIsNew(false);
      setForm({
        id: data.id,
        full_name: data.full_name || "",
        headline: data.headline || "",
        phone: data.phone || "",
        email: data.email || session.session.user.email || "",
        gender: data.gender || "",
        degree: data.degree || "",
        college: data.college || "",
        university: data.university || "",
        graduation_year: data.graduation_year?.toString() || "",
        additional_qualifications: (data.additional_qualifications || []).join(", "),
        department: data.department || "",
        skills: (data.skills || []).join(", "),
        experience_years: data.experience_years?.toString() || "0",
        current_designation: data.current_designation || "",
        current_organization: data.current_organization || "",
        registration_number: data.registration_number || "",
        registration_council: data.registration_council || "",
        preferred_job_type: data.preferred_job_type || "full_time",
        preferred_states: data.preferred_states || [],
        expected_salary_min: data.expected_salary_min?.toString() || "",
        expected_salary_max: data.expected_salary_max?.toString() || "",
        willing_to_relocate: data.willing_to_relocate ?? false,
        notice_period: data.notice_period || "immediate",
        is_actively_looking: data.is_actively_looking ?? true,
        visibility: data.visibility || "public",
        resume_url: data.resume_url || "",
        resume_filename: data.resume_filename || "",
      });
    } else {
      // Prefill from auth
      setForm((prev) => ({ ...prev, email: session.session!.user.email || "" }));
    }
    setLoading(false);
  };

  const update = (key: keyof SeekerProfile, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5MB."); return; }
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
      toast.error("Only PDF, DOC, DOCX files are accepted."); return;
    }

    setUploading(true);
    const path = `resumes/${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("job-documents").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("job-documents").getPublicUrl(path);
    setForm((prev) => ({ ...prev, resume_url: urlData.publicUrl, resume_filename: file.name }));
    setUploading(false);
    toast.success("Resume uploaded!");
  };

  const saveProfile = async () => {
    if (!userId) return;
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (!form.degree.trim()) { toast.error("Degree is required"); return; }

    setSaving(true);
    const payload = {
      user_id: userId,
      full_name: form.full_name.trim(),
      headline: form.headline || null,
      phone: form.phone || null,
      email: form.email || null,
      gender: form.gender || null,
      degree: form.degree,
      college: form.college || null,
      university: form.university || null,
      graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
      additional_qualifications: form.additional_qualifications
        ? form.additional_qualifications.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      department: form.department || null,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      experience_years: Number(form.experience_years || 0),
      current_designation: form.current_designation || null,
      current_organization: form.current_organization || null,
      registration_number: form.registration_number || null,
      registration_council: form.registration_council || null,
      preferred_job_type: form.preferred_job_type,
      preferred_states: form.preferred_states,
      expected_salary_min: form.expected_salary_min ? Number(form.expected_salary_min) : null,
      expected_salary_max: form.expected_salary_max ? Number(form.expected_salary_max) : null,
      willing_to_relocate: form.willing_to_relocate,
      notice_period: form.notice_period,
      is_actively_looking: form.is_actively_looking,
      visibility: form.visibility,
      resume_url: form.resume_url || null,
      resume_filename: form.resume_filename || null,
      resume_updated_at: form.resume_url ? new Date().toISOString() : null,
      profile_completeness: calcCompleteness(form),
      last_active_at: new Date().toISOString(),
    };

    let error;
    if (isNew) {
      ({ error } = await (supabase as any).from("job_seeker_profiles").insert(payload));
    } else {
      ({ error } = await (supabase as any).from("job_seeker_profiles").update(payload).eq("user_id", userId));
    }

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Profile created! Employers can now find you." : "Profile updated!");
    setIsNew(false);
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  const completeness = calcCompleteness(form);

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">Job Seeker</Badge>
                <h1 className="font-display text-3xl font-semibold">My Job Profile</h1>
                <p className="mt-1 text-muted-foreground">
                  {isNew ? "Create your profile so employers can find you and you can apply in one click." : "Keep your profile updated for better job matches."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Profile strength</p>
                  <p className="text-lg font-bold text-primary">{completeness}%</p>
                </div>
                <Progress value={completeness} className="w-32 h-2.5" />
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 max-w-4xl">
          {/* Status bar */}
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Actively looking:</span>
                  <Switch checked={form.is_actively_looking} onCheckedChange={(v) => update("is_actively_looking", v)} />
                </div>
                <Badge variant={form.is_actively_looking ? "default" : "outline"}>
                  {form.is_actively_looking ? "Open to opportunities" : "Not looking"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Visibility:</span>
                <Select value={form.visibility} onValueChange={(v) => update("visibility", v)}>
                  <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public"><Eye className="inline h-3 w-3 mr-1" />Public</SelectItem>
                    <SelectItem value="private"><EyeOff className="inline h-3 w-3 mr-1" />Apply only</SelectItem>
                    <SelectItem value="hidden"><EyeOff className="inline h-3 w-3 mr-1" />Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className="mt-1" placeholder="Dr. Priya Sharma" />
              </div>
              <div>
                <Label>Profile Headline</Label>
                <Input value={form.headline} onChange={(e) => update("headline", e.target.value)} className="mt-1" placeholder="BAMS Doctor | Panchakarma Specialist | 5 yrs exp" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" placeholder="+91 98765 43210" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1" type="email" />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Education</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Highest Degree *</Label>
                <Select value={form.degree} onValueChange={(v) => update("degree", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select degree" /></SelectTrigger>
                  <SelectContent>
                    {DEGREES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Graduation Year</Label>
                <Input value={form.graduation_year} onChange={(e) => update("graduation_year", e.target.value)} className="mt-1" type="number" min="1980" max="2030" placeholder="2020" />
              </div>
              <div>
                <Label>College</Label>
                <Input value={form.college} onChange={(e) => update("college", e.target.value)} className="mt-1" placeholder="Government Ayurveda College" />
              </div>
              <div>
                <Label>University</Label>
                <Input value={form.university} onChange={(e) => update("university", e.target.value)} className="mt-1" placeholder="Kerala University of Health Sciences" />
              </div>
              <div className="md:col-span-2">
                <Label>Additional Qualifications</Label>
                <Input value={form.additional_qualifications} onChange={(e) => update("additional_qualifications", e.target.value)} className="mt-1" placeholder="MD Kayachikitsa, CYI Yoga, PGDHA (comma-separated)" />
              </div>
            </CardContent>
          </Card>

          {/* Professional */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Department / Specialization</Label>
                <Select value={form.department} onValueChange={(v) => update("department", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Total Experience (years)</Label>
                <Input type="number" min="0" value={form.experience_years} onChange={(e) => update("experience_years", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Skills</Label>
                <Input value={form.skills} onChange={(e) => update("skills", e.target.value)} className="mt-1" placeholder="Panchakarma, Kshar Sutra, Marma, Shirodhara (comma-separated)" />
              </div>
              <div>
                <Label>Current Designation</Label>
                <Input value={form.current_designation} onChange={(e) => update("current_designation", e.target.value)} className="mt-1" placeholder="Senior Consultant" />
              </div>
              <div>
                <Label>Current Organization</Label>
                <Input value={form.current_organization} onChange={(e) => update("current_organization", e.target.value)} className="mt-1" placeholder="ABC Ayurveda Hospital" />
              </div>
              <div>
                <Label>Registration Number</Label>
                <Input value={form.registration_number} onChange={(e) => update("registration_number", e.target.value)} className="mt-1" placeholder="KAM/12345" />
              </div>
              <div>
                <Label>Registration Council</Label>
                <Input value={form.registration_council} onChange={(e) => update("registration_council", e.target.value)} className="mt-1" placeholder="Kerala AYUSH Council" />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Preferred Job Type</Label>
                <Select value={form.preferred_job_type} onValueChange={(v) => update("preferred_job_type", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="visiting">Visiting</SelectItem>
                    <SelectItem value="contractual">Contractual</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notice Period</Label>
                <Select value={form.notice_period} onValueChange={(v) => update("notice_period", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="15_days">15 days</SelectItem>
                    <SelectItem value="30_days">30 days</SelectItem>
                    <SelectItem value="60_days">60 days</SelectItem>
                    <SelectItem value="90_days">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Salary (min ₹/month)</Label>
                <Input type="number" min="0" value={form.expected_salary_min} onChange={(e) => update("expected_salary_min", e.target.value)} className="mt-1" placeholder="25000" />
              </div>
              <div>
                <Label>Expected Salary (max ₹/month)</Label>
                <Input type="number" min="0" value={form.expected_salary_max} onChange={(e) => update("expected_salary_max", e.target.value)} className="mt-1" placeholder="60000" />
              </div>
              <div className="md:col-span-2">
                <Label>Preferred States (select multiple from below)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INDIAN_STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        const current = form.preferred_states;
                        if (current.includes(state)) {
                          update("preferred_states", current.filter((s) => s !== state));
                        } else {
                          update("preferred_states", [...current, state]);
                        }
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        form.preferred_states.includes(state)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.willing_to_relocate} onCheckedChange={(v) => update("willing_to_relocate", v)} />
                <Label>Willing to relocate</Label>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Resume / CV</CardTitle>
              <CardDescription>Upload your latest CV (PDF, DOC, DOCX — max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-primary/30 px-6 py-4 transition hover:border-primary hover:bg-primary/5">
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">{uploading ? "Uploading..." : "Choose File"}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
                </label>
                {form.resume_filename && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{form.resume_filename}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/jobs")}>Cancel</Button>
            <Button variant="hero" onClick={saveProfile} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : isNew ? "Create Profile" : "Save Changes"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default JobSeekerProfile;
