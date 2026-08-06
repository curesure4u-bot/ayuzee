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
  Users, Shield, Key, IndianRupee, Receipt, Clock, Eye,
  Lock, CheckCircle2, AlertTriangle, Wallet, Building2,
  UserCog, FileText, Printer
} from "lucide-react";

type Cashier = {
  id: string;
  name: string;
  role: string;
  status: "active" | "shift-ended" | "break";
  shiftStart: string;
  shiftEnd?: string;
  totalCollection: number;
  cashInHand: number;
  digitalPayments: number;
  billsGenerated: number;
  discountsGiven: number;
  refundsProcessed: number;
  permissions: string[];
};

const cashiers: Cashier[] = [
  {
    id: "1", name: "Kumar (Main Counter)", role: "Senior Cashier", status: "active",
    shiftStart: "09:00 AM", totalCollection: 32400, cashInHand: 18200,
    digitalPayments: 14200, billsGenerated: 24, discountsGiven: 2800, refundsProcessed: 500,
    permissions: ["billing", "discount_upto_10", "refund_upto_500", "day_close", "petty_cash"]
  },
  {
    id: "2", name: "Priya (Pharmacy Counter)", role: "Pharmacy Cashier", status: "active",
    shiftStart: "09:00 AM", totalCollection: 21500, cashInHand: 12800,
    digitalPayments: 8700, billsGenerated: 35, discountsGiven: 1200, refundsProcessed: 0,
    permissions: ["billing", "discount_upto_5", "pharmacy_sale", "otc_sale"]
  },
  {
    id: "3", name: "Anitha (IP Counter)", role: "Cashier", status: "active",
    shiftStart: "09:00 AM", totalCollection: 45000, cashInHand: 15000,
    digitalPayments: 30000, billsGenerated: 8, discountsGiven: 5000, refundsProcessed: 2000,
    permissions: ["billing", "discount_upto_10", "refund_upto_2000", "ip_billing", "insurance"]
  },
  {
    id: "4", name: "Ravi (Night Shift)", role: "Cashier", status: "shift-ended",
    shiftStart: "10:00 PM", shiftEnd: "08:00 AM", totalCollection: 8500, cashInHand: 5200,
    digitalPayments: 3300, billsGenerated: 6, discountsGiven: 0, refundsProcessed: 0,
    permissions: ["billing", "emergency_billing"]
  },
];

const cashierPermissions = [
  { key: "billing", label: "Generate Bills", description: "Create OP/Pharmacy bills" },
  { key: "discount_upto_5", label: "Discount up to 5%", description: "Apply max 5% discount" },
  { key: "discount_upto_10", label: "Discount up to 10%", description: "Apply max 10% discount" },
  { key: "discount_unlimited", label: "Unlimited Discount", description: "No discount limit (admin only)" },
  { key: "refund_upto_500", label: "Refund up to ₹500", description: "Process refunds under ₹500" },
  { key: "refund_upto_2000", label: "Refund up to ₹2,000", description: "Process refunds under ₹2,000" },
  { key: "refund_unlimited", label: "Unlimited Refund", description: "No refund limit (admin only)" },
  { key: "day_close", label: "Day Close", description: "End-of-day cash reconciliation" },
  { key: "petty_cash", label: "Petty Cash", description: "Manage petty cash transactions" },
  { key: "pharmacy_sale", label: "Pharmacy Sale", description: "Prescription-based sales" },
  { key: "otc_sale", label: "OTC Sale", description: "Over-the-counter sales" },
  { key: "ip_billing", label: "IP Billing", description: "In-patient billing" },
  { key: "insurance", label: "Insurance Claims", description: "Process insurance claims" },
  { key: "cancel_bill", label: "Cancel Bill", description: "Cancel generated bills" },
  { key: "emergency_billing", label: "Emergency Billing", description: "After-hours emergency billing" },
  { key: "view_reports", label: "View Reports", description: "Access financial reports" },
];

const dayCloseLog = [
  { date: "Jul 21, 2026", cashier: "Kumar", expectedCash: 18200, actualCash: 18200, status: "matched", closedAt: "08:45 PM" },
  { date: "Jul 20, 2026", cashier: "Kumar", expectedCash: 22500, actualCash: 22350, status: "short", closedAt: "09:00 PM" },
  { date: "Jul 19, 2026", cashier: "Kumar", expectedCash: 15800, actualCash: 15800, status: "matched", closedAt: "08:30 PM" },
  { date: "Jul 18, 2026", cashier: "Kumar", expectedCash: 20100, actualCash: 20250, status: "excess", closedAt: "08:55 PM" },
];

const CashierRole = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Cashier Role & Access Management
          </h2>
          <p className="text-sm text-muted-foreground">Control cashier permissions, track collections, and day-close</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" /> Day Close Report</Button>
          <Button size="sm"><Users className="mr-1 h-4 w-4" /> Add Cashier</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Active Cashiers</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="dayclose">Day Close Log</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Active Cashiers */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {cashiers.map((c) => (
              <Card key={c.id} className={c.status === "active" ? "border-green-200" : "border-muted"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                    <Badge className={
                      c.status === "active" ? "bg-green-100 text-green-700" :
                      c.status === "break" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {c.status === "active" ? "On Duty" : c.status === "break" ? "On Break" : "Shift Ended"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Shift Start</span>
                      <span className="font-medium">{c.shiftStart}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Bills</span>
                      <span className="font-medium">{c.billsGenerated}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Cash in Hand</span>
                      <span className="font-medium text-green-600">₹{c.cashInHand.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Digital</span>
                      <span className="font-medium text-blue-600">₹{c.digitalPayments.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Discounts</span>
                      <span className="font-medium text-amber-600">₹{c.discountsGiven.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Refunds</span>
                      <span className="font-medium text-red-600">₹{c.refundsProcessed.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Collection</p>
                      <p className="font-display text-lg font-bold text-primary">₹{c.totalCollection.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Eye className="mr-1 h-3 w-3" /> View</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Printer className="mr-1 h-3 w-3" /> Print</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Management */}
        <TabsContent value="permissions" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Permission Matrix</CardTitle>
                <Select>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Cashier" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashiers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {cashierPermissions.map((p) => (
                  <div key={p.key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                    <Switch defaultChecked={cashiers[0].permissions.includes(p.key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cashier Limits */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Cashier Limits & Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs">Max Discount % Allowed</Label>
                  <Input type="number" placeholder="10" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Refund Amount (₹)</Label>
                  <Input type="number" placeholder="2000" defaultValue="2000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Cash in Drawer (₹)</Label>
                  <Input type="number" placeholder="50000" defaultValue="50000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Petty Cash Limit (₹)</Label>
                  <Input type="number" placeholder="5000" defaultValue="5000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Auto Day-Close Time</Label>
                  <Input type="time" defaultValue="21:00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Require OTP for Cancel</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch defaultChecked />
                    <span className="text-xs text-muted-foreground">Admin OTP required</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Day Close Log */}
        <TabsContent value="dayclose" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Cashier</th>
                      <th className="px-4 py-2 text-right font-medium">Expected Cash</th>
                      <th className="px-4 py-2 text-right font-medium">Actual Cash</th>
                      <th className="px-4 py-2 text-right font-medium">Difference</th>
                      <th className="px-4 py-2 text-center font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Closed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayCloseLog.map((log, i) => {
                      const diff = log.actualCash - log.expectedCash;
                      return (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-2 font-medium">{log.date}</td>
                          <td className="px-4 py-2">{log.cashier}</td>
                          <td className="px-4 py-2 text-right">₹{log.expectedCash.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2 text-right">₹{log.actualCash.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            <span className={diff === 0 ? "" : diff > 0 ? "text-green-600" : "text-red-600"}>
                              {diff === 0 ? "—" : diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Badge className={
                              log.status === "matched" ? "bg-green-100 text-green-700" :
                              log.status === "short" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-xs">{log.closedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                {[
                  { time: "02:45 PM", user: "Kumar", action: "Applied 8% discount on BILL-2152", type: "discount" },
                  { time: "01:30 PM", user: "Priya", action: "Processed refund ₹350 on BILL-2148", type: "refund" },
                  { time: "12:15 PM", user: "Kumar", action: "Day handover cash count: ₹18,200", type: "handover" },
                  { time: "11:00 AM", user: "Anitha", action: "Cancelled BILL-2140 (Admin OTP verified)", type: "cancel" },
                  { time: "10:30 AM", user: "Kumar", action: "Opened cash drawer - ₹5,000 petty cash withdrawn", type: "petty_cash" },
                  { time: "09:05 AM", user: "System", action: "Shift started for Kumar, Priya, Anitha", type: "system" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded border">
                    <Badge variant="outline" className="text-[10px] min-w-[60px] justify-center">{log.time}</Badge>
                    <span className="font-medium min-w-[80px]">{log.user}</span>
                    <span className="flex-1 text-muted-foreground">{log.action}</span>
                    <Badge className={
                      log.type === "discount" ? "bg-amber-100 text-amber-700" :
                      log.type === "refund" ? "bg-red-100 text-red-700" :
                      log.type === "cancel" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {log.type}
                    </Badge>
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

export default CashierRole;
