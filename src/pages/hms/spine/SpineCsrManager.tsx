import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  HeartHandshake, Plus, Save, IndianRupee, Building2, Users, TrendingUp,
  Landmark, Info, CheckCircle2, HandCoins, BarChart3,
} from "lucide-react";

interface Donor {
  id: string; donor_name: string; donor_type?: string | null; grant_amount: number;
  allocated_amount: number; utilized_amount: number; purpose?: string | null; status: string;
}
interface Allocation {
  id: string; donor_name?: string | null; patient_name?: string | null; amount: number;
  utilized: number; outcome?: string | null; status: string; created_at: string;
}
interface Patient { id: string; patient_name: string; }

const blankDonor = { donor_name: "", donor_type: "corporate", contact_person: "", contact: "", grant_amount: "", purpose: "" };
const blankAlloc = { donor_id: "", patient_id: "", amount: "", outcome: "" };

export default function SpineCsrManager() {
  const [tab, setTab] = useState("donors");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [allocs, setAllocs] = useState<Allocation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonor, setShowDonor] = useState(false);
  const [donorForm, setDonorForm] = useState({ ...blankDonor });
  const [alloc, setAlloc] = useState({ ...blankAlloc });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: d } = await (supabase.from("spine_csr_donors") as any).select("*").order("created_at", { ascending: false });
      setDonors((d as Donor[]) || []);
      const { data: a } = await (supabase.from("spine_csr_allocations") as any).select("*").order("created_at", { ascending: false });
      setAllocs((a as Allocation[]) || []);
      const { data: p } = await (supabase.from("spine_injury_patients") as any).select("id, patient_name").order("created_at", { ascending: false });
      setPatients((p as Patient[]) || []);
    } catch { setDonors([]); setAllocs([]); setPatients([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveDonor = async () => {
    if (!donorForm.donor_name || !donorForm.grant_amount) { toast.error("Enter donor name and grant amount"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_csr_donors") as any).insert({
        owner_id: user?.id || null, donor_name: donorForm.donor_name, donor_type: donorForm.donor_type,
        contact_person: donorForm.contact_person || null, contact: donorForm.contact || null,
        grant_amount: Number(donorForm.grant_amount), grant_date: new Date().toISOString().slice(0, 10),
        purpose: donorForm.purpose || null, status: "active",
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Donor / grant added"); setDonorForm({ ...blankDonor }); setShowDonor(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const allocate = async () => {
    if (!alloc.donor_id || !alloc.patient_id || !alloc.amount) { toast.error("Select donor, patient and amount"); return; }
    const donor = donors.find((d) => d.id === alloc.donor_id);
    const pat = patients.find((p) => p.id === alloc.patient_id);
    if (donor && (Number(donor.allocated_amount) + Number(alloc.amount)) > Number(donor.grant_amount)) {
      toast.error("Allocation exceeds remaining grant"); return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_csr_allocations") as any).insert({
        owner_id: user?.id || null, donor_id: alloc.donor_id, donor_name: donor?.donor_name || null,
        patient_id: alloc.patient_id, patient_name: pat?.patient_name || null, amount: Number(alloc.amount),
        outcome: alloc.outcome || null, status: "allocated",
      });
      if (error) { toast.error("Allocation failed: " + error.message); }
      else {
        if (donor) await (supabase.from("spine_csr_donors") as any).update({ allocated_amount: Number(donor.allocated_amount) + Number(alloc.amount) }).eq("id", donor.id);
        // mark patient CSR sponsored
        await (supabase.from("spine_injury_patients") as any).update({ is_csr_sponsored: true }).eq("id", alloc.patient_id);
        toast.success("Fund allocated to patient"); setAlloc({ ...blankAlloc }); load(); setTab("impact");
      }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  // Impact metrics
  const totalGrant = donors.reduce((a, d) => a + Number(d.grant_amount || 0), 0);
  const totalAllocated = donors.reduce((a, d) => a + Number(d.allocated_amount || 0), 0);
  const patientsSponsored = new Set(allocs.map((a) => a.patient_name)).size;
  const outcomesRecorded = allocs.filter((a) => a.outcome).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HeartHandshake className="h-6 w-6 text-rose-600" /> CSR Fund & Sponsorship</h1>
          <p className="text-muted-foreground mt-1">Fund sponsored rehab for underprivileged patients — track allocation, utilization & impact for donor reports.</p>
        </div>
        <Badge className="bg-rose-100 text-rose-700">Impact Program</Badge>
      </div>

      {/* Compliance note */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Compliance note</p>
            <p className="mt-1">This tool tracks CSR fund <b>allocation, utilization and impact</b> for reporting. Actual fund receipt, tax exemption (e.g. 80G / CSR-1 registration) and statutory audit under the Companies Act must be handled by your finance/legal team. Keep every allocation traceable to a patient and outcome for donor transparency.</p>
          </div>
        </CardContent>
      </Card>

      {/* Impact stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold text-rose-600 flex items-center justify-center"><IndianRupee className="h-4 w-4" />{Math.round(totalGrant).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Grants</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold text-amber-600 flex items-center justify-center"><IndianRupee className="h-4 w-4" />{Math.round(totalAllocated).toLocaleString()}</p><p className="text-xs text-muted-foreground">Allocated</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold text-green-600">{patientsSponsored}</p><p className="text-xs text-muted-foreground">Patients Sponsored</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold text-blue-600">{outcomesRecorded}</p><p className="text-xs text-muted-foreground">Outcomes Recorded</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="donors" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Donors</TabsTrigger>
          <TabsTrigger value="allocate" className="text-xs gap-1"><HandCoins className="h-3 w-3" /> Allocate</TabsTrigger>
          <TabsTrigger value="impact" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Impact</TabsTrigger>
        </TabsList>

        {/* DONORS */}
        <TabsContent value="donors" className="space-y-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => setShowDonor((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> Add Donor</Button></div>
          {showDonor && (
            <Card className="border-rose-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Add Donor / Grant</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Donor Name</label><Input value={donorForm.donor_name} onChange={(e) => setDonorForm({ ...donorForm, donor_name: e.target.value })} placeholder="Company / NGO" /></div>
                  <div><label className="text-xs font-medium">Type</label>
                    <Select value={donorForm.donor_type} onValueChange={(v) => setDonorForm({ ...donorForm, donor_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="corporate">Corporate CSR</SelectItem><SelectItem value="ngo">NGO</SelectItem><SelectItem value="individual">Individual</SelectItem><SelectItem value="government">Government</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div><label className="text-xs font-medium">Contact Person</label><Input value={donorForm.contact_person} onChange={(e) => setDonorForm({ ...donorForm, contact_person: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Contact</label><Input value={donorForm.contact} onChange={(e) => setDonorForm({ ...donorForm, contact: e.target.value })} placeholder="phone/email" /></div>
                  <div><label className="text-xs font-medium">Grant Amount ₹</label><Input type="number" value={donorForm.grant_amount} onChange={(e) => setDonorForm({ ...donorForm, grant_amount: e.target.value })} placeholder="500000" /></div>
                </div>
                <div><label className="text-xs font-medium">Purpose</label><Textarea value={donorForm.purpose} onChange={(e) => setDonorForm({ ...donorForm, purpose: e.target.value })} className="h-14" /></div>
                <Button className="w-full gap-1" onClick={saveDonor} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Add Donor"}</Button>
              </CardContent>
            </Card>
          )}

          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
            donors.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No donors yet. Add a CSR grant to start the sponsorship program.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {donors.map((d) => {
                  const pct = d.grant_amount ? Math.round((Number(d.allocated_amount) / Number(d.grant_amount)) * 100) : 0;
                  return (
                    <Card key={d.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded bg-rose-100 grid place-items-center"><Landmark className="h-4 w-4 text-rose-600" /></div>
                            <div><p className="font-semibold text-sm">{d.donor_name}</p><p className="text-[11px] text-muted-foreground capitalize">{d.donor_type}</p></div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 text-[9px]">{d.status}</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-sm font-bold flex items-center justify-center"><IndianRupee className="h-3 w-3" />{Math.round(Number(d.grant_amount)).toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Grant</p></div>
                          <div><p className="text-sm font-bold text-amber-600 flex items-center justify-center"><IndianRupee className="h-3 w-3" />{Math.round(Number(d.allocated_amount)).toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Allocated</p></div>
                          <div><p className="text-sm font-bold text-green-600 flex items-center justify-center"><IndianRupee className="h-3 w-3" />{Math.round(Number(d.grant_amount) - Number(d.allocated_amount)).toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Remaining</p></div>
                        </div>
                        <div className="mt-2"><Progress value={pct} className="h-1.5" /><p className="text-[10px] text-muted-foreground mt-0.5">{pct}% allocated</p></div>
                        {d.purpose && <p className="text-[11px] text-muted-foreground mt-2">{d.purpose}</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </TabsContent>

        {/* ALLOCATE */}
        <TabsContent value="allocate" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><HandCoins className="h-4 w-4" /> Allocate Fund to Patient</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Donor</label>
                  <Select value={alloc.donor_id} onValueChange={(v) => setAlloc({ ...alloc, donor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select donor" /></SelectTrigger>
                    <SelectContent>{donors.map((d) => <SelectItem key={d.id} value={d.id}>{d.donor_name} (₹{Math.round(Number(d.grant_amount) - Number(d.allocated_amount)).toLocaleString()} left)</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs font-medium">Patient</label>
                  <Select value={alloc.patient_id} onValueChange={(v) => setAlloc({ ...alloc, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.patient_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Amount ₹</label><Input type="number" value={alloc.amount} onChange={(e) => setAlloc({ ...alloc, amount: e.target.value })} placeholder="15000" /></div>
                <div><label className="text-xs font-medium">Expected Outcome</label><Input value={alloc.outcome} onChange={(e) => setAlloc({ ...alloc, outcome: e.target.value })} placeholder="e.g. Regain independent transfers" /></div>
              </div>
              {patients.length === 0 && <p className="text-[11px] text-amber-700">Enroll patients in the Rehab Registry first.</p>}
              <Button className="w-full gap-1" onClick={allocate} disabled={saving}><CheckCircle2 className="h-4 w-4" /> {saving ? "Allocating..." : "Allocate Fund"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPACT */}
        <TabsContent value="impact" className="space-y-3">
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="pt-4 text-xs text-muted-foreground flex gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
              <span>This is your donor-facing impact view: patients sponsored, funds utilized, and recorded outcomes. Export/share this for CSR reporting and grant renewals.</span>
            </CardContent>
          </Card>
          {allocs.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No allocations yet. Allocate funds to patients to build the impact record.</CardContent></Card>
          ) : (
            <div className="space-y-1.5">
              {allocs.map((a) => (
                <Card key={a.id}><CardContent className="py-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-rose-500 shrink-0" /> {a.patient_name} <span className="text-muted-foreground font-normal">· ₹{Math.round(Number(a.amount)).toLocaleString()}</span></p>
                    <p className="text-[11px] text-muted-foreground">from {a.donor_name} · {new Date(a.created_at).toLocaleDateString()}{a.outcome ? ` · Outcome: ${a.outcome}` : ""}</p>
                  </div>
                  <Badge className={a.status === "completed" ? "bg-green-100 text-green-700 text-[9px]" : "bg-amber-100 text-amber-700 text-[9px]"}>{a.status}</Badge>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
