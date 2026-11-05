import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Handshake, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  partner_type: z.enum(["therapist", "hospital", "clinic", "panchakarma_theater"]),
  name: z.string().trim().min(2, "Name too short").max(200),
  contact_person: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
  address: z.string().trim().max(500).optional(),
  services: z.string().trim().max(500).optional(),
  about: z.string().trim().max(1000).optional(),
});

const TYPES = [
  { value: "therapist", label: "Therapist" },
  { value: "panchakarma_theater", label: "Panchakarma Theater" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
];

const PartnerApply = () => {
  const [form, setForm] = useState({
    partner_type: "therapist", name: "", contact_person: "", phone: "", email: "",
    city: "", state: "", pincode: "", address: "", services: "", about: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setSubmitting(true);
    const { error } = await supabase.from("network_partners").insert({
      partner_type: form.partner_type,
      name: form.name.trim(),
      contact_person: form.contact_person || null,
      phone: form.phone || null,
      email: form.email || null,
      city: form.city.trim(),
      state: form.state || null,
      pincode: form.pincode || null,
      address: form.address || null,
      services: form.services ? form.services.split(",").map((s) => s.trim()).filter(Boolean) : [],
      about: form.about || null,
      is_approved: false,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  return (
    <>
      <SiteNav />
      <main className="container py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></span>
            <h1 className="mt-3 font-display text-3xl">Join the Ayuzee Network</h1>
            <p className="mt-1 text-sm text-muted-foreground">Therapists · Panchakarma Theaters · Hospitals · Clinics</p>
          </div>

          {done ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-3 font-display text-xl">Application received</h2>
              <p className="mt-2 text-sm text-muted-foreground">Our team will review and reach out within 2–3 business days.</p>
              <Button className="mt-4" asChild><Link to="/">Back to home</Link></Button>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="grid gap-4">
                <div>
                  <Label>Partner type *</Label>
                  <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.partner_type} onChange={(e) => setForm({ ...form, partner_type: e.target.value })}>
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Contact person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                  <div><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
                </div>
                <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Services (comma-separated)</Label><Input placeholder="Abhyanga, Shirodhara, Basti" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></div>
                <div><Label>About</Label><Textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
                <Button onClick={submit} disabled={submitting} size="lg">
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PartnerApply;
