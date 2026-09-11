import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { REHAB_RED_FLAGS } from "@/lib/spineRehabData";
import {
  Save, AlertTriangle, CheckCircle2, ClipboardList, History, Smartphone,
} from "lucide-react";

interface Patient { id: string; patient_name: string; injury_type: string; phase: string; }
interface Followup {
  id: string; patient_name?: string | null; followup_type?: string | null; session_week?: number | null;
  mobility_score?: number | null; pain_score?: number | null; spasticity_score?: number | null;
  adherence_pct?: number | null; red_flags?: string[] | null; needs_referral: boolean;
  progress_note?: string | null; created_at: string;
}

const num = (v: string) => (v === "" ? null : Number(v));
const blank = { patient_id: "", followup_type: "tele", session_week: "", mobility_score: "", pain_score: "", spasticity_score: "", adherence_pct: "", progress_note: "", next_plan: "" };

export default function SpineRehabFollowup() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [form, setForm] = useState({ ...blank });
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: p } = await (supabase.from("spine_injury_patients") as any).select("id, patient_name, injury_type, phase").order("created_at", { ascending: false });
      setPatients((p as Patient[]) || []);
      const { data: f } = await (supabase.from("spine_rehab_followups") as any).select("*").order("created_at", { ascending: false }).limit(30);
      setFollowups((f as Followup[]) || []);
    } catch { setPatients([]); setFollowups([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleFlag = (k: string) => setFlags((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const save = async () => {
    if (!form.patient_id) { toast.error("Select a patient"); return; }
    const pat = patients.find((x) => x.id === form.patient_id);
    const flagLabels = REHAB_RED_FLAGS.filter((r) => flags.has(r.key)).map((r) => r.label);
    const needsReferral = flags.size > 0;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_rehab_followups") as any).insert({
        owner_id: user?.id || null, patient_id: form.patient_id, patient_name: pat?.patient_name || null,
        followup_type: form.followup_type, session_week: num(form.session_week),
        mobility_score: num(form.mobility_score), pain_score: num(form.pain_score), spasticity_score: num(form.spasticity_score),
        adherence_pct: num(form.adherence_pct), red_flags: flagLabels, needs_referral: needsReferral,
        progress_note: form.progress_note || null, next_plan: form.next_plan || null,
      });
      if (error) toast.error("Save failed: " + error.message);
      else {
        // update patient current mobility
        if (form.mobility_score) await (supabase.from("spine_injury_patients") as any).update({ current_mobility: Number(form.mobility_score) }).eq("id", form.patient_id);
        toast.success(needsReferral ? "Follow-up saved — RED FLAG: referral needed" : "Follow-up saved");
        setForm({ ...blank }); setFlags(new Set()); load();
      }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const referralCount = followups.filter((f) => f.needs_referral).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6 text-indigo-600" /> Tele-Rehab Follow-Up</h1>
          <p className="text-muted-foreground mt-1">Remote check-ins with complication red-flag monitoring and outcome tracking.</p>
        </div>
        {referralCount > 0 && <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" /> {referralCount} referral flag(s)</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New follow-up */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><ClipboardList className="h-4 w-4" /> New Follow-Up</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Patient</label>
                <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.patient_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Type</label>
                <Select value={form.followup_type} onValueChange={(v) => setForm({ ...form, followup_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="tele">Tele</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="in_person">In-person</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div><label className="text-xs font-medium">Week</label><Input type="number" value={form.session_week} onChange={(e) => setForm({ ...form, session_week: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Mobility</label><Input type="number" value={form.mobility_score} onChange={(e) => setForm({ ...form, mobility_score: e.target.value })} placeholder="0-10" /></div>
              <div><label className="text-xs font-medium">Pain</label><Input type="number" value={form.pain_score} onChange={(e) => setForm({ ...form, pain_score: e.target.value })} placeholder="0-10" /></div>
              <div><label className="text-xs font-medium">Spasticity</label><Input type="number" value={form.spasticity_score} onChange={(e) => setForm({ ...form, spasticity_score: e.target.value })} placeholder="0-10" /></div>
              <div><label className="text-xs font-medium">Adherence %</label><Input type="number" value={form.adherence_pct} onChange={(e) => setForm({ ...form, adherence_pct: e.target.value })} placeholder="80" /></div>
            </div>

            {/* Red flag checklist */}
            <div>
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5" /> Complication Red Flags (check any present → refer)</p>
              <div className="space-y-1">
                {REHAB_RED_FLAGS.map((r) => {
                  const on = flags.has(r.key);
                  return (
                    <button key={r.key} type="button" onClick={() => toggleFlag(r.key)}
                      className={`w-full flex items-start gap-2 rounded-md border p-2 text-left text-xs transition ${on ? "border-red-300 bg-red-50" : "border-border hover:bg-muted/50"}`}>
                      <span className={`mt-0.5 grid h-4 w-4 place-items-center rounded border shrink-0 ${on ? "bg-red-500 border-red-500" : "border-muted-foreground/40"}`}>{on && <AlertTriangle className="h-3 w-3 text-white" />}</span>
                      <span className="flex-1"><span className={on ? "text-red-800 font-medium" : ""}>{r.label}</span><span className="block text-[10px] text-muted-foreground">{r.action}</span></span>
                    </button>
                  );
                })}
              </div>
            </div>

            {flags.size > 0 && (
              <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-800 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Referral will be flagged on save.</div>
            )}

            <div><label className="text-xs font-medium">Progress Note</label><Textarea value={form.progress_note} onChange={(e) => setForm({ ...form, progress_note: e.target.value })} className="h-14" /></div>
            <div><label className="text-xs font-medium">Next Plan</label><Input value={form.next_plan} onChange={(e) => setForm({ ...form, next_plan: e.target.value })} /></div>
            <Button className={`w-full gap-1 ${flags.size > 0 ? "bg-red-600 hover:bg-red-700" : ""}`} onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Follow-Up"}</Button>
          </CardContent>
        </Card>

        {/* Recent follow-ups */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><History className="h-4 w-4" /> Recent Follow-Ups</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground text-center py-6">Loading...</p> :
              followups.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No follow-ups yet.</p> : (
                <div className="space-y-1.5">
                  {followups.map((f) => (
                    <div key={f.id} className={`rounded-md border p-2.5 ${f.needs_referral ? "border-red-200 bg-red-50/40" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate flex items-center gap-1.5">
                          {f.needs_referral ? <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                          {f.patient_name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{new Date(f.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {f.followup_type} · wk {f.session_week ?? "?"} · mobility {f.mobility_score ?? "-"}/10 · pain {f.pain_score ?? "-"}/10 · adh {f.adherence_pct ?? "-"}%
                      </p>
                      {(f.red_flags && f.red_flags.length > 0) && (
                        <div className="mt-1"><Badge className="bg-red-100 text-red-700 text-[9px]">Referral: {f.red_flags.length} flag(s)</Badge></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
