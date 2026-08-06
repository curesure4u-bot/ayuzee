import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, Calendar, FileText, Brain, ClipboardList } from "lucide-react";

const licenses = [
  { type: "DL-20 (Wholesale)", number: "KA/BNG/20/2024/W-1234", issued: "15 Mar 2024", expiry: "14 Mar 2029", authority: "Drug Controller, Karnataka", status: "active", daysLeft: 965 },
  { type: "DL-21 (Retail)", number: "KA/BNG/21/2024/R-5678", issued: "15 Mar 2024", expiry: "14 Mar 2029", authority: "Drug Controller, Karnataka", status: "active", daysLeft: 965 },
  { type: "AYUSH License (ASU)", number: "KA/ASU/2023/A-9012", issued: "01 Jan 2023", expiry: "31 Dec 2027", authority: "AYUSH Dept, Karnataka", status: "active", daysLeft: 528 },
  { type: "FSSAI (Nutraceuticals)", number: "10024052001234", issued: "10 Jun 2024", expiry: "09 Jun 2029", authority: "FSSAI", status: "active", daysLeft: 1053 },
  { type: "Manufacturing License", number: "KA/MFG/2022/M-3456", issued: "01 Jul 2022", expiry: "30 Jun 2027", authority: "AYUSH Drug Controller", status: "renewal_due", daysLeft: 343 },
];

const inspections = [
  { date: "10 Jul 2026", inspector: "Sri. Ramesh Kumar (ADC)", type: "Routine", branch: "Central Store", findings: "All records satisfactory. Minor: Form 41 register handwriting clarity.", action: "Digitize Form 41 entries", status: "closed" },
  { date: "22 Mar 2026", inspector: "Dr. Lakshmi (AYUSH Inspector)", type: "AYUSH Compliance", branch: "Branch - Koramangala", findings: "Classical medicines storage temperature OK. Label compliance 100%.", action: "None required", status: "closed" },
  { date: "05 Jan 2026", inspector: "Sri. Venkat (Food Safety)", type: "FSSAI Audit", branch: "Central Store", findings: "Nutraceutical labeling needs batch-wise nutrition info", action: "Updated labels for 12 SKUs", status: "closed" },
];

const form41 = [
  { date: "22 Jul 2026", item: "Prednisolone 5mg", schedule: "H", qty: 30, patient: "Rajesh K.", prescription: "Dr. Arun - Rx#4521", batch: "PRD-0726" },
  { date: "21 Jul 2026", item: "Methotrexate 15mg", schedule: "H1", qty: 4, patient: "Meera N.", prescription: "Dr. Mohan - Rx#4520", batch: "MTX-0626" },
  { date: "20 Jul 2026", item: "Codeine Linctus 100ml", schedule: "H", qty: 1, patient: "Suresh M.", prescription: "Dr. Priya - Rx#4519", batch: "CDL-0526" },
  { date: "19 Jul 2026", item: "Diazepam 5mg", schedule: "X", qty: 10, patient: "Anand P.", prescription: "Dr. Arun - Rx#4518", batch: "DZP-0426" },
  { date: "18 Jul 2026", item: "Visha Drug (Aconite prep)", schedule: "E1", qty: 1, patient: "Priya S.", prescription: "Dr. Arun - Rx#4517", batch: "VDA-0726" },
];

export default function DrugLicense() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" /> Drug License & Compliance
        </h1>
        <p className="text-muted-foreground mt-1">Track licenses, Form 41 register, inspector visits — stay audit-ready</p>
      </div>

      <Tabs defaultValue="licenses">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="licenses" className="text-xs">Licenses</TabsTrigger>
          <TabsTrigger value="form41" className="text-xs">Form 41 Register</TabsTrigger>
          <TabsTrigger value="inspections" className="text-xs">Inspector Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{licenses.length}</p><p className="text-xs text-muted-foreground">Total Licenses</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{licenses.filter(l => l.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
            <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{licenses.filter(l => l.status === "renewal_due").length}</p><p className="text-xs text-muted-foreground">Renewal Due</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{inspections.length}</p><p className="text-xs text-muted-foreground">Inspections (YTD)</p></CardContent></Card>
          </div>
          <div className="space-y-2">
            {licenses.map((lic, i) => (
              <Card key={i} className={lic.status === "renewal_due" ? "border-amber-300" : ""}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{lic.type}</p>
                      <Badge variant={lic.status === "active" ? "outline" : "destructive"} className={`text-[10px] ${lic.status === "active" ? "text-green-600" : ""}`}>
                        {lic.status === "active" ? "Active" : "Renewal Due"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{lic.number}</p>
                    <p className="text-[10px] text-muted-foreground">{lic.authority} • Issued: {lic.issued} • Expiry: {lic.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${lic.daysLeft < 365 ? "text-amber-600" : "text-green-600"}`}>{lic.daysLeft} days left</p>
                    {lic.status === "renewal_due" && <Button size="sm" className="h-6 text-[10px] mt-1" onClick={() => toast.success("Renewal application initiated")}>Renew</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="form41" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Schedule H/H1/X/E1 dispensing register — auto-filled from prescriptions</p>
            <Button size="sm" variant="outline" onClick={() => toast.success("Form 41 exported as PDF")}><FileText className="h-3 w-3 mr-1" /> Export PDF</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-center">Schedule</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Prescription</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                </tr>
              </thead>
              <tbody>
                {form41.map((f, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{f.date}</td>
                    <td className="px-3 py-2 text-xs font-medium">{f.item}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="destructive" className="text-[10px]">{f.schedule}</Badge></td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{f.qty}</td>
                    <td className="px-3 py-2 text-xs">{f.patient}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{f.prescription}</td>
                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{f.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Drug inspector visit history — findings & corrective actions</p>
            <Button size="sm" variant="outline" onClick={() => toast.success("Inspection report generated")}>Generate Report</Button>
          </div>
          <div className="space-y-3">
            {inspections.map((ins, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{ins.date}</p>
                        <Badge variant="outline" className="text-[10px]">{ins.type}</Badge>
                        <Badge variant="outline" className="text-[10px] text-green-600">{ins.status}</Badge>
                      </div>
                      <p className="text-xs mt-1"><strong>Inspector:</strong> {ins.inspector} • <strong>Branch:</strong> {ins.branch}</p>
                      <p className="text-xs text-muted-foreground mt-1"><strong>Findings:</strong> {ins.findings}</p>
                      <p className="text-xs mt-1"><strong>Action:</strong> {ins.action}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Compliance Monitor</p>
            <p className="text-sm text-purple-700">
              Manufacturing License expires in 343 days — AI will trigger renewal reminder at 180 days.
              Form 41 auto-populated from HMS prescriptions — no manual entry needed.
              Next scheduled inspection predicted: Oct 2026 (based on 6-month routine cycle).
              All AYUSH classical medicines compliant with ASU labeling requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
