import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope, FileCheck, Upload, IdCard, Camera, CheckCircle2 } from "lucide-react";

type Step = "credentials" | "documents" | "complete";

const DocSlot = ({
  icon: Icon,
  label,
  description,
  file,
  onChange,
}: {
  icon: typeof Upload;
  label: string;
  description: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-3 hover:bg-muted">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="truncate text-xs text-muted-foreground">
        {file ? file.name : description}
      </p>
    </div>
    {file && <CheckCircle2 className="h-5 w-5 text-primary" />}
    <input
      type="file"
      className="hidden"
      accept="image/jpeg,image/png,image/webp,application/pdf"
      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
    />
  </label>
);

const DoctorAuth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [doctorRowId, setDoctorRowId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [certFile, setCertFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  useEffect(() => {
    if (step !== "credentials") return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/doctor", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && step === "credentials") navigate("/doctor", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/doctor`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (!userId) throw new Error("Sign up failed");

        const { data: docRow, error: docErr } = await supabase
          .from("doctors")
          .insert({
            user_id: userId,
            full_name: fullName,
            email,
            phone,
            specialization: specialization || "Ayurvedic Practitioner",
            category: "general",
            city: city || "Not specified",
            is_approved: false,
            is_verified: false,
            verification_status: "pending",
            public_profile: false,
          })
          .select("id")
          .single();
        if (docErr) throw docErr;

        await supabase.from("user_roles").insert({ user_id: userId, role: "doctor" });
        setDoctorRowId(docRow.id);
        setStep("documents");
        toast.success("Account created. Please upload your verification documents.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, Doctor!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const uploadOne = async (file: File, slot: "cert" | "id" | "selfie") => {
    if (!doctorRowId) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${doctorRowId}/${slot}.${ext}`;
    const { error } = await supabase.storage
      .from("doctor-documents")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile || !idFile || !selfieFile) {
      toast.error("Please attach all three documents");
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        uploadOne(certFile, "cert"),
        uploadOne(idFile, "id"),
        uploadOne(selfieFile, "selfie"),
      ]);
      setStep("complete");
      toast.success("Documents submitted for review");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee for Doctors</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            {step === "credentials" && (
              <>
                <h1 className="text-center font-display text-3xl">
                  {mode === "login" ? "Doctor login" : "Join as a doctor"}
                </h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Access your practice dashboard"
                    : "Grow your Ayurvedic practice with Ayuzee"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === "signup" && (
                    <>
                      <div>
                        <Label htmlFor="fullName">Full name (with title)</Label>
                        <Input id="fullName" placeholder="Dr. Mohamad Saleem" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input id="specialization" placeholder="e.g. Panchakarma" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Continue"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "login" ? "New doctor?" : "Already registered?"}{" "}
                  <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Looking for patient login? <Link to="/auth" className="text-primary hover:underline">Click here</Link>
                </p>
              </>
            )}

            {step === "documents" && (
              <>
                <h1 className="text-center font-display text-2xl">Verification documents</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Step 2 of 2 — upload to verify your medical credentials. Image or PDF, max 10MB each.
                </p>
                <form onSubmit={handleUploadDocs} className="mt-6 space-y-3">
                  <DocSlot icon={FileCheck} label="Medical registration certificate" description="Council registration / degree" file={certFile} onChange={setCertFile} />
                  <DocSlot icon={IdCard} label="Identity proof" description="Aadhaar / passport / driving licence" file={idFile} onChange={setIdFile} />
                  <DocSlot icon={Camera} label="Selfie" description="Clear face photo" file={selfieFile} onChange={setSelfieFile} />
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Uploading…" : "Submit for verification"}
                  </Button>
                </form>
              </>
            )}

            {step === "complete" && (
              <div className="py-4 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h1 className="mt-4 font-display text-2xl">Submitted for review</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our team will review your documents within 24–48 hours. You'll receive an email and WhatsApp once approved.
                </p>
                <Button className="mt-6 w-full" variant="hero" onClick={() => navigate("/doctor")}>
                  Go to dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuth;
