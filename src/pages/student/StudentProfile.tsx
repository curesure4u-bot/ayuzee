import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, ImageUp, Loader2, ShieldAlert, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"];
const courses = ["BAMS", "BHMS", "BUMS", "BNYS", "BSMS", "MD Ayurveda", "Other"];
const interests = ["Panchakarma", "Dravyaguna", "Roga Nidana", "Shalya Tantra", "Prasuti", "Kaumarabhritya", "Shalakya", "Swasthavritta", "Research"];

type ProfileForm = {
  full_name: string;
  phone: string;
  college_name: string;
  course: string;
  year_of_study: string;
  state: string;
  city: string;
  interests: string[];
  student_id_url: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
};

const emptyForm: ProfileForm = { full_name: "", phone: "", college_name: "", course: "BAMS", year_of_study: "1", state: "", city: "", interests: [], student_id_url: null, profile_photo_url: null, is_verified: false };

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "ST";

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [studentIdUrl, setStudentIdUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => { loadProfile(); }, []);

  const displayInitials = useMemo(() => initials(form.full_name), [form.full_name]);

  const signedUrl = async (path?: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("student-docs").createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  };

  const loadProfile = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;
    setUserId(user.id);
    setEmail(user.email ?? "");

    const { data, error } = await (supabase as any)
      .from("student_profiles")
      .select("full_name, phone, college_name, course, year_of_study, state, city, interests, student_id_url, profile_photo_url, is_verified")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) toast.error(error.message);
    if (data) {
      setForm({ ...emptyForm, ...data, year_of_study: String(data.year_of_study ?? 1), interests: data.interests ?? [] });
      setAvatarUrl(await signedUrl(data.profile_photo_url));
      setStudentIdUrl(await signedUrl(data.student_id_url));
    }
    setLoading(false);
  };

  const uploadFile = async (file: File, kind: "photo" | "id") => {
    if (!userId) return;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${kind === "photo" ? "photo" : "id"}.${ext}`;
    const { error } = await supabase.storage.from("student-docs").upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) { toast.error(error.message); return; }

    if (kind === "photo") {
      setForm((current) => ({ ...current, profile_photo_url: path }));
      setAvatarUrl(URL.createObjectURL(file));
    } else {
      setForm((current) => ({ ...current, student_id_url: path, is_verified: false }));
      setStudentIdUrl(URL.createObjectURL(file));
    }
    toast.success(kind === "photo" ? "Profile photo uploaded" : "Student ID uploaded");
  };

  const toggleInterest = (value: string) => {
    setForm((current) => ({ ...current, interests: current.interests.includes(value) ? current.interests.filter((item) => item !== value) : [...current.interests, value] }));
  };

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await (supabase as any).from("student_profiles").update({
      full_name: form.full_name,
      phone: form.phone || null,
      college_name: form.college_name || null,
      course: form.course,
      year_of_study: Number(form.year_of_study),
      state: form.state || null,
      city: form.city || null,
      interests: form.interests,
      student_id_url: form.student_id_url,
      profile_photo_url: form.profile_photo_url,
      is_verified: form.is_verified,
    }).eq("user_id", userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    setNewPassword("");
    toast.success("Password updated");
  };

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">My Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your student identity, academic details, and account security.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20"><AvatarImage src={avatarUrl ?? undefined} /><AvatarFallback className="bg-primary text-lg text-primary-foreground">{displayInitials}</AvatarFallback></Avatar>
            <div>
              <h2 className="font-display text-2xl">{form.full_name || "Student Profile"}</h2>
              <p className="text-sm text-muted-foreground">{form.course} · Year {form.year_of_study}</p>
              <div className="mt-2">{form.is_verified ? <Badge className="gap-1 bg-primary text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" />Verified Student ✓</Badge> : <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3.5 w-3.5" />Pending Verification</Badge>}</div>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <ImageUp className="h-4 w-4" /> Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadFile(file, "photo"); }} />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader><CardTitle>Student details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="College name"><Input value={form.college_name} onChange={(e) => setForm({ ...form, college_name: e.target.value })} /></Field>
              <Field label="Course"><Select value={form.course} onValueChange={(value) => setForm({ ...form, course: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map((course) => <SelectItem key={course} value={course}>{course}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Year of study"><Select value={form.year_of_study} onValueChange={(value) => setForm({ ...form, year_of_study: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6].map((year) => <SelectItem key={year} value={String(year)}>Year {year}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="State"><Select value={form.state} onValueChange={(value) => setForm({ ...form, state: value })}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            </div>
            <div className="space-y-2"><Label>Areas of interest</Label><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{interests.map((item) => <label key={item} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Checkbox checked={form.interests.includes(item)} onCheckedChange={() => toggleInterest(item)} />{item}</label>)}</div></div>
            <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Student ID card</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {studentIdUrl ? <a href={studentIdUrl} target="_blank" rel="noopener noreferrer"><img src={studentIdUrl} alt="Student ID card" className="max-h-72 w-full rounded-xl border border-border object-contain" /></a> : <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No student ID uploaded.</div>}
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Re-upload student ID
                <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadFile(file, "id"); }} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Email"><Input value={email} readOnly /></Field>
              <Field label="New password"><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" /></Field>
              <Button variant="outline" onClick={updatePassword}>Change password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;

export default StudentProfile;
