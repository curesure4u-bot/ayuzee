import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { BadgeCheck, Pencil } from "lucide-react";
import { DoctorGrowth } from "@/components/doctor/DoctorGrowth";

const calcCompletion = (d: Record<string, unknown>): number => {
  const fields = [
    "full_name", "email", "phone", "specialization", "city",
    "bio", "avatar_url", "experience_years", "consultation_fee",
    "registration_number",
  ];
  const filled = fields.filter((f) => {
    const v = d[f];
    return v !== null && v !== undefined && v !== "" && v !== 0;
  }).length;
  return Math.round((filled / fields.length) * 100);
};

const DoctorProfile = () => {
  const { doctor, userId, loading, refresh } = useDoctor();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", alternate_phone: "", gender: "",
    date_of_birth: "", bio: "", specialization: "", category: "general",
    city: "", clinic_name: "", experience_years: 0, consultation_fee: 0,
    languages: "", registration_number: "", escalation_name: "", escalation_phone: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ scheduled: 0, consulted: 0, completedSteps: 3 });

  useEffect(() => {
    if (doctor) {
      setForm({
        full_name: doctor.full_name ?? "",
        email: doctor.email ?? "",
        phone: doctor.phone ?? "",
        alternate_phone: doctor.alternate_phone ?? "",
        gender: doctor.gender ?? "",
        date_of_birth: doctor.date_of_birth ?? "",
        bio: doctor.bio ?? "",
        specialization: doctor.specialization ?? "",
        category: doctor.category ?? "general",
        city: doctor.city ?? "",
        clinic_name: doctor.clinic_name ?? "",
        experience_years: doctor.experience_years ?? 0,
        consultation_fee: doctor.consultation_fee ?? 0,
        languages: (doctor.languages ?? []).join(", "),
        registration_number: doctor.registration_number ?? "",
        escalation_name: doctor.escalation_name ?? "",
        escalation_phone: doctor.escalation_phone ?? "",
        avatar_url: doctor.avatar_url ?? "",
      });
    }
  }, [doctor]);

  // Load partner-progress stats: scheduled / consulted appointments + completed milestones
  useEffect(() => {
    if (!doctor) return;
    (async () => {
      const [{ count: scheduled }, { count: consulted }] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", doctor.id).in("status", ["scheduled", "confirmed", "pending"]),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", doctor.id).eq("status", "completed"),
      ]);
      // Compute milestone completion from doctor profile signals
      const flags = [
        true, // free digital profile (always)
        !!doctor.is_approved, // free PMS unlocked once approved
        !!doctor.video_available,
        (doctor.bio?.length ?? 0) > 50,
        (consulted ?? 0) >= 1,
        !!doctor.in_clinic_available,
        (doctor.profile_completion ?? 0) >= 80,
      ];
      const completedSteps = flags.filter(Boolean).length;
      setStats({ scheduled: scheduled ?? 0, consulted: consulted ?? 0, completedSteps });
    })();
  }, [doctor]);

  const togglePublic = async (val: boolean) => {
    if (!doctor) return;
    const { error } = await supabase.from("doctors").update({ public_profile: val }).eq("id", doctor.id);
    if (error) toast.error(error.message);
    else {
      toast.success(val ? "Profile is now public" : "Profile is now private");
      refresh();
    }
  };

  const saveSection = async (fields: Partial<typeof form>) => {
    if (!doctor || !userId) return;
    setSaving(true);
    const payload: Record<string, unknown> = { ...fields };
    if ("languages" in fields) {
      payload.languages = (fields.languages as string).split(",").map((s) => s.trim()).filter(Boolean);
    }
    const merged = { ...doctor, ...payload };
    payload.profile_completion = calcCompletion(merged);
    const { error } = await supabase.from("doctors").update(payload as never).eq("id", doctor.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!doctor) return <p className="text-muted-foreground">No doctor profile found.</p>;

  const completion = doctor.profile_completion ?? calcCompletion(doctor as unknown as Record<string, unknown>);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DoctorGrowth scheduled={stats.scheduled} consulted={stats.consulted} completedSteps={stats.completedSteps} />

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="font-display text-2xl">{doctor.full_name}</h1>
          {doctor.is_approved && <BadgeCheck className="h-6 w-6 text-primary" />}
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-primary/20">
              <AvatarImage src={form.avatar_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="bg-accent text-2xl">
                {doctor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {doctor.is_approved ? (
                <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Verified</Badge>
              ) : (
                <Badge variant="secondary">Pending approval</Badge>
              )}
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                Public profile
                <Switch checked={doctor.public_profile} onCheckedChange={togglePublic} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-semibold text-primary">{completion}%</span>
              </div>
              <Progress value={completion} className="mt-2" />
            </div>
          </div>
        </div>

        {!doctor.is_approved && (
          <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/5 p-3 text-sm">
            Your profile is awaiting admin approval. You'll appear in the public directory once approved.
          </div>
        )}
      </Card>

      <Accordion type="multiple" className="space-y-3" defaultValue={["personal"]}>
        <AccordionItem value="personal" className="rounded-xl border bg-card px-4">
          <AccordionTrigger>Personal & Contact Details</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Alternate phone"><Input value={form.alternate_phone} onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })} /></Field>
              <Field label="Gender"><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Male / Female / Other" /></Field>
              <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
              <Field label="Avatar URL" full><Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." /></Field>
            </div>
            <Button className="mt-4" onClick={() => saveSection({ full_name: form.full_name, email: form.email, phone: form.phone, alternate_phone: form.alternate_phone, gender: form.gender, date_of_birth: form.date_of_birth || null as never, avatar_url: form.avatar_url })} disabled={saving}>Save</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="practice" className="rounded-xl border bg-card px-4">
          <AccordionTrigger>Online Consultation Settings</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Consultation fee (₹)"><Input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })} /></Field>
              <Field label="Languages (comma-separated)"><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="Hindi, English, Tamil" /></Field>
              <Field label="Bio" full><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
            </div>
            <Button className="mt-4" onClick={() => saveSection({ consultation_fee: form.consultation_fee, languages: form.languages, bio: form.bio })} disabled={saving}>Save</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spec" className="rounded-xl border bg-card px-4">
          <AccordionTrigger>Specialization</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Specialization"><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></Field>
              <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="general / panchakarma / cosmetic" /></Field>
              <Field label="Experience (years)"><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} /></Field>
              <Field label="Registration number"><Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} /></Field>
            </div>
            <Button className="mt-4" onClick={() => saveSection({ specialization: form.specialization, category: form.category, experience_years: form.experience_years, registration_number: form.registration_number })} disabled={saving}>Save</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="escalation" className="rounded-xl border bg-card px-4">
          <AccordionTrigger>Escalation Contact</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Contact name"><Input value={form.escalation_name} onChange={(e) => setForm({ ...form, escalation_name: e.target.value })} /></Field>
              <Field label="Contact phone"><Input value={form.escalation_phone} onChange={(e) => setForm({ ...form, escalation_phone: e.target.value })} /></Field>
            </div>
            <Button className="mt-4" onClick={() => saveSection({ escalation_name: form.escalation_name, escalation_phone: form.escalation_phone })} disabled={saving}>Save</Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <Label className="mb-1.5 block text-sm">{label}</Label>
    {children}
  </div>
);

export default DoctorProfile;
