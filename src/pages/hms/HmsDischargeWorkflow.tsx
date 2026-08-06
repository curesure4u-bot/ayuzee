import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, Users, FileText, Pill, CreditCard, Shield, LogOut } from "lucide-react";

const dischargeQueue = [
  { id: "DC-01", patient: "Mr. Nagaraj (AL-8472)", ipNo: "IP-0025", ward: "PK Ward", bed: "PK-03", admDate: "2026-07-22", doctor: "Dr. Mohamad Saleem", steps: { doctorClearance: true, nurseSummary: true, pharmacyClearance: true, billingClearance: false, securityRelease: false } },
  { id: "DC-02", patient: "Mrs. Hameedhal (AL-15598)", ipNo: "IP-0026", ward: "General", bed: "GW-12", admDate: "2026-07-15", doctor: "Dr. Mohamad Saleem", steps: { doctorClearance: true, nurseSummary: true, pharmacyClearance: true, billingClearance: true, securityRelease: false } },
  { id: "DC-03", patient: "Rabiyathubasaria (AL-15568)", ipNo: "IP-0027", ward: "PK Ward", bed: "PK-05", admDate: "2026-07-26", doctor: "Dr. Sahana Fathima", steps: { doctorClearance: true, nurseSummary: false, pharmacyClearance: false, billingClearance: false, securityRelease: false } },
];

const stepConfig = [
  { key: "doctorClearance", label: "Doctor Clearance", icon: Users, desc: "Final examination, discharge summary signed" },
  { key: "nurseSummary", label: "Nursing Summary", icon: FileText, desc: "Final vitals, wound care instructions, handover notes" },
  { key: "pharmacyClearance", label: "Pharmacy Clearance", icon: Pill, desc: "Discharge medicines dispensed, no pending returns" },
  { key: "billingClearance", label: "Billing Clearance", icon: CreditCard, desc: "All bills settled, advance refunded, insurance claimed" },
  { key: "securityRelease", label: "Security Release", icon: Shield, desc: "Gate pass generated, patient released" },
];

const HmsDischargeWorkflow = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Discharge Workflow</h1><p className="text-sm text-muted-foreground">Multi-department clearance: Doctor → Nurse → Pharmacy → Billing → Security Release</p></div>
      <Badge variant="outline">{dischargeQueue.length} patients pending discharge</Badge>
    </div>

    {dischargeQueue.map(patient => {
      const completedSteps = Object.values(patient.steps).filter(Boolean).length;
      const totalSteps = 5;
      return (
        <Card key={patient.id} className={completedSteps === totalSteps - 1 ? "border-green-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">{patient.patient}</CardTitle><p className="text-xs text-muted-foreground">{patient.ipNo} | {patient.ward} - {patient.bed} | Admitted: {patient.admDate} | Doctor: {patient.doctor}</p></div>
              <Badge className="bg-blue-100 text-blue-800">{completedSteps}/{totalSteps} Complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stepConfig.map((step, i) => {
                const done = (patient.steps as any)[step.key];
                return (
                  <div key={step.key} className="flex items-center gap-1">
                    <button onClick={() => !done && toast.success(`${step.label} completed for ${patient.patient}`)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition ${done ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-800 cursor-pointer"}`}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {step.label}
                    </button>
                    {i < 4 && <span className="text-muted-foreground">→</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    })}

    <Card><CardHeader><CardTitle>Discharge Summary Auto-Generated</CardTitle></CardHeader><CardContent className="text-sm space-y-1">
      <p>✅ Diagnosis (ICD/AYUSH code)</p>
      <p>✅ Treatment given (Panchakarma sessions, medicines)</p>
      <p>✅ Discharge medicines + dosage instructions</p>
      <p>✅ Diet chart (Pathya-Apathya) for home</p>
      <p>✅ Yoga/Exercise prescription</p>
      <p>✅ Follow-up date & next appointment</p>
      <p>✅ Emergency contact instructions</p>
      <p>✅ Sent via WhatsApp + Print copy</p>
    </CardContent></Card>
  </div>
);
export default HmsDischargeWorkflow;
