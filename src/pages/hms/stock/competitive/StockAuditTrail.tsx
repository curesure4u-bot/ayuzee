import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, History, Search, Download, User, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";

const auditEntries = [
  { id: "AT-9021", timestamp: "22 Jul 2026, 10:42 AM", item: "Rasnasaptakam 450ml", action: "Dispensed", qty: -2, balance: 32, user: "Pharmacist A", reason: "Patient Rx#4521 (Rajesh K.)", ref: "DISP-4521" },
  { id: "AT-9020", timestamp: "22 Jul 2026, 10:38 AM", item: "Simhanada Guggulu 60t", action: "GRN Received", qty: +50, balance: 85, user: "Store Keeper", reason: "PO-2026-890 from X Pharmaceuticals", ref: "GRN-4520" },
  { id: "AT-9019", timestamp: "22 Jul 2026, 09:55 AM", item: "Kottamchukkadi Taila 200ml", action: "PK Deduction", qty: -1, balance: 28, user: "Therapist B", reason: "Kati Vasti session - Rajesh K.", ref: "PK-1045" },
  { id: "AT-9018", timestamp: "22 Jul 2026, 09:30 AM", item: "Triphala Churna 100g", action: "Adjustment (+)", qty: +3, balance: 203, user: "Auditor", reason: "Physical verification correction", ref: "PV-Jul-001" },
  { id: "AT-9017", timestamp: "21 Jul 2026, 05:15 PM", item: "Mahanarayan Taila 200ml", action: "Transfer Out", qty: -5, balance: 12, user: "Store Keeper", reason: "Inter-branch to HSR Layout", ref: "IBT-3019" },
  { id: "AT-9016", timestamp: "21 Jul 2026, 04:30 PM", item: "Dashamoolarishtam 450ml", action: "Dispensed", qty: -1, balance: 18, user: "Pharmacist B", reason: "Patient Rx#4519 (Suresh M.)", ref: "DISP-4519" },
  { id: "AT-9015", timestamp: "21 Jul 2026, 02:00 PM", item: "Ashwagandha Churna 100g", action: "Expiry Write-off", qty: -5, balance: 45, user: "Store Keeper", reason: "Batch ASC-0124 expired Jan 2026", ref: "EXP-048" },
  { id: "AT-9014", timestamp: "21 Jul 2026, 11:00 AM", item: "Chandraprabha Vati 60t", action: "Sale Return", qty: +2, balance: 55, user: "Pharmacist A", reason: "Patient returned - wrong medicine issued", ref: "SR-2026-012" },
  { id: "AT-9013", timestamp: "20 Jul 2026, 06:00 PM", item: "Bala Taila 200ml", action: "Manufacturing", qty: +30, balance: 38, user: "Production Mgr", reason: "Batch BT-0726 completed QC", ref: "MFG-073" },
  { id: "AT-9012", timestamp: "20 Jul 2026, 03:30 PM", item: "Kottamchukkadi Taila 200ml", action: "Raw Material Used", qty: -8, balance: 29, user: "Production Mgr", reason: "Used in MFG batch KCT-0726-B", ref: "MFG-072" },
];

const actionColors: Record<string, string> = {
  "Dispensed": "text-red-600",
  "GRN Received": "text-green-600",
  "PK Deduction": "text-orange-600",
  "Adjustment (+)": "text-blue-600",
  "Transfer Out": "text-purple-600",
  "Expiry Write-off": "text-red-800",
  "Sale Return": "text-green-700",
  "Manufacturing": "text-green-600",
  "Raw Material Used": "text-amber-600",
};

export default function StockAuditTrail() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-indigo-600" /> Stock Audit Trail
          </h1>
          <p className="text-muted-foreground mt-1">Every stock movement logged — who, when, why. GMP compliance for AYUSH manufacturing.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Audit trail exported as CSV")}>
          <Download className="h-3 w-3 mr-1" /> Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search by item, user, or reference..." className="max-w-xs h-9 text-xs" />
        <Select>
          <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Action Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="dispensed">Dispensed</SelectItem>
            <SelectItem value="grn">GRN Received</SelectItem>
            <SelectItem value="pk">PK Deduction</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="expiry">Expiry Write-off</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="pharma-a">Pharmacist A</SelectItem>
            <SelectItem value="pharma-b">Pharmacist B</SelectItem>
            <SelectItem value="store">Store Keeper</SelectItem>
            <SelectItem value="production">Production Mgr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-center">Balance</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Reason / Reference</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">{entry.timestamp}</td>
                    <td className="px-3 py-2 text-xs font-medium">{entry.item}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={actionColors[entry.action] || ""}>{entry.action}</span>
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold">
                      <span className={entry.qty > 0 ? "text-green-600" : "text-red-600"}>
                        {entry.qty > 0 ? "+" : ""}{entry.qty}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{entry.balance}</td>
                    <td className="px-3 py-2 text-xs flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />{entry.user}
                    </td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px]">
                      {entry.reason} <span className="text-blue-600 font-mono">({entry.ref})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Audit Intelligence</p>
            <p className="text-sm text-purple-700">
              All movements tamper-proof (timestamped, user-linked, non-editable). Sale Return (AT-9014) flagged: wrong medicine
              dispensed — AI recommends barcode scan enforcement for this pharmacist. Kottamchukkadi Taila has 2 deductions
              today (dispensing + PK) — correctly tracked across both channels. For GMP audits: Complete raw material → finished
              product traceability available (MFG-072 → MFG-073 → DISP chain).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
