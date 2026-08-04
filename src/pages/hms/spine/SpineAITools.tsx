import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Activity, Target, Heart, Users, CheckCircle2, AlertTriangle,
  ArrowRight, Stethoscope, TrendingUp, Clock, Zap, Star, Shield,
  Eye, BarChart3, Bell, Phone, Leaf,
} from "lucide-react";

export default function SpineAITools() {
  const [activeTab, setActiveTab] = useState("second-opinion");
  // Second Opinion
  const [soCondition, setSoCondition] = useState("");
  const [soSurgeryAdvised, setSoSurgeryAdvised] = useState("");
  const [soResult, setSoResult] = useState(false);
  // Triage
  const [triageStep, setTriageStep] = useState(0);
  const [triageAnswers, setTriageAnswers] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState(false);
  // Monitoring
  const [monitorData] = useState([
    { day: "Mon", vas: 6, exercise: true, mood: "ok" },
    { day: "Tue", vas: 5, exercise: true, mood: "good" },
    { day: "Wed", vas: 5, exercise: false, mood: "ok" },
    { day: "Thu", vas: 4, exercise: true, mood: "good" },
    { day: "Fri", vas: 4, exercise: true, mood: "great" },
    { day: "Sat", vas: 3, exercise: true, mood: "great" },
    { day: "Sun", vas: 3, exercise: false, mood: "good" },
  ]);

  // Triage questions
  const triageQuestions = [
    { q: "Primary symptom location?", opts: ["Neck/Upper back", "Mid back", "Lower back", "Leg/Arm pain", "Full spine"] },
    { q: "Pain severity right now (0-10)?", opts: ["1-3 (Mild)", "4-6 (Moderate)", "7-8 (Severe)", "9-10 (Unbearable)"] },
    { q: "Duration of problem?", opts: ["Less than 2 weeks (Acute)", "2 weeks - 3 months (Sub-acute)", "3-12 months (Chronic)", "More than 1 year (Long-standing)"] },
    { q: "Any red flags?", opts: ["None", "Numbness/weakness in limbs", "Bladder/bowel changes", "Night pain/unexplained weight loss"] },
    { q: "Previous treatments tried?", opts: ["Nothing yet", "Painkillers only", "Physiotherapy/other", "Surgery recommended"] },
  ];

  const getTriageProtocol = () => {
    const severity = triageAnswers[1] || "";
    const redFlag = triageAnswers[3] || "";
    if (redFlag === "Bladder/bowel changes" || redFlag === "Night pain/unexplained weight loss") {
      return { level: "URGENT REFERRAL", color: "text-red-600", bg: "bg-red-50", protocol: "Red flag detected. Immediate medical evaluation needed (MRI + neurosurgery consult). AYUSH can support AFTER clearance.", icon: AlertTriangle };
    }
    if (severity.includes("9-10") || redFlag === "Numbness/weakness in limbs") {
      return { level: "Level 2 — Intensive Panchakarma", color: "text-purple-600", bg: "bg-purple-50", protocol: "Severe condition → Start with Level 1 (same-day relief) → Immediately schedule Level 2 Panchakarma course (14-21 days). Assign 15 Integrative Therapies. Full module access M1-M18.", icon: Star };
    }
    if (severity.includes("7-8") || severity.includes("4-6")) {
      return { level: "Level 1 → Level 2 Package", color: "text-amber-600", bg: "bg-amber-50", protocol: "Moderate-Severe → Level 1 OPD today (Agnikarma/Marma/Trigger Point) → Book Level 2 Package (7-14 days Kati/Greeva Basti). Assign modules M14-M18 + self-care from 15 therapies.", icon: Zap };
    }
    return { level: "Level 1 + Self-Management", color: "text-green-600", bg: "bg-green-50", protocol: "Mild condition → Level 1 OPD session → Teach self-acupressure + ear seeds → Assign M1 + M18 modules → Follow-up in 1 week. May not need Level 2.", icon: Heart };
  };

  // Treatment comparison data
  const comparison = [
    { factor: "Success Rate", surgery: "70-85%", ayush: "78-87%", winner: "tie" },
    { factor: "Cost", surgery: "₹2-8 Lakhs", ayush: "₹15K-3.5L", winner: "ayush" },
    { factor: "Recovery Time", surgery: "3-6 months + rehab", ayush: "2-6 months (active throughout)", winner: "ayush" },
    { factor: "Side Effects", surgery: "Infection, nerve damage, adjacent segment disease", ayush: "Minimal (mild soreness, detox symptoms)", winner: "ayush" },
    { factor: "Invasiveness", surgery: "General anesthesia, incision, hardware", ayush: "Non-invasive to minimally invasive", winner: "ayush" },
    { factor: "Recurrence", surgery: "15-30% (adjacent segment)", ayush: "10-20% (with maintenance program)", winner: "ayush" },
    { factor: "Self-Management", surgery: "Limited — depends on surgeon", ayush: "Complete — 13 modules + 15 self-therapies", winner: "ayush" },
    { factor: "Dependency", surgery: "One-time (but may need revision)", ayush: "Reduces over time → independence", winner: "ayush" },
    { factor: "When Surgery IS Better", surgery: "Cauda equina, progressive neuro deficit, tumor, fracture instability", ayush: "We refer these cases immediately", winner: "surgery" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-indigo-600" /> Spine AI Tools — Intelligence Hub</h1>
          <p className="text-muted-foreground mt-1">Second Opinion · Virtual Triage · Treatment Comparison · Remote Monitoring</p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700"><Brain className="h-3 w-3 mr-1" /> AI-Powered</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 h-10">
          <TabsTrigger value="second-opinion" className="text-xs">Second Opinion</TabsTrigger>
          <TabsTrigger value="triage" className="text-xs">Virtual Triage</TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs">Surgery vs AYUSH</TabsTrigger>
          <TabsTrigger value="monitoring" className="text-xs">Remote Monitor</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: SECOND OPINION ═══ */}
        <TabsContent value="second-opinion" className="space-y-4 mt-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-blue-800 flex items-center gap-2"><Shield className="h-5 w-5" /> AYUSH Second Opinion — Before You Choose Surgery</h3>
              <p className="text-sm text-muted-foreground mt-1">68% of patients referred for spine surgery respond to our integrative AYUSH approach. Get a second opinion before deciding.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Patient Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs font-medium">Condition / Diagnosis</label>
                  <Select value={soCondition} onValueChange={setSoCondition}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select condition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disc-herniation">Disc Herniation (L4-L5 / L5-S1)</SelectItem>
                      <SelectItem value="spinal-stenosis">Spinal Stenosis</SelectItem>
                      <SelectItem value="spondylolisthesis">Spondylolisthesis</SelectItem>
                      <SelectItem value="cervical-myelopathy">Cervical Myelopathy</SelectItem>
                      <SelectItem value="failed-conservative">Failed Conservative Treatment</SelectItem>
                      <SelectItem value="degenerative-disc">Degenerative Disc Disease</SelectItem>
                      <SelectItem value="sciatica-chronic">Chronic Sciatica (6+ months)</SelectItem>
                      <SelectItem value="scoliosis">Scoliosis (Adult)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs font-medium">Surgery Type Recommended</label>
                  <Select value={soSurgeryAdvised} onValueChange={setSoSurgeryAdvised}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="What surgery was advised?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discectomy">Discectomy / Microdiscectomy</SelectItem>
                      <SelectItem value="laminectomy">Laminectomy / Decompression</SelectItem>
                      <SelectItem value="fusion">Spinal Fusion</SelectItem>
                      <SelectItem value="disc-replacement">Artificial Disc Replacement</SelectItem>
                      <SelectItem value="not-sure">Not sure / multiple options given</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setSoResult(true)} disabled={!soCondition}>
                  Get AYUSH Second Opinion <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {soResult && (
              <Card className="border-green-300 bg-green-50">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-green-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> AYUSH Second Opinion</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-white rounded border">
                    <p className="font-bold text-green-700">AYUSH Alternative Available</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on our clinical experience with 401+ patients, this condition has a <strong>68-78% response rate</strong> to our integrative approach WITHOUT surgery.</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-medium">Recommended AYUSH Protocol:</p>
                    <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Level 1 assessment + immediate relief (same day)</div>
                    <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Level 2 Panchakarma course (14-21 days intensive)</div>
                    <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> 15 Integrative Therapies (condition-specific selection)</div>
                    <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> 3-6 month structured program with measurable outcomes</div>
                    <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> If no improvement by 6 weeks → we refer back to surgeon</div>
                  </div>
                  <Separator />
                  <p className="text-[10px] text-muted-foreground"><strong>Note:</strong> This is a preliminary opinion. Full assessment required before confirming suitability. Conditions with progressive neurological deficit, cauda equina, or tumor require surgery — we do NOT delay these.</p>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Book Full Assessment with Dr. Saleem</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ═══ TAB 2: VIRTUAL TRIAGE ═══ */}
        <TabsContent value="triage" className="space-y-4 mt-4">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-amber-800 flex items-center gap-2"><Zap className="h-5 w-5" /> Virtual Triage — Instant Protocol Assignment</h3>
              <p className="text-sm text-muted-foreground mt-1">Answer 5 questions → AI assigns exact treatment level + protocol from your toolkit. No guessing needed.</p>
            </CardContent>
          </Card>

          {!triageResult ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Question {triageStep + 1} of {triageQuestions.length}</span>
                  <span>{Math.round((triageStep / triageQuestions.length) * 100)}%</span>
                </div>
                <Progress value={(triageStep / triageQuestions.length) * 100} className="h-2" />
                <p className="text-lg font-semibold mt-4">{triageQuestions[triageStep].q}</p>
                <div className="grid gap-2">
                  {triageQuestions[triageStep].opts.map((opt, i) => (
                    <Button key={i} variant="outline" className="justify-start text-left h-auto py-3 hover:bg-amber-50" onClick={() => {
                      const next = [...triageAnswers, opt];
                      setTriageAnswers(next);
                      if (triageStep < triageQuestions.length - 1) setTriageStep(triageStep + 1);
                      else setTriageResult(true);
                    }}>{opt}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={`max-w-2xl mx-auto border-2 ${getTriageProtocol().bg}`}>
              <CardContent className="p-6 space-y-4 text-center">
                <div className={`text-2xl font-bold ${getTriageProtocol().color}`}>{getTriageProtocol().level}</div>
                <p className="text-sm text-muted-foreground">{getTriageProtocol().protocol}</p>
                <div className="bg-white p-4 rounded border text-left text-xs space-y-2">
                  <p className="font-medium">Auto-assigned actions:</p>
                  <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Open Quick Protocol Builder with this condition</div>
                  <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Assign appropriate modules (M14-M18 + condition-specific)</div>
                  <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Schedule follow-up based on severity</div>
                  <div className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> Enter patient into Community Pipeline (Stage appropriate)</div>
                </div>
                <Button variant="outline" onClick={() => { setTriageStep(0); setTriageAnswers([]); setTriageResult(false); }}>Retake Triage</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ TAB 3: SURGERY VS AYUSH COMPARISON ═══ */}
        <TabsContent value="comparison" className="space-y-4 mt-4">
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2"><Target className="h-5 w-5" /> Surgery vs AYUSH — Honest Comparison</h3>
              <p className="text-sm text-muted-foreground mt-1">We're not anti-surgery. We believe in the right treatment for the right patient. Here's an evidence-based comparison.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Factor</th>
                      <th className="p-3 text-left font-medium text-red-700">Surgery</th>
                      <th className="p-3 text-left font-medium text-green-700">AYUSH Integrative</th>
                      <th className="p-3 text-center font-medium">Better</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium text-xs">{row.factor}</td>
                        <td className="p-3 text-xs text-red-700">{row.surgery}</td>
                        <td className="p-3 text-xs text-green-700">{row.ayush}</td>
                        <td className="p-3 text-center">
                          {row.winner === "ayush" && <Badge className="bg-green-100 text-green-700 text-[9px]">AYUSH</Badge>}
                          {row.winner === "surgery" && <Badge className="bg-red-100 text-red-700 text-[9px]">Surgery</Badge>}
                          {row.winner === "tie" && <Badge className="bg-gray-100 text-gray-600 text-[9px]">Equal</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-800">Our Position:</p>
              <p className="text-xs text-muted-foreground mt-1">We recommend trying AYUSH integrative approach for 6-8 weeks BEFORE deciding on surgery (unless red flags present). 68% of surgery-recommended patients respond to our approach. If no response → we support surgical decision fully and provide pre/post-operative AYUSH care.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 4: REMOTE MONITORING ═══ */}
        <TabsContent value="monitoring" className="space-y-4 mt-4">
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Eye className="h-5 w-5" /> Remote Monitoring — Daily Patient Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">Patients submit daily VAS + exercise compliance via WhatsApp bot. AI flags stalling recovery or red flags for doctor intervention.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly VAS Trend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> This Week's VAS Trend (Demo Patient)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {monitorData.map(d => (
                    <div key={d.day} className="text-center">
                      <div className="bg-red-100 rounded h-20 flex items-end overflow-hidden">
                        <div className="w-full bg-red-400 transition-all" style={{ height: `${d.vas * 10}%` }} />
                      </div>
                      <p className="text-[10px] font-bold mt-1">{d.vas}</p>
                      <p className="text-[9px] text-muted-foreground">{d.day}</p>
                      <span className="text-[10px]">{d.exercise ? "✅" : "❌"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 pt-2 border-t">
                  <span>VAS trend: Improving ↓</span>
                  <span>Exercise compliance: 5/7 days (71%)</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Alerts */}
            <Card className="border-amber-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-amber-600" /> AI-Generated Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: "success", msg: "Ramesh K. — VAS dropped from 6 to 3 this week. Recovery on track!", color: "bg-green-50 border-green-200 text-green-700" },
                  { type: "warning", msg: "Priya S. — VAS unchanged for 5 days. May need protocol adjustment.", color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { type: "alert", msg: "Murugan R. — Missed 3 consecutive exercise days. Call to motivate.", color: "bg-red-50 border-red-200 text-red-700" },
                  { type: "info", msg: "Lakshmi N. — Completed 30-day streak! Auto-award badge sent.", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { type: "warning", msg: "Senthil M. — VAS increased from 3 to 5 today. Possible flare. Follow-up needed.", color: "bg-amber-50 border-amber-200 text-amber-700" },
                ].map((alert, i) => (
                  <div key={i} className={`p-2 rounded border text-xs ${alert.color}`}>{alert.msg}</div>
                ))}
              </CardContent>
            </Card>

            {/* WhatsApp Bot Flow */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-green-600" /> WhatsApp Bot Daily Check-in</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-muted-foreground">Automated daily message to patient (morning 8 AM):</p>
                <div className="bg-green-50 p-3 rounded border border-green-200 space-y-1.5 font-mono text-[11px]">
                  <p>🌅 Good morning! Time for your spine check-in.</p>
                  <p>1️⃣ Rate your pain today (0-10): ___</p>
                  <p>2️⃣ Did you do exercises yesterday? (Yes/No)</p>
                  <p>3️⃣ How's your mood? (Great/Good/OK/Low)</p>
                  <p>4️⃣ Any new symptoms? (type or "none")</p>
                  <p className="text-green-600 pt-1">Reply with: 4, Yes, Good, none</p>
                </div>
                <p className="text-muted-foreground">Bot auto-logs to patient's recovery dashboard. Flags to doctor if VAS increases or exercises missed 3+ days.</p>
              </CardContent>
            </Card>

            {/* Predictive Insights */}
            <Card className="border-purple-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-600" /> Predictive Insights</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="font-medium">Based on current trend, AI predicts:</p>
                <div className="space-y-1.5">
                  <div className="p-2 bg-green-50 rounded border border-green-100 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>VAS will reach 1-2 in approximately 2 more weeks</span>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-100 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    <span>Recovery trajectory: 78% recovery by end of this course</span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded border border-amber-100 flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-amber-600" />
                    <span>Compliance risk: Wednesday exercise skips pattern detected</span>
                  </div>
                  <div className="p-2 bg-purple-50 rounded border border-purple-100 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-purple-600" />
                    <span>Suggested: add Wednesday group call to boost mid-week motivation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
