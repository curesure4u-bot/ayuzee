import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone } from "lucide-react";

const leadSchema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid phone"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conditionId?: string;
  conditionSlug?: string;
  conditionName?: string;
  packageLabel?: string;
}

export const RequestCallDialog = ({ open, onOpenChange, conditionId, conditionSlug, conditionName, packageLabel }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", notes: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("condition_leads").insert({
      condition_id: conditionId ?? null,
      condition_slug: conditionSlug ?? null,
      user_id: userData.user?.id ?? null,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      package_label: packageLabel ?? null,
      notes: parsed.data.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thanks! Our doctor will call you soon.");
    setForm({ full_name: "", phone: "", email: "", notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Talk to an Ayurvedic Doctor</DialogTitle>
          <DialogDescription>
            {conditionName ? `Free consultation for ${conditionName}.` : "Free consultation."} Share your details and we'll call you back.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Full name *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={120} required />
          </div>
          <div>
            <Label>Phone number *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} required placeholder="+91 98xxxxxxxx" />
          </div>
          <div>
            <Label>Email (optional)</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
          </div>
          <div>
            <Label>Brief about your condition (optional)</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} rows={3} />
          </div>
          {packageLabel && (
            <p className="rounded-md bg-accent px-3 py-2 text-xs">Interested in: <strong>{packageLabel}</strong></p>
          )}
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Submitting…" : "Request a Call"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
