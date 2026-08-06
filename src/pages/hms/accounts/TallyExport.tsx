import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, Download, RefreshCw, Clock, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const exportTypes = ["Sales Vouchers", "Purchase Vouchers", "Receipt Vouchers", "Payment Vouchers", "Journal Entries", "Contra Entries"];

const ledgerMappings = [
  { hmsAccount: "OPD Consultation", tallyLedger: "Consultation Income" },
  { hmsAccount: "Lab Revenue", tallyLedger: "Lab Income" },
  { hmsAccount: "Pharmacy Sales", tallyLedger: "Medicine Sales" },
  { hmsAccount: "Panchakarma Revenue", tallyLedger: "Therapy Income" },
  { hmsAccount: "IPD Charges", tallyLedger: "Inpatient Income" },
  { hmsAccount: "Surgical Supplies", tallyLedger: "Surgical Sales" },
  { hmsAccount: "Medicine Purchases", tallyLedger: "Purchase - Medicines" },
  { hmsAccount: "Lab Consumables", tallyLedger: "Purchase - Lab Items" },
];

type ExportStatus = "Exported" | "Pending" | "Error";

const exportHistory = [
  { id: 1, date: "2026-07-23", type: "Sales Vouchers", entries: 52, amount: 185000, status: "Exported" as ExportStatus },
  { id: 2, date: "2026-07-22", type: "Receipt Vouchers", entries: 38, amount: 142000, status: "Exported" as ExportStatus },
  { id: 3, date: "2026-07-21", type: "Purchase Vouchers", entries: 15, amount: 95000, status: "Exported" as ExportStatus },
  { id: 4, date: "2026-07-20", type: "Journal Entries", entries: 8, amount: 45000, status: "Pending" as ExportStatus },
  { id: 5, date: "2026-07-19", type: "Payment Vouchers", entries: 12, amount: 67000, status: "Error" as ExportStatus },
];

const statusColors: Record<ExportStatus, string> = {
  Exported: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Error: "bg-red-100 text-red-700",
};

const summaryCards = [
  { label: "Entries to Export Today", value: "45", icon: Upload, color: "text-blue-600" },
  { label: "Last Export", value: "2026-07-23", icon: Clock, color: "text-green-600" },
  { label: "Pending Sync", value: "12 entries", icon: RefreshCw, color: "text-yellow-600" },
  { label: "Exported This Month", value: "890", icon: CheckCircle2, color: "text-purple-600" },
];

const TallyExport = () => {
  const [exportType, setExportType] = useState<string>("Sales Vouchers");
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-23");
  const [autoSync, setAutoSync] = useState(true);

  const handleExport = () => {
    toast.success(`Generating Tally XML for ${exportType}`, { description: `Date range: ${dateFrom} to ${dateTo}. File will be ready for import into Tally Prime.` });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tally Integration & Export</h1>
          <p className="text-sm text-muted-foreground">Export vouchers in Tally XML format for ERP 9 / Tally Prime</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Auto-export daily at 10 PM</span>
          <Switch checked={autoSync} onCheckedChange={setAutoSync} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <card.icon className={`h-5 w-5 mb-1 ${card.color}`} />
              <p className="text-lg font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Export Type</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {exportTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </div>
            <Button onClick={handleExport} className="gap-2"><FileText className="h-4 w-4" /> Generate Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ledger Mapping (HMS → Tally)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HMS Account</TableHead>
                <TableHead>Tally Ledger Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerMappings.map((m) => (
                <TableRow key={m.hmsAccount}>
                  <TableCell className="font-medium">{m.hmsAccount}</TableCell>
                  <TableCell><Badge variant="outline">{m.tallyLedger}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Export History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Entries</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportHistory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs">{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="text-right">{row.entries}</TableCell>
                  <TableCell className="text-right">₹{row.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell><Badge className={statusColors[row.status]}>{row.status}</Badge></TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" disabled={row.status === "Error"}>
                      <Download className="h-3 w-3" /> XML
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TallyExport;
