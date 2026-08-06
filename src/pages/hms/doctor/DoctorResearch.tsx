import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  GraduationCap, Brain, FileText, Users, Shield, CheckCircle,
  Download, BarChart3, Activity, Calendar, ClipboardList, Sparkles,
} from "lucide-react";

const activeStudies = [
  { id: "CTRI/2026/07/001", title: "Efficacy of Simhanada Guggulu + Kati Basti in Gridhrasi (Sciatica): A Prospective Case Series", pi: "Dr. Mohamad Saleem", status: "Recruiting", enrolled: 18, target: 30, ethics: "IEC/2026/045 — Approved", startDate: "01/04/2026", outcomes: ["VAS Pain Score", "SLR Angle", "ODI Score", "DAS28 (if RA concurrent)"] },
  { id: "CTRI/2026/07/002", title: "Combined Ayurveda-Allopathy Protocol in Amavata (RA): Integrative Outcome Assessment", pi: "Dr. Mohamad Saleem", status: "Active", enrolled: 28, target: 40, ethics: "IEC/2026/032 — Approved", startDate: "01/01/2026", outcomes: ["DAS28-ESR", "HAQ-DI", "MTX dose reduction %", "Agni Score", "Ama Index"] },
  { id: "CTRI/2026/07/003", title: "AI-Assisted Prakriti Assessment: Validation Against Traditional Pareeksha", pi: "Dr. Sahana Fathima", status: "Completed", enrolled: 100, target: 100, ethics: "IEC/2025/089 — Approved", startDate: "01/09/2025", outcomes: ["Prakriti Match %", "Inter-rater reliability", "AI Confidence Score"] },
];

const eligiblePatients = [
  { id: "AL-15291", name: "Mrs. Kalpana", condition: "Gridhrasi", eligible: "Study 1", consent: "Pending", visits: 5 },
  { id: "AL-8472", name: "Mr. Nagaraj", condition: "Amavata (RA)", eligible: "Study 2", consent: "Obtained", visits: 14 },
  { id: "AL-15598", name: "Mrs. Hameedhal", condition: "Sandhivata", eligible: "Study 1", consent: "Pending", visits: 8 },
  { id: "AL-15568", name: "Rabiyathubasaria", condition: "Madhumeha", eligible: "New study needed", consent: "N/A", visits: 6 },
  { id: "AL-14181", name: "Mr. Kubbusamy", condition: "Twak Vikara", eligible: "Study (Psoriasis)", consent: "Pending", visits: 3 },
];

const outcomeData = [
  { patient: "Mr. Nagaraj", study: "RA Integrative", baseline: { das28: 5.8, haq: 1.8, mtxDose: "15mg" }, current: { das28: 3.2, haq: 0.9, mtxDose: "10mg" }, improvement: "DAS28: -2.6 (45% improvement). MTX reduced by 33%." },
  { patient: "Mrs. Kalpana", study: "Gridhrasi", baseline: { vas: 8, slr: 30, odi: 62 }, current: { vas: 3, slr: 65, odi: 28 }, improvement: "VAS: -5 (63% pain reduction). SLR improved 35°." },
  { patient: "Priya S.", study: "Gridhrasi", baseline: { vas: 7, slr: 40, odi: 55 }, current: { vas: 2, slr: 75, odi: 18 }, improvement: "VAS: -5 (71% pain reduction). SLR normalized." },
];

const DoctorResearch = () => {
  const [activeTab, setActiveTab] = useState("studies");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-blue-600" /> Clinical Research & Evidence Generation</h1>
          <p className="text-muted-foreground mt-1">Generate publishable evidence from your daily practice — Ethics compliant · CTRI registered · AI-powered analysis</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-300"><Shield className="h-3 w-3 mr-1" /> Ethics Compliant</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><GraduationCap className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{activeStudies.length}</p><p className="text-xs text-muted-foreground">Active Studies</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{activeStudies.reduce((s, st) => s + st.enrolled, 0)}</p><p className="text-xs text-muted-foreground">Patients Enrolled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ClipboardList className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{outcomeData.length}</p><p className="text-xs text-muted-foreground">Outcomes Recorded</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><FileText className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">1</p><p className="text-xs text-muted-foreground">Papers Ready</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Shield className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">3/3</p><p className="text-xs text-muted-foreground">Ethics Approved</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full">
          <TabsTrigger value="studies">My Studies</TabsTrigger>
          <TabsTrigger value="enroll">Enroll Patients</TabsTrigger>
          <TabsTrigger value="outcomes">Outcome Data</TabsTrigger>
          <TabsTrigger value="ethics">Ethics & Consent</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="publish">Publish / Export</TabsTrigger>
        </TabsList>

        {/* Studies Tab */}
        <TabsContent value="studies" className="space-y-4 mt-4">
          {activeStudies.map(s => (
            <Card key={s.id} className={s.status === "Completed" ? "border-green-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">PI: {s.pi} · CTRI: {s.id} · Ethics: {s.ethics}</p>
                  </div>
                  <Badge variant={s.status === "Completed" ? "outline" : s.status === "Recruiting" ? "default" : "secondary"} className={`text-xs ${s.status === "Completed" ? "text-green-600" : ""}`}>{s.status}</Badge>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={(s.enrolled / s.target) * 100} className="flex-1 h-2" />
                  <span className="text-xs font-bold">{s.enrolled}/{s.target} enrolled</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] text-muted-foreground">Outcomes:</span>
                  {s.outcomes.map(o => <Badge key={o} variant="outline" className="text-[9px]">{o}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={() => toast.info("Create new study protocol...")}><GraduationCap className="h-4 w-4 mr-1" /> Create New Study</Button>
        </TabsContent>

        {/* Enroll Patients Tab */}
        <TabsContent value="enroll" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Eligible Patients (AI-identified from your patient pool)</CardTitle></CardHeader>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Condition</th><th className="px-3 py-2 text-left">Eligible For</th><th className="px-3 py-2 text-center">Visits</th><th className="px-3 py-2 text-center">Consent</th><th className="px-3 py-2 text-right">Action</th></tr></thead>
                <tbody>{eligiblePatients.map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2"><p className="font-medium">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.id}</p></td>
                    <td className="px-3 py-2 text-xs">{p.condition}</td>
                    <td className="px-3 py-2 text-xs">{p.eligible}</td>
                    <td className="px-3 py-2 text-center">{p.visits}</td>
                    <td className="px-3 py-2 text-center"><Badge variant={p.consent === "Obtained" ? "outline" : "secondary"} className={`text-[10px] ${p.consent === "Obtained" ? "text-green-600" : ""}`}>{p.consent}</Badge></td>
                    <td className="px-3 py-2 text-right">{p.consent === "Pending" ? <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`Research consent form sent to ${p.name}`)}>Get Consent</Button> : <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div></CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Patient Matching</p><p className="text-sm text-purple-700">AI automatically identifies patients from your practice who meet study inclusion criteria. When a new patient matches, you get an alert: "This patient qualifies for Study 1 — obtain research consent?"</p></div></CardContent>
          </Card>
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent value="outcomes" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Outcome Measurements (Before → After)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outcomeData.map((o, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{o.patient} — {o.study}</p>
                      <Badge variant="outline" className="text-green-600 text-xs">Improvement Recorded</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2 bg-red-50 rounded"><p className="font-medium text-red-700">Baseline</p><p className="text-muted-foreground mt-1">{JSON.stringify(o.baseline).replace(/[{}"]/g, '').replace(/,/g, ' · ')}</p></div>
                      <div className="p-2 bg-green-50 rounded"><p className="font-medium text-green-700">Current</p><p className="text-muted-foreground mt-1">{JSON.stringify(o.current).replace(/[{}"]/g, '').replace(/,/g, ' · ')}</p></div>
                      <div className="p-2 bg-blue-50 rounded"><p className="font-medium text-blue-700">Result</p><p className="text-muted-foreground mt-1">{o.improvement}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ethics Tab */}
        <TabsContent value="ethics" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" /> Institutional Ethics Committee (IEC) Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { protocol: "Gridhrasi Case Series", iec: "IEC/2026/045", status: "Approved", date: "15/03/2026", validity: "14/03/2027", type: "Observational" },
                { protocol: "RA Integrative Study", iec: "IEC/2026/032", status: "Approved", date: "10/01/2026", validity: "09/01/2027", type: "Interventional (Ayurveda add-on)" },
                { protocol: "AI Prakriti Validation", iec: "IEC/2025/089", status: "Approved (Completed)", date: "01/08/2025", validity: "Completed", type: "Validation study" },
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">{e.protocol}</p><p className="text-xs text-muted-foreground">{e.iec} · {e.type} · Valid until: {e.validity}</p></div>
                  <Badge variant="outline" className="text-green-600 text-xs"><Shield className="h-3 w-3 mr-1" />{e.status}</Badge>
                </div>
              ))}
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Research Consent Template</p>
                <p className="text-xs text-muted-foreground">Standard ICMR-compliant consent form auto-generated per study. Includes: purpose, procedures, risks, benefits, voluntary participation, right to withdraw, confidentiality clause, data anonymization note.</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("Consent template generated for download")}><FileText className="h-3 w-3 mr-1" /> Download Consent Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-4 mt-4">
          <Card className="border-purple-200">
            <CardHeader className="pb-2 bg-purple-50"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI Research Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-4 rounded-lg border bg-white">
                <p className="font-medium text-sm mb-2">Study: Gridhrasi Case Series (n=18)</p>
                <p className="text-xs text-muted-foreground mb-3">AI has analyzed all 18 enrolled patients' data:</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Primary Outcome (VAS Pain):</strong> Mean reduction 4.8 points (SD 1.2). p &lt; 0.001. Clinically significant.</p>
                  <p><strong>Secondary (SLR):</strong> Mean improvement 32° (SD 8). All patients crossed 60° threshold.</p>
                  <p><strong>Treatment Responders:</strong> 15/18 (83%) showed &gt;50% pain reduction at 30 days.</p>
                  <p><strong>Non-responders:</strong> 3 patients had concurrent disc herniation &gt;8mm (suggest MRI screening as inclusion criterion).</p>
                  <p><strong>AI Conclusion:</strong> Kati Basti + Simhanada Guggulu protocol shows statistically significant improvement in Gridhrasi (Sciatica). Effect size: Cohen's d = 2.1 (large). Ready for publication as case series. Consider RCT design for level-1 evidence.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-700"><Sparkles className="h-3 w-3 inline mr-1" /><strong>AI can auto-generate:</strong> Abstract, methodology section, results table, statistical analysis (paired t-test, Wilcoxon), and CONSORT-style flow diagram from your patient data.</p>
              </div>
              <Button onClick={() => toast.success("AI generating research paper draft...")}><Brain className="h-4 w-4 mr-1" /> Generate Paper Draft (AI)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publish / Export Tab */}
        <TabsContent value="publish" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Export & Publication</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { format: "CTRI Registration Format", desc: "Clinical Trials Registry India submission format", icon: Shield },
                  { format: "Excel/CSV Data Export", desc: "Anonymized patient data for statistical analysis (SPSS/R)", icon: Download },
                  { format: "Case Series Paper (AI Draft)", desc: "Auto-generated paper with abstract, methods, results, discussion", icon: FileText },
                  { format: "Conference Abstract", desc: "300-word abstract for AYUSH/medical conferences", icon: GraduationCap },
                  { format: "Outcome Charts (PDF)", desc: "Before-after graphs, box plots, forest plots", icon: BarChart3 },
                  { format: "ICMR Submission Pack", desc: "Complete submission package for ICMR/CCRAS funding", icon: Shield },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => toast.success(`Generating ${f.format}...`)}>
                    <f.icon className="h-5 w-5 text-blue-600 shrink-0" />
                    <div><p className="text-sm font-medium">{f.format}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700"><strong>Important:</strong> All exported data is auto-anonymized (patient IDs replaced with study codes). No personally identifiable information leaves the system without explicit consent. ICMR Ethical Guidelines for Biomedical Research (2017) compliant.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorResearch;
