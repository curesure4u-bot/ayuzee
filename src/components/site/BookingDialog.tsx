import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Building2 } from "lucide-react";

declare global {
  interface Window { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }
}

const loadRazorpay = (): Promise<boolean> => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

interface Doctor {
  id: string;
  full_name: string;
  consultation_fee: number;
  video_available: boolean;
  in_clinic_available: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doctor: Doctor;
}

const SLOTS = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

const today = () => new Date().toISOString().slice(0, 10);
const maxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

export const BookingDialog = ({ open, onOpenChange, doctor }: Props) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"video" | "in_clinic">(doctor.video_available ? "video" : "in_clinic");
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState(SLOTS[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }
      const { error } = await supabase.from("appointments").insert({
        user_id: sessionData.session.user.id,
        doctor_id: doctor.id,
        appointment_date: date,
        time_slot: slot,
        mode,
        fee: doctor.consultation_fee,
        notes: notes || null,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Appointment booked! View it in your dashboard.");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not book";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book with {doctor.full_name}</DialogTitle>
          <DialogDescription>Choose your preferred mode, date, and time slot.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-2 block">Consultation mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                active={mode === "video"}
                disabled={!doctor.video_available}
                onClick={() => setMode("video")}
                icon={Video}
                label="Video"
                desc="Zoom call"
              />
              <ModeCard
                active={mode === "in_clinic"}
                disabled={!doctor.in_clinic_available}
                onClick={() => setMode("in_clinic")}
                icon={Building2}
                label="In-clinic"
                desc="Visit doctor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              value={date}
              min={today()}
              max={maxDate()}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            />
          </div>

          <div>
            <Label className="mb-2 block">Time slot</Label>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-smooth ${
                    slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes for the doctor (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} placeholder="Briefly describe your concern…" />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-accent/60 p-4">
            <span className="text-sm font-medium">Consultation fee</span>
            <span className="font-display text-2xl">₹{doctor.consultation_fee}</span>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={saving}>
              {saving ? "Booking…" : "Confirm booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ModeCard = ({ active, disabled, onClick, icon: Icon, label, desc }: {
  active: boolean; disabled?: boolean; onClick: () => void;
  icon: React.ComponentType<{ className?: string }>; label: string; desc: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-smooth disabled:cursor-not-allowed disabled:opacity-40 ${
      active ? "border-primary bg-accent" : "border-border hover:border-primary/40"
    }`}
  >
    <div className={`grid h-10 w-10 place-items-center rounded-lg ${active ? "gradient-leaf text-primary-foreground" : "bg-accent text-primary"}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </button>
);
