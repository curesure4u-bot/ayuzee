import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, BarChart3, Mail, Heart, Search, Clock, Send, Plus, Trash2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type EmailReport = { id: string; user: string; email: string; reports: string[]; status: "active" | "inactive" };
type FavoriteReport = { id: string; category: string; subCategory: string; reports: string[] };
type ScheduledReport = { id: string; name: string; frequency: string; recipients: string; format: string; modules: string; status: "active" | "inactive" };

// ─── Constants ───────────────────────────────────────────────────────────────
const USERS = ["ADMIN", "Dr Mohamad Saleem", "ROSANA", "Front Office", "Lab Head", "Pharmacy Head", "Accounts"];
const REPORT_CATEGORIES = ["Collection", "Accounts", "Stocks", "TestOrders", "OrderRequest", "Patient", "OPD", "IPD", "Panchakarma", "Pharmacy", "Lab", "Appointments"];
const SUB_CATEGORIES: Record<string, string[]> = {
  "Collection": ["Daily Summary", "My Daily Summary", "My Net Collection", "My Transaction", "My Consolidated Income", "My Income - Billwise", "Doctor Wise Collection", "Department Wise", "Branch Wise"],
  "Accounts": ["Expense Report", "Income vs Expense", "Profit & Loss", "Balance Sheet", "Outstanding", "TDS Report", "GST Summary"],
  "Stocks": ["Stock Summary", "Low Stock", "Expiry Alert", "Purchase Report", "GRN Report", "Stock Transfer", "Dead Stock", "Consumption Report"],
  "TestOrders": ["Lab Orders Summary", "TAT Report", "Pending Results", "Critical Values", "QC Report", "Machine Utilization"],
  "OrderRequest": ["Indent Pending", "Indent Fulfilled", "Purchase Orders", "Vendor Wise", "Branch Transfer"],
  "Patient": ["Patient Registration", "Visit Summary", "Follow-up Due", "Chronic Patients", "New vs Revisit", "Source Wise", "Age Group Wise"],
  "OPD": ["OPD Summary", "Doctor Wise OPD", "Department Wise OPD", "Cancellation Report", "Wait Time Report"],
  "IPD": ["IPD Census", "Admission/Discharge", "Bed Occupancy", "Average Length of Stay", "Room Revenue"],
  "Panchakarma": ["PK Schedule", "Therapy Utilization", "Package Completion", "Therapist Productivity", "Patient Outcome"],
  "Pharmacy": ["Sales Report", "Return Report", "Near Expiry", "Fast Moving", "Slow Moving", "Profit Margin"],
  "Lab": ["Lab Revenue", "Test Wise Volume", "Referral Lab", "Critical Alerts", "Turnaround Time"],
  "Appointments": ["Appointment Summary", "No-Show Report", "Teleconsultation", "Slot Utilization", "Online Bookings"],
};

const AI_REPORT_FEATURES = [
  { label: "AI Auto-Summary", desc: "Generates natural language summary of daily/weekly reports" },
  { label: "Anomaly Detection", desc: "AI flags unusual patterns in revenue, visits, or stock movement" },
  { label: "Predictive Analytics", desc: "Forecasts next week's patient volume and revenue based on trends" },
  { label: "Smart Scheduling", desc: "AI suggests optimal report timing based on data availability" },
  { label: "Insight Highlights", desc: "Auto-identifies top 3 insights from each report for quick review" },
  { label: "Comparative Analysis", desc: "AI compares current period with previous for trend reporting" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockEmailReports: EmailReport[] = [
  { id: "1", user: "ADMIN", email: "admin@alshifa-ayush.com", reports: ["Daily Collection Summary", "Low Stock Alert", "Branch Comparison"], status: "active" },
  { id: "2", user: "Dr Mohamad Saleem", email: "dr.saleem@alshifa-ayush.com", reports: ["Doctor Wise OPD", "Panchakarma Schedule", "Patient Follow-up Due"], status: "active" },
  { id: "3", user: "Accounts", email: "accounts@alshifa-ayush.com", reports: ["Daily Collection Summary", "Expense Report", "Insurance Claim Pending"], status: "active" },
  { id: "4", user: "Pharmacy Head", email: "pharmacy@alshifa-ayush.com", reports: ["Low Stock Alert", "Near Expiry", "Sales Report"], status: "active" },
];

const mockFavorites: FavoriteReport[] = [
  { id: "1", category: "Collection", subCategory: "Daily Summary", reports: ["Daily Collection Summary", "Branch Wise Collection"] },
  { id: "2", category: "Patient", subCategory: "Visit Summary", reports: ["New vs Revisit", "Source Wise Report"] },
  { id: "3", category: "Panchakarma", subCategory: "PK Schedule", reports: ["Therapy Utilization", "Package Completion"] },
];

const mockScheduled: ScheduledReport[] = [
  { id: "1", name: "Daily Collection Summary", frequency: "Daily 9:00 PM", recipients: "admin@alshifa-ayush.com, accounts@alshifa-ayush.com", format: "PDF + Excel", modules: "Billing, Pharmacy, Lab", status: "active" },
  { id: "2", name: "Doctor-wise Consultation", frequency: "Daily 8:00 PM", recipients: "admin@alshifa-ayush.com", format: "PDF", modules: "OPD, Appointments", status: "active" },
  { id: "3", name: "Panchakarma Occupancy", frequency: "Daily 7:00 AM", recipients: "pk-head@alshifa-ayush.com", format: "Excel", modules: "Panchakarma, IPD", status: "active" },
  { id: "4", name: "Weekly Revenue Summary", frequency: "Every Monday 9:00 AM", recipients: "ceo@alshifa-ayush.com", format: "PDF + Charts", modules: "All Revenue", status: "active" },
  { id: "5", name: "Monthly MIS Report", frequency: "1st of Month 10:00 AM", recipients: "management@alshifa-ayush.com", format: "PDF + Excel", modules: "All Modules", status: "active" },
  { id: "6", name: "Low Stock Alert", frequency: "Daily 6:00 AM", recipients: "pharmacy@alshifa-ayush.com", format: "Email Alert", modules: "Pharmacy, Inventory", status: "active" },
  { id: "7", name: "Insurance Claim Pending", frequency: "Every 3 Days", recipients: "billing@alshifa-ayush.com", format: "Excel", modules: "Billing, Insurance", status: "active" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const ReportMaster = () => {
  const [section, setSection] = useState<"email" | "favorites" | "scheduled">("email");
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["AI Auto-Summary", "Anomaly Detection", "Insight Highlights"]);

  // Email form
  const [eUser, setEUser] = useState("ADMIN");
  const [eEmail, setEEmail] = useState("");
  const [eReports, setEReports] = useState("");

  // Favorites form
  const [fCategory, setFCategory] = useState("Collection");
  const [fSubCategory, setFSubCategory] = useState("Daily Summary");
  const [fReports, setFReports] = useState("");

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleSaveEmail = () => {
    if (!eReports.trim()) return toast.error("Enter report names");
    toast.success("Email report configuration saved!");
    setEReports("");
  };

  const handleSaveFavorite = () => {
    if (!fReports.trim()) return toast.error("Enter report name");
    toast.success("Favorite report saved!");
    setFReports("");
  };

  // ─── Render Email Reports ──────────────────────────────────────────────────
  const renderEmail = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Manage Email Reports</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Add Form */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="min-w-[150px]"><Label className="font-semibold">User</Label>
            <Select value={eUser} onValueChange={setEUser}><SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger><SelectContent>{USERS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="min-w-[200px]"><Label className="font-semibold">Email</Label><Input value={eEmail} onChange={e => setEEmail(e.target.value)} placeholder="No Email found, please update.." className="mt-1 h-9" /></div>
          <div className="flex-1 min-w-[200px]"><Label className="font-semibold">Reports</Label><Input value={eReports} onChange={e => setEReports(e.target.value)} placeholder="Enter report names" className="mt-1 h-9" /></div>
          <Button onClick={handleSaveEmail} className="bg-orange-500 hover:bg-orange-600 text-white h-9">Save</Button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded p-2"><p className="text-xs text-emerald-700">Note: Email will be sent to those who has appropriate privilege.</p></div>

        {/* Configuration Table */}
        <h3 className="font-semibold text-sm text-center">Configuration</h3>
        <div className="flex items-center justify-between"><div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div><div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">User</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Email</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Reports</th><th className="px-3 py-2 w-16"></th></tr></thead>
        <tbody>{mockEmailReports.filter(r => r.user.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
          <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No data available in table</td></tr>
        ) : (
          mockEmailReports.filter(r => r.user.toLowerCase().includes(search.toLowerCase())).map(r => (
            <tr key={r.id} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{r.user}</td>
              <td className="px-3 py-2 text-xs">{r.email}</td>
              <td className="px-3 py-2 text-xs">{r.reports.join(", ")}</td>
              <td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Pencil className="h-3 w-3 text-orange-500" /></Button></td>
            </tr>
          ))
        )}</tbody></table>
        <div className="text-xs text-muted-foreground">Showing 1 to {mockEmailReports.length} of {mockEmailReports.length} entries</div>
      </CardContent>
    </Card>
  );

  // ─── Render Favorites ──────────────────────────────────────────────────────
  const renderFavorites = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Manage Favorites Reports</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="min-w-[160px]"><Label className="font-semibold">Category</Label>
            <Select value={fCategory} onValueChange={v => { setFCategory(v); setFSubCategory(SUB_CATEGORIES[v]?.[0] || ""); }}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{REPORT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]"><Label className="font-semibold">Sub Category</Label>
            <Select value={fSubCategory} onValueChange={setFSubCategory}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{(SUB_CATEGORIES[fCategory] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]"><Label className="font-semibold">Reports</Label><Input value={fReports} onChange={e => setFReports(e.target.value)} placeholder="Report name" className="mt-1 h-9" /></div>
          <Button onClick={handleSaveFavorite} className="bg-orange-500 hover:bg-orange-600 text-white h-9">Save</Button>
        </div>

        {/* Existing Favorites */}
        <h3 className="font-semibold text-sm text-center pt-2">Configuration</h3>
        <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">Category</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Sub Category</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Reports</th><th className="px-3 py-2 w-16"></th></tr></thead>
        <tbody>{mockFavorites.map(f => (
          <tr key={f.id} className="border-b hover:bg-muted/30">
            <td className="px-3 py-2 text-xs font-medium">{f.category}</td>
            <td className="px-3 py-2 text-xs">{f.subCategory}</td>
            <td className="px-3 py-2 text-xs">{f.reports.join(", ")}</td>
            <td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button></td>
          </tr>
        ))}</tbody></table>
      </CardContent>
    </Card>
  );

  // ─── Render Scheduled Reports ──────────────────────────────────────────────
  const renderScheduled = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Scheduled & Automated Reports</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-3">
        <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-2 py-2 text-left font-semibold text-orange-600">Report</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Frequency</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Recipients</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Format</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th><th className="px-2 py-2 w-16"></th></tr></thead>
        <tbody>{mockScheduled.map(r => (
          <tr key={r.id} className="border-b hover:bg-muted/30">
            <td className="px-2 py-2 text-xs font-medium">{r.name}</td>
            <td className="px-2 py-2"><Badge variant="outline" className="text-[9px]"><Clock className="h-2.5 w-2.5 mr-0.5 inline" />{r.frequency}</Badge></td>
            <td className="px-2 py-2 text-[10px] max-w-[150px] truncate">{r.recipients}</td>
            <td className="px-2 py-2"><Badge variant="secondary" className="text-[9px]">{r.format}</Badge></td>
            <td className="px-2 py-2"><Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700 text-[9px]" : "bg-gray-100 text-gray-600 text-[9px]"}>{r.status}</Badge></td>
            <td className="px-2 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-500"><Send className="h-3 w-3" /></Button></td>
          </tr>
        ))}</tbody></table>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-orange-600" /> Report Master</h1>
          <p className="text-sm text-muted-foreground">Set up EOD email reports with defined recipient IDs, manage favorites, and AI-powered analytics.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Analytics</Badge>
          <Badge variant="secondary">Scheduled: {mockScheduled.length} | Users: {mockEmailReports.length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Report Master</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "email" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("email")}>
                <span className="mr-2">✉️</span> Email
              </Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "favorites" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("favorites")}>
                <span className="mr-2">❤️</span> Favorites
              </Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "scheduled" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("scheduled")}>
                <span className="mr-2">⏰</span> Scheduled Reports
              </Button>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Report Intelligence</p>
            <div className="space-y-1 text-[10px]">
              {AI_REPORT_FEATURES.map(f => (
                <label key={f.label} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" />
                  <span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Report Categories Quick */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Categories</p>
            <div className="flex flex-wrap gap-1">
              {REPORT_CATEGORIES.map(c => (
                <Badge key={c} variant="outline" className="text-[9px] cursor-pointer hover:bg-orange-50">{c}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div>
          {section === "email" && renderEmail()}
          {section === "favorites" && renderFavorites()}
          {section === "scheduled" && renderScheduled()}
        </div>
      </div>
    </div>
  );
};

export default ReportMaster;
