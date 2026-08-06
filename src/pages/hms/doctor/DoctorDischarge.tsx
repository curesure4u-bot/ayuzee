import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Printer, Brain, MessageCircle, Save } from "lucide-react";

const DoctorDischarge = () => {
  const [diagnosisAdmit] = useState("Amavata (RA) — Acute flare with DAS28: 5.8");
  const [diagnosisDischarge] = useState("Amavata — Improved. DAS28: 3.2 (Low activity)");
  const [treatmentGiven] = useState("1. Panchakarma: Virechana (Day 3) + Yoga Basti × 8 days\n2. Abhyanga + Patra Pinda Sweda × 7 days\n3. Internal: Simhanada Guggulu + Rasnasaptakam + MTX continued\n4. Agnikarma × 2 sittings on knee trigger points\n5. Physiotherapy: Gentle ROM exercises daily");
  const [conditionDischarge] = useState("Stable. Pain 2/10 (was 8/10). Morning stiffness < 15 min. Able to walk independently. Appetite improved. Sleep normal.");
  const [dischargeMeds] = useState("1. Simhanada Guggulu 2 BD — 30 days\n2. Rasnasaptakam 15ml BD — 30 days\n3. Ashwagandha 3g HS with milk — 60 days\n4. Methotrexate 15mg weekly (continue)\n5. Folic Acid 5mg (next day after MTX)\n6. Kottamchukkadi Taila — external daily");
  const [advice] = useState("1. Follow Pathya diet (warm, unctuous, avoid cold/curd/fermented)\n2. Yoga: Pawanmuktasana series + Pranayama daily\n3. Oil Abhyanga (self-massage) with Mahanarayan Taila before bath\n4. Avoid: heavy lifting, cold exposure, stress\n5. Monthly LFT + CBC (MTX monitoring)\n6. Return for follow-up Panchakarma after 3 months");
  const [followUp] = useState("30 days — Dr. Mohamad Saleem, Kadayanallur");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" /> Discharge Summary Builder</h1>
          <p className="text-muted-foreground mt-1">AI auto-fills from IP records — review and finalize</p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300"><Brain className="h-3 w-3 mr-1" /> AI Pre-filled</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2 bg-blue-50"><CardTitle className="text-base">Patient: Mr. Nagaraj (AL-8472) | IP No: 14 | Admitted: 10/07/2026 | Discharged: 17/07/2026 (7 days)</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div><Label className="font-medium">Diagnosis at Admission</Label><Textarea value={diagnosisAdmit} readOnly className="bg-muted mt-1" rows={2} /></div>
          <div><Label className="font-medium">Diagnosis at Discharge</Label><Textarea value={diagnosisDischarge} readOnly className="bg-muted mt-1" rows={2} /></div>
          <Separator />
          <div><Label className="font-medium">Treatment Given During Stay</Label><Textarea value={treatmentGiven} readOnly className="bg-muted mt-1" rows={5} /></div>
          <div><Label className="font-medium">Condition at Discharge</Label><Textarea value={conditionDischarge} readOnly className="bg-muted mt-1" rows={3} /></div>
          <Separator />
          <div><Label className="font-medium">Discharge Medications</Label><Textarea value={dischargeMeds} readOnly className="bg-muted mt-1" rows={6} /></div>
          <div><Label className="font-medium">Advice & Instructions</Label><Textarea value={advice} readOnly className="bg-muted mt-1" rows={6} /></div>
          <div><Label className="font-medium">Follow-up</Label><Input value={followUp} readOnly className="bg-muted" /></div>
          <Separator />
          <div className="flex gap-2">
            <Button onClick={() => toast.success("Discharge summary saved")}><Save className="h-4 w-4 mr-1" /> Save & Finalize</Button>
            <Button variant="outline" onClick={() => toast.success("Printing...")}><Printer className="h-4 w-4 mr-1" /> Print</Button>
            <Button variant="outline" onClick={() => toast.success("Sent via WhatsApp")}><MessageCircle className="h-4 w-4 mr-1" /> Send to Patient</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDischarge;
