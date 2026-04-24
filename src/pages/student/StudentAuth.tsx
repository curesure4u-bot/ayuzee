import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, GraduationCap, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const courses = ["BAMS", "BHMS", "BUMS", "BNYS", "BSMS", "MD Ayurveda", "Other"];
const interests = ["Panchakarma", "Dravyaguna", "Roga Nidana", "Shalya Tantra", "Prasuti", "Kaumarabhritya", "Shalakya", "Swasthavritta", "Research"];

type SignupState = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  state: string;
  city: string;
  collegeName: string;
  course: string;
  yearOfStudy: string;
  interests: string[];
};

const initialSignup: SignupState = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  state: "",
  city: "",
  collegeName: "",
  course: "BAMS",
  yearOfStudy: "1",
  interests: [],
};

const StudentAuth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "signin");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signin, setSignin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState<SignupState>(initialSignup);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const updateSignup = (patch: Partial<SignupState>) => setSignup((current) => ({ ...current, ...patch }));

  const toggleInterest = (value: string) => {
    updateSignup({
      interests: signup.interests.includes(value)
        ? signup.interests.filter((item) => item !== value)
        : [...signup.interests, value],
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!signup.fullName.trim() || !signup.email.trim() || !signup.password || !signup.confirmPassword || !signup.state || !signup.city.trim()) {
        toast.error("Please complete all required basic details.");
        return false;
      }
      if (signup.password !== signup.confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
      if (signup.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return false;
      }
    }
    if (step === 2 && (!signup.collegeName.trim() || !signup.course || !signup.yearOfStudy || signup.interests.length === 0)) {
      toast.error("Please complete your academic details and select at least one interest.");
      return false;
    }
    if (step === 3 && !idFile) {
      toast.error("Please upload your student ID card photo.");
      return false;
    }
    return true;
  };

  const handleSignin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(signin);
      if (error) throw error;
      const userId = data.user?.id;
      const { data: roleRows, error: roleError } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "student");
      if (roleError) throw roleError;
      if (!roleRows?.length) {
        await supabase.auth.signOut();
        toast.error("This account is not registered as a student.");
        return;
      }
      navigate("/student/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signup.email.trim(),
        password: signup.password,
        options: {
          emailRedirectTo: `${window.location.origin}/student/dashboard`,
          data: { full_name: signup.fullName.trim(), phone: signup.phone.trim() },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Account creation did not return a user.");
      if (!data.session) {
        toast.success("Account created. Please verify your email, then sign in to complete your student profile.");
        setTab("signin");
        return;
      }

      const fileExt = idFile?.name.split(".").pop() || "jpg";
      const path = `${userId}/id.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("student-docs").upload(path, idFile!, {
        cacheControl: "3600",
        contentType: idFile?.type || "image/jpeg",
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { error: profileError } = await (supabase as any).from("student_profiles").insert({
        user_id: userId,
        full_name: signup.fullName.trim(),
        phone: signup.phone.trim() || null,
        college_name: signup.collegeName.trim(),
        course: signup.course,
        year_of_study: Number(signup.yearOfStudy),
        state: signup.state,
        city: signup.city.trim(),
        student_id_url: path,
        interests: signup.interests,
      });
      if (profileError) throw profileError;

      const { error: roleError } = await (supabase as any).from("user_roles").insert({ user_id: userId, role: "student" });
      if (roleError) throw roleError;

      toast.success("Welcome to Ayuzee Student Hub 🎓");
      navigate("/student/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create student account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-3xl border border-border bg-card p-10 shadow-soft lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-3 font-display text-2xl font-semibold">
            <span className="grid h-11 w-11 place-items-center rounded-full gradient-leaf text-primary-foreground"><GraduationCap className="h-5 w-5" /></span>
            Ayuzee Student Hub
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">For future AYUSH leaders</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">Learn, connect, and build your Ayurveda career.</h1>
            <p className="mt-4 text-muted-foreground">Access student resources, courses, research, webinars, and job pathways built around your academic journey.</p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            {['Verified student access', 'AYUSH learning library', 'Jobs and research pathways'].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</span>)}
          </div>
        </section>

        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-2xl"><BookOpenCheck className="h-6 w-6 text-primary" />Student Portal</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in or create a verified Ayurveda student profile.</p>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="signin">Sign In</TabsTrigger><TabsTrigger value="signup">Sign Up</TabsTrigger></TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignin} className="mt-6 space-y-4">
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={signin.email} onChange={(e) => setSignin({ ...signin, email: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Password</Label><Input type="password" required value={signin.password} onChange={(e) => setSignin({ ...signin, password: e.target.value })} /></div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <div className="mt-6 space-y-6">
                  <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">Step {step} of 3</span><span className="text-muted-foreground">{Math.round(progress)}%</span></div><Progress value={progress} /></div>
                  {step === 1 && <BasicStep signup={signup} updateSignup={updateSignup} />}
                  {step === 2 && <AcademicStep signup={signup} updateSignup={updateSignup} toggleInterest={toggleInterest} />}
                  {step === 3 && <UploadStep preview={preview} onFile={(file) => { setIdFile(file); setPreview(URL.createObjectURL(file)); }} />}
                  <div className="flex justify-between border-t border-border pt-4">
                    <Button type="button" variant="outline" disabled={step === 1 || loading} onClick={() => setStep((value) => value - 1)}>Back</Button>
                    {step < 3 ? <Button type="button" onClick={() => validateStep() && setStep((value) => value + 1)}>Continue</Button> : <Button type="button" variant="hero" disabled={loading} onClick={handleSignup}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Student Account</Button>}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BasicStep = ({ signup, updateSignup }: { signup: SignupState; updateSignup: (patch: Partial<SignupState>) => void }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-1.5 sm:col-span-2"><Label>Full name</Label><Input required value={signup.fullName} onChange={(e) => updateSignup({ fullName: e.target.value })} /></div>
    <div className="space-y-1.5"><Label>Phone</Label><Input type="tel" value={signup.phone} onChange={(e) => updateSignup({ phone: e.target.value })} /></div>
    <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={signup.email} onChange={(e) => updateSignup({ email: e.target.value })} /></div>
    <div className="space-y-1.5"><Label>Password</Label><Input type="password" required minLength={6} value={signup.password} onChange={(e) => updateSignup({ password: e.target.value })} /></div>
    <div className="space-y-1.5"><Label>Confirm password</Label><Input type="password" required minLength={6} value={signup.confirmPassword} onChange={(e) => updateSignup({ confirmPassword: e.target.value })} /></div>
    <div className="space-y-1.5"><Label>State</Label><Select value={signup.state} onValueChange={(value) => updateSignup({ state: value })}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-1.5"><Label>City</Label><Input required value={signup.city} onChange={(e) => updateSignup({ city: e.target.value })} /></div>
  </div>
);

const AcademicStep = ({ signup, updateSignup, toggleInterest }: { signup: SignupState; updateSignup: (patch: Partial<SignupState>) => void; toggleInterest: (value: string) => void }) => (
  <div className="space-y-4">
    <div className="space-y-1.5"><Label>College name</Label><Input required value={signup.collegeName} onChange={(e) => updateSignup({ collegeName: e.target.value })} /></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label>Course</Label><Select value={signup.course} onValueChange={(value) => updateSignup({ course: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map((course) => <SelectItem key={course} value={course}>{course}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label>Year of study</Label><Select value={signup.yearOfStudy} onValueChange={(value) => updateSignup({ yearOfStudy: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6].map((year) => <SelectItem key={year} value={String(year)}>{year}{year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year</SelectItem>)}</SelectContent></Select></div>
    </div>
    <div className="space-y-2"><Label>Areas of interest</Label><div className="grid gap-2 sm:grid-cols-2">{interests.map((item) => <label key={item} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"><Checkbox checked={signup.interests.includes(item)} onCheckedChange={() => toggleInterest(item)} />{item}</label>)}</div></div>
  </div>
);

const UploadStep = ({ preview, onFile }: { preview: string | null; onFile: (file: File) => void }) => (
  <div className="space-y-4">
    <Label>Upload student ID card photo</Label>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 text-center transition hover:bg-muted/70">
      <Upload className="h-8 w-8 text-primary" /><span className="mt-3 text-sm font-semibold">Choose ID card image</span><span className="text-xs text-muted-foreground">JPG, PNG, or WebP</span>
      <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} />
    </label>
    {preview && <img src={preview} alt="Student ID preview" className="max-h-72 w-full rounded-2xl border border-border object-contain" />}
  </div>
);

export default StudentAuth;