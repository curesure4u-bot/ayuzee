import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, X, AlertTriangle, CheckCircle2, Circle } from "lucide-react";

type Corpus = {
  id: string;
  balance: number;
  total_received: number;
  total_spent: number;
  monthly_case_limit: number;
  cases_this_month: number;
  minimum_balance_alert: number;
  notes: string | null;
};

type Case = any;
type Pledge = any;
type Hospital = any;
type Update = any;

const STATUS_TABS = ["all", "submitted", "under_review", "doctor_assigned", "approved", "in_treatment", "completed", "cancelled"];

const statusColor = (s: string) => {
  switch (s) {
    case "submitted": return "bg-muted text-foreground";
    case "under_review": return "bg-amber-100 text-amber-800";
    case "doctor_assigned": return "bg-blue-100 text-blue-800";
    case "approved": return "bg-green-100 text-green-800";
    case "in_treatment": return "bg-primary/15 text-primary";
    case "completed": return "bg-emerald-100 text-emerald-800";
    case "cancelled": return "bg-destructive/15 text-destructive";
    default: return "bg-muted";
  }
};

export default function AdminAtmriHelp() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "corpus";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">🌿 ATMRI Trust — Model 3 Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage corpus, sponsored cases, doctor pledges, partner hospitals and case updates.</p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="corpus">💰 Corpus</TabsTrigger>
          <TabsTrigger value="cases">🩺 Cases</TabsTrigger>
          <TabsTrigger value="doctors">🏅 Doctors</TabsTrigger>
          <TabsTrigger value="hospitals">🏥 Hospitals</TabsTrigger>
          <TabsTrigger value="updates">📢 Updates</TabsTrigger>
        </TabsList>
        <TabsContent value="corpus" className="mt-6"><CorpusTab /></TabsContent>
        <TabsContent value="cases" className="mt-6"><CasesTab /></TabsContent>
        <TabsContent value="doctors" className="mt-6"><DoctorsTab /></TabsContent>
        <TabsContent value="hospitals" className="mt-6"><HospitalsTab /></TabsContent>
        <TabsContent value="updates" className="mt-6"><UpdatesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────── CORPUS TAB ───────────────────────
function CorpusTab() {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [loading, setLoading] = useState(true);
  const [balOpen, setBalOpen] = useState(false);
  const [limOpen, setLimOpen] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [reason, setReason] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newAlert, setNewAlert] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("atmri_trust_corpus").select("*").limit(1).maybeSingle();
    setCorpus(data as Corpus);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!corpus) return <Card className="p-6">No corpus record found.</Card>;

  const lowBalance = corpus.balance < corpus.minimum_balance_alert;
  const ratio = Math.min(1, corpus.balance / Math.max(corpus.minimum_balance_alert * 4, 1));
  const circumference = 2 * Math.PI * 70;
  const strokeOffset = circumference * (1 - ratio);

  const updateBalance = async () => {
    const amt = Number(newBalance);
    if (!amt) return toast.error("Enter a valid amount");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("atmri_trust_corpus").update({
      balance: corpus.balance + amt,
      total_received: corpus.total_received + amt,
      notes: reason ? `${corpus.notes || ""}\n[${new Date().toISOString().slice(0,10)}] +₹${amt} — ${reason}`.trim() : corpus.notes,
      last_updated_by: u.user?.id,
      last_updated_at: new Date().toISOString(),
    }).eq("id", corpus.id);
    if (error) return toast.error(error.message);
    toast.success("Balance updated ✓");
    setBalOpen(false); setNewBalance(""); setReason(""); load();
  };

  const updateLimits = async () => {
    const lim = Number(newLimit) || corpus.monthly_case_limit;
    const al = Number(newAlert) || corpus.minimum_balance_alert;
    const { error } = await supabase.from("atmri_trust_corpus").update({
      monthly_case_limit: lim, minimum_balance_alert: al, last_updated_at: new Date().toISOString(),
    }).eq("id", corpus.id);
    if (error) return toast.error(error.message);
    toast.success("Limits updated ✓");
    setLimOpen(false); load();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
          <div className="relative w-[180px] h-[180px] mx-auto">
            <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
              <circle cx="90" cy="90" r="70" stroke="hsl(var(--muted))" strokeWidth="14" fill="none" />
              <circle cx="90" cy="90" r="70" stroke={lowBalance ? "hsl(var(--destructive))" : "hsl(var(--primary))"} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset} />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="font-display text-2xl text-primary">₹{corpus.balance.toLocaleString("en-IN")}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Available</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total received" value={`₹${corpus.total_received.toLocaleString("en-IN")}`} />
            <Stat label="Total spent" value={`₹${corpus.total_spent.toLocaleString("en-IN")}`} />
            <Stat label="Cases this month" value={`${corpus.cases_this_month}/${corpus.monthly_case_limit}`} />
            <Stat label="Minimum alert" value={`₹${corpus.minimum_balance_alert.toLocaleString("en-IN")}`} />
          </div>
        </div>

        {lowBalance && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">⚠️ Corpus below minimum threshold of ₹{corpus.minimum_balance_alert.toLocaleString("en-IN")}.</p>
              <p className="text-muted-foreground mt-1">New Model 3 cases are PAUSED until corpus is replenished. Contact trustees to add funds.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <Dialog open={balOpen} onOpenChange={setBalOpen}>
            <DialogTrigger asChild><Button>💰 Update Balance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add to corpus</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><label className="text-sm">Amount to add (₹)</label><Input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="50000" /></div>
                <div><label className="text-sm">Reason / source</label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="CSR donation from XYZ Corp" /></div>
              </div>
              <DialogFooter><Button onClick={updateBalance}>Update</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={limOpen} onOpenChange={setLimOpen}>
            <DialogTrigger asChild><Button variant="outline">📊 Set Monthly Limit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Set thresholds</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><label className="text-sm">Monthly case limit</label><Input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder={String(corpus.monthly_case_limit)} /></div>
                <div><label className="text-sm">Minimum balance alert (₹)</label><Input type="number" value={newAlert} onChange={(e) => setNewAlert(e.target.value)} placeholder={String(corpus.minimum_balance_alert)} /></div>
              </div>
              <DialogFooter><Button onClick={updateLimits}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-display text-xl mt-1">{value}</div>
  </div>
);

// ─────────────────────── CASES TAB ───────────────────────
function CasesTab() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Case | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("atmri_sponsored_cases").select("*, doctors:assigned_doctor_id(id,full_name,specialization)").order("created_at", { ascending: false });
    setCases(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === "all" ? cases : cases.filter((c) => c.status === filter), [cases, filter]);

  const checkpointCount = (c: Case) =>
    [c.checkpoint_doctor_signed, c.checkpoint_documents_verified, c.checkpoint_video_verified, c.checkpoint_corpus_allocated, c.checkpoint_hospital_confirmed].filter(Boolean).length;

  const daysSince = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Condition</th>
                <th className="text-left p-3">City</th>
                <th className="text-left p-3">Urgent</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Doctor</th>
                <th className="text-left p-3">Corpus (₹)</th>
                <th className="text-left p-3">Checkpoints</th>
                <th className="text-left p-3">Days</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{c.patient_name}</td>
                  <td className="p-3">{c.condition_name}</td>
                  <td className="p-3 text-muted-foreground">{c.patient_city}</td>
                  <td className="p-3">{c.is_urgent ? <Badge variant="destructive">URGENT</Badge> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-3"><Badge className={statusColor(c.status)}>{c.status?.replace(/_/g, " ")}</Badge></td>
                  <td className="p-3 text-xs">{c.doctors?.full_name || <span className="text-muted-foreground">Unassigned</span>}</td>
                  <td className="p-3">₹{Number(c.corpus_amount_allocated || 0).toLocaleString("en-IN")}</td>
                  <td className="p-3">{checkpointCount(c)}/5</td>
                  <td className="p-3 text-xs text-muted-foreground">{daysSince(c.created_at)}d</td>
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => setSelected(c)}>Review</Button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No cases match this filter.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {selected && <CaseSlidePanel caseData={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </div>
  );
}

// ─────────────────────── CASE SLIDE PANEL ───────────────────────
function CaseSlidePanel({ caseData, onClose, onSaved }: { caseData: Case; onClose: () => void; onSaved: () => void }) {
  const [c, setC] = useState<Case>(caseData);
  const [pledgedDoctors, setPledgedDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctorId, setDoctorId] = useState<string>("");
  const [hospitalId, setHospitalId] = useState<string>(c.partner_hospital_id || "");
  const [docFee, setDocFee] = useState(String(c.doctor_fee_waived || 0));
  const [medFee, setMedFee] = useState(String(c.medicines_cost || 0));
  const [thFee, setThFee] = useState(String(c.therapy_sessions_cost || 0));
  const [trFee, setTrFee] = useState(String(c.transport_allowance || 0));
  const [videoUrl, setVideoUrl] = useState(c.video_call_recording_url || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: pds } = await supabase
        .from("doctor_charity_pledges")
        .select("*, doctors:doctor_id(id,full_name,specialization,consultation_fee)")
        .eq("is_active", true);
      setPledgedDoctors((pds || []).filter((p: any) => (p.used_this_month || 0) < (p.pledged_consultations_per_month || 0)));
      const { data: hs } = await supabase.from("atmri_partner_hospitals").select("*").eq("is_active", true);
      setHospitals(hs || []);
    })();
  }, []);

  const total = Number(docFee || 0) + Number(medFee || 0) + Number(thFee || 0) + Number(trFee || 0);
  const checkpoints = [
    { key: "checkpoint_doctor_signed", label: "Doctor signed" },
    { key: "checkpoint_documents_verified", label: "Medical documents verified" },
    { key: "checkpoint_video_verified", label: "Video call done" },
    { key: "checkpoint_corpus_allocated", label: "Corpus allocated" },
    { key: "checkpoint_hospital_confirmed", label: "Hospital confirmed" },
  ];
  const checkedCount = checkpoints.filter((cp) => c[cp.key]).length;

  const toggleCheckpoint = async (key: string) => {
    const next = !c[key];
    const { error } = await supabase.from("atmri_sponsored_cases").update({ [key]: next, updated_at: new Date().toISOString() }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setC({ ...c, [key]: next });
  };

  const saveVideo = async () => {
    const { error } = await supabase.from("atmri_sponsored_cases").update({
      video_call_recording_url: videoUrl, checkpoint_video_verified: !!videoUrl, updated_at: new Date().toISOString(),
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setC({ ...c, video_call_recording_url: videoUrl, checkpoint_video_verified: !!videoUrl });
    toast.success("Video info saved");
  };

  const assignDoctor = async () => {
    if (!doctorId) return toast.error("Pick a doctor");
    const pledge = pledgedDoctors.find((p) => p.doctor_id === doctorId);
    if (!pledge) return;
    const { error } = await supabase.from("atmri_sponsored_cases").update({
      assigned_doctor_id: pledge.doctor_id,
      assigned_doctor_user_id: pledge.doctor_user_id,
      status: "doctor_assigned",
      updated_at: new Date().toISOString(),
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(`Assigned to Dr. ${pledge.doctors?.full_name}`);
    setC({ ...c, assigned_doctor_id: pledge.doctor_id, assigned_doctor_user_id: pledge.doctor_user_id, status: "doctor_assigned" });
    onSaved();
  };

  const confirmHospital = async () => {
    const h = hospitals.find((x) => x.id === hospitalId);
    if (!h) return;
    const loc = `${h.hospital_name}, ${h.city}`;
    const { error } = await supabase.from("atmri_sponsored_cases").update({
      partner_hospital_id: h.id, treatment_location: loc, checkpoint_hospital_confirmed: true, updated_at: new Date().toISOString(),
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    setC({ ...c, partner_hospital_id: h.id, treatment_location: loc, checkpoint_hospital_confirmed: true });
    toast.success("Hospital confirmed");
  };

  const saveCosts = async () => {
    setSaving(true);
    const { data: corpus } = await supabase.from("atmri_trust_corpus").select("balance,monthly_case_limit,cases_this_month").limit(1).maybeSingle();
    if (corpus && total > corpus.balance && (corpus.cases_this_month >= corpus.monthly_case_limit)) {
      setSaving(false);
      return toast.error("⚠️ Insufficient corpus or monthly limit reached.");
    }
    const { error } = await supabase.from("atmri_sponsored_cases").update({
      doctor_fee_waived: Number(docFee),
      medicines_cost: Number(medFee),
      therapy_sessions_cost: Number(thFee),
      transport_allowance: Number(trFee),
      corpus_amount_allocated: total,
      checkpoint_corpus_allocated: total > 0,
      updated_at: new Date().toISOString(),
    }).eq("id", c.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setC({ ...c, doctor_fee_waived: Number(docFee), medicines_cost: Number(medFee), therapy_sessions_cost: Number(thFee), transport_allowance: Number(trFee), corpus_amount_allocated: total, checkpoint_corpus_allocated: total > 0 });
    toast.success("Costs saved");
  };

  const approve = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("atmri_sponsored_cases").update({
      status: "approved", approved_by_1: u.user?.id, approved_at_1: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    await supabase.from("atmri_case_updates").insert({
      case_id: c.id, update_type: "treatment_started", is_public: true,
      update_text: `${c.patient_name}'s treatment has been approved by ATMRI Trust. Treatment begins shortly.`,
      posted_by: u.user?.id,
    });
    toast.success("✅ Case approved & treatment started");
    onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm" onClick={onClose}>
      <div className="fixed right-0 top-0 h-screen w-full max-w-[540px] bg-card border-l shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b flex items-center justify-between p-4">
          <div>
            <h2 className="font-display text-lg">{c.patient_name}</h2>
            <Badge className={statusColor(c.status)}>{c.status?.replace(/_/g, " ")}</Badge>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="p-5 space-y-6">
          {/* Patient info */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Patient</h3>
            <Card className="p-4 space-y-2 text-sm">
              <div><strong>{c.patient_name}</strong> · {c.patient_age || "?"} · {c.patient_gender || "?"}</div>
              <div className="text-muted-foreground">{c.patient_city}, {c.patient_state}</div>
              <div className="text-xs"><strong>Condition:</strong> {c.condition_name}</div>
              <p className="text-xs text-muted-foreground line-clamp-6 mt-2">{c.patient_story}</p>
              {c.medical_report_urls?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.medical_report_urls.map((u: string, i: number) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="text-xs text-primary underline">📄 Report {i + 1}</a>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* Checkpoints */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Verification ({checkedCount}/5)</h3>
            <Card className="p-4 space-y-2">
              {checkpoints.map((cp) => (
                <button key={cp.key} onClick={() => toggleCheckpoint(cp.key)} className="w-full flex items-center gap-3 text-sm hover:bg-muted/30 rounded-md p-2 -mx-2">
                  {c[cp.key] ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                  <span className={c[cp.key] ? "" : "text-muted-foreground"}>{cp.label}</span>
                </button>
              ))}
              <div className="pt-2">
                <label className="text-xs text-muted-foreground">Video call recording URL</label>
                <div className="flex gap-2 mt-1">
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
                  <Button size="sm" onClick={saveVideo}>Save</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{checkedCount}/5 complete. Approval enabled when all 5 are checked.</p>
            </Card>
          </section>

          {/* Doctor Assignment */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Doctor Assignment</h3>
            <Card className="p-4 space-y-2">
              {c.assigned_doctor_id ? (
                <p className="text-sm">Assigned to <strong>Dr. {c.doctors?.full_name || "—"}</strong></p>
              ) : (
                <>
                  <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger><SelectValue placeholder="Choose a pledged doctor" /></SelectTrigger>
                    <SelectContent>
                      {pledgedDoctors.map((p) => (
                        <SelectItem key={p.doctor_id} value={p.doctor_id}>
                          Dr. {p.doctors?.full_name} — {p.doctors?.specialization} — {(p.pledged_consultations_per_month - p.used_this_month)} slots left
                        </SelectItem>
                      ))}
                      {pledgedDoctors.length === 0 && <div className="p-2 text-xs text-muted-foreground">No doctors with available slots.</div>}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={assignDoctor} disabled={!doctorId}>Assign</Button>
                </>
              )}
            </Card>
          </section>

          {/* Treatment Setup */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Treatment Setup</h3>
            <Card className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Partner hospital</label>
                <div className="flex gap-2 mt-1">
                  <Select value={hospitalId} onValueChange={setHospitalId}>
                    <SelectTrigger><SelectValue placeholder="Pick a hospital" /></SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.hospital_name} — {h.city} ({h.discount_percent || 0}% off)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={confirmHospital} disabled={!hospitalId}>Confirm</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs">Doctor fee waived (₹)</label><Input type="number" value={docFee} onChange={(e) => setDocFee(e.target.value)} /></div>
                <div><label className="text-xs">Medicines (₹)</label><Input type="number" value={medFee} onChange={(e) => setMedFee(e.target.value)} /></div>
                <div><label className="text-xs">Therapy sessions (₹)</label><Input type="number" value={thFee} onChange={(e) => setThFee(e.target.value)} /></div>
                <div><label className="text-xs">Transport (₹)</label><Input type="number" value={trFee} onChange={(e) => setTrFee(e.target.value)} /></div>
              </div>

              <div className="text-sm font-semibold flex justify-between border-t pt-2">
                <span>Total corpus to allocate:</span><span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <Button onClick={saveCosts} disabled={saving} className="w-full">{saving ? "Saving…" : "Save Costs"}</Button>
            </Card>
          </section>

          {/* Approve */}
          {checkedCount === 5 && c.status !== "approved" && c.status !== "in_treatment" && c.status !== "completed" && (
            <Button onClick={approve} className="w-full" size="lg">✅ Approve & Begin Treatment</Button>
          )}
          {checkedCount < 5 && (
            <p className="text-xs text-muted-foreground text-center">Complete all 5 checkpoints to enable approval.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── DOCTORS TAB ───────────────────────
function DoctorsTab() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("doctor_charity_pledges")
      .select("*, doctors:doctor_id(full_name,specialization,id)")
      .order("created_at", { ascending: false });
    setPledges(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resetMonthly = async () => {
    const { error } = await supabase.from("doctor_charity_pledges").update({ used_this_month: 0, updated_at: new Date().toISOString() }).neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return toast.error(error.message);
    toast.success("Monthly counts reset");
    load();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{pledges.length} pledged doctors</p>
        <Button variant="outline" onClick={resetMonthly}>🔄 Reset Monthly Counts</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">Specialization</th>
              <th className="text-left p-3">Pledged/mo</th>
              <th className="text-left p-3">Used</th>
              <th className="text-left p-3">Total donated</th>
              <th className="text-left p-3">Fee value (₹)</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pledges.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">Dr. {p.doctors?.full_name || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.doctors?.specialization || "—"}</td>
                <td className="p-3">{p.pledged_consultations_per_month}</td>
                <td className="p-3">{p.used_this_month}/{p.pledged_consultations_per_month}</td>
                <td className="p-3">{p.total_consultations_donated}</td>
                <td className="p-3">₹{Number(p.total_fee_value_donated || 0).toLocaleString("en-IN")}</td>
                <td className="p-3">{p.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Paused</Badge>}</td>
              </tr>
            ))}
            {pledges.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No pledges yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─────────────────────── HOSPITALS TAB ───────────────────────
function HospitalsTab() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    hospital_name: "", hospital_type: "ayurveda", address: "", city: "", state: "",
    contact_name: "", contact_phone: "", contact_email: "",
    discount_percent: 0, beds_reserved_for_atmri: 0, mou_signed_date: "", mou_expiry_date: "", notes: "",
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("atmri_partner_hospitals").select("*").order("city");
    setHospitals(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const expiryColor = (d: string | null) => {
    if (!d) return "bg-muted text-foreground";
    const days = Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
    if (days < 30) return "bg-destructive/15 text-destructive";
    if (days < 60) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  const submit = async () => {
    if (!form.hospital_name || !form.city || !form.state || !form.address) return toast.error("Fill required fields");
    const { error } = await supabase.from("atmri_partner_hospitals").insert({
      ...form,
      discount_percent: Number(form.discount_percent) || 0,
      beds_reserved_for_atmri: Number(form.beds_reserved_for_atmri) || 0,
      mou_signed_date: form.mou_signed_date || null,
      mou_expiry_date: form.mou_expiry_date || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Hospital added ✓");
    setOpen(false); load();
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{hospitals.length} partner hospitals</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Add Partner Hospital</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New partner hospital</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Hospital name *" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} />
              <Select value={form.hospital_type} onValueChange={(v) => setForm({ ...form, hospital_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ayurveda", "panchakarma", "integrative", "naturopathy", "homeopathy", "multi"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <Textarea className="col-span-2" placeholder="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Input placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              <Input placeholder="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              <Input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input type="number" placeholder="Discount %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              <Input type="number" placeholder="Beds reserved" value={form.beds_reserved_for_atmri} onChange={(e) => setForm({ ...form, beds_reserved_for_atmri: e.target.value })} />
              <Input type="date" placeholder="MOU signed" value={form.mou_signed_date} onChange={(e) => setForm({ ...form, mou_signed_date: e.target.value })} />
              <Input type="date" placeholder="MOU expiry" value={form.mou_expiry_date} onChange={(e) => setForm({ ...form, mou_expiry_date: e.target.value })} />
              <Textarea className="col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter><Button onClick={submit}>Add hospital</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((h) => (
          <Card key={h.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{h.hospital_name}</h3>
              <Badge variant="outline">{h.hospital_type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">📍 {h.city}, {h.state}</p>
            {h.contact_name && <p className="text-xs">Contact: {h.contact_name}</p>}
            <div className="flex flex-wrap gap-1 pt-2">
              {h.mou_expiry_date && <Badge className={expiryColor(h.mou_expiry_date)}>MOU expires {h.mou_expiry_date}</Badge>}
              {h.discount_percent > 0 && <Badge className="bg-amber-100 text-amber-800">{h.discount_percent}% off</Badge>}
              {h.beds_reserved_for_atmri > 0 && <Badge className="bg-blue-100 text-blue-800">{h.beds_reserved_for_atmri} beds</Badge>}
            </div>
          </Card>
        ))}
        {hospitals.length === 0 && <Card className="p-8 text-center text-muted-foreground col-span-full">No partner hospitals yet.</Card>}
      </div>
    </div>
  );
}

// ─────────────────────── UPDATES TAB ───────────────────────
function UpdatesTab() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ case_id: "", update_type: "milestone", update_text: "", is_public: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("atmri_case_updates")
      .select("*, atmri_sponsored_cases:case_id(patient_name)")
      .order("created_at", { ascending: false })
      .limit(20);
    setUpdates(data || []);
    const { data: cs } = await supabase.from("atmri_sponsored_cases").select("id,patient_name").order("created_at", { ascending: false });
    setCases(cs || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.case_id || !form.update_text) return toast.error("Fill case and update text");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("atmri_case_updates").insert({ ...form, posted_by: u.user?.id });
    if (error) return toast.error(error.message);
    toast.success("Update posted ✓");
    setOpen(false); setForm({ case_id: "", update_type: "milestone", update_text: "", is_public: true }); load();
  };

  const togglePublic = async (id: string, current: boolean) => {
    const { error } = await supabase.from("atmri_case_updates").update({ is_public: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    setUpdates(updates.map((u) => u.id === id ? { ...u, is_public: !current } : u));
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Last 20 case updates</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Post Case Update</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New case update</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.case_id} onValueChange={(v) => setForm({ ...form, case_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick case" /></SelectTrigger>
                <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.patient_name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.update_type} onValueChange={(v) => setForm({ ...form, update_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["doctor_assigned", "treatment_started", "session_completed", "medicine_dispatched", "milestone", "completed", "thank_you"].map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Update text" value={form.update_text} onChange={(e) => setForm({ ...form, update_text: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} /> Public on case page</label>
            </div>
            <DialogFooter><Button onClick={submit}>Post</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {updates.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex gap-2 items-center text-xs text-muted-foreground">
                  <Badge variant="outline">{u.update_type?.replace(/_/g, " ")}</Badge>
                  <span>{u.atmri_sponsored_cases?.patient_name}</span>
                  <span>·</span>
                  <span>{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mt-2">{u.update_text}</p>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={u.is_public} onCheckedChange={() => togglePublic(u.id, u.is_public)} />
                Public
              </label>
            </div>
          </Card>
        ))}
        {updates.length === 0 && <Card className="p-8 text-center text-muted-foreground">No updates yet.</Card>}
      </div>
    </div>
  );
}
