import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Apple, Activity, Pill, Video, FileText, Plus, Sparkles, Loader2, Send, Trash2,
} from "lucide-react";
import { toast } from "sonner";

type GuidanceType = "diet" | "yoga" | "medicine_schedule" | "video" | "pdf" | "lifestyle";

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  diet: { label: "Diet Plan", icon: Apple, color: "bg-rose-100 text-rose-700 border-rose-200" },
  yoga: { label: "Yoga Protocol", icon: Activity, color: "bg-amber-100 text-amber-700 border-amber-200" },
  medicine_schedule: { label: "Medicine Schedule", icon: Pill, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  lifestyle: { label: "Lifestyle", icon: Sparkles, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  video: { label: "Video Link", icon: Video, color: "bg-violet-100 text-violet-700 border-violet-200" },
  pdf: { label: "PDF / Document", icon: FileText, color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const Guidance = () => {
  const [me, setMe] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // form
  const [type, setType] = useState<GuidanceType>("diet");
  const [appointmentId, setAppointmentId] = useState("");
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [prakriti, setPrakriti] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [content, setContent] = useState<any>({});
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      setMe(auth.user.id);

      const [{ data: g }, { data: appts }] = await Promise.all([
        (supabase as any).from("consultation_guidance")
          .select("*").eq("doctor_user_id", auth.user.id)
          .order("created_at", { ascending: false }).limit(100),
        (supabase as any).from("appointments")
          .select("id, appointment_date, time_slot, user_id, mode, status")
          .eq("doctor_id", auth.user.id)
          .order("appointment_date", { ascending: false }).limit(50),
      ]);
      setItems(g || []);
      setAppointments(appts || []);
      // hydrate patient names
      const userIds = Array.from(new Set([...(g || []).map((x: any) => x.patient_user_id), ...(appts || []).map((x: any) => x.user_id)])).filter(Boolean);
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any).from("profiles").select("user_id, full_name, phone").in("user_id", userIds);
        const map = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setItems((prev) => prev.map((it) => ({ ...it, _patient: map.get(it.patient_user_id) })));
        setAppointments((prev) => prev.map((a) => ({ ...a, _patient: map.get(a.user_id) })));
      }
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setType("diet"); setAppointmentId(""); setTitle(""); setCondition(""); setPrakriti("");
    setNotes(""); setLink(""); setContent({});
  };

  const aiGenerate = async () => {
    if (!["diet", "yoga", "medicine_schedule", "lifestyle"].includes(type)) {
      toast.error("AI generation only for diet, yoga, medicine schedule or lifestyle"); return;
    }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-guidance-generate", {
        body: { guidance_type: type, condition, prakriti, notes },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const plan = data?.plan;
      if (!plan) throw new Error("No plan returned");
      setContent(plan);
      if (plan.title && !title) setTitle(plan.title);
      toast.success("AI draft ready — review & edit");
    } catch (e: any) { toast.error(e.message || "AI generation failed"); }
    finally { setAiBusy(false); }
  };

  const saveGuidance = async () => {
    if (!me) return;
    if (!appointmentId) { toast.error("Pick an appointment / patient"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }

    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;

    setSaving(true);
    try {
      const dbType = ["video", "pdf"].includes(type) ? "other" : type;
      const payload: any = {
        appointment_id: appointmentId,
        doctor_user_id: me,
        patient_user_id: appt.user_id,
        guidance_type: dbType,
        title,
        content: type === "video" ? { url: link, notes } : type === "pdf" ? { url: link, notes } : { ...content, notes: content?.notes || notes },
        schedule: type === "medicine_schedule" ? { items: content?.items || [] } : {},
        sent_via: ["app"],
      };

      const { data: inserted, error } = await (supabase as any)
        .from("consultation_guidance").insert(payload).select().maybeSingle();
      if (error) throw error;

      // WhatsApp notify (best-effort)
      const phone = appt._patient?.phone;
      if (phone) {
        const msg = `Namaste ${appt._patient?.full_name || "Patient"}, your doctor has shared new ${TYPE_META[type].label}: "${title}". Open the Ayuzee app → My Guidance to view it.`;
        try {
          await supabase.functions.invoke("send-whatsapp", { body: { to: phone, message: msg } });
        } catch { /* non-blocking */ }
      }

      setItems((prev) => [{ ...inserted, _patient: appt._patient }, ...prev]);
      toast.success("Guidance shared with patient");
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const removeItem = async (id: string) => {
    if (!confirm("Delete this guidance?")) return;
    const { error } = await (supabase as any).from("consultation_guidance").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Deleted");
  };

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    items.forEach((i) => { (g[i.guidance_type] = g[i.guidance_type] || []).push(i); });
    return g;
  }, [items]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Follow-up Guidance</h1>
          <p className="text-sm text-slate-600">Send diet plans, yoga protocols, medicine schedules and resources to your patients.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> New Guidance</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create guidance</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => { setType(v as GuidanceType); setContent({}); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_META) as GuidanceType[]).map((t) => (
                        <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient appointment</Label>
                  <Select value={appointmentId} onValueChange={setAppointmentId}>
                    <SelectTrigger><SelectValue placeholder="Pick appointment" /></SelectTrigger>
                    <SelectContent>
                      {appointments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {(a._patient?.full_name || "Patient")} · {a.appointment_date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vata-pacifying diet for 2 weeks" />
              </div>

              {["diet", "yoga", "medicine_schedule", "lifestyle"].includes(type) && (
                <Card className="border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Condition (e.g. lower back pain)" value={condition} onChange={(e) => setCondition(e.target.value)} />
                    <Input placeholder="Prakriti (e.g. Vata-Pitta)" value={prakriti} onChange={(e) => setPrakriti(e.target.value)} />
                  </div>
                  <Textarea className="mt-2" rows={2} placeholder="Doctor notes for AI"
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <Button type="button" size="sm" className="mt-2" onClick={aiGenerate} disabled={aiBusy}>
                    {aiBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
                    🧠 AI Generate
                  </Button>
                </Card>
              )}

              {(type === "video" || type === "pdf") && (
                <div>
                  <Label>{type === "video" ? "Video URL" : "PDF URL"}</Label>
                  <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
                  <Textarea className="mt-2" rows={3} placeholder="Notes for the patient"
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              )}

              {/* Diet preview */}
              {type === "diet" && content?.do_eat && (
                <Card className="p-3 text-xs">
                  <p className="font-semibold text-emerald-700">Eat: <span className="font-normal text-slate-700">{(content.do_eat || []).join(", ")}</span></p>
                  <p className="mt-1 font-semibold text-rose-700">Avoid: <span className="font-normal text-slate-700">{(content.avoid || []).join(", ")}</span></p>
                  {Array.isArray(content.meal_plan) && content.meal_plan.map((m: any, i: number) => (
                    <div key={i} className="mt-1"><span className="font-medium capitalize">{m.meal}:</span> {m.suggestions?.join(", ")}</div>
                  ))}
                </Card>
              )}
              {type === "yoga" && content?.asanas && (
                <Card className="p-3 text-xs">
                  <p className="font-semibold text-amber-700">Asanas:</p>
                  <div className="mt-1 flex flex-wrap gap-1">{(content.asanas || []).map((a: string, i: number) => <Badge key={i} variant="secondary">{a}</Badge>)}</div>
                  {content.pranayama?.length ? <><p className="mt-2 font-semibold text-amber-700">Pranayama:</p><p>{content.pranayama.join(", ")}</p></> : null}
                  {content.duration_minutes && <p className="mt-1">Duration: {content.duration_minutes}</p>}
                </Card>
              )}
              {type === "medicine_schedule" && Array.isArray(content?.items) && (
                <Card className="p-3 text-xs space-y-1">
                  {content.items.map((it: any, i: number) => (
                    <div key={i} className="flex flex-wrap items-center gap-1">
                      <span className="font-medium">{it.name}</span>
                      <span className="text-slate-600">— {it.dose}</span>
                      {(it.times || []).map((t: string, j: number) => <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>)}
                    </div>
                  ))}
                </Card>
              )}

              {(content?.notes || notes) && type !== "video" && type !== "pdf" && (
                <Textarea rows={3} value={content?.notes ?? notes}
                  onChange={(e) => content?.notes !== undefined
                    ? setContent({ ...content, notes: e.target.value })
                    : setNotes(e.target.value)}
                  placeholder="Additional notes" />
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveGuidance} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Save & send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No guidance yet. Click "New Guidance" to create your first plan.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((it) => {
            const meta = TYPE_META[it.guidance_type] || TYPE_META.lifestyle;
            const Icon = meta.icon;
            return (
              <Card key={it.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-9 w-9 place-items-center rounded-md border ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{it.title}</p>
                      <p className="text-xs text-slate-500">{meta.label} · {it._patient?.full_name || "Patient"}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
                {it.content?.notes && <p className="text-xs text-slate-600 line-clamp-2">{it.content.notes}</p>}
                <p className="mt-2 text-[11px] text-slate-400">
                  {new Date(it.created_at).toLocaleDateString()} · {it.acknowledged ? "✅ Acknowledged" : "Sent"}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Guidance;
