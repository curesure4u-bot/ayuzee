import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Receipt, Brain, FileText, CheckCircle, AlertTriangle, Download } from "lucide-react";

const gstr1Summary = {
  month: "June 2026",
  b2b: { invoices: 45, taxable: 285000, cgst: 14250, sgst: 14250, igst: 8500, total: 37000 },
  b2c: { invoices: 820, taxable: 425000, cgst: 21250, sgst: 21250, igst: 0, total: 42500 },
  creditNotes: { count: 3, taxable: -12500, tax: -625 },
  exports: { count: 0, value: 0 },
  status: "filed",
};

const gstr3bSummary = {
  month: "June 2026",
  outputTax: 79500,
  inputTax: 52300,
  netPayable: 27200,
  itcClaimed: 52300,
  cashPaid: 27200,
  status: "filed",
};

const hsnMapping = [
  { hsn: "3004 90 19", description: "Ayurvedic Kashayams (medicaments)", rate: "5%", items: 45, monthlyValue: 185000 },
  { hsn: "3004 90 29", description: "Ayurvedic Churnas & Vatis (medicaments)", rate: "12%", items: 62, monthlyValue: 142000 },
  { hsn: "3004 90 11", description: "Homeopathic medicines", rate: "12%", items: 15, monthlyValue: 28000 },
  { hsn: "3301 29 90", description: "Essential/Therapeutic Oils", rate: "18%", items: 22, monthlyValue: 95000 },
  { hsn: "1211 90 90", description: "Raw herbs/dried plants", rate: "5%", items: 85, monthlyValue: 65000 },
  { hsn: "2106 90 99", description: "Nutraceuticals/Supplements", rate: "18%", items: 18, monthlyValue: 52000 },
  { hsn: "3307 90 90", description: "Personal care (AYUSH cosmetics)", rate: "28%", items: 8, monthlyValue: 22000 },
];

const itcReconciliation = [
  { supplier: "AVN Kottakkal", invoices: 12, claimedITC: 18500, matchedIn2A: 16200, mismatch: 2300, status: "partial" },
  { supplier: "X Ayush Agency", invoices: 8, claimedITC: 12800, matchedIn2A: 12800, mismatch: 0, status: "matched" },
  { supplier: "Nagarjuna Herbal", invoices: 6, claimedITC: 8900, matchedIn2A: 8900, mismatch: 0, status: "matched" },
  { supplier: "Dabur Ayurvedics", invoices: 5, claimedITC: 6200, matchedIn2A: 5800, mismatch: 400, status: "partial" },
  { supplier: "X Pharmaceuticals", invoices: 4, claimedITC: 5900, matchedIn2A: 5900, mismatch: 0, status: "matched" },
];

export default function GstReturns() {
  const totalMismatch = itcReconciliation.reduce((s, i) => s + i.mismatch, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-green-600" /> GST Returns & HSN Integration
          </h1>
          <p className="text-muted-foreground mt-1">Auto-generate GSTR-1/3B from stock transactions, HSN mapping, ITC reconciliation</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("GST data exported for Tally/CA")}><Download className="h-3 w-3 mr-1" /> Export</Button>
      </div>

      <Tabs defaultValue="gstr1">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="gstr1" className="text-xs">GSTR-1</TabsTrigger>
          <TabsTrigger value="gstr3b" className="text-xs">GSTR-3B</TabsTrigger>
          <TabsTrigger value="hsn" className="text-xs">HSN Mapping</TabsTrigger>
          <TabsTrigger value="itc" className="text-xs">ITC Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="gstr1" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">GSTR-1 Summary — {gstr1Summary.month}</h3>
            <Badge variant="outline" className="text-[10px] text-green-600">Filed</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs">B2B (Business to Business)</CardTitle></CardHeader>
              <CardContent className="p-3 text-xs space-y-1">
                <p>Invoices: <strong>{gstr1Summary.b2b.invoices}</strong></p>
                <p>Taxable Value: <strong>₹{gstr1Summary.b2b.taxable.toLocaleString()}</strong></p>
                <p>CGST: ₹{gstr1Summary.b2b.cgst.toLocaleString()} | SGST: ₹{gstr1Summary.b2b.sgst.toLocaleString()} | IGST: ₹{gstr1Summary.b2b.igst.toLocaleString()}</p>
                <p className="font-bold">Total Tax: ₹{gstr1Summary.b2b.total.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs">B2C (Business to Consumer)</CardTitle></CardHeader>
              <CardContent className="p-3 text-xs space-y-1">
                <p>Invoices: <strong>{gstr1Summary.b2c.invoices}</strong></p>
                <p>Taxable Value: <strong>₹{gstr1Summary.b2c.taxable.toLocaleString()}</strong></p>
                <p>CGST: ₹{gstr1Summary.b2c.cgst.toLocaleString()} | SGST: ₹{gstr1Summary.b2c.sgst.toLocaleString()}</p>
                <p className="font-bold">Total Tax: ₹{gstr1Summary.b2c.total.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gstr3b" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">GSTR-3B Summary — {gstr3bSummary.month}</h3>
            <Badge variant="outline" className="text-[10px] text-green-600">Filed</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Output Tax</p><p className="text-lg font-bold text-red-600">₹{gstr3bSummary.outputTax.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Input Tax (ITC)</p><p className="text-lg font-bold text-green-600">₹{gstr3bSummary.inputTax.toLocaleString()}</p></CardContent></Card>
            <Card className="border-blue-200"><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Net Payable</p><p className="text-lg font-bold text-blue-600">₹{gstr3bSummary.netPayable.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Cash Paid</p><p className="text-lg font-bold">₹{gstr3bSummary.cashPaid.toLocaleString()}</p></CardContent></Card>
          </div>
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-3 text-xs text-green-700">
              <strong>ITC Utilization:</strong> ₹{gstr3bSummary.itcClaimed.toLocaleString()} ITC claimed against ₹{gstr3bSummary.outputTax.toLocaleString()} output tax. Net cash outgo only ₹{gstr3bSummary.netPayable.toLocaleString()}.
              AYUSH medicines at 5% GST rate give lower output but also lower ITC.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hsn" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">HSN code mapping for all inventory items — ensures correct GST rate application</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">HSN Code</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-center">GST Rate</th>
                  <th className="px-3 py-2 text-center">Items</th>
                  <th className="px-3 py-2 text-right">Monthly Value</th>
                </tr>
              </thead>
              <tbody>
                {hsnMapping.map((h, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs font-bold">{h.hsn}</td>
                    <td className="px-3 py-2 text-xs">{h.description}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{h.rate}</Badge></td>
                    <td className="px-3 py-2 text-center text-xs">{h.items}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold">₹{h.monthlyValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="itc" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Match ITC claimed vs GSTR-2A auto-populated data</p>
            {totalMismatch > 0 && <Badge variant="destructive" className="text-xs">₹{totalMismatch.toLocaleString()} mismatch</Badge>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-center">Invoices</th>
                  <th className="px-3 py-2 text-right">ITC Claimed</th>
                  <th className="px-3 py-2 text-right">Matched (2A)</th>
                  <th className="px-3 py-2 text-right">Mismatch</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {itcReconciliation.map((item, i) => (
                  <tr key={i} className={`border-b ${item.mismatch > 0 ? "bg-red-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{item.supplier}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.invoices}</td>
                    <td className="px-3 py-2 text-right text-xs">₹{item.claimedITC.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-xs">₹{item.matchedIn2A.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold">{item.mismatch > 0 ? <span className="text-red-600">₹{item.mismatch.toLocaleString()}</span> : <span className="text-green-600">₹0</span>}</td>
                    <td className="px-3 py-2 text-center"><Badge variant={item.status === "matched" ? "outline" : "destructive"} className={`text-[10px] ${item.status === "matched" ? "text-green-600" : ""}`}>{item.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI GST Intelligence</p>
            <p className="text-sm text-purple-700">
              ₹2,700 ITC mismatch detected with 2 suppliers (AVN ₹2,300 + Dabur ₹400). Likely cause: Supplier filed late.
              AI auto-follows up with supplier at month-end. Most AYUSH medicines at 5% — consider claiming manufacturing
              input at 18% for better ITC position. Annual ITC recovery potential: ₹1.2L if all suppliers file on time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
