import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Globe, Link2, Users, IndianRupee, ArrowRight, CheckCircle2,
  XCircle, RefreshCw, Brain, Sparkles, Building2, Phone, Mail,
  Calendar, TrendingUp, BarChart3, Zap, Shield, Clock, Settings,
  ExternalLink, Plug
} from "lucide-react";

type CrmIntegration = {
  id: string;
  name: string;
  type: "accounting" | "crm" | "payment" | "communication";
  logo: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync?: string;
  recordsSynced?: number;
  features: string[];
};

const integrations: CrmIntegration[] = [
  { id: "1", name: "Tally Prime", type: "accounting", logo: "T", status: "connected", lastSync: "Jul 22, 02:30 PM", recordsSynced: 1245, features: ["Vouchers", "Ledgers", "GST", "P&L", "Balance Sheet"] },
  { id: "2", name: "Zoho CRM", type: "crm", logo: "Z", status: "connected", lastSync: "Jul 22, 02:00 PM", recordsSynced: 3420, features: ["Contacts", "Deals", "Tasks", "Pipeline", "Campaigns"] },
  { id: "3", name: "QuickBooks", type: "accounting", logo: "Q", status: "disconnected", features: ["Invoices", "Expenses", "Reports", "Payroll", "Tax"] },
  { id: "4", name: "Razorpay", type: "payment", logo: "R", status: "connected", lastSync: "Jul 22, 03:00 PM", recordsSynced: 856, features: ["Payments", "Settlements", "Refunds", "Subscriptions"] },
  { id: "5", name: "WhatsApp Business API", type: "communication", logo: "W", status: "connected", lastSync: "Jul 22, 03:15 PM", recordsSynced: 2100, features: ["Follow-ups", "Payment Links", "Reminders", "Feedback"] },
  { id: "6", name: "Zoho Books", type: "accounting", logo: "ZB", status: "disconnected", features: ["Invoicing", "Banking", "Reports", "Inventory", "Projects"] },
  { id: "7", name: "Freshsales CRM", type: "crm", logo: "F", status: "disconnected", features: ["Leads", "Contacts", "Deals", "Phone", "Email"] },
  { id: "8", name: "Google Workspace", type: "communication", logo: "G", status: "connected", lastSync: "Jul 22, 01:00 PM", recordsSynced: 450, features: ["Calendar", "Email", "Drive", "Meet"] },
];

type PatientFinancialJourney = {
  id: string;
  name: string;
  phone: string;
  source: string;
  firstVisit: string;
  totalSpent: number;
  visits: number;
  ltv: number;
  stage: "lead" | "first_visit" | "active" | "loyal" | "dormant";
  lastActivity: string;
  pendingDues: number;
  crmNotes: string;
};

const patientJourneys: PatientFinancialJourney[] = [
  { id: "1", name: "Rajesh Kumar", phone: "98xxx12345", source: "Google Ads", firstVisit: "Jan 2026", totalSpent: 45000, visits: 12, ltv: 85000, stage: "loyal", lastActivity: "Jul 21", pendingDues: 0, crmNotes: "High-value patient. Panchakarma regular. Referred 3 patients." },
  { id: "2", name: "Sunita Devi", phone: "97xxx45678", source: "Referral (Rajesh)", firstVisit: "Mar 2026", totalSpent: 18500, visits: 5, ltv: 42000, stage: "active", lastActivity: "Jul 18", pendingDues: 2500, crmNotes: "Interested in Panchakarma package. Follow up next week." },
  { id: "3", name: "Mohammed Ali", phone: "90xxx11223", source: "Walk-in", firstVisit: "Feb 2026", totalSpent: 65000, visits: 15, ltv: 120000, stage: "loyal", lastActivity: "Jul 20", pendingDues: 12500, crmNotes: "IP patient. Insurance claim pending. Family of 4 visits regularly." },
  { id: "4", name: "Priya Sharma", phone: "95xxx22334", source: "Instagram", firstVisit: "Jun 2026", totalSpent: 8500, visits: 3, ltv: 25000, stage: "first_visit", lastActivity: "Jul 22", pendingDues: 0, crmNotes: "New patient. Skin care consultation. High conversion potential." },
  { id: "5", name: "Anand Sharma", phone: "91xxx55667", source: "WhatsApp Campaign", firstVisit: "Dec 2025", totalSpent: 95000, visits: 22, ltv: 150000, stage: "loyal", lastActivity: "Jul 15", pendingDues: 8500, crmNotes: "VIP patient. Panchakarma + Lab regular. Pending payment reminder sent." },
  { id: "6", name: "Deepa Menon", phone: "96xxx77889", source: "Zoho Lead", firstVisit: "May 2026", totalSpent: 12000, visits: 4, ltv: 35000, stage: "active", lastActivity: "Jul 19", pendingDues: 0, crmNotes: "Ayurveda consultation. Interested in wellness packages." },
  { id: "7", name: "Ravi Patel", phone: "93xxx99001", source: "Website Booking", firstVisit: "Jul 2026", totalSpent: 3500, visits: 1, ltv: 15000, stage: "lead", lastActivity: "Jul 22", pendingDues: 0, crmNotes: "First visit today. Online booking. Potential repeat for Panchakarma." },
];

const revenueAttribution = [
  { source: "Google Ads", patients: 45, revenue: 320000, cost: 35000, roi: "9.1x" },
  { source: "Referral Program", patients: 32, revenue: 280000, cost: 12000, roi: "23.3x" },
  { source: "Walk-in", patients: 85, revenue: 450000, cost: 0, roi: "∞" },
  { source: "WhatsApp Campaigns", patients: 28, revenue: 185000, cost: 8000, roi: "23.1x" },
  { source: "Instagram/Social", patients: 18, revenue: 95000, cost: 15000, roi: "6.3x" },
  { source: "Website Booking", patients: 22, revenue: 145000, cost: 5000, roi: "29x" },
  { source: "Zoho CRM Leads", patients: 15, revenue: 120000, cost: 3000, roi: "40x" },
];

const apiWebhooks = [
  { event: "New Bill Created", endpoint: "POST /api/crm/bill-created", target: "Zoho CRM + Tally", active: true },
  { event: "Payment Received", endpoint: "POST /api/crm/payment-received", target: "Tally + Razorpay", active: true },
  { event: "Due Reminder", endpoint: "POST /api/crm/due-reminder", target: "WhatsApp API", active: true },
  { event: "Patient Registered", endpoint: "POST /api/crm/patient-new", target: "Zoho CRM", active: true },
  { event: "Appointment Booked", endpoint: "POST /api/crm/appointment", target: "Google Calendar + Zoho", active: true },
  { event: "Expense Added", endpoint: "POST /api/crm/expense", target: "Tally Prime", active: false },
  { event: "Refund Processed", endpoint: "POST /api/crm/refund", target: "Razorpay + Tally", active: true },
  { event: "Insurance Claim Filed", endpoint: "POST /api/crm/insurance-claim", target: "Zoho CRM", active: false },
];

const CrmAccounts = () => {
  const [activeTab, setActiveTab] = useState("integrations");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            CRM-Integrated Accounts
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect with Tally, Zoho, QuickBooks & external APIs for seamless financial flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Sync All</Button>
          <Button size="sm"><Plug className="mr-1 h-4 w-4" /> Add Integration</Button>
        </div>
      </div>

      {/* Connection Status Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
            <p className="font-display text-xl font-bold text-green-600">{integrations.filter(i => i.status === "connected").length}</p>
            <p className="text-xs text-green-600">Active integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">CRM Patients</p>
            </div>
            <p className="font-display text-xl font-bold text-blue-600">3,420</p>
            <p className="text-xs text-muted-foreground">Synced contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Lead → Revenue</p>
            </div>
            <p className="font-display text-xl font-bold text-purple-600">₹15.9L</p>
            <p className="text-xs text-muted-foreground">This month from CRM</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">API Calls Today</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">847</p>
            <p className="text-xs text-muted-foreground">Webhooks triggered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="patient-journey">Patient Financial Journey</TabsTrigger>
          <TabsTrigger value="attribution">Revenue Attribution</TabsTrigger>
          <TabsTrigger value="api-webhooks">API & Webhooks</TabsTrigger>
          <TabsTrigger value="sync-log">Sync Log</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((intg) => (
              <Card key={intg.id} className={intg.status === "connected" ? "border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        intg.status === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {intg.logo}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{intg.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{intg.type}</Badge>
                      </div>
                    </div>
                    <Badge className={
                      intg.status === "connected" ? "bg-green-100 text-green-700" :
                      intg.status === "error" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {intg.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {intg.features.slice(0, 4).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[9px]">{f}</Badge>
                      ))}
                      {intg.features.length > 4 && <Badge variant="outline" className="text-[9px]">+{intg.features.length - 4}</Badge>}
                    </div>

                    {intg.lastSync && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last sync: {intg.lastSync}</span>
                        {intg.recordsSynced && <span>· {intg.recordsSynced.toLocaleString()} records</span>}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {intg.status === "connected" ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                          <Settings className="mr-1 h-3 w-3" /> Configure
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                          <RefreshCw className="mr-1 h-3 w-3" /> Sync Now
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1 h-7 text-xs">
                        <Link2 className="mr-1 h-3 w-3" /> Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI CRM Insights */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">AI CRM Intelligence</p>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <p>• Zoho CRM has 12 hot leads not yet converted. Estimated revenue potential: ₹85,000</p>
                    <p>• Tally sync detected 3 unreconciled vouchers from yesterday. Review needed.</p>
                    <p>• WhatsApp campaign conversion rate: 18% (above industry avg of 12%)</p>
                    <p>• Suggest: Connect QuickBooks for international patient billing & multi-currency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Financial Journey */}
        <TabsContent value="patient-journey" className="space-y-4 mt-4">
          <div className="flex items-center gap-3 mb-2">
            <Input placeholder="Search patient..." className="max-w-xs" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="first_visit">First Visit</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="loyal">Loyal</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline visual */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Patient Revenue Pipeline</p>
              <div className="grid grid-cols-5 gap-2 text-xs text-center">
                <div className="p-3 rounded bg-gray-100 space-y-1">
                  <p className="font-bold text-lg">{patientJourneys.filter(p => p.stage === "lead").length}</p>
                  <p className="font-medium">Leads</p>
                  <p className="text-muted-foreground">New enquiries</p>
                </div>
                <div className="p-3 rounded bg-blue-50 space-y-1">
                  <p className="font-bold text-lg">{patientJourneys.filter(p => p.stage === "first_visit").length}</p>
                  <p className="font-medium">First Visit</p>
                  <p className="text-muted-foreground">Converting</p>
                </div>
                <div className="p-3 rounded bg-green-50 space-y-1">
                  <p className="font-bold text-lg">{patientJourneys.filter(p => p.stage === "active").length}</p>
                  <p className="font-medium">Active</p>
                  <p className="text-muted-foreground">Regular patients</p>
                </div>
                <div className="p-3 rounded bg-purple-50 space-y-1">
                  <p className="font-bold text-lg">{patientJourneys.filter(p => p.stage === "loyal").length}</p>
                  <p className="font-medium">Loyal</p>
                  <p className="text-muted-foreground">VIP patients</p>
                </div>
                <div className="p-3 rounded bg-amber-50 space-y-1">
                  <p className="font-bold text-lg">0</p>
                  <p className="font-medium">Dormant</p>
                  <p className="text-muted-foreground">Re-engage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <div className="space-y-3">
            {patientJourneys.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{p.name}</p>
                        <Badge className={
                          p.stage === "loyal" ? "bg-purple-100 text-purple-700" :
                          p.stage === "active" ? "bg-green-100 text-green-700" :
                          p.stage === "first_visit" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {p.stage.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">Source: {p.source}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>📱 {p.phone}</span>
                        <span>Since {p.firstVisit}</span>
                        <span>{p.visits} visits</span>
                        <span>Last: {p.lastActivity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">CRM: {p.crmNotes}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-display text-lg font-bold text-green-600">₹{p.totalSpent.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-muted-foreground">LTV: ₹{p.ltv.toLocaleString("en-IN")}</p>
                      {p.pendingDues > 0 && (
                        <Badge className="bg-red-100 text-red-700 text-[10px] mt-1">
                          Due: ₹{p.pendingDues.toLocaleString("en-IN")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revenue Attribution */}
        <TabsContent value="attribution" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Lead Source → Revenue Attribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Source</th>
                      <th className="px-4 py-2 text-center font-medium">Patients</th>
                      <th className="px-4 py-2 text-right font-medium">Revenue</th>
                      <th className="px-4 py-2 text-right font-medium">Cost</th>
                      <th className="px-4 py-2 text-center font-medium">ROI</th>
                      <th className="px-4 py-2 text-right font-medium">Avg/Patient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueAttribution.map((r, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{r.source}</td>
                        <td className="px-4 py-2 text-center">{r.patients}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">₹{r.revenue.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {r.cost > 0 ? `₹${r.cost.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge className="bg-primary/10 text-primary">{r.roi}</Badge>
                        </td>
                        <td className="px-4 py-2 text-right text-xs">
                          ₹{Math.round(r.revenue / r.patients).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-muted/30">
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2 text-center">{revenueAttribution.reduce((s, r) => s + r.patients, 0)}</td>
                      <td className="px-4 py-2 text-right text-green-600">₹{revenueAttribution.reduce((s, r) => s + r.revenue, 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2 text-right text-red-600">₹{revenueAttribution.reduce((s, r) => s + r.cost, 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2 text-center"><Badge className="bg-green-100 text-green-700">20.3x avg</Badge></td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">AI Revenue Intelligence</p>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <p>• Referral Program has highest ROI (23.3x). Invest more in patient referral incentives.</p>
                    <p>• Google Ads bringing patients but at ₹778/patient acquisition cost. Optimize keywords.</p>
                    <p>• Zoho CRM leads convert at 40% — highest among all digital channels.</p>
                    <p>• Dormant patients (no visit 60+ days): 28 patients worth ₹4.2L LTV. Re-engage via WhatsApp.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks */}
        <TabsContent value="api-webhooks" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Webhook Configuration</CardTitle>
                <Button size="sm"><Plug className="mr-1 h-4 w-4" /> Add Webhook</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiWebhooks.map((wh, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${wh.active ? "bg-green-500" : "bg-gray-300"}`} />
                      <div>
                        <p className="font-medium text-sm">{wh.event}</p>
                        <p className="text-xs text-muted-foreground font-mono">{wh.endpoint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px]">{wh.target}</Badge>
                      <Switch defaultChecked={wh.active} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> External API Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium text-sm">HMS Accounts API Key</p>
                    <p className="text-xs text-muted-foreground">For external CRM/ERP to pull financial data</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value="hms_ak_****************************7f2a" readOnly className="w-72 text-xs font-mono" />
                    <Button size="sm" variant="outline" className="text-xs">Regenerate</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium text-sm">Webhook Secret</p>
                    <p className="text-xs text-muted-foreground">Verify incoming webhooks from external services</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value="whsec_****************************9b3c" readOnly className="w-72 text-xs font-mono" />
                    <Button size="sm" variant="outline" className="text-xs">Regenerate</Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded bg-blue-50 text-xs text-blue-700">
                <p className="font-medium">API Documentation</p>
                <p className="mt-1">External systems can push/pull data using REST API. Endpoints support JSON/XML. 
                Rate limit: 1000 requests/hour. See <span className="underline cursor-pointer">API Docs</span> for full reference.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Log */}
        <TabsContent value="sync-log" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { time: "03:15 PM", system: "WhatsApp API", action: "Sent 5 payment reminder messages", status: "success" },
                  { time: "03:00 PM", system: "Razorpay", action: "Synced 12 new payments (₹28,500)", status: "success" },
                  { time: "02:30 PM", system: "Tally Prime", action: "Pushed 8 vouchers (5 receipts, 3 payments)", status: "success" },
                  { time: "02:00 PM", system: "Zoho CRM", action: "Updated 15 contact records, 3 new deals", status: "success" },
                  { time: "01:00 PM", system: "Google Calendar", action: "Synced 8 new appointments", status: "success" },
                  { time: "12:00 PM", system: "Tally Prime", action: "Failed to push voucher V-2847 (duplicate)", status: "error" },
                  { time: "11:00 AM", system: "Zoho CRM", action: "Imported 2 new leads from web form", status: "success" },
                  { time: "09:00 AM", system: "All Systems", action: "Daily full sync completed (7,240 records)", status: "success" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded border text-sm">
                    <Badge variant="outline" className="text-[10px] min-w-[60px] justify-center">{log.time}</Badge>
                    <Badge className={log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} >
                      {log.status === "success" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                      {log.system}
                    </Badge>
                    <span className="flex-1 text-muted-foreground">{log.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrmAccounts;
