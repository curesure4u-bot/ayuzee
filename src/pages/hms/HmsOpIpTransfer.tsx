import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BedDouble, ArrowRight, Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const pendingTransfers = [
  { id: "T-01", patient: "Mr. Nagaraj (AL-8472)", age: 65, opNo: "OP-1846", doctor: "Dr. Mohamad Saleem", reason: "Kati Basti 7-day course — requires daily IP monitoring", ward: "Panchakarma Ward", bed: "PK-03", admType: "Day Care", status: "Pending Approval" },
  { id: "T-02", patient: "Mrs. Hameedhal (AL-15598)", age: 75, opNo: "OP-1852", doctor: "Dr. Mohamad Saleem", reason: "Severe Gridhrasi — needs Tikta Ksheer Basti (16 days)", ward: "General Ward", bed: "GW-12", admType: "IP Admission", status: "Approved" },
  { id: "T-03", patient: "Rabiyathubasaria (AL-15568)", age: 42, opNo: "OP-1851", doctor: "Dr. Sahana Fathima", reason: "Virechana Karma — 5-day pre-procedure + 1 day procedure", ward: "Panchakarma Ward", bed: "PK-05", admType: "Day Care", status: "Bed Assigned" },
];

const HmsOpIpTransfer = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">OP → IP Transfer</h1><p className="text-sm text-muted-foreground">One-click convert OPD patient to In-Patient admission with full data carryover</p></div>
      <Button onClick={() => toast.success("New transfer initiated")}><ArrowRight className="mr-2 h-4 w-4" />New Transfer</Button>
    </div>

    <div className="grid gap-3">
      {pendingTransfers.map(t => (
        <Card key={t.id} className={t.status === "Approved" ? "border-green-200" : t.status === "Bed Assigned" ? "border-blue-200" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><p className="font-semibold">{t.patient}</p><Badge variant="outline">{t.opNo}</Badge><Badge className="bg-blue-100 text-blue-800">{t.admType}</Badge></div>
                <p className="text-sm text-muted-foreground">Age: {t.age} | Doctor: {t.doctor}</p>
                <p className="text-sm"><strong>Reason:</strong> {t.reason}</p>
                <p className="text-sm"><strong>Ward:</strong> {t.ward} | <strong>Bed:</strong> {t.bed}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={t.status === "Approved" ? "bg-green-100 text-green-800" : t.status === "Bed Assigned" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>{t.status}</Badge>
                {t.status === "Pending Approval" && <Button size="sm" onClick={() => toast.success("Transfer approved — bed assigned")}>Approve & Assign Bed</Button>}
                {t.status === "Approved" && <Button size="sm" variant="outline" onClick={() => toast.success("Patient admitted to IP")}>Admit Now</Button>}
                {t.status === "Bed Assigned" && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Patient checked in to ward")}><CheckCircle2 className="mr-1 h-3 w-3" />Check In</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card><CardHeader><CardTitle>Data Carryover (Auto-transferred to IP)</CardTitle></CardHeader><CardContent className="text-sm space-y-1">
      <p>✅ Patient demographics & insurance</p>
      <p>✅ Current vitals & allergies</p>
      <p>✅ Today's consultation notes & Rx</p>
      <p>✅ Lab orders & pending results</p>
      <p>✅ Active treatment plan (Panchakarma schedule)</p>
      <p>✅ Diet chart (Pathya-Apathya)</p>
      <p>✅ Consent forms (if signed)</p>
    </CardContent></Card>
  </div>
);
export default HmsOpIpTransfer;
