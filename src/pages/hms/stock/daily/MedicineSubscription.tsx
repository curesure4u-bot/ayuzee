import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, RefreshCw, CreditCard, CheckCircle, Clock, Users, Calendar } from "lucide-react";

const subscriptions = [
  { id: "SUB-1001", patient: "Rajesh Kumar", plan: "Spine Care Monthly", medicines: ["Rasnasaptakam 200ml ×3", "Simhanada Guggulu ×1", "Kottamchukkadi Taila ×1"], monthlyValue: 1060, method: "UPI Auto-debit", startDate: "May 2026", months: 3, nextDispatch: "22 Jul 2026", status: "active", adherence: 100 },
  { id: "SUB-1002", patient: "Meera Nair", plan: "Joint Care Monthly", medicines: ["Simhanada Guggulu ×2", "Rasnasaptakam 200ml ×3", "Chandraprabha Vati ×1"], monthlyValue: 1380, method: "Card recurring", startDate: "Apr 2026", months: 4, nextDispatch: "25 Jul 2026", status: "active", adherence: 92 },
  { id: "SUB-1003", patient: "Suresh Menon", plan: "Cervical Care Monthly", medicines: ["Mahanarayan Taila ×2", "Dashamoolarishtam ×1", "Ashwagandha Churna ×1"], monthlyValue: 985, method: "UPI Auto-debit", startDate: "Mar 2026", months: 5, nextDispatch: "28 Jul 2026", status: "active", adherence: 95 },
  { id: "SUB-1004", patient: "Lakshmi Nair", plan: "Rejuvenation Quarterly", medicines: ["Ashwagandha Churna ×2", "Chandraprabha Vati ×2", "Dashamoolarishtam ×1"], monthlyValue: 875, method: "Manual payment", startDate: "Jun 2026", months: 2, nextDispatch: "01 Aug 2026", status: "active", adherence: 85 },
  { id: "SUB-1005", patient: "Priya Sharma", plan: "PCOD Care Monthly", medicines: ["Chandraprabha Vati ×2", "Ashwagandha ×2", "Dashamoolarishtam ×1"], monthlyValue: 920, method: "UPI Auto-debit", startDate: "May 2026", months: 3, nextDispatch: "15 Jul 2026", status: "overdue", adherence: 55 },
  { id: "SUB-1006", patient: "Anand Patel", plan: "Spine Care Monthly", medicines: ["Rasnasaptakam 200ml ×3", "Kottamchukkadi Taila ×2"], monthlyValue: 1190, method: "Card recurring", startDate: "Jul 2026", months: 1, nextDispatch: "30 Jul 2026", status: "active", adherence: 100 },
];

const monthlyRevenue = subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + s.monthlyValue, 0);

export default function MedicineSubscription() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RefreshCw className="h-6 w-6 text-green-600" /> Patient Medicine Subscription</h1>
          <p className="text-muted-foreground mt-1">Monthly auto-dispatch for chronic patients — recurring payment, guaranteed adherence, predictable revenue</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New subscription plan created")}>+ New Subscription</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{subscriptions.length}</p><p className="text-xs text-muted-foreground">Subscribers</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CreditCard className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">₹{(monthlyRevenue/1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Monthly Recurring</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{subscriptions.filter(s => s.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{subscriptions.filter(s => s.status === "overdue").length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-left">Medicines</th><th className="px-3 py-2 text-center">Monthly</th><th className="px-3 py-2 text-center">Payment</th><th className="px-3 py-2 text-center">Months</th><th className="px-3 py-2 text-center">Next</th><th className="px-3 py-2 text-center">Adherence</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {subscriptions.map((s, i) => (
              <tr key={i} className={`border-b ${s.status === "overdue" ? "bg-amber-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-medium">{s.patient}<br/><span className="text-[10px] text-muted-foreground">{s.id}</span></td>
                <td className="px-3 py-2 text-xs">{s.plan}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px]">{s.medicines.join(", ")}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">₹{s.monthlyValue.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-[10px]">{s.method}</td>
                <td className="px-3 py-2 text-center text-xs">{s.months}</td>
                <td className="px-3 py-2 text-center text-xs">{s.nextDispatch}</td>
                <td className="px-3 py-2 text-center"><div className="flex items-center gap-1 justify-center"><Progress value={s.adherence} className="w-10 h-1.5" /><span className={`text-[10px] font-bold ${s.adherence >= 90 ? "text-green-600" : s.adherence >= 70 ? "text-amber-600" : "text-red-600"}`}>{s.adherence}%</span></div></td>
                <td className="px-3 py-2 text-center"><Badge variant={s.status === "active" ? "outline" : "destructive"} className={`text-[10px] ${s.status === "active" ? "text-green-600" : ""}`}>{s.status}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 text-xs text-green-700 space-y-1">
          <p><strong>Subscription Benefits:</strong></p>
          <p>• Patient: Never misses medicine. Auto-delivered at doorstep. 5% subscription discount.</p>
          <p>• Clinic: Guaranteed recurring revenue (₹{(monthlyRevenue/1000).toFixed(1)}K/month). Predictable stock demand. 95% adherence vs 62% walk-in.</p>
          <p>• Stock: Auto-generates PO for subscription medicines 7 days before dispatch cycle — zero stock-outs.</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Subscription Intelligence</p><p className="text-sm text-purple-700">SUB-1005 (Priya Sharma) overdue + 55% adherence — trigger retention intervention (WhatsApp + doctor call). She skipped because "medicine is hard to take" — AI suggests switch to tablet form. Subscription patients: 95% retention at 6 months vs 45% for non-subscribers. Revenue prediction: If 20 more patients subscribe → ₹22K additional MRR. Auto-PO: 18 bottles Rasnasaptakam needed by 25 Jul for subscription dispatches — stock sufficient.</p></div></CardContent></Card>
    </div>
  );
}
