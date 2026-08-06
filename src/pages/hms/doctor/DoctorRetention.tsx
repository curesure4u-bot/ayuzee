import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain, Users, Heart, Phone, MessageCircle, AlertTriangle,
  TrendingUp, Target, Gift, Star, Calendar, Activity,
  CheckCircle, Clock, IndianRupee, Shield, Zap,
} from "lucide-react";

// ─── Dropout Risk Patients ───
const atRiskPatients = [
  { id: "AL-15291", name: "Mrs. Kalpana", age: 31, condition: "Gridhrasi (Sciatica)", lastVisit: "45 days ago", dueDate: "Overdue 31 days", adherence: 40, riskScore: 78, riskFactors: ["Stopped Kashayam (taste)", "Cost concern", "No family support"], phase: "Phase 3/8 — Shodhana", suggestedAction: "Call husband. Offer tablet form. EMI ₹2500/month." },
  { id: "AL-8472", name: "Mr. Nagaraj", age: 65, condition: "Amavata (RA)", lastVisit: "18 days ago", dueDate: "Overdue 4 days", adherence: 72, riskScore: 45, riskFactors: ["Age-related fatigue", "Multiple meds confusion"], phase: "Phase 5/8 — Rasayana", suggestedAction: "WhatsApp reminder. Simplify med schedule to 2x daily." },
  { id: "AL-15598", name: "Mrs. Hameedhal", age: 75, condition: "Sandhivata (OA Knee)", lastVisit: "22 days ago", dueDate: "Overdue 8 days", adherence: 55, riskScore: 62, riskFactors: ["Transport difficulty", "Son manages appointments"], phase: "Phase 4/8 — Shamana", suggestedAction: "Call son. Offer teleconsult option. Home delivery meds." },
  { id: "AL-15568", name: "Rabiyathubasaria", age: 42, condition: "Madhumeha + Sthaulya", lastVisit: "10 days ago", dueDate: "Due in 4 days", adherence: 85, riskScore: 22, riskFactors: ["None significant"], phase: "Phase 3/8 — Shodhana prep", suggestedAction: "On track. Send motivation message." },
  { id: "AL-14181", name: "Mr. Kubbusamy", age: 45, condition: "Twak Vikara (Psoriasis)", lastVisit: "60 days ago", dueDate: "Overdue 46 days", adherence: 15, riskScore: 95, riskFactors: ["Switched to allopathy steroids", "Lost trust in Ayurveda", "No visible results yet"], phase: "Phase 2/8 — Dropped at Deepana", suggestedAction: "Doctor personal call. Explain: results take 45-60 days in Psoriasis. Offer free review. Show before/after cases." },
];

// ─── Subscription Plans ───
const subscriptionPlans = [
  { name: "Chronic Care (Monthly)", price: 2500, duration: "Per month (12 months)", includes: "1 Consultation + Medicines + WhatsApp support", patients: 45 },
  { name: "Panchakarma Package", price: 15000, duration: "Per course (7-21 days)", includes: "Full PK course + Pre/Post care + Follow-ups", patients: 28 },
  { name: "Annual Wellness Plan", price: 18000, duration: "1 year", includes: "12 Consultations + 2 PK courses + Medicines + Diet chart", patients: 12 },
  { name: "Family Package", price: 4000, duration: "Per month (family of 4)", includes: "All family consultations + Medicines + Swarnaprasanam for kids", patients: 8 },
  { name: "Corporate Employee Plan", price: 1500, duration: "Per employee/month", includes: "2 Consultations + Stress management + Yoga", patients: 50 },
];

// ─── Treatment Journey Phases ───
const treatmentPhases = [
  { phase: 1, name: "Nidana Parivarjana", description: "Remove causative factors (diet, lifestyle correction)", duration: "7-14 days" },
  { phase: 2, name: "Deepana-Pachana", description: "Kindle digestive fire, digest toxins (Ama)", duration: "7-14 days" },
  { phase: 3, name: "Shodhana (Panchakarma)", description: "Purification — Vamana/Virechana/Basti/Nasya", duration: "7-21 days" },
  { phase: 4, name: "Shamana", description: "Palliative medicines to balance doshas", duration: "30-90 days" },
  { phase: 5, name: "Rasayana", description: "Rejuvenation — rebuild tissues, strengthen immunity", duration: "30-60 days" },
  { phase: 6, name: "Dinacharya", description: "Daily routine establishment (wake, eat, sleep, exercise)", duration: "Ongoing" },
  { phase: 7, name: "Ritucharya", description: "Seasonal adjustments to diet and lifestyle", duration: "Seasonal (4x/year)" },
  { phase: 8, name: "Maintenance", description: "Annual check-ups, preventive Panchakarma, Rasayana", duration: "Lifelong" },
];

const DoctorRetention = () => {
  const [selectedPlan, setSelectedPlan] = useState("all");
  const highRisk = atRiskPatients.filter(p => p.riskScore >= 70).length;
  const totalActive = atRiskPatients.length;
  const avgAdherence = Math.round(atRiskPatients.reduce((s, p) => s + p.adherence, 0) / totalActive);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-600" /> Patient Retention & Care Continuity
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered dropout prevention · Treatment journey · Subscriptions · Family engagement · Referral growth
          </p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300"><Brain className="h-3 w-3 mr-1" /> AI Active</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{highRisk}</p><p className="text-xs text-muted-foreground">High Dropout Risk</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalActive}</p><p className="text-xs text-muted-foreground">Active Patients</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{avgAdherence}%</p><p className="text-xs text-muted-foreground">Avg Adherence</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹1.8L</p><p className="text-xs text-muted-foreground">Monthly Subscriptions</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Gift className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">23</p><p className="text-xs text-muted-foreground">Referrals This Month</p></CardContent></Card>
      </div>

      <Tabs defaultValue="dropout">
        <TabsList className="grid grid-cols-2 sm:grid-cols-7 w-full">
          <TabsTrigger value="dropout">Dropout Risk (AI)</TabsTrigger>
          <TabsTrigger value="journey">Treatment Journey</TabsTrigger>
          <TabsTrigger value="adherence">Adherence Tracker</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="family">Family & Referrals</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="rejuvenation">Rejuvenation</TabsTrigger>
        </TabsList>

        {/* ─── DROPOUT RISK TAB ─── */}
        <TabsContent value="dropout" className="space-y-4 mt-4">
          {atRiskPatients.sort((a, b) => b.riskScore - a.riskScore).map(p => (
            <Card key={p.id} className={p.riskScore >= 70 ? "border-red-300 bg-red-50/20" : p.riskScore >= 40 ? "border-amber-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{p.name} <span className="text-muted-foreground font-normal">({p.id}) · {p.age}yr</span></p>
                    <p className="text-xs text-muted-foreground">{p.condition} · Last visit: {p.lastVisit} · {p.phase}</p>
                  </div>
                  <Badge variant={p.riskScore >= 70 ? "destructive" : p.riskScore >= 40 ? "default" : "outline"} className={`${p.riskScore < 40 ? "text-green-600" : ""}`}>
                    Risk: {p.riskScore}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div><p className="text-[10px] text-muted-foreground">Adherence</p><Progress value={p.adherence} className={`h-2 ${p.adherence < 50 ? "[&>div]:bg-red-500" : p.adherence < 75 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`} /><p className="text-[10px] font-bold">{p.adherence}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Due</p><p className="text-xs font-bold text-red-600">{p.dueDate}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Risk Factors</p><div className="flex flex-wrap gap-1">{p.riskFactors.map((f, i) => <Badge key={i} variant="secondary" className="text-[9px]">{f}</Badge>)}</div></div>
                </div>
                <div className="p-2 rounded bg-purple-50 border border-purple-200 mb-2">
                  <p className="text-xs flex items-start gap-1"><Brain className="h-3 w-3 text-purple-600 mt-0.5 shrink-0" /><span className="text-purple-700"><strong>AI Suggests:</strong> {p.suggestedAction}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${p.name}...`)}><Phone className="h-3 w-3 mr-1" /> Call</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`WhatsApp sent to ${p.name}`)}><MessageCircle className="h-3 w-3 mr-1" /> WhatsApp</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Offer sent: Free follow-up")}><Gift className="h-3 w-3 mr-1" /> Send Offer</Button>
                  <Button size="sm" onClick={() => toast.success("Appointment pre-booked")}><Calendar className="h-3 w-3 mr-1" /> Book Next</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ─── TREATMENT JOURNEY TAB ─── */}
        <TabsContent value="journey" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">8-Phase Ayurvedic Treatment Protocol</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Every patient is mapped to this journey. AI auto-moves them between phases based on progress.</p>
              <div className="space-y-3">
                {treatmentPhases.map(ph => (
                  <div key={ph.phase} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${ph.phase <= 3 ? "bg-green-100 text-green-700" : ph.phase <= 5 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      <span className="text-xs font-bold">{ph.phase}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ph.name}</p>
                      <p className="text-xs text-muted-foreground">{ph.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{ph.duration}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-700"><strong>Key insight:</strong> Most patients drop out between Phase 2-3 (when they feel slightly better but haven't completed Shodhana). AI triggers extra motivation messages at this critical juncture.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SUBSCRIPTIONS TAB ─── */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Active Subscription Plans</CardTitle></CardHeader>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr>
                  <th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-left">Duration</th><th className="px-3 py-2 text-left">Includes</th><th className="px-3 py-2 text-center">Active Patients</th>
                </tr></thead>
                <tbody>{subscriptionPlans.map((sp, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{sp.name}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{sp.price.toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs">{sp.duration}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{sp.includes}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline">{sp.patients}</Badge></td>
                  </tr>
                ))}</tbody>
                <tfoot className="border-t font-bold"><tr>
                  <td className="px-3 py-2" colSpan={4}>Total Subscription Revenue (Monthly)</td>
                  <td className="px-3 py-2 text-center text-green-600">₹1,82,500</td>
                </tr></tfoot>
              </table>
            </div></CardContent>
          </Card>
          <div className="flex gap-2">
            <Button onClick={() => toast.success("New plan created")}><IndianRupee className="h-4 w-4 mr-1" /> Create New Plan</Button>
            <Button variant="outline" onClick={() => toast.success("Renewal reminders sent to 12 patients")}>Send Renewal Reminders</Button>
          </div>
        </TabsContent>

        {/* ─── FAMILY & REFERRALS TAB ─── */}
        <TabsContent value="family" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Family Engagement</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { patient: "Mrs. Kalpana", family: "Husband: Ravi (9876543210)", status: "Caretaker assigned", action: "Update family on progress" },
                  { patient: "Mr. Nagaraj", family: "Son: Suresh (9443314670)", status: "Son manages visits", action: "Send monthly summary to son" },
                  { patient: "Mrs. Hameedhal", family: "Son: Ahmed (9876500013)", status: "Transport dependent", action: "Coordinate pickup for visits" },
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <p className="text-sm font-medium">{f.patient}</p>
                    <p className="text-xs text-muted-foreground">{f.family}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="secondary" className="text-[10px]">{f.status}</Badge>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => toast.success(f.action)}>{f.action}</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4 text-green-600" /> Referral Performance</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-green-50 rounded text-center"><p className="text-lg font-bold text-green-600">23</p><p className="text-[10px] text-muted-foreground">Referrals This Month</p></div>
                  <div className="p-2 bg-blue-50 rounded text-center"><p className="text-lg font-bold text-blue-600">₹68,000</p><p className="text-[10px] text-muted-foreground">Revenue from Referrals</p></div>
                </div>
                <p className="text-xs font-medium">Top Referrers:</p>
                {[
                  { name: "Priya S.", referrals: 5, earned: "₹2,500 points" },
                  { name: "Rahul K.", referrals: 3, earned: "₹1,500 points" },
                  { name: "Mohammed F.", referrals: 3, earned: "₹1,500 points" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{r.name} ({r.referrals} referrals)</span>
                    <Badge variant="outline" className="text-[10px] text-green-600">{r.earned}</Badge>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => toast.success("Referral prompts sent to 15 happy patients")}>
                  <MessageCircle className="h-3 w-3 mr-1" /> Trigger Referral Prompts (AI picks best timing)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── GAMIFICATION TAB ─── */}
        <TabsContent value="gamification" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Patient Motivation Engine</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Patients earn points and see milestones — they feel motivated without knowing it's a retention tool.</p>
              <div className="space-y-3">
                <p className="text-sm font-medium">Auto-triggered Rewards:</p>
                {[
                  { trigger: "Complete each consultation visit", reward: "+100 points", timing: "Immediately after checkout" },
                  { trigger: "7-day streak (took medicines daily)", reward: "+250 points + badge", timing: "WhatsApp celebration message" },
                  { trigger: "Complete Panchakarma course", reward: "+1000 points + certificate", timing: "On last day + photo opportunity" },
                  { trigger: "Refer a friend who visits", reward: "+500 points + ₹500 off next visit", timing: "When referred patient checks in" },
                  { trigger: "Leave Google Review", reward: "+200 points", timing: "Prompt on 2nd visit (when feeling better)" },
                  { trigger: "Complete 8-phase journey", reward: "Gold membership + annual free checkup", timing: "Graduation ceremony feel" },
                  { trigger: "Birthday", reward: "Free consultation + wellness gift", timing: "Birthday morning WhatsApp" },
                  { trigger: "1-year anniversary as patient", reward: "+1000 points + health package discount", timing: "Anniversary date" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded border">
                    <div><p className="text-sm">{r.trigger}</p><p className="text-[10px] text-muted-foreground">Timing: {r.timing}</p></div>
                    <Badge variant="outline" className="text-amber-600 text-xs shrink-0">{r.reward}</Badge>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700"><Zap className="h-3 w-3 inline mr-1" /><strong>Patient sees:</strong> "You've earned 750 health points! 🎉 Only 250 more for a free Abhyanga session." They feel REWARDED, not TRACKED.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ADHERENCE TRACKER TAB ─── */}
        <TabsContent value="adherence" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Medicine Adherence Tracker</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Patients confirm medicine intake via WhatsApp "Done" replies. Doctor sees compliance % before each consultation.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-center">Today</th>
                    <th className="px-3 py-2 text-center">This Week</th>
                    <th className="px-3 py-2 text-center">This Month</th>
                    <th className="px-3 py-2 text-center">Streak</th>
                    <th className="px-3 py-2 text-left">Issue</th>
                    <th className="px-3 py-2 text-left">AI Suggestion</th>
                  </tr></thead>
                  <tbody>
                    {[
                      { name: "Mrs. Kalpana", today: "1/3", week: "40%", month: "38%", streak: "0 days", issue: "Stopped Kashayam (taste)", suggestion: "Switch to Rasnadi Tablet form" },
                      { name: "Mr. Nagaraj", today: "2/3", week: "72%", month: "70%", streak: "3 days", issue: "Forgets evening dose", suggestion: "Set 6 PM alarm via WhatsApp" },
                      { name: "Rabiyathubasaria", today: "3/3", week: "92%", month: "85%", streak: "12 days", issue: "None", suggestion: "On track — send praise message" },
                      { name: "Mrs. Hameedhal", today: "2/4", week: "55%", month: "52%", streak: "1 day", issue: "Confuses multiple medicines", suggestion: "Create visual med chart with photos" },
                      { name: "Mr. Kubbusamy", today: "0/3", week: "0%", month: "15%", streak: "0 days", issue: "Stopped all AYUSH meds", suggestion: "Urgent: Doctor call needed" },
                    ].map((p, i) => (
                      <tr key={i} className={`border-b hover:bg-muted/30 ${parseInt(p.month) < 40 ? "bg-red-50/30" : ""}`}>
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-center"><Badge variant={p.today.startsWith("3") || p.today.startsWith("4") ? "outline" : "secondary"} className={`text-[10px] ${p.today.startsWith("3") || p.today.startsWith("4") ? "text-green-600" : ""}`}>{p.today}</Badge></td>
                        <td className="px-3 py-2 text-center"><Progress value={parseInt(p.week)} className={`h-2 w-12 inline-block ${parseInt(p.week) < 50 ? "[&>div]:bg-red-500" : parseInt(p.week) < 75 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`} /></td>
                        <td className="px-3 py-2 text-center font-bold">{p.month}</td>
                        <td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[10px] ${parseInt(p.streak) >= 7 ? "text-green-600" : ""}`}>{p.streak}</Badge></td>
                        <td className="px-3 py-2 text-xs text-red-600">{p.issue}</td>
                        <td className="px-3 py-2 text-xs text-purple-700">{p.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="my-3" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Reminders sent to non-compliant patients")}><MessageCircle className="h-3 w-3 mr-1" /> Send Reminders to Low Adherence</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Generating alternative medicine suggestions...")}><Brain className="h-3 w-3 mr-1" /> AI Suggest Alternatives (for taste/form issues)</Button>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700"><strong>How it works:</strong> Patient gets WhatsApp at medicine time: "Time for Rasnasaptakam Kashayam 15ml 💊 Reply DONE when taken." Their reply auto-updates this tracker. No app install needed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── REJUVENATION SCHEDULE TAB ─── */}
        <TabsContent value="rejuvenation" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" /> Rejuvenation & Maintenance Schedule</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">After acute treatment ends → patients auto-move to maintenance. AI schedules seasonal Panchakarma, Ritucharya adjustments, and annual check-ups.</p>
              <div className="space-y-3">
                <p className="text-sm font-medium">Upcoming Maintenance Events (Auto-scheduled by AI):</p>
                {[
                  { patient: "Priya S.", event: "Seasonal Panchakarma (Varsha Ritu)", date: "Aug 2026", reason: "Monsoon → Vata aggravation. Basti recommended.", status: "Reminder sent" },
                  { patient: "Rahul K.", event: "6-month Rasayana Course Renewal", date: "Sep 2026", reason: "Ashwagandha + Chyawanprash course ending. Renewal needed.", status: "Pending" },
                  { patient: "Mr. Nagaraj", event: "Annual Health Check-up", date: "Oct 2026", reason: "1 year since registration. Full blood work + Prakriti recheck.", status: "Pending" },
                  { patient: "Mrs. Kalpana", event: "Post-PK Follow-up (45 days)", date: "Aug 2026", reason: "Assess Panchakarma results. Decide Shamana continuation.", status: "Pending" },
                  { patient: "Mohammed F.", event: "Ritucharya Diet Change (Sharad)", date: "Sep 2026", reason: "Summer → Autumn transition. Change from Pitta to Vata diet.", status: "Pending" },
                  { patient: "ALL Pediatric", event: "Swarnaprasanam (Monthly)", date: "Every Pushya Nakshatra", reason: "Monthly gold-drops for children. 82 kids registered.", status: "Auto-recurring" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{e.patient} — {e.event}</p>
                      <p className="text-xs text-muted-foreground">{e.reason}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <Badge variant="outline" className="text-xs">{e.date}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{e.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-green-700">Ritucharya Calendar (AI)</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between"><span>Varsha (Monsoon Jul-Sep)</span><span className="text-green-600">→ Basti, warm food, no raw</span></div>
                      <div className="flex justify-between"><span>Sharad (Autumn Oct-Nov)</span><span className="text-green-600">→ Virechana, Pitta shamana</span></div>
                      <div className="flex justify-between"><span>Hemant (Winter Dec-Jan)</span><span className="text-green-600">→ Abhyanga, heavy foods OK</span></div>
                      <div className="flex justify-between"><span>Shishir (Late Winter Feb-Mar)</span><span className="text-green-600">→ Nasya, warm oil therapies</span></div>
                      <div className="flex justify-between"><span>Vasant (Spring Apr-May)</span><span className="text-green-600">→ Vamana, Kapha reduction</span></div>
                      <div className="flex justify-between"><span>Grishma (Summer Jun-Jul)</span><span className="text-green-600">→ Cool foods, Pitta pacify</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50/30">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-purple-700">AI Auto-Actions</p>
                    <div className="mt-2 space-y-1.5 text-xs text-purple-600">
                      <p>• 2 weeks before season change → WhatsApp diet change advisory to all patients</p>
                      <p>• At treatment completion → auto-schedule 45-day follow-up + Rasayana phase</p>
                      <p>• Annual anniversary → offer health check-up package + loyalty reward</p>
                      <p>• Swarnaprasanam date → auto-remind all registered parents via WhatsApp</p>
                      <p>• Patient birthday → wellness wishes + free consultation coupon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => toast.success("Seasonal reminders sent to all 145 active patients")}><MessageCircle className="h-3 w-3 mr-1" /> Send Ritucharya Reminders (All)</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Swarnaprasanam reminders sent to 82 parents")}><Calendar className="h-3 w-3 mr-1" /> Trigger Swarnaprasanam Alert</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorRetention;
