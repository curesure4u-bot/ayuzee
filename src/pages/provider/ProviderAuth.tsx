import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { Building2, Hotel, Sparkles, HeartHandshake, Hospital, CheckCircle2, FileCheck, IdCard, Camera, Upload } from "lucide-react";

type ProviderType = "hospital" | "therapist" | "panchakarma" | "resort";
type Step = "credentials" | "documents" | "complete";

const TYPE_META: Record<ProviderType, { label: string; icon: typeof Hospital; hint: string }> = {
  hospital: { label: "Hospital", icon: Hospital, hint: "Multi-specialty Ayurvedic hospital" },
  therapist: { label: "Therapist", icon: HeartHandshake, hint: "Independent Panchakarma therapist" },
  panchakarma: { label: "Panchakarma Theater", icon: Sparkles, hint: "Dedicated Panchakarma centre" },
  resort: { label: "Wellness Resort", icon: Hotel, hint: "Retreat / wellness resort" },
};

const DocSlot = ({
  icon: Icon, label, description, file, onChange,
}: {
  icon: typeof Upload; label: string; description: string;
  file: File | null; onChange: (f: File | null) => void;
}) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-3 hover:bg-muted">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="truncate text-xs text-muted-foreground">{file ? file.name : description}</p>
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

const ProviderAuth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [providerRowId, setProviderRowId] = useState<string | null>(null);

  const [providerType, setProviderType] = useState<ProviderType>("hospital");
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const redirectForAccount = async (userId: string) => {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (therapist) {
      navigate("/therapist", { replace: true });
      return;
    }

    navigate("/provider", { replace: true });
  };

  useEffect(() => {
    if (step !== "credentials") return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mode === "login") redirectForAccount(data.session.user.id);
    });
  }, [mode, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/provider`,
            data: { full_name: contactPerson, phone },
          },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (!userId) throw new Error("Sign up failed");

        const { data: row, error: rowErr } = await supabase
          .from("service_providers")
          .insert({
            user_id: userId,
            provider_type: providerType,
            business_name: businessName,
            contact_person: contactPerson,
            email, phone, city,
            verification_status: "pending",
            is_approved: false,
            is_verified: false,
          })
          .select("id")
          .single();
        if (rowErr) throw rowErr;

        await supabase.from("user_roles").insert({ user_id: userId, role: "provider" });
        setProviderRowId(row.id);
        setStep("documents");
        toast.success("Account created. Please upload your verification documents.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        if (data.user) await redirectForAccount(data.user.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const uploadOne = async (file: File, slot: string) => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${uid}/${slot}.${ext}`;
    const { error } = await supabase.storage
      .from("provider-documents")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile || !idFile || !photoFile) {
      toast.error("Please attach all three documents");
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        uploadOne(licenseFile, "license"),
        uploadOne(idFile, "id"),
        uploadOne(photoFile, "facility"),
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
          <Link to="/login" className="mb-8 flex items-center justify-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full gradient-leaf">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee Service Partners</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            {step === "credentials" && (
              <>
                <h1 className="text-center font-display text-3xl">
                  {mode === "login" ? "Partner login" : "Join as a service partner"}
                </h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {mode === "login" ? "Manage your facility and bookings" : "Hospitals, therapists, Panchakarma centres & resorts"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === "signup" && (
                    <>
                      <div>
                        <Label>Type of facility</Label>
                        <Select value={providerType} onValueChange={(v) => setProviderType(v as ProviderType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TYPE_META) as ProviderType[]).map((k) => {
                              const m = TYPE_META[k];
                              return (
                                <SelectItem key={k} value={k}>
                                  <span className="flex items-center gap-2">
                                    <m.icon className="h-4 w-4 text-primary" />
                                    {m.label} <span className="text-xs text-muted-foreground">— {m.hint}</span>
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="businessName">Business / facility name</Label>
                        <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="contactPerson">Contact person</Label>
                        <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && <ForgotPasswordDialog defaultEmail={email} trigger={<button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>} />}
                    </div>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Continue"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "login" ? "New partner?" : "Already registered?"}{" "}
                  <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Not a service partner? <Link to="/login" className="text-primary hover:underline">Choose another role</Link>
                </p>
              </>
            )}

            {step === "documents" && (
              <>
                <h1 className="text-center font-display text-2xl">Verification documents</h1>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Step 2 of 2 — upload to verify your facility. Image or PDF, max 10MB each.
                </p>
                <form onSubmit={handleUploadDocs} className="mt-6 space-y-3">
                  <DocSlot icon={FileCheck} label="Business / clinic licence" description="Trade or operating licence" file={licenseFile} onChange={setLicenseFile} />
                  <DocSlot icon={IdCard} label="Owner identity proof" description="Aadhaar / passport / driving licence" file={idFile} onChange={setIdFile} />
                  <DocSlot icon={Camera} label="Facility photo" description="Reception / signage / room photo" file={photoFile} onChange={setPhotoFile} />
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
                  Our team will review your facility within 24–48 hours. You'll receive an email and WhatsApp once approved.
                </p>
                <Button className="mt-6 w-full" variant="hero" onClick={() => navigate("/provider")}>
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

export default ProviderAuth;
