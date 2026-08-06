import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText, IndianRupee, Download, Calendar, CheckCircle2,
  AlertTriangle, Clock, BarChart3, Upload, Shield,
} from "lucide-react";

interface GSTInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  patientName: string;
  gstin?: string;
  sacCode: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  type: "B2C" | "B2B";
  filed: boolean;
}

interface GSTSummary {
  month: string;
  outputCGST: number;
  outputSGST: number;
  outputIGST: number;
  inputCGST: number;
  inputSGST: number;
  inputIGST: number;
  netCGST: number;
  netSGST: number;
  netIGST: number;
  totalPayable: number;
  status: "Filed" | "Pending" | "Overdue";
  filedDate?: string;
}

const mockInvoices: GSTInvoice[] = [
  { id: "1", invoiceNo: "AYZ/2026-27/0341", date: "2026-07-24", patientName: "Mr. Rajesh Kumar", sacCode: "998931", taxableAmount: 847, cgst: 76, sgst: 76, igst: 0, totalTax: 153, totalAmount: 1000, type: "B2C", filed: false },
  { id: "2", invoiceNo: "AYZ/2026-27/0342", date: "2026-07-24", patientName: "Mrs. Lakshmi Devi", sacCode: "998931", taxableAmount: 1017, cgst: 92, sgst: 92, igst: 0, totalTax: 183, totalAmount: 1200, type: "B2C", filed: false },
  { id: "3", invoiceNo: "AYZ/2026-27/0343", date: "2026-07-24", patientName: "TCS Corporate Wellness", gstin: "33AABCT1234F1Z5", sacCode: "998931", taxableAmount: 2246, cgst: 202, sgst: 202, igst: 0, totalTax: 404, totalAmount: 2650, type: "B2B", filed: false },
  { id: "4", invoiceNo: "AYZ/2026-27/0340", date: "2026-07-24", patientName: "Mrs. Priya Sharma", sacCode: "998931", taxableAmount: 593, cgst: 53, sgst: 53, igst: 0, totalTax: 107, totalAmount: 700, type: "B2C", filed: false },
  { id: "5", invoiceNo: "AYZ/2026-27/0339", date: "2026-07-23", patientName: "Star Health Insurance", gstin: "33AABCS5678G1Z8", sacCode: "998931", taxableAmount: 2966, cgst: 267, sgst: 267, igst: 0, totalTax: 534, totalAmount: 3500, type: "B2B", filed: true },
];

const mockGSTSummary: GSTSummary[] = [
  { month: "July 2026", outputCGST: 45200, outputSGST: 45200, outputIGST: 0, inputCGST: 12800, inputSGST: 12800, inputIGST: 0, netCGST: 32400, netSGST: 32400, netIGST: 0, totalPayable: 64800, status: "Pending" },
  { month: "June 2026", outputCGST: 42100, outputSGST: 42100, outputIGST: 0, inputCGST: 11500, inputSGST: 11500, inputIGST: 0, netCGST: 30600, netSGST: 30600, netIGST: 0, totalPayable: 61200, status: "Filed", filedDate: "2026-07-11" },
  { month: "May 2026", outputCGST: 38900, outputSGST: 38900, outputIGST: 0, inputCGST: 10200, inputSGST: 10200, inputIGST: 0, netCGST: 28700, netSGST: 28700, netIGST: 0, totalPayable: 57400, status: "Filed", filedDate: "2026-06-10" },
  { month: "April 2026", outputCGST: 35400, outputSGST: 35400, outputIGST: 0, inputCGST: 9800, inputSGST: 9800, inputIGST: 0, netCGST: 25600, netSGST: 25600, netIGST: 0, totalPayable: 51200, status: "Filed", filedDate: "2026-05-09" },
];

const GSTManagement = () => {
  const [invoices] = useState<GSTInvoice[]>(mockInvoices);
  const [summary] = useState<GSTSummary[]>(mockGSTSummary);
  const [activeTab, setActiveTab] = useState("summary");

  const currentMonth = summary[0];
  const b2bCount = invoices.filter(i => i.type === "B2B").length;
  const b2cCount = invoices.filter(i => i.type === "B2C").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Shield className="h-5 w-5" /> GST Management</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">GSTIN: 33AABCA1234B1Z5</Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> GSTR-1 JSON</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">₹{((currentMonth?.outputCGST + currentMonth?.outputSGST) / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Output GST (Jul)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{((currentMonth?.inputCGST + currentMonth?.inputSGST) / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Input Tax Credit</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(currentMonth?.totalPayable / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Net GST Payable</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><FileText className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{b2bCount} B2B</p><p className="text-[10px] text-muted-foreground">{b2cCount} B2C Invoices</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="summary">GST Summary</TabsTrigger><TabsTrigger value="invoices">Tax Invoices</TabsTrigger><TabsTrigger value="returns">Returns (GSTR)</TabsTrigger></TabsList>

        {/* GST Summary */}
        <TabsContent value="summary" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Month</th><th className="px-3 py-2 text-right">Output CGST</th><th className="px-3 py-2 text-right">Output SGST</th><th className="px-3 py-2 text-right">Input CGST</th><th className="px-3 py-2 text-right">Input SGST</th><th className="px-3 py-2 text-right font-bold">Net Payable</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="px-3 py-2 font-medium">{row.month}</td>
                    <td className="px-3 py-2 text-right">₹{row.outputCGST.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">₹{row.outputSGST.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-600">₹{row.inputCGST.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-600">₹{row.inputSGST.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">₹{row.totalPayable.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${row.status === "Filed" ? "bg-green-100 text-green-700" : row.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{row.status}</Badge>{row.filedDate && <p className="text-[9px] text-muted-foreground">{row.filedDate}</p>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Tax Invoices */}
        <TabsContent value="invoices" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Invoice</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Party</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-left">SAC</th><th className="px-3 py-2 text-right">Taxable</th><th className="px-3 py-2 text-right">CGST</th><th className="px-3 py-2 text-right">SGST</th><th className="px-3 py-2 text-right font-bold">Total</th></tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{inv.invoiceNo}</td>
                    <td className="px-3 py-2">{inv.date}</td>
                    <td className="px-3 py-2">{inv.patientName}{inv.gstin && <p className="text-[9px] text-muted-foreground">{inv.gstin}</p>}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[9px] ${inv.type === "B2B" ? "text-blue-600" : "text-gray-600"}`}>{inv.type}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground">{inv.sacCode}</td>
                    <td className="px-3 py-2 text-right">₹{inv.taxableAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">₹{inv.cgst}</td>
                    <td className="px-3 py-2 text-right">₹{inv.sgst}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{inv.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* GSTR Returns */}
        <TabsContent value="returns" className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="border-blue-200"><CardContent className="p-4 space-y-2"><h4 className="text-sm font-bold">GSTR-1 (Outward Supplies)</h4><p className="text-xs text-muted-foreground">Monthly return for all sales invoices. Due by 11th of next month.</p><p className="text-xs">July 2026: <Badge className="bg-amber-100 text-amber-700 text-[9px]">Pending</Badge></p><p className="text-xs">Due Date: 11 Aug 2026</p><Button size="sm" variant="outline" className="text-xs mt-2" onClick={() => toast.info("Generating GSTR-1 JSON...")}><Download className="mr-1 h-3 w-3" /> Generate JSON</Button></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-4 space-y-2"><h4 className="text-sm font-bold">GSTR-3B (Summary Return)</h4><p className="text-xs text-muted-foreground">Monthly summary return with tax payment. Due by 20th of next month.</p><p className="text-xs">July 2026: <Badge className="bg-amber-100 text-amber-700 text-[9px]">Pending</Badge></p><p className="text-xs">Due Date: 20 Aug 2026</p><Button size="sm" variant="outline" className="text-xs mt-2" onClick={() => toast.info("Generating GSTR-3B...")}><FileText className="mr-1 h-3 w-3" /> Generate Report</Button></CardContent></Card>
          </div>
          <Card><CardContent className="p-3 text-xs space-y-1">
            <p className="font-medium">HSN/SAC Codes Used:</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">998931 - Medical & Diagnostic Services (18% GST)</Badge>
              <Badge variant="outline" className="text-[10px]">998932 - Pathology Lab Services (18% GST)</Badge>
              <Badge variant="outline" className="text-[10px]">998933 - Imaging/Radiology (18% GST)</Badge>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSTManagement;
