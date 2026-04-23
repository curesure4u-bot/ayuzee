import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Sparkles, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AYUSH_THERAPIES, AYUSH_SYSTEMS, findTherapyByCode } from "@/data/ayushTherapyCatalog";

const STATUSES = ["planned", "ongoing", "completed", "cancelled"];

const TherapyPlans = () => {
  const { userId } = useDoctor();
  const [params] = useSearchParams();
  const preselectPartner = params.get("partner") || "";
  const preselectCode = params.get("code") || "";
  const preTherapy = preselectCode ? findTherapyByCode(preselectCode) : undefined;
  const [items, setItems] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [open, setOpen] = useState(!!preselectPartner || !!preselectCode);
  const [showPrice, setShowPrice] = useState(true);
  const [therapySystem, setTherapySystem] = useState<string>(preTherapy?.system || "Ayurveda");
  const [numSessions, setNumSessions] = useState("1");
  const [perSessionMinutes, setPerSessionMinutes] = useState("60");
  const [startDate, setStartDate] = useState("");
  const [medicines, setMedicines] = useState<Array<{ product_id: string; name: string; price: number; quantity: number }>>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [form, setForm] = useState({
    patient_name: "", patient_phone: "", patient_user_id: "", partner_id: preselectPartner,
    therapy_code: preTherapy?.code || "",
    therapy_name: preTherapy?.name || "",
    unit_price: preTherapy ? String(preTherapy.price) : "",
    planned_date: "", duration_days: "1", notes: "",
  });

  // Search products for medicines
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("products").select("id, name, brand, price, unit").ilike("name", `%${productSearch}%`).limit(8);
      setProductResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [productSearch]);

  const load = async () => {
    if (!userId) return;
    const [{ data: plans }, { data: parts }] = await Promise.all([
      supabase.from("therapy_plans").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false }),
      supabase.from("network_partners").select("id, name, partner_type, city").eq("is_approved", true),
    ]);
    setItems(plans ?? []);
    setPartners(parts ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    if (!form.patient_name.trim()) return toast.error("Patient required");
    if (!form.therapy_name.trim()) return toast.error("Therapy required");
    const N = Math.max(1, Number(numSessions || 1));
    const dur = Math.max(15, Number(perSessionMinutes || 60));

    const { data: plan, error } = await supabase.from("therapy_plans").insert({
      doctor_user_id: userId,
      patient_name: form.patient_name.trim(),
      patient_phone: form.patient_phone || null,
      patient_user_id: form.patient_user_id.trim() || null,
      partner_id: form.partner_id || null,
      therapy_name: form.therapy_name.trim(),
      therapy_code: form.therapy_code || null,
      estimated_price: form.unit_price ? Number(form.unit_price) : null,
      planned_date: startDate || form.planned_date || null,
      duration_days: N,
      notes: form.notes || null,
    }).select("id").single();
    if (error || !plan) return toast.error(error?.message || "Could not create plan");

    // Create one therapy_sessions row per planned session
    const baseDate = startDate ? new Date(startDate) : new Date();
    const rows = Array.from({ length: N }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      return {
        therapy_plan_id: plan.id,
        doctor_user_id: userId,
        therapy_code: form.therapy_code || null,
        therapy_name: form.therapy_name.trim(),
        session_number: i + 1,
        total_sessions_in_plan: N,
        patient_user_id: form.patient_user_id.trim() || null,
        patient_name: form.patient_name.trim(),
        patient_phone: form.patient_phone || null,
        scheduled_date: d.toISOString().slice(0, 10),
        scheduled_start: "09:00:00",
        scheduled_duration_minutes: dur,
        duration_minutes: dur,
        status: "scheduled",
        medicines_prescribed: medicines,
      };
    });
    const { error: sErr } = await supabase.from("therapy_sessions").insert(rows);
    if (sErr) toast.error(`Plan saved, but sessions failed: ${sErr.message}`);

    // Notify patient via WhatsApp (stub)
    if (form.patient_phone) {
      supabase.functions.invoke("send-whatsapp", {
        body: {
          to: form.patient_phone,
          message: `Dr. has prescribed ${form.therapy_name} for ${N} sessions. Tap to choose your therapist and venue.`,
        },
      }).catch(() => {});
    }

    toast.success(`Plan created with ${N} session(s)`);
    setOpen(false);
    setForm({ patient_name: "", patient_phone: "", patient_user_id: "", partner_id: "", therapy_code: "", therapy_name: "", unit_price: "", planned_date: "", duration_days: "1", notes: "" });
    setNumSessions("1"); setPerSessionMinutes("60"); setStartDate(""); setMedicines([]); setProductSearch("");
    load();
  };

  const therapyOptions = AYUSH_THERAPIES.filter((t) => t.system === therapySystem);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("therapy_plans").update({ status }).eq("id", id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">Therapy Plans</h1>
            <p className="text-xs text-muted-foreground">Plan therapies with nearby therapists & Panchakarma theaters.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New Therapy Plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Plan a therapy</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Patient name *</Label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.patient_phone} onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Patient Ayuzee account ID (optional)</Label>
                  <Input value={form.patient_user_id} onChange={(e) => setForm({ ...form, patient_user_id: e.target.value })} placeholder="If linked, plan appears in patient dashboard for Confirm & Pay" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Therapy * (Ayush Benchmark 2026)</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setShowPrice((v) => !v)}>
                      {showPrice ? <><EyeOff className="mr-1 h-3 w-3" /> Hide price</> : <><Eye className="mr-1 h-3 w-3" /> Show price</>}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {AYUSH_SYSTEMS.map((s) => (
                      <Button key={s} type="button" size="sm" variant={therapySystem === s ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setTherapySystem(s)}>{s}</Button>
                    ))}
                  </div>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.therapy_code}
                    onChange={(e) => {
                      const t = findTherapyByCode(e.target.value);
                      setForm({ ...form, therapy_code: e.target.value, therapy_name: t?.name || "", unit_price: t ? String(t.price) : "" });
                    }}
                  >
                    <option value="">— Select therapy ({therapyOptions.length} available) —</option>
                    {therapyOptions.map((t) => (
                      <option key={t.code} value={t.code}>{t.code} · {t.name}{showPrice ? ` — ₹${t.price}` : ""}</option>
                    ))}
                  </select>
                  <Input placeholder="Or type a custom therapy name" value={form.therapy_name} onChange={(e) => setForm({ ...form, therapy_name: e.target.value, therapy_code: "" })} />
                  {showPrice && form.unit_price && (
                    <p className="text-[11px] text-muted-foreground">Benchmark unit cost: <strong className="text-primary">₹{form.unit_price}</strong> (hidable, billing reference only)</p>
                  )}
                </div>
                <div>
                  <Label>Partner</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                    <option value="">— Optional, pick from network —</option>
                    {partners.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.partner_type.replace("_", " ")} · {p.city})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Sessions in plan</Label><Input type="number" min="1" value={numSessions} onChange={(e) => setNumSessions(e.target.value)} /></div>
                  <div><Label>Minutes / session</Label><Input type="number" min="15" step="15" value={perSessionMinutes} onChange={(e) => setPerSessionMinutes(e.target.value)} /></div>
                  <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                </div>
                <div className="rounded-md border p-2">
                  <Label className="text-xs">Medicines to dispatch</Label>
                  <Input placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="mt-1 h-8" />
                  {productResults.length > 0 && (
                    <div className="mt-1 max-h-32 overflow-auto rounded border bg-background">
                      {productResults.map((p) => (
                        <button key={p.id} type="button" className="block w-full px-2 py-1 text-left text-xs hover:bg-accent"
                          onClick={() => { setMedicines((m) => [...m, { product_id: p.id, name: p.name, price: p.price, quantity: 1 }]); setProductSearch(""); setProductResults([]); }}>
                          {p.name} · {p.brand} · ₹{p.price}
                        </button>
                      ))}
                    </div>
                  )}
                  {medicines.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {medicines.map((m, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span className="flex-1 truncate">{m.name}</span>
                          <Input type="number" min="1" value={m.quantity} className="h-6 w-14"
                            onChange={(e) => setMedicines((arr) => arr.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value || 1) } : x))} />
                          <button type="button" className="text-destructive" onClick={() => setMedicines((arr) => arr.filter((_, j) => j !== i))}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit}>Save plan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No therapy plans yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => {
            const partner = partners.find((x) => x.id === p.partner_id);
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.therapy_name}</p>
                    <p className="text-xs text-muted-foreground">{p.patient_name} · {p.duration_days}d</p>
                  </div>
                  <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {p.planned_date && <p>📅 {p.planned_date}</p>}
                  {partner && <p>🏥 {partner.name} · {partner.city}</p>}
                  {p.notes && <p>📝 {p.notes}</p>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapyPlans;
