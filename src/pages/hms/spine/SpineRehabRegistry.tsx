import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { REHAB_PROTOCOLS, getRehabProtocol, REHAB_REFERENCES, INJURY_TYPE_LABEL } from "@/lib/spineRehabData";
import {
  Accessibility, UserPlus, Save, ShieldCheck, HeartHandshake, Activity,
  Leaf, Users, ExternalLink, ArrowLeft, ClipboardList, ArrowRight,
} from "lucide-react";

interface Patient {
  id: string;
  patient_name: string;
  age?: number | null;
  gender?: string | null;
  injury_type: string;
  injury_level?: string | null;
  phase: string;
  assigned_protocol?: string | null;
  is_csr_sponsored?: boolean;
  status: string;
  baseline_mobility?: number | null;
  current_mobility?: number | null;
}

const blank = { patient_name: "", phone: "", age: "", gender: "male", injury_type: "post_op", injury_level: "", asia_grade: "", phase: "sub_acute", injury_date: "", referred_by: "", goals: "", assigned_protocol: "post_op", is_csr_sponsored: false, baseline_mobility: "" };

export default function SpineRehabRegistry() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [viewProtocol, setViewProtocol] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_injury_patients") as any).select("*").order("created_at", { ascending: false });
      setPatients((data as Patient[]) || []);
    } catch { setPatients([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.patient_name) { toast.error("Enter patient name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_injury_patients") as any).insert({
        owner_id: user?.id || null, patient_name: form.patient_name, phone: form.phone || null,
        age: form.age ? parseInt(form.age) : null, gender: form.gender,
        injury_type: form.injury_type, injury_level: form.injury_level || null, asia_grade: form.asia_grade || null,
        phase: form.phase, injury_date: form.injury_date || null, referred_by: form.referred_by || null,
        goals: form.goals || null, assigned_protocol: form.assigned_protocol,
        is_csr_sponsored: form.is_csr_sponsored, status: "active",
        baseline_mobility: form.baseline_mobility ? parseInt(form.baseline_mobility) : null,
        current_mobility: form.baseline_mobility ? parseInt(form.baseline_mobility) : null,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Patient enrolled in rehab registry"); setForm({ ...blank }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const proto = viewProtocol ? getRehabProtocol(viewProtocol) : null;

  // Protocol detail view
  if (proto) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => setViewProtocol(null)} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{proto.title}</CardTitle><p className="text-xs text-muted-foreground">{proto.scope}</p></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{proto.overview}</p>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Phased Milestones</p>
              <div className="space-y-2">
                {proto.phases.map((ph, i) => (
                  <div key={i} className="rounded-md border p-2.5">
                    <div className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-700 text-[9px]">{ph.window}</Badge><span className="text-sm font-medium">{ph.phase}</span></div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{ph.focus}</p>
                    <ul className="mt-1 space-y-0.5">{ph.milestones.map((m, j) => <li key={j} className="text-xs text-muted-foreground flex gap-1"><span className="text-blue-500">•</span> {m}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs font-semibold flex items-center gap-1 text-green-700"><Leaf className="h-3.5 w-3.5" /> Integrative (AYUSH)</p><ul className="mt-1 space-y-0.5">{proto.integrative.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-500">•</span> {s}</li>)}</ul></div>
              <div><p className="text-xs font-semibold flex items-center gap-1 text-amber-700"><Users className="h-3.5 w-3.5" /> Caregiver Tasks</p><ul className="mt-1 space-y-0.5">{proto.caregiver.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-amber-500">•</span> {s}</li>)}</ul></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const csrCount = patients.filter((p) => p.is_csr_sponsored).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Accessibility className="h-6 w-6 text-blue-600" /> Spinal Injury Rehab Registry</h1>
          <p className="text-muted-foreground mt-1">Sub-acute & chronic rehabilitation with phased protocols and long-term follow-up.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1"><UserPlus className="h-4 w-4" /> Enroll Patient</Button>
      </div>

      {/* Clinical guardrail */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Scope & safety</p>
            <p className="mt-1">This module supports <b>sub-acute and chronic rehabilitation</b> and integrative supportive care — an adjunct to neurosurgical / rehabilitation-medicine care, not acute emergency management. Always screen complication red flags (see Follow-Up) and refer when indicated.</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-blue-600">{patients.length}</p><p className="text-xs text-muted-foreground">Rehab Patients</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{patients.filter((p) => p.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-rose-600 flex items-center justify-center gap-1"><HeartHandshake className="h-5 w-5" />{csrCount}</p><p className="text-xs text-muted-foreground">CSR Sponsored</p></CardContent></Card>
      </div>

      {/* Enroll form */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Enroll Rehab Patient</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Name</label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Phone</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." /></div>
              <div><label className="text-xs font-medium">Age</label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Gender</label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Injury Type</label>
                <Select value={form.injury_type} onValueChange={(v) => setForm({ ...form, injury_type: v, assigned_protocol: v === "sci" ? "sci" : v === "post_op" ? "post_op" : "neuro_rehab" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(INJURY_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Injury Level</label><Input value={form.injury_level} onChange={(e) => setForm({ ...form, injury_level: e.target.value })} placeholder="e.g. T12" /></div>
              <div><label className="text-xs font-medium">ASIA Grade</label><Input value={form.asia_grade} onChange={(e) => setForm({ ...form, asia_grade: e.target.value })} placeholder="A-E (optional)" /></div>
              <div><label className="text-xs font-medium">Phase</label>
                <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sub_acute">Sub-acute</SelectItem><SelectItem value="chronic">Chronic</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Protocol</label>
                <Select value={form.assigned_protocol} onValueChange={(v) => setForm({ ...form, assigned_protocol: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REHAB_PROTOCOLS.map((p) => <SelectItem key={p.key} value={p.key}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Injury Date</label><Input type="date" value={form.injury_date} onChange={(e) => setForm({ ...form, injury_date: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Referred By</label><Input value={form.referred_by} onChange={(e) => setForm({ ...form, referred_by: e.target.value })} placeholder="Hospital/doctor" /></div>
              <div><label className="text-xs font-medium">Baseline Mobility (0-10)</label><Input type="number" value={form.baseline_mobility} onChange={(e) => setForm({ ...form, baseline_mobility: e.target.value })} /></div>
            </div>
            <div><label className="text-xs font-medium">Goals</label><Textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} className="h-14" placeholder="Rehab goals..." /></div>
            <button onClick={() => setForm({ ...form, is_csr_sponsored: !form.is_csr_sponsored })} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium ${form.is_csr_sponsored ? "border-rose-400 bg-rose-50 text-rose-700" : "border-border"}`}>
              <HeartHandshake className="h-3.5 w-3.5" /> {form.is_csr_sponsored ? "CSR Sponsored ✓" : "Mark CSR Sponsored"}
            </button>
            <Button className="w-full gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Enrolling..." : "Enroll Patient"}</Button>
          </CardContent>
        </Card>
      )}

      {/* Protocol library quick access */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Rehab Protocols</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REHAB_PROTOCOLS.map((p) => (
            <Card key={p.key} className="cursor-pointer hover:shadow-md hover:border-blue-300 transition" onClick={() => setViewProtocol(p.key)}>
              <CardContent className="pt-4">
                <Activity className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-sm mt-1">{p.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{p.scope}</p>
                <p className="text-[11px] text-blue-600 mt-2 flex items-center gap-1">View phases <ArrowRight className="h-3 w-3" /></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Registry</h2>
        {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
          patients.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No rehab patients enrolled yet.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <Card key={p.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-sm flex items-center gap-2">
                        {p.patient_name}
                        {p.is_csr_sponsored && <Badge className="bg-rose-100 text-rose-700 text-[9px]"><HeartHandshake className="h-2.5 w-2.5 mr-0.5" /> CSR</Badge>}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{INJURY_TYPE_LABEL[p.injury_type] || p.injury_type}{p.injury_level ? ` · ${p.injury_level}` : ""} · {p.phase}{p.age ? ` · ${p.age}y` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={p.status === "active" ? "bg-green-100 text-green-700 text-[9px]" : "bg-muted text-muted-foreground text-[9px]"}>{p.status}</Badge>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => navigate("/hms/spine-rehab-followup")}><ClipboardList className="h-3.5 w-3.5" /> Follow-up</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>

      {/* References */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">References</p>
          <div className="space-y-1">{REHAB_REFERENCES.map((r) => <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {r.label}</a>)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
