import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText, IndianRupee, Download, Users, CheckCircle2,
  Clock, Calendar, Printer, Shield, AlertTriangle,
} from "lucide-react";

interface TDSDeduction {
  id: string;
  deducteeeName: string;
  pan: string;
  section: "194J" | "194C" | "194H" | "194I";
  nature: "Professional Fees" | "Commission" | "Contractor" | "Rent";
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  deductionDate: string;
  paymentDate?: string;
  challanNo?: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  status: "Deducted" | "Deposited" | "Certificate Issued" | "Pending";
}

const mockDeductions: TDSDeduction[] = [
  { id: "1", deducteeeName: "Dr. Mohamad Saleem", pan: "ABCPS1234M", section: "194J", nature: "Professional Fees", grossAmount: 10200, tdsRate: 10, tdsAmount: 1020, netPayable: 9180, deductionDate: "2026-07-05", paymentDate: "2026-07-07", challanNo: "CHL-2026-0451", quarter: "Q1", status: "Deposited" },
  { id: "2", deducteeeName: "Dr. Anitha Kumari", pan: "DEFPK5678N", section: "194J", nature: "Professional Fees", grossAmount: 6240, tdsRate: 10, tdsAmount: 624, netPayable: 5616, deductionDate: "2026-07-05", paymentDate: "2026-07-07", challanNo: "CHL-2026-0451", quarter: "Q1", status: "Deposited" },
  { id: "3", deducteeeName: "Dr. Ramesh Babu", pan: "GHIRB9012P", section: "194J", nature: "Professional Fees", grossAmount: 3500, tdsRate: 10, tdsAmount: 350, netPayable: 3150, deductionDate: "2026-07-05", quarter: "Q1", status: "Deducted" },
  { id: "4", deducteeeName: "M/s. Kumar & Associates (CA)", pan: "AABFK3456Q", section: "194J", nature: "Professional Fees", grossAmount: 25000, tdsRate: 10, tdsAmount: 2500, netPayable: 22500, deductionDate: "2026-07-24", quarter: "Q2", status: "Pending" },
  { id: "5", deducteeeName: "Cool Care Services", pan: "BCDCS7890R", section: "194C", nature: "Contractor", grossAmount: 42000, tdsRate: 1, tdsAmount: 420, netPayable: 41580, deductionDate: "2026-06-30", paymentDate: "2026-07-07", challanNo: "CHL-2026-0452", quarter: "Q1", status: "Certificate Issued" },
  { id: "6", deducteeeName: "Landlord - Main Road Property", pan: "EFGHL1234S", section: "194I", nature: "Rent", grossAmount: 50000, tdsRate: 10, tdsAmount: 5000, netPayable: 45000, deductionDate: "2026-07-01", paymentDate: "2026-07-07", challanNo: "CHL-2026-0453", quarter: "Q2", status: "Deposited" },
  { id: "7", deducteeeName: "Dr. Priya Nair", pan: "HIJPN5678T", section: "194H", nature: "Commission", grossAmount: 3200, tdsRate: 5, tdsAmount: 160, netPayable: 3040, deductionDate: "2026-06-30", paymentDate: "2026-07-07", challanNo: "CHL-2026-0451", quarter: "Q1", status: "Certificate Issued" },
];

const TDSManagement = () => {
  const [deductions] = useState<TDSDeduction[]>(mockDeductions);
  const [activeTab, setActiveTab] = useState("deductions");
  const [quarterFilter, setQuarterFilter] = useState("ALL");

  const totalTDS = deductions.reduce((s, d) => s + d.tdsAmount, 0);
  const depositedTDS = deductions.filter(d => d.status === "Deposited" || d.status === "Certificate Issued").reduce((s, d) => s + d.tdsAmount, 0);
  const pendingTDS = deductions.filter(d => d.status === "Deducted" || d.status === "Pending").reduce((s, d) => s + d.tdsAmount, 0);

  const filtered = deductions.filter(d => quarterFilter === "ALL" || d.quarter === quarterFilter);

  const getStatusColor = (s: string) => {
    switch (s) { case "Certificate Issued": return "bg-green-100 text-green-700"; case "Deposited": return "bg-blue-100 text-blue-700"; case "Deducted": return "bg-amber-100 text-amber-700"; case "Pending": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Shield className="h-5 w-5" /> TDS Management</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">TAN: CHEA12345B</Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Form 26Q</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">₹{(totalTDS / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Total TDS (FY)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(depositedTDS / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Deposited</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(pendingTDS / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Pending Deposit</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{new Set(deductions.map(d => d.pan)).size}</p><p className="text-[10px] text-muted-foreground">Deductees</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="deductions">TDS Deductions</TabsTrigger><TabsTrigger value="challan">Challans & Deposits</TabsTrigger><TabsTrigger value="certificates">Certificates (16A)</TabsTrigger></TabsList>

        {/* Deductions */}
        <TabsContent value="deductions" className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={quarterFilter} onValueChange={setQuarterFilter}><SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="Q1">Q1 (Apr-Jun)</SelectItem><SelectItem value="Q2">Q2 (Jul-Sep)</SelectItem><SelectItem value="Q3">Q3 (Oct-Dec)</SelectItem><SelectItem value="Q4">Q4 (Jan-Mar)</SelectItem></SelectContent></Select>
            <Button size="sm" variant="outline" className="h-8 text-xs ml-auto"><Download className="mr-1 h-3 w-3" /> Export</Button>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Deductee</th><th className="px-3 py-2 text-left">PAN</th><th className="px-3 py-2 text-center">Section</th><th className="px-3 py-2 text-left">Nature</th><th className="px-3 py-2 text-right">Gross</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">TDS</th><th className="px-3 py-2 text-right">Net</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{d.deducteeeName}</td>
                    <td className="px-3 py-2 text-muted-foreground font-mono">{d.pan}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[9px]">{d.section}</Badge></td>
                    <td className="px-3 py-2">{d.nature}</td>
                    <td className="px-3 py-2 text-right">₹{d.grossAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{d.tdsRate}%</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">₹{d.tdsAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-600">₹{d.netPayable.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(d.status)}`}>{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50"><tr><td colSpan={6} className="px-3 py-2 text-right font-bold">Total TDS:</td><td className="px-3 py-2 text-right font-bold text-red-700">₹{filtered.reduce((s, d) => s + d.tdsAmount, 0).toLocaleString()}</td><td colSpan={2}></td></tr></tfoot>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Challans */}
        <TabsContent value="challan" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">TDS Challan History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[...new Set(deductions.filter(d => d.challanNo).map(d => d.challanNo))].map(challan => {
                const items = deductions.filter(d => d.challanNo === challan);
                const total = items.reduce((s, d) => s + d.tdsAmount, 0);
                return (
                  <div key={challan} className="border rounded p-3 flex items-center justify-between">
                    <div><p className="text-xs font-medium">{challan}</p><p className="text-[10px] text-muted-foreground">{items[0]?.paymentDate} | {items.length} deductees | Sections: {[...new Set(items.map(i => i.section))].join(", ")}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-red-600">₹{total.toLocaleString()}</p><Badge className="bg-green-100 text-green-700 text-[9px]">Paid</Badge></div>
                  </div>
                );
              })}
              {pendingTDS > 0 && (
                <div className="border border-red-200 rounded p-3 bg-red-50 flex items-center justify-between">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /><div><p className="text-xs font-medium text-red-700">Pending TDS Deposit</p><p className="text-[10px] text-red-600">₹{pendingTDS.toLocaleString()} awaiting challan payment. Due by 7th of next month.</p></div></div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => toast.success("Challan generated for deposit")}>Generate Challan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Form 16A — TDS Certificates</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Generate quarterly TDS certificates (Form 16A) for deductees.</p>
              {deductions.filter(d => d.status === "Certificate Issued" || d.status === "Deposited").map(d => (
                <div key={d.id} className="flex items-center justify-between border rounded p-2">
                  <div><p className="text-xs font-medium">{d.deducteeeName}</p><p className="text-[10px] text-muted-foreground">PAN: {d.pan} | {d.section} | ₹{d.tdsAmount} deducted</p></div>
                  <div className="flex gap-1">
                    {d.status === "Certificate Issued" ? <Badge className="bg-green-100 text-green-700 text-[9px]">Issued</Badge> : <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success(`Form 16A generated for ${d.deducteeeName}`)}>Generate</Button>}
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Printer className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TDSManagement;
