import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Send, Edit, Globe, Shield, Pen } from "lucide-react";

const templates = [
  { id: "panchakarma", name: "Panchakarma Consent", procedures: "Vamana, Virechana, Basti, Nasya, Raktamokshana" },
  { id: "ksharasutra", name: "Ksharasutra Consent", procedures: "Ksharasutra ligation for fistula-in-ano" },
  { id: "surgery", name: "Surgical Consent", procedures: "General / Minor surgery under local/general anesthesia" },
  { id: "blood-test", name: "Blood Test Consent", procedures: "Venipuncture for diagnostic blood investigation" },
  { id: "genetic", name: "Genetic Testing Consent", procedures: "Pharmacogenomic / Prakriti-genomic testing" },
];

const mockConsentText = `I, the undersigned patient, hereby consent to undergo the following procedure(s):

Procedure: Panchakarma Therapy (Vamana, Virechana, Basti)

I have been informed about:
1. The nature and purpose of the procedure
2. Expected benefits and possible risks/complications
3. Alternative treatment options available
4. The right to withdraw consent at any time

I confirm that I have had the opportunity to ask questions and that my questions have been answered satisfactorily.

Patient Name: ___________________
Date: ___________________
Signature: ___________________

Doctor Name: Dr. Sharma
Registration No: BAMS-12345
Digital Signature: [Pending]`;

const ConsentBuilder = () => {
  const [selected, setSelected] = useState("panchakarma");
  const [consentText, setConsentText] = useState(mockConsentText);
  const [isEditing, setIsEditing] = useState(false);
  const [patientName, setPatientName] = useState("");

  const handleSend = () => {
    if (!patientName.trim()) { toast.error("Enter patient name/ID"); return; }
    toast.success(`Consent form sent to ${patientName} via WhatsApp/SMS`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consent Form Builder</h1>
        <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> Multi-language</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-sm">Templates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                  selected === t.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.procedures}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Consent Document</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-1">
                  <Edit className="h-3 w-3" /> {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button size="sm" variant="outline" className="gap-1"><Shield className="h-3 w-3" /> PDF</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <Textarea value={consentText} onChange={(e) => setConsentText(e.target.value)} rows={14} className="font-mono text-sm" />
            ) : (
              <div className="border rounded-lg p-4 bg-muted/30 whitespace-pre-wrap text-sm min-h-[300px]">{consentText}</div>
            )}

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed">
                <Pen className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">E-Signature area (patient signs on device)</span>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Patient Name / ID</label>
                  <Input placeholder="Enter patient name or ID" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                </div>
                <Button onClick={handleSend} className="gap-2"><Send className="h-4 w-4" /> Send to Patient</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsentBuilder;
