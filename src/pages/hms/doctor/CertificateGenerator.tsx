import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Printer, Download, FileText, PenTool } from "lucide-react";
import { toast } from "sonner";

const certificateTypes = [
  { id: "fitness", label: "Fitness Certificate", description: "Certifies patient is fit to resume work/travel" },
  { id: "sick-leave", label: "Sick Leave Certificate", description: "Medical leave recommendation" },
  { id: "disability", label: "Disability Certificate", description: "Percentage disability assessment" },
  { id: "insurance", label: "Insurance Medical Report", description: "Medical details for insurance claim" },
  { id: "travel", label: "Travel Fitness", description: "Fit to fly / travel clearance" },
  { id: "death", label: "Death Certificate", description: "Cause and manner of death documentation" },
];

const mockPatient = {
  name: "Rajesh Kumar",
  age: 45,
  gender: "Male",
  uhid: "UHID-2024-00342",
  address: "42, Gandhi Nagar, Chennai - 600020",
};

const mockDoctor = {
  name: "Dr. Mohamad Saleem",
  qualification: "BAMS, MD (Kayachikitsa)",
  regNo: "TN-AYU-2015-4521",
  hospital: "Ayuzee AYUSH Hospital, Chennai",
};

export default function CertificateGenerator() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("Gridhrasi (Lumbar Radiculopathy)");
  const [duration, setDuration] = useState("7 days");
  const [restrictions, setRestrictions] = useState("Avoid heavy lifting, prolonged sitting. Light duties recommended.");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handlePrint = () => toast.success("Certificate sent to printer.");
  const handlePdf = () => toast.success("PDF generated and saved.");
  const handleSign = () => toast.success("Digital signature applied.");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medical Certificate Generator</h1>
        <p className="text-muted-foreground">Generate, sign, and print medical certificates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {certificateTypes.map((ct) => (
          <Card key={ct.id} className={`cursor-pointer transition-all ${selectedType === ct.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`} onClick={() => setSelectedType(ct.id)}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{ct.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ct.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Certificate Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Patient Name</label>
                  <Input value={mockPatient.name} readOnly className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-xs font-medium">UHID</label>
                  <Input value={mockPatient.uhid} readOnly className="mt-1 bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Diagnosis</label>
                <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Duration / Period</label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">Certificate Type</label>
                  <Input value={certificateTypes.find((c) => c.id === selectedType)?.label || ""} readOnly className="mt-1 bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Restrictions / Recommendations</label>
                <Textarea value={restrictions} onChange={(e) => setRestrictions(e.target.value)} className="mt-1" rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium">Additional Notes</label>
                <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} className="mt-1" rows={2} placeholder="Any additional notes..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 border rounded-lg p-4 bg-white">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base">{mockDoctor.hospital}</h3>
                <p className="text-xs text-muted-foreground">Regd. under Clinical Establishment Act</p>
                <Badge className="mt-1">{certificateTypes.find((c) => c.id === selectedType)?.label?.toUpperCase()}</Badge>
              </div>
              <div className="space-y-2">
                <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
                <p><strong>Patient:</strong> {mockPatient.name}, {mockPatient.age}y/{mockPatient.gender}</p>
                <p><strong>UHID:</strong> {mockPatient.uhid}</p>
                <p><strong>Address:</strong> {mockPatient.address}</p>
                <p className="mt-3">This is to certify that the above-named patient was examined and found to be suffering from <strong>{diagnosis}</strong>.</p>
                <p><strong>Duration:</strong> {duration}</p>
                <p><strong>Restrictions:</strong> {restrictions}</p>
                {additionalNotes && <p><strong>Notes:</strong> {additionalNotes}</p>}
              </div>
              <div className="border-t pt-3 mt-4 text-right">
                <p className="font-medium">{mockDoctor.name}</p>
                <p className="text-xs text-muted-foreground">{mockDoctor.qualification}</p>
                <p className="text-xs text-muted-foreground">Reg. No: {mockDoctor.regNo}</p>
                <div className="mt-2 border border-dashed border-muted-foreground/30 rounded p-2 inline-block text-xs text-muted-foreground">[Digital Signature]</div>
              </div>
            </CardContent>
            <CardContent className="flex gap-2 pt-0">
              <Button onClick={handlePrint} className="gap-2 flex-1"><Printer className="h-4 w-4" />Print</Button>
              <Button onClick={handlePdf} variant="outline" className="gap-2 flex-1"><Download className="h-4 w-4" />PDF</Button>
              <Button onClick={handleSign} variant="outline" className="gap-2 flex-1"><PenTool className="h-4 w-4" />Sign</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
