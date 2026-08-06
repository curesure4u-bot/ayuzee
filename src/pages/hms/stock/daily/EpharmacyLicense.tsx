import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, Shield, CheckCircle, AlertTriangle, Calendar, FileText, Globe } from "lucide-react";

const licenses = [
  { type: "e-Pharmacy Registration", number: "EP/KA/2024/001234", authority: "State Pharmacy Council, Karnataka", issued: "01 Jun 2024", expiry: "31 May 2029", status: "active", daysLeft: 1044, requirement: "Required for online sale + courier dispatch of medicines" },
  { type: "Drug License DL-20B (Online)", number: "KA/BNG/20B/2024/O-5678", authority: "Drug Controller, Karnataka", issued: "15 Jun 2024", expiry: "14 Jun 2029", status: "active", daysLeft: 1058, requirement: "Specific to online/e-commerce dispensing. Separate from retail DL-21." },
  { type: "IT Act Compliance (Pharmacy)", number: "CERT/2024/EP/789", authority: "MeitY / CDSCO", issued: "01 Jan 2025", expiry: "31 Dec 2025", status: "renewal_due", daysLeft: 162, requirement: "Data protection + IT Act compliance for storing patient prescription data online" },
  { type: "FSSAI (Online Food Business)", number: "10024052001234-E", authority: "FSSAI", issued: "10 Jun 2024", expiry: "09 Jun 2029", status: "active", daysLeft: 1053, requirement: "Required if selling health supplements / nutraceuticals online" },
];

const complianceChecklist = [
  { item: "Registered pharmacist available during online dispensing hours", status: "compliant", note: "Pharmacist A: 9 AM - 6 PM, Pharmacist B: 6 PM - 9 PM" },
  { item: "Prescription uploaded before Schedule H/H1 medicine dispatch", status: "compliant", note: "Auto-enforced by HMS — blocks dispatch without Rx upload" },
  { item: "Patient identity verification for first-time online orders", status: "compliant", note: "OTP verification + Aadhaar optional" },
  { item: "Medicine labeling compliance for courier packages", status: "compliant", note: "Auto-generated labels with batch, expiry, dosage" },
  { item: "Temperature-sensitive medicine cold chain for courier", status: "partial", note: "Only for Ghrita/biologicals. Insulated packaging available but not IoT-tracked in transit." },
  { item: "Grievance redressal mechanism displayed on platform", status: "compliant", note: "WhatsApp + email + call center" },
  { item: "Data retention policy (3 years minimum for prescriptions)", status: "compliant", note: "Supabase + backup — 5 year retention configured" },
  { item: "Quarterly report submission to State Pharmacy Council", status: "pending", note: "Q2 report due by 31 Jul 2026" },
];

export default function EpharmacyLicense() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-green-600" /> e-Pharmacy License Tracker</h1>
          <p className="text-muted-foreground mt-1">Track online pharmacy licenses — separate from retail DL. Required for courier dispatch model.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{licenses.length}</p><p className="text-xs text-muted-foreground">Licenses</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{licenses.filter(l => l.status === "active").length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{licenses.filter(l => l.status === "renewal_due").length}</p><p className="text-xs text-muted-foreground">Renewal Due</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{complianceChecklist.filter(c => c.status === "compliant").length}/{complianceChecklist.length}</p><p className="text-xs text-muted-foreground">Compliance</p></CardContent></Card>
      </div>

      <div className="space-y-2">
        {licenses.map((lic, i) => (
          <Card key={i} className={lic.status === "renewal_due" ? "border-amber-300" : ""}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{lic.type}</p>
                  <Badge variant={lic.status === "active" ? "outline" : "destructive"} className={`text-[10px] ${lic.status === "active" ? "text-green-600" : ""}`}>{lic.status === "active" ? "Active" : "Renewal Due"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{lic.number} • {lic.authority}</p>
                <p className="text-[10px] text-muted-foreground">Issued: {lic.issued} | Expiry: {lic.expiry}</p>
                <p className="text-[10px] mt-0.5">{lic.requirement}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${lic.daysLeft < 180 ? "text-amber-600" : "text-green-600"}`}>{lic.daysLeft}d</p>
                {lic.status === "renewal_due" && <Button size="sm" className="h-6 text-[10px] mt-1" onClick={() => toast.success("Renewal initiated")}>Renew</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Checklist (e-Pharmacy Rules 2018)</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {complianceChecklist.map((c, i) => (
            <div key={i} className={`p-2 rounded border text-xs flex items-start gap-2 ${c.status === "compliant" ? "border-green-200" : c.status === "partial" ? "border-amber-200" : "border-red-200"}`}>
              {c.status === "compliant" ? <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />}
              <div><p className="font-medium">{c.item}</p><p className="text-[10px] text-muted-foreground mt-0.5">{c.note}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI License Intelligence</p><p className="text-sm text-purple-700">IT Act compliance certificate expiring in 162 days — renewal process takes 30 days. AI will trigger reminder at 60 days. Q2 quarterly report due 31 Jul — auto-generated from HMS data (online orders, prescriptions verified, complaints resolved). Cold chain tracking gap identified: Add IoT temp sensor in courier packaging for Ghrita shipments (₹15/shipment — covers liability).</p></div></CardContent></Card>
    </div>
  );
}
