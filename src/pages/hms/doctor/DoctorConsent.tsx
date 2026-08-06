import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Printer, Save, PenTool, CheckCircle } from "lucide-react";

const consentTypes = [
  "Panchakarma Treatment (Virechana/Vamana/Basti)",
  "Surgical Procedure (Agnikarma/Ksharasutra)",
  "IP Admission",
  "Teleconsultation",
  "Research Participation",
  "Raktamokshana (Leech/Blood-letting)",
  "General Treatment Consent",
];

const DoctorConsent = () => {
  const [consentType, setConsentType] = useState("Panchakarma Treatment (Virechana/Vamana/Basti)");
  const [risksExplained, setRisksExplained] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(false);
  const [signed, setSigned] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" /> Digital Consent Forms</h1>
          <p className="text-muted-foreground mt-1">Generate and capture patient consent digitally before procedures</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Select Consent Type</CardTitle></CardHeader>
        <CardContent>
          <Select value={consentType} onValueChange={setConsentType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{consentTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 bg-blue-50"><CardTitle className="text-base">Consent Form — Panchakarma (Virechana)</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Patient Name</Label><Input value="Mr. Nagaraj" readOnly className="bg-muted" /></div>
            <div><Label>Date</Label><Input value="22/07/2026" readOnly className="bg-muted" /></div>
            <div><Label>Procedure</Label><Input value="Virechana (Therapeutic Purgation)" readOnly className="bg-muted" /></div>
            <div><Label>Doctor</Label><Input value="Dr. Mohamad Saleem" readOnly className="bg-muted" /></div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Procedure Description:</p>
            <p className="text-sm text-muted-foreground">Virechana is a Panchakarma procedure involving therapeutic purgation using Ayurvedic medicines (Trivrit Lehya / Abhayadi Modak) to eliminate vitiated Pitta and Ama from the body through the anal route. This is preceded by 5-7 days of Snehapana (internal oleation) and Swedana (fomentation).</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-red-600">Possible Side Effects & Risks:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Nausea, vomiting during purgation</li>
              <li>Temporary weakness and fatigue (1-2 days)</li>
              <li>Dehydration (managed with ORS and fluids)</li>
              <li>Abdominal cramps (self-limiting)</li>
              <li>Rare: electrolyte imbalance, excessive purgation</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Contraindications Verified:</p>
            <p className="text-sm text-muted-foreground">Not pregnant, No rectal bleeding, No severe debility, No fever, Adequate Agni after Snehapana confirmed.</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Digital Signature:</p>
            <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
              {signed ? <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span className="font-medium">Signed Digitally</span></div> : <div className="flex items-center gap-2 text-muted-foreground"><PenTool className="h-5 w-5" /><span>Tap/Click here to sign</span></div>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2"><Checkbox checked={risksExplained} onCheckedChange={(c) => setRisksExplained(!!c)} /><span className="text-sm">I confirm risks were explained verbally to the patient</span></label>
            <label className="flex items-center gap-2"><Checkbox checked={questionsAsked} onCheckedChange={(c) => setQuestionsAsked(!!c)} /><span className="text-sm">Patient had opportunity to ask questions and all doubts were clarified</span></label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setSigned(true); toast.success("Consent captured digitally"); }}><PenTool className="h-4 w-4 mr-1" /> Patient Signed (Digital)</Button>
            <Button variant="outline" onClick={() => toast.success("Sent to printer")}><Printer className="h-4 w-4 mr-1" /> Print for Physical Sign</Button>
            <Button variant="outline" onClick={() => toast.success("Saved to patient record")}><Save className="h-4 w-4 mr-1" /> Save to Record</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorConsent;
