import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, CalendarDays, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Template = { id: string; name: string; therapy_type: string; total_days: number; description: string | null };
type Stage = {
  id: string; template_id: string; stage_name: string; day_offset: number;
  duration_minutes: number | null; requires_room_type: string | null; sort_order: number;
};
type Patient = { user_id: string; full_name: string | null; phone: string | null };

type Slot = {
  index: number; stage: Stage; scheduled_date: string; scheduled_time: string;
  room_resource: string; conflicts: string[];
};

const DEFAULT_TIME = "09:00";

export default function PanchakarmaSchedule() {
  const nav = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [patientId, setPatientId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setMe(u.user?.id ?? null);
      const [{ data: tpls }, { data: pts }] = await Promise.all([
        supabase.from("panchakarma_course_templates").select("id,name,therapy_type,total_days,description").eq("is_active", true).order("name"),
        supabase.from("profiles").select("user_id,full_name,phone").order("full_name").limit(500),
      ]);
      setTemplates((tpls ?? []) as Template[]);
      setPatients((pts ?? []) as Patient[]);
    })();
  }, []);

  useEffect(() => {
    if (!templateId) { setStages([]); return; }
    (async () => {
      const { data } = await supabase.from("panchakarma_template_stages")
        .select("*").eq("template_id", templateId).order("sort_order");
      setStages((data ?? []) as Stage[]);
    })();
  }, [templateId]);

  // Rebuild slot list whenever template/start date changes
  useEffect(() => {
    if (!stages.length || !startDate) { setSlots([]); setChecked(false); return; }
    const base = new Date(startDate + "T00:00:00");
    setSlots(stages.map((s, i) => {
      const d = new Date(base); d.setDate(base.getDate() + s.day_offset);
      return {
        index: i, stage: s,
        scheduled_date: d.toISOString().slice(0, 10),
        scheduled_time: DEFAULT_TIME,
        room_resource: s.requires_room_type ?? "",
        conflicts: [],
      };
    }));
    setChecked(false);
  }, [stages, startDate]);

  const conflictCount = useMemo(() => slots.reduce((n, s) => n + (s.conflicts.length ? 1 : 0), 0), [slots]);

  const updateSlot = (idx: number, patch: Partial<Slot>) => {
    setSlots(prev => prev.map(s => s.index === idx ? { ...s, ...patch, conflicts: [] } : s));
    setChecked(false);
  };

  const checkConflicts = async () => {
    if (!me || slots.length === 0) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("panchakarma-check-conflicts", {
        body: {
          vaidya_id: me,
          slots: slots.map(s => ({
            index: s.index,
            scheduled_date: s.scheduled_date,
            scheduled_time: s.scheduled_time,
            duration_minutes: s.stage.duration_minutes,
            room_resource: s.room_resource || null,
          })),
        },
      });
      if (error) throw error;
      const map = new Map<number, string[]>();
      for (const c of (data as any).conflicts ?? []) map.set(c.index, c.conflicts);
      setSlots(prev => prev.map(s => ({ ...s, conflicts: map.get(s.index) ?? [] })));
      setChecked(true);
      const total = [...map.values()].filter(v => v.length).length;
      toast[total ? "warning" : "success"](total ? `${total} conflict(s) found` : "No conflicts — ready to confirm");
    } catch (e: any) {
      toast.error(e.message || "Conflict check failed");
    } finally { setChecking(false); }
  };

  const confirm = async () => {
    if (!me || !patientId || !templateId || !slots.length) return;
    if (conflictCount > 0) { toast.error("Resolve conflicts first"); return; }
    setConfirming(true);
    try {
      const { data: booking, error: bErr } = await supabase
        .from("panchakarma_course_bookings")
        .insert({
          patient_id: patientId, vaidya_id: me, template_id: templateId,
          start_date: startDate, status: "scheduled",
        })
        .select("id").single();
      if (bErr) throw bErr;

      const rows = slots.map(s => ({
        booking_id: booking.id,
        stage_id: s.stage.id,
        scheduled_date: s.scheduled_date,
        scheduled_time: s.scheduled_time,
        vaidya_id: me,
        room_resource: s.room_resource || null,
        status: "pending",
      }));
      const { error: sErr } = await supabase.from("panchakarma_sessions").insert(rows);
      if (sErr) {
        // Best-effort rollback
        await supabase.from("panchakarma_course_bookings").delete().eq("id", booking.id);
        throw sErr;
      }
      toast.success("Panchakarma course scheduled");
      nav("/vaidya/panchakarma");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setConfirming(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold">Schedule Panchakarma Course</h1>
        <p className="text-sm text-muted-foreground">Pick a patient and template — dates are auto-calculated from each stage's day offset.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Course setup</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {patients.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.full_name || "Unnamed"} {p.phone ? `· ${p.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Course template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name} ({t.total_days}d)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {slots.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Proposed sessions ({slots.length})
              {checked && conflictCount === 0 && (
                <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> No conflicts
                </Badge>
              )}
              {conflictCount > 0 && (
                <Badge variant="destructive" className="ml-2"><AlertTriangle className="mr-1 h-3 w-3" />{conflictCount} conflict{conflictCount>1?"s":""}</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={checkConflicts} disabled={checking}>
                {checking ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Checking…</> : "Check conflicts"}
              </Button>
              <Button size="sm" variant="hero" onClick={confirm}
                disabled={confirming || !patientId || !checked || conflictCount > 0}>
                {confirming ? "Saving…" : "Confirm & schedule"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {slots.map(s => (
                <div key={s.index}
                  className={`p-4 grid gap-3 md:grid-cols-[1fr,150px,110px,180px] items-start ${s.conflicts.length ? "bg-destructive/5 border-l-4 border-destructive" : ""}`}>
                  <div>
                    <div className="text-sm font-medium">Day {s.stage.day_offset + 1} · {s.stage.stage_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.stage.duration_minutes ? `${s.stage.duration_minutes} min` : "duration TBD"}
                      {s.stage.requires_room_type ? ` · needs ${s.stage.requires_room_type}` : ""}
                    </div>
                    {s.conflicts.length > 0 && (
                      <ul className="mt-2 text-xs text-destructive space-y-0.5">
                        {s.conflicts.map((c, i) => <li key={i}>⚠ {c}</li>)}
                      </ul>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={s.scheduled_date}
                      onChange={e => updateSlot(s.index, { scheduled_date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input type="time" value={s.scheduled_time}
                      onChange={e => updateSlot(s.index, { scheduled_time: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Room</Label>
                    <Input value={s.room_resource} placeholder="e.g. Room 2"
                      onChange={e => updateSlot(s.index, { room_resource: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
