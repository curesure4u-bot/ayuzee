import {  useEffect, useRef, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { downloadUserDataExport } from "@/lib/dataExport";
import { fetchCompanyLegal } from "@/lib/legal";
import {
  ArrowLeft,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Trash,
  User,
  Users,
  X,
} from "lucide-react";

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam",
  "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Urdu",
];

interface Member {
  id: string;
  full_name: string;
  relation: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  marital_status: string | null;
}

const PatientProfile = () => {
  usePageSEO({ title: "My Profile — Ayuzee", noIndex: true });
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    pincode: "",
    city: "",
    state: "",
    avatar_url: "",
    preferred_languages: [] as string[],
  });
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [grievanceEmail, setGrievanceEmail] = useState("complaints@ayuzee.com");

  const [members, setMembers] = useState<Member[]>([]);
  const [memberOpen, setMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: "",
    relation: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    marital_status: "",
  });

  useEffect(() => { supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      setUserId(uid);
      const sessionEmail = data.session?.user.email ?? "";
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, phone, gender, date_of_birth, email, avatar_url, pincode, city, state, preferred_languages")
        .eq("user_id", uid)
        .maybeSingle();
      if (prof) {
        setForm({
          full_name: prof.full_name ?? "",
          email: prof.email ?? sessionEmail,
          phone: prof.phone ?? "",
          gender: prof.gender ?? "",
          date_of_birth: prof.date_of_birth ?? "",
          pincode: prof.pincode ?? "",
          city: prof.city ?? "",
          state: prof.state ?? "",
          avatar_url: prof.avatar_url ?? "",
          preferred_languages: prof.preferred_languages ?? [],
        });
      } else {
        setForm((f) => ({ ...f, email: sessionEmail }));
      }
      loadMembers(uid);
    });
    fetchCompanyLegal("privacy").then(({ info }) => {
      if (info?.grievance_email) setGrievanceEmail(info.grievance_email);
    });
  }, []);

  const loadMembers = async (uid: string) => {
    const { data } = await supabase
      .from("patient_associated_members")
      .select("*")
      .eq("patient_user_id", uid)
      .order("created_at", { ascending: false });
    setMembers((data as Member[]) ?? []);
  };

  const handleAvatarPick = () => fileRef.current?.click();
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: pub.publicUrl }));
      await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("user_id", userId);
      toast.success("Profile picture updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setForm((f) => {
      if (f.preferred_languages.includes(lang)) {
        return { ...f, preferred_languages: f.preferred_languages.filter((l) => l !== lang) };
      }
      if (f.preferred_languages.length >= 3) {
        toast.error("You can select up to 3 languages");
        return f;
      }
      return { ...f, preferred_languages: [...f.preferred_languages, lang] };
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        pincode: form.pincode || null,
        city: form.city || null,
        state: form.state || null,
        preferred_languages: form.preferred_languages,
      })
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const requestDelete = async () => {
    const { data: existing } = await (supabase as any)
      .from("deletion_requests")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ["pending", "in_progress"])
      .maybeSingle();

    if (existing) {
      toast.info("You already have a pending deletion request. Our team will contact you within 30 days.");
      return;
    }

    const { error } = await (supabase as any).from("deletion_requests").insert({
      user_id: userId,
      email: form.email || null,
    });

    if (error) {
      toast.error(error.message || "Could not submit deletion request.");
      return;
    }
    toast.success("Account deletion request submitted. We will respond within 30 days per DPDP requirements.");
  };

  const handleExportData = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      await downloadUserDataExport(userId);
      toast.success("Your data export has been downloaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const addMember = async () => {
    if (!newMember.full_name || !newMember.relation) {
      toast.error("Name and relation are required");
      return;
    }
    const { error } = await supabase.from("patient_associated_members").insert({
      patient_user_id: userId,
      full_name: newMember.full_name,
      relation: newMember.relation,
      age: newMember.age ? Number(newMember.age) : null,
      gender: newMember.gender || null,
      height_cm: newMember.height_cm ? Number(newMember.height_cm) : null,
      weight_kg: newMember.weight_kg ? Number(newMember.weight_kg) : null,
      marital_status: newMember.marital_status || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Family member added");
    setMemberOpen(false);
    setNewMember({ full_name: "", relation: "", age: "", gender: "", height_cm: "", weight_kg: "", marital_status: "" });
    loadMembers(userId);
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("patient_associated_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Member removed");
      loadMembers(userId);
    }
  };

  const initials = (form.full_name || "U").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-semibold">{form.full_name || "My Profile"}</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="flex justify-center bg-muted/40 px-5 py-4">
            <TabsList className="rounded-full bg-background p-1 shadow-sm">
              <TabsTrigger value="profile" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="members" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Associated Members
              </TabsTrigger>
            </TabsList>
          </div>

          {/* My Profile */}
          <TabsContent value="profile" className="m-0">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 bg-muted/40 px-5 pb-6">
              <div className="relative">
                <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-3xl font-semibold text-muted-foreground">
                      {initials || <User className="h-12 w-12" />}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:opacity-90"
                  aria-label="Edit profile picture"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarFile} />
              </div>
            </div>

            {/* Personal & Contact Details */}
            <div className="bg-background px-5 py-6">
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between pb-4">
                  <span className="font-display text-lg font-semibold text-primary">
                    Personal &amp; Contact Details
                  </span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-5">
                  <FloatingField label="Full Name">
                    <Input
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    />
                  </FloatingField>

                  <FloatingField label="Email">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </FloatingField>

                  <FloatingField label="Mobile">
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 - 9999999999"
                    />
                  </FloatingField>

                  <FloatingField label="Gender">
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FloatingField>

                  <FloatingField label="Date of Birth">
                    <Input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    />
                  </FloatingField>

                  <FloatingField label="Pincode">
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                    />
                  </FloatingField>

                  <FloatingField label="City">
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </FloatingField>

                  <FloatingField label="State">
                    <Input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    />
                  </FloatingField>

                  {/* Languages */}
                  <div className="space-y-2 pt-2">
                    <Label className="font-semibold">Preferred Languages (select up to 3)</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      {form.preferred_languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="gap-1 rounded-full px-3 py-1 text-sm">
                          {lang}
                          <button
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className="ml-1 grid h-4 w-4 place-items-center rounded-full hover:bg-background"
                            aria-label={`Remove ${lang}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}

                      <Dialog open={langPickerOpen} onOpenChange={setLangPickerOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-primary text-primary hover:bg-primary/10"
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add More
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Select languages (max 3)</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map((lang) => {
                              const active = form.preferred_languages.includes(lang);
                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => toggleLanguage(lang)}
                                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                    active
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background hover:bg-muted"
                                  }`}
                                >
                                  {lang}
                                </button>
                              );
                            })}
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setLangPickerOpen(false)}>Done</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={saveProfile}
                      disabled={saving}
                      className="h-11 w-full max-w-xs rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Data rights (DPDP) */}
            <div className="border-t border-border bg-muted/30 px-5 py-6">
              <h3 className="font-display text-base font-semibold">Your data rights</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Under India&apos;s DPDP Act you can download your data or request account deletion.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" disabled={exporting} onClick={handleExportData}>
                  {exporting ? "Preparing…" : "Download my data"}
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Grievance Officer:{" "}
                <a href={`mailto:${grievanceEmail}`} className="text-primary hover:underline">
                  {grievanceEmail}
                </a>
              </p>
            </div>

            {/* Delete account */}
            <div className="border-t border-border bg-background px-5 py-4 text-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive">
                    <Trash className="h-4 w-4" /> Request to delete account
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This submits a request to permanently delete your Ayuzee account and related data.
                      We will respond within 30 days as required under the DPDP Act.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={requestDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Submit request
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          {/* Associated Members */}
          <TabsContent value="members" className="m-0 bg-background px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Family Members</h2>
              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <Plus className="mr-1 h-4 w-4" /> Add New Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={newMember.full_name} onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Relation *</Label>
                      <Select value={newMember.relation} onValueChange={(v) => setNewMember({ ...newMember, relation: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Other"].map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={newMember.gender} onValueChange={(v) => setNewMember({ ...newMember, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Height (cm)</Label>
                      <Input type="number" value={newMember.height_cm} onChange={(e) => setNewMember({ ...newMember, height_cm: e.target.value })} />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input type="number" value={newMember.weight_kg} onChange={(e) => setNewMember({ ...newMember, weight_kg: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Marital Status</Label>
                      <Select value={newMember.marital_status} onValueChange={(v) => setNewMember({ ...newMember, marital_status: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addMember}>Save Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">No family members yet</p>
                <p className="text-sm text-muted-foreground">Add family members to book appointments on their behalf.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-start justify-between rounded-xl border border-border p-4">
                    <div>
                      <div className="font-semibold">{m.full_name}</div>
                      <div className="text-xs text-muted-foreground">{m.relation}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {[m.age && `${m.age} yrs`, m.gender, m.height_cm && `${m.height_cm} cm`, m.weight_kg && `${m.weight_kg} kg`]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

/** Material-style floating label field wrapper */
const FloatingField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative">
    <span className="absolute -top-2 left-3 z-10 bg-background px-1 text-xs text-muted-foreground">
      {label}
    </span>
    <div className="[&_input]:h-11 [&_input]:rounded-lg [&_button]:rounded-lg">{children}</div>
  </div>
);

export default PatientProfile;
