import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Clock, Users, Bell, CheckCircle, Plus, MessageCircle, ArrowUp,
  Brain, Zap, TrendingUp, AlertTriangle, Calendar, Target,
  Activity, Timer, BarChart3, Phone,
} from "lucide-react";

type WaitlistEntry = {
  id: string; patient: string; phone: string; department: string;
  doctor: string; preferredDate: string; preferredTime: string;
  priority: "normal" | "urgent" | "vip"; reason: string;
  addedDate: string; status: "waiting" | "notified" | "booked" | "expired";
  position: number;
  // AI-enhanced fields
  aiPredictedWait: string; aiSlotMatch: number; aiCancellationProb: number;
  aiPriorityScore: number; aiRecommendation: string;
};

const mockWaitlist: WaitlistEntry[] = [
  {
    id: "1", patient: "Priya Menon", phone: "+91-9876500010", department: "Panchakarma",
    doctor: "Dr. Meena Patel", preferredDate: "2026-07-23", preferredTime: "Morning",
    priority: "normal", reason: "All Panchakarma slots full for this week",
    addedDate: "2026-07-20", status: "notified", position: 1,
    aiPredictedWait: "1.5 hrs", aiSlotMatch: 92, aiCancellationProb: 35,
    aiPriorityScore: 78, aiRecommendation: "High chance of opening — Patient #4 (10AM slot) has 65% cancellation probability based on 3 prior no-shows."
  },
  {
    id: "2", patient: "Rahul Kumar", phone: "+91-9876500011", department: "Ayurveda",
    doctor: "Dr. Arun Sharma", preferredDate: "2026-07-23", preferredTime: "Any",
    priority: "urgent", reason: "Doctor on leave Jul 22. Rescheduled.",
    addedDate: "2026-07-21", status: "waiting", position: 2,
    aiPredictedWait: "45 min", aiSlotMatch: 88, aiCancellationProb: 42,
    aiPriorityScore: 91, aiRecommendation: "Urgent flag + flexible timing = likely to get slot by 11 AM. Dr. Sharma's 10:30 patient called to confirm — 42% no-show risk."
  },
  {
    id: "3", patient: "Ananya S.", phone: "+91-9876500012", department: "Panchakarma",
    doctor: "Dr. Meena Patel", preferredDate: "2026-07-24", preferredTime: "Afternoon",
    priority: "normal", reason: "Shirodhara room occupied",
    addedDate: "2026-07-21", status: "waiting", position: 3,
    aiPredictedWait: "1 day", aiSlotMatch: 75, aiCancellationProb: 20,
    aiPriorityScore: 55, aiRecommendation: "Shirodhara room available tomorrow 2 PM (90 min session ending at 1:30 PM). Auto-book recommended."
  },
  {
    id: "4", patient: "Mohammed F.", phone: "+91-9876500013", department: "Ayurveda",
    doctor: "Dr. Arun Sharma", preferredDate: "2026-07-25", preferredTime: "Morning",
    priority: "vip", reason: "Follow-up after Panchakarma, next available",
    addedDate: "2026-07-21", status: "waiting", position: 4,
    aiPredictedWait: "2 days", aiSlotMatch: 70, aiCancellationProb: 15,
    aiPriorityScore: 85, aiRecommendation: "VIP patient — suggest reserving Dr. Sharma's 9 AM slot on Jul 25. Pattern shows 2-3 cancellations happen on Fridays."
  },
  {
    id: "5", patient: "Lakshmi Nair", phone: "+91-9876500014", department: "Homeopathy",
    doctor: "Dr. Priya Das", preferredDate: "2026-07-23", preferredTime: "Evening",
    priority: "normal", reason: "All evening slots booked",
    addedDate: "2026-07-20", status: "booked", position: 0,
    aiPredictedWait: "0", aiSlotMatch: 100, aiCancellationProb: 0,
    aiPriorityScore: 60, aiRecommendation: "Converted — slot opened due to cancellation at 5:30 PM. Auto-notified and confirmed in 12 minutes."
  },
  {
    id: "6", patient: "David Thomas", phone: "+971-50-1234567", department: "Teleconsult",
    doctor: "Dr. Arun Sharma", preferredDate: "2026-07-27", preferredTime: "IST 8 PM",
    priority: "normal", reason: "International time zone - limited slots",
    addedDate: "2026-07-21", status: "waiting", position: 5,
    aiPredictedWait: "4 days", aiSlotMatch: 60, aiCancellationProb: 10,
    aiPriorityScore: 45, aiRecommendation: "Limited evening teleconsult slots. Suggest opening a special 8 PM slot on Sun/Wed based on demand pattern analysis."
  },
  {
    id: "7", patient: "Kavitha R.", phone: "+91-9876500015", department: "Panchakarma",
    doctor: "Dr. Meena Patel", preferredDate: "2026-07-23", preferredTime: "Morning",
    priority: "urgent", reason: "Post-surgery rehabilitation - time-sensitive",
    addedDate: "2026-07-22", status: "waiting", position: 6,
    aiPredictedWait: "3 hrs", aiSlotMatch: 82, aiCancellationProb: 55,
    aiPriorityScore: 88, aiRecommendation: "HIGH PRIORITY: Post-surgical window closing. Patient at Position 1 (Priya) has alternate slot available at City Center branch. Suggest offering branch swap to Priya, move Kavitha up."
  },
];

const HmsWaitlist = () => {
  const [waitlist] = useState<WaitlistEntry[]>(mockWaitlist);
  const [addOpen, setAddOpen] = useState(false);

  const active = waitlist.filter(w => w.status === "waiting" || w.status === "notified").length;
  const notified = waitlist.filter(w => w.status === "notified").length;
  const booked = waitlist.filter(w => w.status === "booked").length;
  const avgWait = "2.1 hrs";
  const conversionRate = Math.round((booked / waitlist.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-600" /> AI-Powered Waitlist Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Predictive wait times · Smart slot matching · Cancellation probability · Auto-notification · Priority scoring
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add to Waitlist
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Users className="h-5 w-5 mx-auto text-amber-600" />
          <p className="text-xl font-bold mt-1">{active}</p>
          <p className="text-xs text-muted-foreground">Active Queue</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Bell className="h-5 w-5 mx-auto text-blue-600" />
          <p className="text-xl font-bold mt-1">{notified}</p>
          <p className="text-xs text-muted-foreground">Slot Notified</p>
        </CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-xl font-bold mt-1">{booked}</p>
          <p className="text-xs text-muted-foreground">Converted</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Timer className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">{avgWait}</p>
          <p className="text-xs text-muted-foreground">Avg AI Wait</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Target className="h-5 w-5 mx-auto text-orange-600" />
          <p className="text-xl font-bold mt-1">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Brain className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">94%</p>
          <p className="text-xs text-muted-foreground">AI Accuracy</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="queue">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="queue">Smart Queue</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Wait Analytics</TabsTrigger>
          <TabsTrigger value="automation">Auto-Rules</TabsTrigger>
        </TabsList>

        {/* Smart Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">AI-Optimized Waitlist Queue</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Patient</th>
                    <th className="px-3 py-2 text-left font-medium">Dept / Doctor</th>
                    <th className="px-3 py-2 text-left font-medium">Preferred</th>
                    <th className="px-3 py-2 text-left font-medium">Priority</th>
                    <th className="px-3 py-2 text-left font-medium">AI Wait</th>
                    <th className="px-3 py-2 text-left font-medium">Slot Match</th>
                    <th className="px-3 py-2 text-left font-medium">Cancel Prob</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {waitlist.filter(w => w.status !== "expired").sort((a, b) => b.aiPriorityScore - a.aiPriorityScore).map((w) => (
                      <tr key={w.id} className={`border-b hover:bg-muted/30 ${w.status === "notified" ? "bg-blue-50/30" : w.status === "booked" ? "bg-green-50/30" : ""}`}>
                        <td className="px-3 py-2 font-bold text-xs">{w.position || "✓"}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-xs">{w.patient}</p>
                          <p className="text-[10px] text-muted-foreground">{w.phone}</p>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <p>{w.department}</p>
                          <p className="text-[10px] text-muted-foreground">{w.doctor}</p>
                        </td>
                        <td className="px-3 py-2 text-xs">{w.preferredDate}<br/><span className="text-muted-foreground">{w.preferredTime}</span></td>
                        <td className="px-3 py-2">
                          <Badge variant={w.priority === "urgent" ? "destructive" : w.priority === "vip" ? "default" : "secondary"} className="text-[10px] capitalize">
                            {w.priority}
                          </Badge>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Score: {w.aiPriorityScore}</p>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-bold ${w.aiPredictedWait === "0" ? "text-green-600" : ""}`}>
                            {w.aiPredictedWait === "0" ? "Done" : w.aiPredictedWait}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Progress value={w.aiSlotMatch} className="h-2 w-12" />
                            <span className="text-[10px]">{w.aiSlotMatch}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={w.aiCancellationProb > 40 ? "destructive" : w.aiCancellationProb > 20 ? "default" : "secondary"} className="text-[10px]">
                            {w.aiCancellationProb}%
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={w.status === "notified" ? "default" : w.status === "booked" ? "outline" : "secondary"} className={`text-[10px] capitalize ${w.status === "booked" ? "text-green-600" : ""}`}>
                            {w.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {w.status === "waiting" && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.success("WhatsApp sent: slot available notification")}>
                                <MessageCircle className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                            {w.status === "notified" && (
                              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Converted to booking!")}>
                                Book
                              </Button>
                            )}
                            {w.status === "waiting" && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.info("Moved up in priority")}>
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" /> AI Recommendations per Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitlist.filter(w => w.status === "waiting" || w.status === "notified").map((w) => (
                  <div key={w.id} className={`p-4 rounded-lg border ${w.aiPriorityScore > 85 ? "border-amber-300 bg-amber-50/20" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{w.patient}</p>
                        <Badge variant="outline" className="text-[10px]">{w.department}</Badge>
                        <Badge variant={w.priority === "urgent" ? "destructive" : w.priority === "vip" ? "default" : "secondary"} className="text-[10px] capitalize">
                          {w.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">AI Score:</span>
                        <Badge variant="outline" className={`font-bold ${w.aiPriorityScore > 80 ? "text-amber-600" : ""}`}>
                          {w.aiPriorityScore}/100
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Timer className="h-4 w-4 mx-auto text-purple-600" />
                        <p className="text-sm font-bold mt-1">{w.aiPredictedWait}</p>
                        <p className="text-[10px] text-muted-foreground">Predicted Wait</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Target className="h-4 w-4 mx-auto text-blue-600" />
                        <p className="text-sm font-bold mt-1">{w.aiSlotMatch}%</p>
                        <p className="text-[10px] text-muted-foreground">Slot Match</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Activity className="h-4 w-4 mx-auto text-orange-600" />
                        <p className="text-sm font-bold mt-1">{w.aiCancellationProb}%</p>
                        <p className="text-[10px] text-muted-foreground">Cancel Prob (next slot)</p>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-purple-50 border border-purple-200">
                      <p className="text-xs flex items-start gap-1">
                        <Zap className="h-3 w-3 text-purple-600 mt-0.5 shrink-0" />
                        <span className="text-purple-700">{w.aiRecommendation}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wait Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Wait Time by Department</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { dept: "Panchakarma", avgWait: "4.2 hrs", maxWait: "2 days", queueSize: 3, trend: "up" },
                    { dept: "Ayurveda OPD", avgWait: "1.5 hrs", maxWait: "6 hrs", queueSize: 2, trend: "down" },
                    { dept: "Homeopathy", avgWait: "45 min", maxWait: "3 hrs", queueSize: 1, trend: "flat" },
                    { dept: "Teleconsult", avgWait: "4 days", maxWait: "7 days", queueSize: 1, trend: "up" },
                  ].map(d => (
                    <div key={d.dept} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{d.dept}</p>
                        <Badge variant="outline" className="text-[10px]">{d.queueSize} waiting</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span>Avg: <strong>{d.avgWait}</strong></span>
                        <span>Max: <strong>{d.maxWait}</strong></span>
                        <span className={`${d.trend === "up" ? "text-red-600" : d.trend === "down" ? "text-green-600" : "text-muted-foreground"}`}>
                          {d.trend === "up" ? "↑ Increasing" : d.trend === "down" ? "↓ Decreasing" : "→ Stable"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">AI Prediction Accuracy</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { metric: "Wait Time Prediction", accuracy: 94, improved: "+5% this month" },
                    { metric: "Cancellation Probability", accuracy: 88, improved: "+3% this month" },
                    { metric: "Slot Match Success", accuracy: 91, improved: "+7% this month" },
                    { metric: "Priority Score Ordering", accuracy: 96, improved: "+2% this month" },
                    { metric: "Auto-Notification Timing", accuracy: 89, improved: "+4% this month" },
                  ].map(m => (
                    <div key={m.metric} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{m.metric}</span>
                        <span className="font-bold text-green-600">{m.accuracy}%</span>
                      </div>
                      <Progress value={m.accuracy} className="h-2 [&>div]:bg-green-500" />
                      <p className="text-[10px] text-muted-foreground">{m.improved}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { stage: "Added to Waitlist", count: 48, pct: 100 },
                  { stage: "AI Matched to Slot", count: 42, pct: 88 },
                  { stage: "Notified (WhatsApp/Call)", count: 38, pct: 79 },
                  { stage: "Confirmed within 2hrs", count: 32, pct: 67 },
                  { stage: "Converted to Booking", count: 30, pct: 63 },
                ].map(s => (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="text-xs w-[180px]">{s.stage}</span>
                    <div className="flex-1"><Progress value={s.pct} className="h-4" /></div>
                    <span className="text-xs font-bold w-16 text-right">{s.count} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">AI Waitlist Automation Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rule: "Auto-notify next patient when cancellation detected", enabled: true, trigger: "Within 60 seconds", conversions: 24 },
                  { rule: "Escalate VIP patients to branch-swap option after 2hr wait", enabled: true, trigger: "2 hour threshold", conversions: 8 },
                  { rule: "Send WhatsApp reminder to booked patients 24hrs before (reduce no-show)", enabled: true, trigger: "T-24 hours", conversions: 0 },
                  { rule: "Auto-extend waitlist window if patient doesn't confirm in 2hrs", enabled: true, trigger: "2hr timeout", conversions: 5 },
                  { rule: "AI re-ranks queue every 30 minutes based on real-time cancellation signals", enabled: true, trigger: "Every 30 min", conversions: 0 },
                  { rule: "Suggest alternate doctor if preferred doctor wait > 3 days", enabled: true, trigger: "3-day threshold", conversions: 6 },
                  { rule: "Auto-book when slot match > 95% and patient pre-approved any-time", enabled: true, trigger: "Slot match ≥95%", conversions: 12 },
                  { rule: "Call patient (IVR) if WhatsApp unread after 1 hour", enabled: false, trigger: "1hr WhatsApp unread", conversions: 0 },
                  { rule: "Weekend overflow: auto-suggest Sunday special clinic slots", enabled: true, trigger: "Weekday full", conversions: 4 },
                ].map((r) => (
                  <div key={r.rule} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`h-2 w-2 rounded-full ${r.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                      <div>
                        <p className="text-sm">{r.rule}</p>
                        <p className="text-[10px] text-muted-foreground">Trigger: {r.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.conversions > 0 && <Badge variant="outline" className="text-[10px] text-green-600">{r.conversions} conversions</Badge>}
                      <Badge variant={r.enabled ? "outline" : "secondary"} className={`text-[10px] ${r.enabled ? "text-green-600" : ""}`}>
                        {r.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="p-3 flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
              <div className="text-xs text-purple-700">
                <p className="font-medium">AI Priority Scoring Algorithm</p>
                <p className="text-purple-600 mt-0.5">
                  Priority Score (0-100) is calculated from: Medical urgency (30%) + Wait duration (20%) + 
                  VIP/Loyalty tier (15%) + Cancellation probability of upcoming slot (15%) + 
                  Time flexibility of patient (10%) + Revenue potential (10%). 
                  Queue is re-optimized every 30 minutes to maximize conversions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auto-notification info */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Smart Auto-Notification (AI-Enhanced)</p>
            <p className="text-blue-600 mt-0.5">
              When a cancellation is detected, AI identifies the best-matching waitlisted patient (not just next in line) based on 
              department, doctor preference, time match, and priority score. Patient is notified via WhatsApp within 60 seconds. 
              They have 2 hours to confirm, after which the next best match is notified. AI learns from acceptance patterns to improve future matching.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add to Waitlist Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add to AI-Powered Waitlist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name *</Label><Input placeholder="Search patient" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayurveda">Ayurveda</SelectItem>
                    <SelectItem value="panchakarma">Panchakarma</SelectItem>
                    <SelectItem value="homeopathy">Homeopathy</SelectItem>
                    <SelectItem value="teleconsult">Teleconsult</SelectItem>
                    <SelectItem value="siddha">Siddha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Doctor</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d1">Dr. Arun Sharma</SelectItem>
                    <SelectItem value="d2">Dr. Meena Patel</SelectItem>
                    <SelectItem value="d3">Dr. Priya Das</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preferred Date</Label><Input type="date" /></div>
              <div><Label>Preferred Time</Label>
                <Select><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time</SelectItem>
                    <SelectItem value="morning">Morning (8-12)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12-4)</SelectItem>
                    <SelectItem value="evening">Evening (4-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label>
                <Select><SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent (Medical)</SelectItem>
                    <SelectItem value="vip">VIP (Loyalty Member)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Flexibility</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact date/time only</SelectItem>
                    <SelectItem value="flexible-time">Flexible time, same day</SelectItem>
                    <SelectItem value="flexible-day">Flexible ±2 days</SelectItem>
                    <SelectItem value="any">Fully flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Reason for Waitlist</Label><Input placeholder="e.g., All slots full, doctor on leave..." /></div>

            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs flex items-center gap-1 text-purple-700">
                <Brain className="h-3 w-3" /> AI will calculate: predicted wait time, best slot match, and auto-notify when a slot opens.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Added to waitlist. AI predicted wait: ~2 hours. Will auto-notify."); setAddOpen(false); }}>
              Add & Calculate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsWaitlist;
