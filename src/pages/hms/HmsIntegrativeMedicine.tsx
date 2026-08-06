import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Leaf, Pill, AlertTriangle, CheckCircle, Shield, Heart,
  Brain, Activity, Clock, Plus, FileText, Zap,
  ArrowRight, Users, Stethoscope, Beaker,
} from "lucide-react";

type MedicineEntry = {
  name: string; system: "ayurveda" | "allopathy" | "homeopathy" | "siddha" | "unani";
  dose: string; frequency: string; duration: string; route: string;
  purpose: string; status: "active" | "tapering" | "stopped";
};

type IntegrativeProtocol = {
  id: string; patient: string; condition: string; prakriti: string;
  startDate: string; doctor: string; status: "active" | "completed" | "review";
  medicines: MedicineEntry[];
  interactions: { severity: "high" | "moderate" | "low"; description: string }[];
  notes: string;
};

const mockProtocols: IntegrativeProtocol[] = [
  {
    id: "1", patient: "Ramesh Kumar", condition: "Rheumatoid Arthritis (Amavata)",
    prakriti: "Vata-Kapha", startDate: "2026-06-15", doctor: "Dr. Arun Sharma",
    status: "active",
    medicines: [
      { name: "Methotrexate", system: "allopathy", dose: "15mg", frequency: "Once weekly (Sunday)", duration: "Ongoing", route: "Oral", purpose: "DMARD — disease modification", status: "active" },
      { name: "Folic Acid", system: "allopathy", dose: "5mg", frequency: "Daily (except MTX day)", duration: "Ongoing", route: "Oral", purpose: "Counteract MTX side effects", status: "active" },
      { name: "Simhanada Guggulu", system: "ayurveda", dose: "2 tablets", frequency: "BD (morning & evening)", duration: "3 months", route: "Oral", purpose: "Ama pachana, anti-inflammatory (Ayurvedic DMARD)", status: "active" },
      { name: "Rasnasaptakam Kashayam", system: "ayurveda", dose: "15ml + 45ml warm water", frequency: "BD before food", duration: "2 months", route: "Oral", purpose: "Vata-shamana, joint support", status: "active" },
      { name: "Kottamchukkadi Taila", system: "ayurveda", dose: "External application", frequency: "Daily at night", duration: "Ongoing", route: "External", purpose: "Local pain relief, joint inflammation", status: "active" },
      { name: "Prednisolone", system: "allopathy", dose: "5mg", frequency: "Once daily (morning)", duration: "Tapering over 4 weeks", route: "Oral", purpose: "Bridge therapy for flare", status: "tapering" },
    ],
    interactions: [
      { severity: "moderate", description: "Simhanada Guggulu contains Castor oil — may enhance Methotrexate GI side effects. Take 2 hours apart." },
      { severity: "low", description: "Rasnasaptakam + Prednisolone: Both reduce inflammation via different pathways. Monitor for additive immunosuppression signs." },
    ],
    notes: "Patient tolerating combination well. RA activity reducing — DAS28 from 5.2 to 3.8 in 4 weeks. Plan: Taper prednisolone, continue Ayurveda + MTX. Consider Panchakarma (Virechana) after steroid taper."
  },
  {
    id: "2", patient: "Priya Menon", condition: "Type 2 Diabetes (Madhumeha) + Hypothyroid",
    prakriti: "Kapha-Pitta", startDate: "2026-05-01", doctor: "Dr. Meena Patel",
    status: "active",
    medicines: [
      { name: "Metformin", system: "allopathy", dose: "500mg", frequency: "BD with meals", duration: "Ongoing", route: "Oral", purpose: "Blood sugar control", status: "active" },
      { name: "Levothyroxine", system: "allopathy", dose: "50mcg", frequency: "Once daily (empty stomach)", duration: "Ongoing", route: "Oral", purpose: "Thyroid hormone replacement", status: "active" },
      { name: "Nishamalaki Churna", system: "ayurveda", dose: "3g", frequency: "BD with warm water", duration: "3 months", route: "Oral", purpose: "Blood sugar regulation (Turmeric + Amla)", status: "active" },
      { name: "Chandraprabha Vati", system: "ayurveda", dose: "2 tablets", frequency: "BD", duration: "2 months", route: "Oral", purpose: "Prameha (urinary issues), metabolism support", status: "active" },
      { name: "Kanchanara Guggulu", system: "ayurveda", dose: "2 tablets", frequency: "BD", duration: "3 months", route: "Oral", purpose: "Thyroid support (Galaganda)", status: "active" },
      { name: "Thyroidinum 30C", system: "homeopathy", dose: "4 pills", frequency: "Twice weekly", duration: "3 months", route: "Sublingual", purpose: "Constitutional thyroid support", status: "active" },
    ],
    interactions: [
      { severity: "moderate", description: "Kanchanara Guggulu may affect thyroid levels — monitor TSH every 4 weeks while co-administering with Levothyroxine. Take 4 hours apart." },
      { severity: "low", description: "Nishamalaki may mildly enhance Metformin effect — monitor for hypoglycemia initially." },
      { severity: "low", description: "Thyroidinum 30C (homeopathic): Unlikely pharmacological interaction at this dilution. Safe to combine." },
    ],
    notes: "HbA1c improved from 8.2% to 7.1% in 3 months on combined protocol. TSH normalized. Patient reports better energy. Continue current protocol with monthly monitoring."
  },
  {
    id: "3", patient: "Ananya S.", condition: "Chronic Migraine (Ardhavabhedaka)",
    prakriti: "Pitta-Vata", startDate: "2026-07-01", doctor: "Dr. Arun Sharma",
    status: "review",
    medicines: [
      { name: "Propranolol", system: "allopathy", dose: "40mg", frequency: "BD", duration: "3 months (prophylaxis)", route: "Oral", purpose: "Migraine prevention", status: "active" },
      { name: "Sumatriptan", system: "allopathy", dose: "50mg", frequency: "As needed (max 2/week)", duration: "PRN", route: "Oral", purpose: "Acute migraine abort", status: "active" },
      { name: "Pathyadi Kwatham", system: "ayurveda", dose: "15ml + water", frequency: "BD before food", duration: "2 months", route: "Oral", purpose: "Shiroroga (head disorders), Pitta-shamana", status: "active" },
      { name: "Shirashooladi Vajra Rasa", system: "ayurveda", dose: "1 tablet", frequency: "BD with honey", duration: "1 month", route: "Oral", purpose: "Specific for migraine (Rasa Shastra)", status: "active" },
      { name: "Nasya (Anu Taila)", system: "ayurveda", dose: "2 drops each nostril", frequency: "Morning (empty stomach)", duration: "21 days", route: "Nasal", purpose: "Panchakarma — Urdhvajatrugata Vyadhi", status: "active" },
      { name: "Natrum Muriaticum 200C", system: "homeopathy", dose: "3 pills", frequency: "Weekly once", duration: "2 months", route: "Sublingual", purpose: "Constitutional remedy for migraine pattern", status: "active" },
    ],
    interactions: [
      { severity: "low", description: "Propranolol + Pathyadi Kwatham: Both may lower BP slightly. Monitor for dizziness." },
      { severity: "low", description: "Nasya with Anu Taila: Ensure 30 min gap before Propranolol intake." },
    ],
    notes: "Migraine frequency reduced from 12/month to 4/month in 3 weeks. Review to consider tapering Propranolol if Ayurveda alone can maintain control."
  },
];

const systemColors: Record<string, { bg: string; text: string; label: string }> = {
  ayurveda: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Ayurveda" },
  allopathy: { bg: "bg-blue-100", text: "text-blue-700", label: "Allopathy" },
  homeopathy: { bg: "bg-purple-100", text: "text-purple-700", label: "Homeopathy" },
  siddha: { bg: "bg-amber-100", text: "text-amber-700", label: "Siddha" },
  unani: { bg: "bg-teal-100", text: "text-teal-700", label: "Unani" },
};

const HmsIntegrativeMedicine = () => {
  const [protocols] = useState<IntegrativeProtocol[]>(mockProtocols);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<IntegrativeProtocol | null>(null);

  const activeProtocols = protocols.filter(p => p.status === "active").length;
  const totalInteractions = protocols.reduce((s, p) => s + p.interactions.length, 0);
  const highRiskCount = protocols.reduce((s, p) => s + p.interactions.filter(i => i.severity === "high").length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" /> Integrative Medicine
          </h1>
          <p className="text-sm text-muted-foreground">
            Combined AYUSH + Allopathy protocols · Drug interaction alerts · Unified prescription view · Cross-system tracking
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Protocol
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Users className="h-5 w-5 mx-auto text-blue-600" />
          <p className="text-xl font-bold mt-1">{protocols.length}</p>
          <p className="text-xs text-muted-foreground">Total Protocols</p>
        </CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-xl font-bold mt-1">{activeProtocols}</p>
          <p className="text-xs text-muted-foreground">Active Combined</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Shield className="h-5 w-5 mx-auto text-amber-600" />
          <p className="text-xl font-bold mt-1">{totalInteractions}</p>
          <p className="text-xs text-muted-foreground">Interactions Flagged</p>
        </CardContent></Card>
        <Card className={highRiskCount > 0 ? "border-red-200" : ""}><CardContent className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
          <p className="text-xl font-bold mt-1 text-red-600">{highRiskCount}</p>
          <p className="text-xs text-muted-foreground">High-Risk Alerts</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Brain className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">92%</p>
          <p className="text-xs text-muted-foreground">AI Safety Score</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="protocols">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="protocols">Active Protocols</TabsTrigger>
          <TabsTrigger value="unified-rx">Unified Prescription</TabsTrigger>
          <TabsTrigger value="guidelines">Integrative Guidelines</TabsTrigger>
          <TabsTrigger value="outcomes">Outcome Tracking</TabsTrigger>
        </TabsList>

        {/* Active Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          {protocols.map((p) => (
            <Card key={p.id} className={p.status === "review" ? "border-amber-300" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{p.patient} — {p.condition}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Prakriti: {p.prakriti} · Doctor: {p.doctor} · Since: {p.startDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "active" ? "outline" : p.status === "review" ? "default" : "secondary"} className={`text-[10px] capitalize ${p.status === "active" ? "text-green-600" : ""}`}>
                      {p.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedProtocol(p)}>
                      View Detail
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Medicine List by System */}
                <div className="space-y-2 mb-3">
                  {p.medicines.map((med, idx) => {
                    const sc = systemColors[med.system];
                    return (
                      <div key={idx} className={`flex items-center gap-3 p-2 rounded border ${med.status === "tapering" ? "border-amber-200 bg-amber-50/30" : med.status === "stopped" ? "opacity-50" : ""}`}>
                        <Badge className={`text-[9px] px-1.5 ${sc.bg} ${sc.text} border-0`}>{sc.label}</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{med.name} <span className="text-muted-foreground font-normal">— {med.dose} {med.frequency}</span></p>
                          <p className="text-[10px] text-muted-foreground">{med.purpose}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[9px]">{med.route}</Badge>
                          {med.status === "tapering" && <Badge variant="outline" className="text-[9px] text-amber-600">Tapering</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactions */}
                {p.interactions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1"><Shield className="h-3 w-3" /> Interaction Alerts:</p>
                    {p.interactions.map((inter, idx) => (
                      <div key={idx} className={`p-2 rounded text-xs ${
                        inter.severity === "high" ? "bg-red-50 border border-red-200 text-red-700" :
                        inter.severity === "moderate" ? "bg-amber-50 border border-amber-200 text-amber-700" :
                        "bg-blue-50 border border-blue-200 text-blue-700"
                      }`}>
                        <span className="font-medium capitalize">[{inter.severity}]</span> {inter.description}
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Note */}
                {p.notes && (
                  <div className="mt-3 p-2 rounded bg-muted/50 border">
                    <p className="text-xs"><span className="font-medium">Progress:</span> {p.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Unified Prescription View */}
        <TabsContent value="unified-rx" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unified Multi-System Prescription View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                All medicines across medical systems for a patient in one view with timing schedule
              </p>
              
              {/* Example: Daily Schedule for Ramesh Kumar */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Ramesh Kumar — Daily Medicine Schedule</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Schedule sent via WhatsApp")}>
                    <FileText className="mr-1 h-3 w-3" /> Send to Patient
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { time: "6:00 AM (Empty Stomach)", meds: [
                      { name: "Rasnasaptakam Kashayam 15ml + warm water", sys: "ayurveda" },
                    ]},
                    { time: "7:30 AM (Before Breakfast)", meds: [
                      { name: "Simhanada Guggulu 2 tab", sys: "ayurveda" },
                    ]},
                    { time: "8:00 AM (With Breakfast)", meds: [
                      { name: "Folic Acid 5mg", sys: "allopathy" },
                      { name: "Prednisolone 5mg (tapering)", sys: "allopathy" },
                    ]},
                    { time: "12:00 PM (Before Lunch)", meds: [
                      { name: "Rasnasaptakam Kashayam 15ml + warm water", sys: "ayurveda" },
                    ]},
                    { time: "6:00 PM (Before Dinner)", meds: [
                      { name: "Simhanada Guggulu 2 tab", sys: "ayurveda" },
                    ]},
                    { time: "9:00 PM (Bedtime)", meds: [
                      { name: "Kottamchukkadi Taila — external to joints", sys: "ayurveda" },
                    ]},
                    { time: "Sunday Only", meds: [
                      { name: "Methotrexate 15mg (skip Folic Acid this day)", sys: "allopathy" },
                    ]},
                  ].map((slot) => (
                    <div key={slot.time} className="flex gap-3 items-start">
                      <div className="w-[180px] shrink-0">
                        <Badge variant="outline" className="text-[10px] font-medium">{slot.time}</Badge>
                      </div>
                      <div className="flex-1 space-y-1">
                        {slot.meds.map((m, i) => {
                          const sc = systemColors[m.sys];
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${sc.bg.replace('100', '500')}`} />
                              <span className="text-sm">{m.name}</span>
                              <Badge className={`text-[8px] px-1 ${sc.bg} ${sc.text} border-0`}>{sc.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrative Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Cross-System Prescribing Guidelines</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Timing Separation Rules", icon: <Clock className="h-4 w-4" />, rules: [
                    "Ayurvedic Kashayam/Arishta: 30 min before food, 2hrs apart from allopathic",
                    "Guggulu preparations: Take 1hr after food, separate from statins by 4hrs",
                    "Homeopathic sublingual: 30 min gap from any food/drink/other medicine",
                    "Levothyroxine: Always on empty stomach, 4hrs before any Ayurvedic thyroid medicine",
                  ]},
                  { title: "Monitoring Requirements", icon: <Activity className="h-4 w-4" />, rules: [
                    "Combined Ayurveda + Allopathy DMARDs: Monthly LFT & CBC mandatory",
                    "Guggulu + Thyroid meds: TSH every 4 weeks for first 3 months",
                    "Blood sugar-lowering herbs + oral hypoglycemics: Weekly fasting sugar initially",
                    "Any Rasa Shastra (mineral) preparation: Heavy metal screening quarterly",
                  ]},
                  { title: "Contraindicated Combinations", icon: <AlertTriangle className="h-4 w-4" />, rules: [
                    "Guggulu + Warfarin/anticoagulants: AVOID or monitor INR weekly",
                    "Ashwagandha + Immunosuppressants (post-transplant): AVOID",
                    "Strong Virechana/purgatives + oral medications: Reduces absorption",
                    "Bhasma preparations + Antacids/PPIs: Altered mineral absorption",
                  ]},
                  { title: "Safe & Synergistic Combinations", icon: <Heart className="h-4 w-4" />, rules: [
                    "Turmeric (Haridra) + NSAIDs: Synergistic anti-inflammatory, may allow NSAID dose reduction",
                    "Triphala + Probiotics: Complementary gut health support",
                    "Ashwagandha + Antidepressants (SSRI): Generally safe, may enhance efficacy",
                    "External Panchakarma (Abhyanga, Basti) + Any oral medicine: No interaction concern",
                  ]},
                ].map((section) => (
                  <div key={section.title} className="rounded-lg border p-4">
                    <p className="font-medium text-sm flex items-center gap-2 mb-2">{section.icon} {section.title}</p>
                    <div className="space-y-1.5">
                      {section.rules.map((rule, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {rule}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcome Tracking Tab */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Integrative Treatment Outcomes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { condition: "Rheumatoid Arthritis (Amavata)", patients: 28, improvedPct: 82, avgDuration: "4 months", protocol: "MTX + Simhanada Guggulu + Panchakarma", highlight: "42% patients achieved MTX dose reduction" },
                  { condition: "Type 2 Diabetes (Madhumeha)", patients: 45, improvedPct: 76, avgDuration: "6 months", protocol: "Metformin + Nishamalaki + Chandraprabha", highlight: "Average HbA1c reduction: 1.3% additional vs Metformin alone" },
                  { condition: "Chronic Migraine (Ardhavabhedaka)", patients: 18, improvedPct: 88, avgDuration: "3 months", protocol: "Propranolol + Pathyadi Kwatham + Nasya", highlight: "67% patients tapered off prophylactic allopathy within 6 months" },
                  { condition: "Osteoarthritis (Sandhivata)", patients: 62, improvedPct: 90, avgDuration: "3 months", protocol: "NSAIDs (PRN) + Janu Basti + Guggulu", highlight: "85% reduced NSAID use to PRN only after Panchakarma" },
                  { condition: "Hypothyroidism (Galaganda)", patients: 22, improvedPct: 68, avgDuration: "6 months", protocol: "Levothyroxine + Kanchanara Guggulu + Thyroidinum 30C", highlight: "32% achieved dose reduction in Levothyroxine" },
                ].map((outcome) => (
                  <div key={outcome.condition} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{outcome.condition}</p>
                      <Badge variant="outline" className="text-[10px] text-green-600">{outcome.improvedPct}% improved</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{outcome.patients}</p>
                        <p className="text-[10px] text-muted-foreground">Patients</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{outcome.improvedPct}%</p>
                        <p className="text-[10px] text-muted-foreground">Improved</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-sm font-bold">{outcome.avgDuration}</p>
                        <p className="text-[10px] text-muted-foreground">Avg Duration</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Protocol:</span> {outcome.protocol}</p>
                    <p className="text-xs text-green-700 mt-1 bg-green-50 p-1.5 rounded"><Zap className="h-3 w-3 inline mr-1" />{outcome.highlight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Protocol Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Integrative Protocol</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient *</Label><Input placeholder="Search patient name or ID" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Primary Condition</Label><Input placeholder="e.g., Rheumatoid Arthritis" /></div>
              <div><Label>Prakriti</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vata">Vata</SelectItem>
                    <SelectItem value="pitta">Pitta</SelectItem>
                    <SelectItem value="kapha">Kapha</SelectItem>
                    <SelectItem value="vata-pitta">Vata-Pitta</SelectItem>
                    <SelectItem value="vata-kapha">Vata-Kapha</SelectItem>
                    <SelectItem value="pitta-kapha">Pitta-Kapha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Treating Doctor</Label><Input placeholder="Doctor name" /></div>
            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Medicines (add from each system)</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(systemColors).map(([key, val]) => (
                  <Button key={key} variant="outline" size="sm" className={`text-xs h-7 ${val.bg} ${val.text} border-0`}>
                    <Plus className="h-3 w-3 mr-1" /> {val.label}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">AI will automatically check interactions as you add medicines</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Integrative protocol created. AI interaction check complete — no high-risk found."); setCreateOpen(false); }}>
              <Shield className="mr-1 h-4 w-4" /> Create & Check Safety
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedProtocol} onOpenChange={() => setSelectedProtocol(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedProtocol?.patient} — Full Protocol</DialogTitle></DialogHeader>
          {selectedProtocol && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-sm"><span className="font-medium">Condition:</span> {selectedProtocol.condition}</p>
              <p className="text-sm"><span className="font-medium">Prakriti:</span> {selectedProtocol.prakriti}</p>
              <p className="text-sm"><span className="font-medium">Doctor:</span> {selectedProtocol.doctor}</p>
              <div className="space-y-2">
                {selectedProtocol.medicines.map((med, idx) => {
                  const sc = systemColors[med.system];
                  return (
                    <div key={idx} className="p-2 rounded border text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${sc.bg} ${sc.text} border-0`}>{sc.label}</Badge>
                        <span className="font-medium">{med.name}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{med.dose} · {med.frequency} · {med.duration} · {med.route}</p>
                      <p className="text-muted-foreground">Purpose: {med.purpose}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProtocol(null)}>Close</Button>
            <Button onClick={() => { toast.success("Prescription printed"); setSelectedProtocol(null); }}>Print Unified Rx</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsIntegrativeMedicine;
