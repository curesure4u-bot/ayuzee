import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { Sparkles, Upload, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

type Mode = "auth" | "onboarding" | "review";

const TherapistAuth = () => {
  usePageSEO({ title: "Therapist Portal | Ayuzee", noIndex: true });
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("auth");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Auth fields
  const [signup, setSignup] = useState({ full_name: "", phone: "", gender: "male", email: "", password: "", city: "", state: "" });
  const [signin, setSignin] = useState({ email: "", password: "" });

  // Onboarding state
  const [certNumber, setCertNumber] = useState("");
  const [certBody, setCertBody] = useState("");
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [idUrl, setIdUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [years, setYears] = useState("0");
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);

  useEffect(() => { (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data: existing } = await supabase
        .from("therapists")
        .select("id, verification_status")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (existing) {
        if (existing.verification_status === "approved") navigate("/therapist", { replace: true });
        else setMode("review");
      } else {
        setMode("onboarding");
      }
    })();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: `${window.location.origin}/therapist/auth`,
        data: { full_name: signup.full_name, phone: signup.phone },
      },
    });
    setLoading(false);
    if (error) return toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    if (data.user) {
      setUserId(data.user.id);
      setMode("onboarding");
      toast({ title: "Account created", description: "Complete your profile for verification." });
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: signin.email, password: signin.password });
    setLoading(false);
    if (error) return toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data: existing } = await supabase
      .from("therapists")
      .select("verification_status")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!existing) setMode("onboarding");
    else if (existing.verification_status === "approved") navigate("/therapist", { replace: true });
    else setMode("review");
  };

  const uploadFile = async (file: File, fileName: string): Promise<string | null> => {
    if (!userId) return null;
    const path = `${userId}/${fileName}`;
    const { error } = await supabase.storage.from("therapist-docs").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return path;
  };

  const submitOnboarding = async () => {
    if (!userId) return;
    if (!certUrl || !idUrl || !photoUrl) {
      return toast({ title: "Missing documents", description: "Please upload all required files.", variant: "destructive" });
    }
    if (selectedTherapies.length === 0) {
      return toast({ title: "Select therapies", description: "Pick at least one therapy you are certified for.", variant: "destructive" });
    }
    setLoading(true);
    const { error } = await supabase.from("therapists").insert({
      user_id: userId,
      full_name: signup.full_name || "Therapist",
      phone: signup.phone || "",
      gender: signup.gender as "male" | "female" | "other",
      city: signup.city || null,
      state: signup.state || null,
      certificate_url: certUrl,
      certificate_number: certNumber,
      certifying_body: certBody,
      photo_url: photoUrl,
      years_experience: Number(years) || 0,
      allowed_therapies: selectedTherapies,
      verification_status: "pending",
    });
    setLoading(false);
    if (error) return toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    setMode("review");
  };

  if (mode === "review") return <UnderReview />;

  if (mode === "onboarding") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 text-primary" />Therapist onboarding</div>
            <h1 className="text-3xl font-bold mt-1">Complete your profile</h1>
            <p className="text-muted-foreground">Step {step} of 4</p>
            <Progress value={(step / 4) * 100} className="mt-4 max-w-md mx-auto" />
          </div>

          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-semibold">Panchakarma certification</h2>
                  <FileUploader label="Certification PDF" accept="application/pdf" onPicked={async (f) => { const p = await uploadFile(f, "cert.pdf"); if (p) setCertUrl(p); }} uploaded={!!certUrl} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Certificate number</Label><Input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} placeholder="e.g. KAA-2021-1234" /></div>
                    <div><Label>Certifying body</Label><Input value={certBody} onChange={(e) => setCertBody(e.target.value)} placeholder="e.g. Kerala Ayurveda Academy" /></div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-semibold">Government ID proof</h2>
                  <p className="text-sm text-muted-foreground">Aadhaar, PAN, Passport or Driving Licence (PDF or image).</p>
                  <FileUploader label="ID document" accept="application/pdf,image/*" onPicked={async (f) => { const p = await uploadFile(f, "id." + (f.name.split(".").pop() || "pdf")); if (p) setIdUrl(p); }} uploaded={!!idUrl} />
                </>
              )}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-semibold">Therapies you're certified for</h2>
                  <p className="text-sm text-muted-foreground">Select only the therapies your certification covers.</p>
                  <TherapyPicker selected={selectedTherapies} onChange={setSelectedTherapies} />
                  <div className="text-xs text-muted-foreground">{selectedTherapies.length} selected</div>
                </>
              )}
              {step === 4 && (
                <>
                  <h2 className="text-xl font-semibold">Experience & profile photo</h2>
                  <div><Label>Years of experience</Label><Input type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} /></div>
                  <FileUploader label="Profile photo" accept="image/*" onPicked={async (f) => { const p = await uploadFile(f, "photo." + (f.name.split(".").pop() || "jpg")); if (p) setPhotoUrl(p); }} uploaded={!!photoUrl} />
                </>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Back</Button>
                {step < 4 ? (
                  <Button onClick={() => setStep(s => s + 1)}>Continue</Button>
                ) : (
                  <Button onClick={submitOnboarding} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit for review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Therapist Portal</CardTitle>
          <p className="text-sm text-muted-foreground">For certified Panchakarma practitioners.</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignin} className="space-y-4 mt-4">
                <div><Label>Email</Label><Input type="email" required value={signin.email} onChange={(e) => setSignin({ ...signin, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required value={signin.password} onChange={(e) => setSignin({ ...signin, password: e.target.value })} /></div>
                <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3 mt-4">
                <div><Label>Full name</Label><Input required value={signup.full_name} onChange={(e) => setSignup({ ...signup, full_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input required value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} /></div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={signup.gender} onValueChange={(v) => setSignup({ ...signup, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Email</Label><Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required minLength={6} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>City</Label><Input value={signup.city} onChange={(e) => setSignup({ ...signup, city: e.target.value })} /></div>
                  <div><Label>State</Label><Input value={signup.state} onChange={(e) => setSignup({ ...signup, state: e.target.value })} /></div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const FileUploader = ({ label, accept, onPicked, uploaded }: { label: string; accept: string; onPicked: (f: File) => void | Promise<void>; uploaded: boolean }) => {
  const [busy, setBusy] = useState(false);
  return (
    <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition ${uploaded ? "border-primary/40 bg-primary/5" : "border-border"}`}>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${uploaded ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{uploaded ? "Uploaded — click to replace" : busy ? "Uploading…" : "Click to upload"}</div>
      </div>
      <input type="file" accept={accept} className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true); await onPicked(f); setBusy(false);
      }} />
    </label>
  );
};

const TherapyPicker = ({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) => {
  const grouped = AYUSH_THERAPIES.reduce<Record<string, typeof AYUSH_THERAPIES>>((acc, t) => {
    const key = `${t.system} · ${t.group}`;
    (acc[key] ||= []).push(t);
    return acc;
  }, {});
  const toggle = (code: string) => onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);
  return (
    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">{group}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {items.map(t => (
              <label key={t.code} className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer hover:border-primary/40 ${selected.includes(t.code) ? "border-primary bg-primary/5" : ""}`}>
                <Checkbox checked={selected.includes(t.code)} onCheckedChange={() => toggle(t.code)} />
                <div className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">{t.code}</Badge>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const UnderReview = () => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-background">
    <Card className="max-w-lg w-full text-center">
      <CardContent className="p-10">
        <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="h-8 w-8 text-primary" /></div>
        <h1 className="text-2xl font-bold mt-4">Your application is under review</h1>
        <p className="text-muted-foreground mt-2">Our team is verifying your certification. You'll receive an email once approved (typically within 24-48 hours).</p>
        <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign out</Button>
      </CardContent>
    </Card>
  </div>
);

export default TherapistAuth;
