import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CreditCard, IndianRupee, Search, Link2, MessageSquare,
  CheckCircle2, Clock, AlertTriangle, RefreshCw, Copy,
  Phone, QrCode, Download, TrendingUp, Shield, Settings,
} from "lucide-react";

interface PaymentLink {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  amount: number;
  billNo: string;
  linkUrl: string;
  shortCode: string;
  sentVia: ("WhatsApp" | "SMS" | "Email")[];
  createdAt: string;
  expiresAt: string;
  status: "Active" | "Paid" | "Expired" | "Cancelled";
  paidAt?: string;
  paidVia?: string;
  transactionId?: string;
}

interface PaymentTransaction {
  id: string;
  transactionId: string;
  patientName: string;
  patientId: string;
  amount: number;
  billNo: string;
  gateway: "Razorpay" | "PhonePe" | "UPI" | "Card" | "Net Banking";
  method: "UPI" | "Card" | "Net Banking" | "Wallet" | "QR";
  status: "Success" | "Failed" | "Pending" | "Refunded";
  timestamp: string;
  upiId?: string;
  cardLast4?: string;
}

const mockLinks: PaymentLink[] = [
  { id: "pl1", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", phone: "+91 87654 32109", amount: 700, billNo: "LB-2026-00342", linkUrl: "https://pay.ayuzee.com/p/xK9mP2q", shortCode: "xK9mP2q", sentVia: ["WhatsApp"], createdAt: "2026-07-24 09:30 AM", expiresAt: "2026-07-27", status: "Active" },
  { id: "pl2", patientName: "Mr. Suresh Babu", patientId: "AL-15320", phone: "+91 76543 21098", amount: 2650, billNo: "LB-2026-00343", linkUrl: "https://pay.ayuzee.com/p/aB3nQ7w", shortCode: "aB3nQ7w", sentVia: ["WhatsApp", "SMS"], createdAt: "2026-07-24 10:00 AM", expiresAt: "2026-07-27", status: "Active" },
  { id: "pl3", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", phone: "+91 98765 43210", amount: 1000, billNo: "LB-2026-00341", linkUrl: "https://pay.ayuzee.com/p/cD8sT4r", shortCode: "cD8sT4r", sentVia: ["WhatsApp"], createdAt: "2026-07-24 08:40 AM", expiresAt: "2026-07-27", status: "Paid", paidAt: "2026-07-24 08:55 AM", paidVia: "UPI - Google Pay", transactionId: "RZP_2026072400123" },
  { id: "pl4", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", phone: "+91 65432 10987", amount: 700, billNo: "LB-2026-00340", linkUrl: "https://pay.ayuzee.com/p/eF2hJ9m", shortCode: "eF2hJ9m", sentVia: ["SMS"], createdAt: "2026-07-24 07:15 AM", expiresAt: "2026-07-27", status: "Paid", paidAt: "2026-07-24 07:25 AM", paidVia: "Card ending 4532", transactionId: "RZP_2026072400098" },
  { id: "pl5", patientName: "Mr. Gopal K", patientId: "AL-18045", phone: "+91 94567 12345", amount: 1200, billNo: "LB-2026-00338", linkUrl: "https://pay.ayuzee.com/p/gH5kL3n", shortCode: "gH5kL3n", sentVia: ["WhatsApp", "SMS"], createdAt: "2026-07-23 06:00 PM", expiresAt: "2026-07-26", status: "Expired" },
];

const mockTransactions: PaymentTransaction[] = [
  { id: "t1", transactionId: "RZP_2026072400123", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", amount: 1000, billNo: "LB-2026-00341", gateway: "Razorpay", method: "UPI", status: "Success", timestamp: "2026-07-24 08:55 AM", upiId: "rajesh@okaxis" },
  { id: "t2", transactionId: "RZP_2026072400098", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", amount: 700, billNo: "LB-2026-00340", gateway: "Razorpay", method: "Card", status: "Success", timestamp: "2026-07-24 07:25 AM", cardLast4: "4532" },
  { id: "t3", transactionId: "RZP_2026072300087", patientName: "Mr. Arun Prasad", patientId: "AL-12980", amount: 500, billNo: "LB-2026-00335", gateway: "Razorpay", method: "UPI", status: "Success", timestamp: "2026-07-23 04:30 PM", upiId: "arun@ybl" },
  { id: "t4", transactionId: "RZP_2026072300092", patientName: "Ms. Kavitha R", patientId: "AL-16001", amount: 350, billNo: "LB-2026-00337", gateway: "Razorpay", method: "Net Banking", status: "Failed", timestamp: "2026-07-23 05:10 PM" },
  { id: "t5", transactionId: "RZP_2026072200075", patientName: "Mr. Venkat Rao", patientId: "AL-16025", amount: 1500, billNo: "LB-2026-00330", gateway: "Razorpay", method: "UPI", status: "Refunded", timestamp: "2026-07-22 11:00 AM", upiId: "venkat@paytm" },
];

const OnlinePayment = () => {
  const [links] = useState<PaymentLink[]>(mockLinks);
  const [transactions] = useState<PaymentTransaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState("links");

  const totalCollected = transactions.filter(t => t.status === "Success").reduce((s, t) => s + t.amount, 0);
  const pendingAmount = links.filter(l => l.status === "Active").reduce((s, l) => s + l.amount, 0);
  const successRate = ((transactions.filter(t => t.status === "Success").length / transactions.length) * 100).toFixed(0);

  const getStatusColor = (s: string) => {
    switch (s) { case "Paid": case "Success": return "bg-green-100 text-green-700"; case "Active": case "Pending": return "bg-amber-100 text-amber-700"; case "Expired": case "Failed": return "bg-red-100 text-red-700"; case "Refunded": return "bg-purple-100 text-purple-700"; case "Cancelled": return "bg-gray-100 text-gray-500"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Online Payment Gateway</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Link2 className="mr-1 h-3 w-3" /> Generate Payment Link</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(totalCollected / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Collected Online</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{(pendingAmount / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Pending Links</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{successRate}%</p><p className="text-[10px] text-muted-foreground">Success Rate</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><CreditCard className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{transactions.length}</p><p className="text-[10px] text-muted-foreground">Transactions</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="links">Payment Links</TabsTrigger><TabsTrigger value="transactions">Transactions</TabsTrigger><TabsTrigger value="settings">Gateway Settings</TabsTrigger></TabsList>

        {/* Payment Links */}
        <TabsContent value="links" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Bill</th><th className="px-3 py-2 text-left">Link</th><th className="px-3 py-2 text-center">Sent Via</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Actions</th></tr></thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className={`border-b ${link.status === "Expired" ? "opacity-60" : ""}`}>
                    <td className="px-3 py-2"><p className="font-medium">{link.patientName}</p><p className="text-[10px] text-muted-foreground">{link.phone}</p></td>
                    <td className="px-3 py-2 text-right font-bold">₹{link.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-muted-foreground">{link.billNo}</td>
                    <td className="px-3 py-2"><code className="bg-gray-100 px-1 rounded text-[9px]">{link.shortCode}</code></td>
                    <td className="px-3 py-2 text-center">{link.sentVia.map((v, i) => <Badge key={i} variant="outline" className="text-[8px] mr-0.5">{v === "WhatsApp" ? "WA" : v}</Badge>)}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(link.status)}`}>{link.status}</Badge>{link.paidVia && <p className="text-[8px] text-green-600 mt-0.5">{link.paidVia}</p>}</td>
                    <td className="px-3 py-2 text-center"><div className="flex gap-1 justify-center">
                      {link.status === "Active" && <><Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => { navigator.clipboard.writeText(link.linkUrl); toast.success("Link copied"); }}><Copy className="h-3 w-3" /></Button><Button size="sm" variant="outline" className="h-5 text-[9px] text-green-600" onClick={() => toast.success("Resent via WhatsApp")}><MessageSquare className="h-3 w-3" /></Button></>}
                      {link.status === "Expired" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success("New link generated")}><RefreshCw className="h-3 w-3" /></Button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Transaction ID</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Method</th><th className="px-3 py-2 text-left">Details</th><th className="px-3 py-2 text-left">Time</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className={`border-b ${txn.status === "Failed" ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2 font-mono text-[10px]">{txn.transactionId}</td>
                    <td className="px-3 py-2 font-medium">{txn.patientName}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{txn.amount.toLocaleString()}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{txn.method}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground">{txn.upiId || (txn.cardLast4 ? `****${txn.cardLast4}` : "-")}</td>
                    <td className="px-3 py-2 text-muted-foreground">{txn.timestamp}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(txn.status)}`}>{txn.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Payment Gateway Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium">Payment Gateway</label><Select defaultValue="razorpay"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="phonepe">PhonePe PG</SelectItem><SelectItem value="payu">PayU</SelectItem><SelectItem value="cashfree">Cashfree</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">API Key</label><Input className="h-8 text-xs" type="password" defaultValue="rzp_live_••••••••••" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">API Secret</label><Input className="h-8 text-xs" type="password" defaultValue="••••••••••••••" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Webhook URL</label><Input className="h-8 text-xs" defaultValue="https://api.ayuzee.com/payments/webhook" readOnly /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Link Expiry (Days)</label><Input className="h-8 text-xs" type="number" defaultValue="3" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">UPI VPA (for QR)</label><Input className="h-8 text-xs" defaultValue="ayuzeelab@okaxis" /></div>
              </div>
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium">Payment Methods Enabled</p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>UPI (GPay, PhonePe, Paytm)</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Credit/Debit Cards</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Net Banking</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Wallets (Paytm, Amazon Pay)</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>QR Code at Counter</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Auto-send link on billing</span></div>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Payment settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnlinePayment;
