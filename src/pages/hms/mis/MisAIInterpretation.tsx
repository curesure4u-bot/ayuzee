import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Target, Lightbulb, BarChart3, ArrowUpRight, ArrowDownRight, Zap,
  Eye, MessageSquare, RefreshCw, Clock, Shield, Activity
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { day: "Jul 15", revenue: 52000, predicted: 53000 },
  { day: "Jul 16", revenue: 58000, predicted: 55000 },
  { day: "Jul 17", revenue: 48000, predicted: 56000 },
  { day: "Jul 18", revenue: 65000, predicted: 58000 },
  { day: "Jul 19", revenue: 55000, predicted: 59000 },
  { day: "Jul 20", revenue: 72000, predicted: 61000 },
  { day: "Jul 21", revenue: 60700, predicted: 62000 },
  { day: "Jul 22", revenue: 60700, predicted: 63000 },
  { day: "Jul 23", revenue: 0, predicted: 64000 },
  { day: "Jul 24", revenue: 0, predicted: 62000 },
  { day: "Jul 25", revenue: 0, predicted: 65000 },
];

const aiNarratives = {
  revenue: {
    title: "Revenue Analysis - July 2026",
    narrative: `Your clinic generated ₹6,80,000 revenue this month (22 days). This represents an 12.5% increase compared to June 2026 (₹6,04,000). The growth is primarily driven by:

• **OPD Consultations** (+18%): Dr. Sivarama Krishnan's patient volume increased from 78 to 92 consultations
• **Pharmacy OTC** (+23%): Monsoon-related immunity products (Chyawanprash, Giloy) saw seasonal demand spike
• **Panchakarma** (+15%): 3 new package enrollments from Instagram campaign

**Concerning Areas:**
• Lab revenue decreased by 8% — possibly due to 2 days machine downtime on Jul 18-19
• IP revenue flat — room occupancy at 65%, potential to push to 80%

**Prediction:** Based on current trajectory, you'll close July at approximately ₹8,50,000 — exceeding your ₹8,00,000 target by 6.3%.`,
    confidence: 92,
  },
  expense: {
    title: "Expense Pattern Analysis",
    narrative: `Total expenses: ₹3,70,000 (expense ratio: 54.4%). This is within healthy range (target: <60%).

**Key Findings:**
• Fixed expenses stable at ₹3,35,000/month (salary ₹2.5L + rent ₹25K + utilities ₹35K + EMI ₹35K)
• Variable expenses ₹1,62,000 — 8% over budget primarily due to unplanned AC repair (₹3,500) and extra medicine restock (₹12,000) for monsoon demand

**Anomaly Detected:** Marketing expense ₹8,000 on newspaper ad (Jul 19) — ROI analysis shows only 3 patients attributed. Suggest shifting budget to WhatsApp campaigns (18% conversion vs 2% newspaper).

**Optimization Opportunity:** Consolidate lab reagent orders with Rajapalayam branch — estimated saving ₹2,400/month on shipping.`,
    confidence: 88,
  },
  patients: {
    title: "Patient Flow Intelligence",
    narrative: `Total unique patients this month: 245 (92 new + 153 returning). Repeat rate: 62.4% (target: 60% ✓).

**AI Insights:**
• Monday and Thursday are peak days (avg 38 patients vs 28 on other days)
• Average waiting time: 18 minutes (improved from 24 min last month after token system)
• 12% of new patients came through referral program — highest ROI acquisition channel
• Patient drop-off: 28 patients haven't returned in 60+ days (LTV at risk: ₹4.2L)

**Recommendation:** Send re-engagement WhatsApp with seasonal health tips + 10% discount QR to dormant patients. Expected recovery: 35% (based on past campaigns).`,
    confidence: 85,
  },
  stock: {
    title: "Stock & Pharmacy Intelligence",
    narrative: `Current stock value: ₹9,50,000 across 3 stores. Stock turnover ratio: 4.2x (healthy for AYUSH pharmacy).

**Alerts:**
• 5 products below reorder level — auto PO generated for top 3 (Triphala, Ashwagandha, Dhanwantharam Oil)
• 12 items expiring within 30 days (value: ₹18,500) — suggest clearance sale or return to supplier
• Slow-moving: 8 products with zero sales in 60 days (₹12,000 dead stock)

**Margin Analysis:**
• Best margin: Kumkumadi Oil 30% → focus promotion
• Lowest margin: Chyawanprash 18% → negotiate better supplier rate or switch brand
• Overall pharmacy margin: 22.5% (industry avg: 20%)

**Prediction:** Based on monsoon season patterns, expect 30% increase in immunity product demand next 2 weeks. Pre-stock accordingly.`,
    confidence: 90,
  },
};

const anomalies = [
  { type: "spike", metric: "OPD Revenue", date: "Jul 20", value: "₹72,000", normal: "₹55,000", reason: "Saturday camp + walk-ins", severity: "info" },
  { type: "drop", metric: "Lab Tests", date: "Jul 18-19", value: "0 tests", normal: "12/day", reason: "Machine downtime (Biochemistry analyzer)", severity: "high" },
  { type: "spike", metric: "Pharmacy OTC", date: "Jul 21", value: "₹12,800", normal: "₹8,500", reason: "Monsoon immunity product rush", severity: "info" },
  { type: "drop", metric: "Digital Payments", date: "Jul 17", value: "₹8,200", normal: "₹15,000", reason: "GPay server issue (2hrs)", severity: "medium" },
  { type: "spike", metric: "Expense", date: "Jul 22", value: "₹45,000", normal: "₹12,000", reason: "Himalaya bulk order (quarterly)", severity: "info" },
  { type: "drop", metric: "New Patients", date: "Jul 19", value: "2", normal: "6/day", reason: "Heavy rain + competitor camp nearby", severity: "medium" },
];

const predictions = [
  { metric: "July End Revenue", prediction: "₹8,50,000", confidence: 92, vsTarget: "+6.3%" },
  { metric: "Next Week Collection", prediction: "₹4,20,000", confidence: 85, vsTarget: "On track" },
  { metric: "Pharmacy Demand (Immunity)", prediction: "+30% next 2 weeks", confidence: 78, vsTarget: "Stock now" },
  { metric: "Due Collection (Next 7 days)", prediction: "₹42,000 of ₹68,500", confidence: 72, vsTarget: "62% recovery" },
  { metric: "Staff Incentive Payout", prediction: "₹63,000 (end of month)", confidence: 95, vsTarget: "Budget OK" },
  { metric: "Supplier Payment Due", prediction: "₹1,23,000 by Jul 30", confidence: 98, vsTarget: "Cash sufficient" },
];

const MisAIInterpretation = () => {
  const [activeTab, setActiveTab] = useState("narrative");
  const [selectedReport, setSelectedReport] = useState("revenue");

  const currentNarrative = aiNarratives[selectedReport as keyof typeof aiNarratives];

  return (
    <div className="space-y-4 mt-4">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">AI Report Interpretation Engine</h3>
                <p className="text-xs text-muted-foreground">Auto-generates narratives, detects anomalies, predicts trends, and gives actionable advice</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700"><Zap className="mr-1 h-3 w-3" /> Real-time Analysis</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="narrative"><Brain className="mr-1 h-3.5 w-3.5" /> AI Narratives</TabsTrigger>
          <TabsTrigger value="anomalies"><AlertTriangle className="mr-1 h-3.5 w-3.5" /> Anomaly Detection</TabsTrigger>
          <TabsTrigger value="predictions"><TrendingUp className="mr-1 h-3.5 w-3.5" /> Predictions</TabsTrigger>
          <TabsTrigger value="recommendations"><Lightbulb className="mr-1 h-3.5 w-3.5" /> Recommendations</TabsTrigger>
          <TabsTrigger value="ask-ai"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Ask AI</TabsTrigger>
        </TabsList>

        {/* AI NARRATIVES */}
        <TabsContent value="narrative" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(aiNarratives).map((key) => (
              <Button key={key} size="sm" variant={selectedReport === key ? "default" : "outline"} className="text-xs capitalize"
                onClick={() => setSelectedReport(key)}>
                {key}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{currentNarrative.title}</CardTitle>
                <Badge className="bg-primary/10 text-primary">AI Confidence: {currentNarrative.confidence}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-sm text-foreground/80 whitespace-pre-line">
                {currentNarrative.narrative}
              </div>
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">AI Revenue Prediction (Actual vs Forecast)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—"} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" name="Actual" />
                  <Area type="monotone" dataKey="predicted" stroke="#6366f1" fill="#6366f120" strokeDasharray="5 5" name="AI Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANOMALY DETECTION */}
        <TabsContent value="anomalies" className="space-y-3 mt-4">
          <Card className="border-amber-100">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-amber-700">AI monitors all data streams 24/7. </span>
                Anomalies are auto-detected when values deviate &gt;20% from expected range. Each anomaly includes root cause analysis.
              </p>
            </CardContent>
          </Card>

          {anomalies.map((a, i) => (
            <Card key={i} className={a.severity === "high" ? "border-red-200" : a.severity === "medium" ? "border-amber-200" : ""}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {a.type === "spike" ? <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5" /> : <ArrowDownRight className="h-4 w-4 text-red-500 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{a.metric}</p>
                        <Badge className={a.severity === "high" ? "bg-red-100 text-red-700" : a.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                          {a.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.date} — Value: <span className="font-semibold">{a.value}</span> (Normal: {a.normal})
                      </p>
                      <p className="text-xs mt-1"><span className="font-medium">AI Root Cause:</span> {a.reason}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PREDICTIONS */}
        <TabsContent value="predictions" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> AI Predictions (Next 7-30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded border">
                    <div>
                      <p className="font-medium text-sm">{p.metric}</p>
                      <p className="text-xs text-muted-foreground">{p.vsTarget}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-bold text-primary">{p.prediction}</span>
                      <Badge variant="outline" className="text-[10px]">{p.confidence}% confident</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECOMMENDATIONS */}
        <TabsContent value="recommendations" className="space-y-3 mt-4">
          {[
            { priority: "high", category: "Revenue", action: "Send re-engagement WhatsApp to 28 dormant patients (60+ days inactive)", impact: "Expected recovery: ₹4.2L LTV", timeline: "This week" },
            { priority: "high", category: "Collection", action: "Clear overdue dues from 5 patients (>30 days, total ₹45,000)", impact: "Improve cash flow by 8%", timeline: "Next 3 days" },
            { priority: "medium", category: "Stock", action: "Pre-stock immunity products (Chyawanprash, Giloy, Tulsi) for monsoon demand spike", impact: "Prevent stockouts, +₹35K potential revenue", timeline: "Next week" },
            { priority: "medium", category: "Expense", action: "Shift newspaper ad budget (₹8K/month) to WhatsApp campaigns", impact: "9x better ROI (18% vs 2% conversion)", timeline: "Next month" },
            { priority: "medium", category: "Operations", action: "Extend Thursday evening OPD by 1 hour (peak demand day)", impact: "+8 consultations/week = ₹4K extra revenue", timeline: "Immediately" },
            { priority: "low", category: "Lab", action: "Schedule preventive maintenance for Biochemistry analyzer (avoid repeat of Jul 18 downtime)", impact: "Prevent ₹24K revenue loss per downtime day", timeline: "This month" },
            { priority: "low", category: "Franchise", action: "Follow up with Erode franchise (₹55K overdue since Jun 28)", impact: "Recover overdue receivable", timeline: "This week" },
            { priority: "low", category: "Staff", action: "Lakshmi (Therapist) at 72% target — assign 5 more Panchakarma bookings", impact: "Help achieve monthly target + incentive", timeline: "This week" },
          ].map((rec, i) => (
            <Card key={i} className={rec.priority === "high" ? "border-red-200" : rec.priority === "medium" ? "border-amber-200" : ""}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Lightbulb className={`h-4 w-4 mt-0.5 ${rec.priority === "high" ? "text-red-500" : rec.priority === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={rec.priority === "high" ? "bg-red-100 text-red-700" : rec.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{rec.category}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {rec.timeline}</span>
                    </div>
                    <p className="text-sm font-medium">{rec.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Impact: {rec.impact}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">Act</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ASK AI */}
        <TabsContent value="ask-ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Ask AI About Your Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Ask anything about your MIS data... e.g., 'Why did revenue drop on Jul 18?', 'Compare this month pharmacy sales vs last month', 'Which doctor has best patient retention?'" className="min-h-[80px]" />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {["Why revenue dropped?", "Best performing dept?", "Expense optimization tips", "Predict next week"].map((q, i) => (
                    <Button key={i} size="sm" variant="secondary" className="text-[10px] h-6">{q}</Button>
                  ))}
                </div>
                <Button size="sm"><Brain className="mr-1 h-4 w-4" /> Ask AI</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample AI Response */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary mb-2">AI Response</p>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Based on your MIS data analysis for July 2026:</p>
                    <p><strong>Revenue dropped on Jul 18</strong> because the Biochemistry analyzer was down for maintenance. This caused 0 lab tests that day (normally 12/day avg). Revenue impact: ~₹12,000 lost.</p>
                    <p><strong>Action taken:</strong> I've scheduled preventive maintenance for Aug 15 (Sunday) to avoid future business-day disruptions. Also added a backup testing protocol to route urgent samples to partner lab during downtime.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisAIInterpretation;
