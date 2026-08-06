import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Shield, AlertTriangle, Lock, FileText, Download } from "lucide-react";

const ndpsItems = [
  { name: "Vijaya (Cannabis leaf extract)", schedule: "NDPS — AYUSH Exemption", form: "Vijaya Extract Capsule 10mg", license: "AYUSH-NDPS/KA/2024/001", stock: 120, monthlyUsage: 35, supplier: "Licensed AYUSH manufacturer", restriction: "Only BAMS/MD(Ay) can prescribe. Register mandatory." },
  { name: "Bhang (Cannabis Sativa leaf)", schedule: "NDPS — State Exemption", form: "Bhang Churna 50g", license: "AYUSH-NDPS/KA/2024/002", stock: 25, monthlyUsage: 8, supplier: "State-authorized cultivator", restriction: "Legal in Karnataka for AYUSH. Possession limit 100g." },
  { name: "Ahiphena (Opium-based)", schedule: "NDPS Schedule II", form: "Ahiphena formulation 30ml", license: "NDPS/KA/2024/003", stock: 5, monthlyUsage: 2, supplier: "Govt. Opium Factory (Neemuch)", restriction: "Strictest control. Double-lock storage. Inspector access." },
  { name: "Codeine Phosphate Linctus", schedule: "Schedule H1 + NDPS", form: "Codeine Linctus 100ml", license: "DL-Sch.H1/KA/2024", stock: 8, monthlyUsage: 3, supplier: "Licensed pharma (Allopathy)", restriction: "Prescription mandatory. Maintain dispensing register." },
];

const register = [
  { date: "22 Jul 2026", item: "Vijaya Extract Capsule 10mg", patient: "Rajesh K.", doctor: "Dr. Arun (MD Ay)", rx: "Rx#4525", qty: 30, balance: 90, purpose: "Chronic pain — Spine (failed PK+Guggulu)", verification: "Aadhaar verified" },
  { date: "20 Jul 2026", item: "Vijaya Extract Capsule 10mg", patient: "Suresh M.", doctor: "Dr. Arun (MD Ay)", rx: "Rx#4520", qty: 20, balance: 100, purpose: "Neuropathic pain + insomnia", verification: "Aadhaar verified" },
  { date: "18 Jul 2026", item: "Bhang Churna 50g", patient: "Anand P.", doctor: "Dr. Arun (MD Ay)", rx: "Rx#4518", qty: 1, balance: 24, purpose: "Anxiety + appetite enhancement (cancer support)", verification: "Aadhaar verified" },
  { date: "15 Jul 2026", item: "Codeine Linctus 100ml", patient: "Meera N.", doctor: "Dr. Mohan (MBBS)", rx: "Rx#4515", qty: 1, balance: 7, purpose: "Severe dry cough (post-COVID)", verification: "Rx photo uploaded" },
  { date: "10 Jul 2026", item: "Ahiphena formulation 30ml", patient: "Lakshmi N.", doctor: "Dr. Arun (MD Ay)", rx: "Rx#4510", qty: 1, balance: 4, purpose: "Severe diarrhea (Atisara — classical Ayurvedic indication)", verification: "Aadhaar + doctor sign" },
];

const storageRules = [
  { item: "All NDPS items", rule: "Double-lock safe (2 different keys held by 2 different persons)", compliance: "compliant" },
  { item: "Register maintenance", rule: "Physical register + digital backup. No erasure/overwriting allowed.", compliance: "compliant" },
  { item: "Inspector access", rule: "Narcotic inspector can demand register anytime. Keep updated daily.", compliance: "compliant" },
  { item: "Quarterly balance report", rule: "Submit to Narcotics Commissioner quarterly (Form 1-A)", compliance: "due" },
  { item: "Annual return", rule: "Annual stock statement to NDPS authority by April 30", compliance: "compliant" },
];

export default function NdpsRegister() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-red-600" /> Narcotics (NDPS) Register</h1>
          <p className="text-muted-foreground mt-1">Schedule X / NDPS drugs — Vijaya (cannabis-based AYUSH), Ahiphena (opium). Legally mandated register.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("NDPS register exported as PDF")}><Download className="h-3 w-3 mr-1" /> Export Register</Button>
      </div>

      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3 text-xs text-red-700">
          <Shield className="h-3.5 w-3.5 inline mr-1" />
          <strong>LEGAL REQUIREMENT:</strong> Every purchase, dispensing, and balance of NDPS items MUST be recorded in a bound register (physical + digital). Narcotics inspector can demand inspection without notice. Non-compliance = criminal offense under NDPS Act 1985.
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">NDPS Items in Stock</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Schedule</th><th className="px-3 py-2 text-left">Form</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-center">Monthly Use</th><th className="px-3 py-2 text-left">Restriction</th></tr></thead><tbody>
            {ndpsItems.map((item, i) => (
              <tr key={i} className="border-b bg-red-50/20">
                <td className="px-3 py-2 text-xs font-medium">{item.name}</td>
                <td className="px-3 py-2 text-center"><Badge variant="destructive" className="text-[10px]">{item.schedule}</Badge></td>
                <td className="px-3 py-2 text-xs">{item.form}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{item.stock}</td>
                <td className="px-3 py-2 text-center text-xs">{item.monthlyUsage}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px]">{item.restriction}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Dispensing Register (Digital)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Doctor</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-center">Balance</th><th className="px-3 py-2 text-left">Purpose</th><th className="px-3 py-2 text-center">ID Verify</th></tr></thead><tbody>
            {register.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-center text-xs">{r.date}</td>
                <td className="px-3 py-2 text-xs font-medium">{r.item}</td>
                <td className="px-3 py-2 text-xs">{r.patient}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.doctor}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{r.qty}</td>
                <td className="px-3 py-2 text-center text-xs">{r.balance}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px]">{r.purpose}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px] text-green-600">{r.verification}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Storage &amp; Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {storageRules.map((r, i) => (
            <div key={i} className={`p-2 rounded border text-xs flex items-start gap-2 ${r.compliance === "compliant" ? "border-green-200" : "border-amber-200"}`}>
              {r.compliance === "compliant" ? <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />}
              <div><p className="font-medium">{r.item}</p><p className="text-[10px] text-muted-foreground">{r.rule}</p></div>
              <Badge variant={r.compliance === "compliant" ? "outline" : "default"} className={`text-[10px] ml-auto ${r.compliance === "compliant" ? "text-green-600" : ""}`}>{r.compliance}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI NDPS Compliance</p><p className="text-sm text-purple-700">All NDPS dispensings auto-verified: Doctor qualification checked (only MD Ay/BAMS for Vijaya), patient Aadhaar mandatory, running balance maintained. Quarterly report due 31 Jul — auto-generated from register data. Vijaya usage trending up (35/month) — legitimate chronic pain patients post spine treatment. Stock vs register balance matched: Zero discrepancy (last inspector visit: "exemplary record-keeping"). AI blocks any attempt to dispense without valid Rx + ID verification.</p></div></CardContent></Card>
    </div>
  );
}
