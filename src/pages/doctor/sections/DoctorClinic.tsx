import { useEffect, useState, useCallback } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, MapPin, IndianRupee, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Clinic = Tables<"doctor_clinics">;

const initial = {
  clinic_name: "", address_line1: "", city: "", state: "", pincode: "",
  phone: "", consultation_fee: 0, timings: "", services: "",
};

const DoctorClinic = () => {
  const { userId } = useDoctor();
  const [list, setList] = useState<Clinic[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);

  const fetchList = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("doctor_clinics").select("*").eq("doctor_user_id", userId);
    setList(data ?? []);
  }, [userId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const save = async () => {
    if (!userId) return;
    const { error } = await supabase.from("doctor_clinics").insert({
      doctor_user_id: userId,
      clinic_name: form.clinic_name, address_line1: form.address_line1,
      city: form.city, state: form.state, pincode: form.pincode,
      phone: form.phone, consultation_fee: form.consultation_fee,
      timings: form.timings,
      services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
    });
    if (error) toast.error(error.message);
    else { toast.success("Clinic added"); setOpen(false); setForm(initial); fetchList(); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">My Clinic</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add clinic</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a clinic</DialogTitle></DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2"><Label>Clinic name</Label><Input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Address</Label><Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                <div><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Consultation fee (₹)</Label><Input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })} /></div>
                <div><Label>Timings</Label><Input value={form.timings} onChange={(e) => setForm({ ...form, timings: e.target.value })} placeholder="Mon-Sat 10am-7pm" /></div>
                <div className="md:col-span-2"><Label>Services (comma separated)</Label><Textarea rows={2} value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></div>
              </div>
              <Button onClick={save}>Save clinic</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-5 space-y-3">
          {list.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">No clinics yet. Add your first to appear in patient searches.</p>
          ) : list.map((c) => (
            <div key={c.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{c.clinic_name}</h3>
              <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4" />{c.address_line1}, {c.city}, {c.state} - {c.pincode}</p>
              {c.timings && <p className="text-sm flex items-center gap-1"><Clock className="h-4 w-4" />{c.timings}</p>}
              <p className="text-sm flex items-center gap-1"><IndianRupee className="h-4 w-4" />{c.consultation_fee} consultation</p>
              {c.services?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.services.map((s) => <span key={s} className="rounded-full bg-accent px-2 py-0.5 text-xs">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DoctorClinic;
