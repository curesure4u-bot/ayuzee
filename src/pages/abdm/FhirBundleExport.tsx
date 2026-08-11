import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const sampleBundle = JSON.stringify({
  resourceType: "Bundle",
  type: "document",
  entry: [{ resource: { resourceType: "Patient", name: [{ family: "Sharma", given: ["Rahul"] }], gender: "male", birthDate: "1990-05-15" } }],
}, null, 2);

const exportOptions = [
  "Patient Demographics", "Conditions/Diagnoses", "Medications", "Allergies",
  "Observations (vitals)", "Procedures", "Immunizations", "Lab Results",
];

export default function FhirBundleExport() {
  const [selected, setSelected] = useState<string[]>(["Patient Demographics"]);
  const [format, setFormat] = useState<"JSON" | "XML">("JSON");
  const [showPreview, setShowPreview] = useState(false);

  const toggleOption = (opt: string) => {
    setSelected((prev) => prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">FHIR R4 Export</h1>
          <p className="text-muted-foreground">Export health records in HL7 FHIR R4 format for interoperability</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Patient Record</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Select patient record to export" defaultValue="Rahul Sharma — ID: P-2026-001" />
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggleOption(opt)} />
                {opt}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant={format === "JSON" ? "default" : "outline"} size="sm" onClick={() => setFormat("JSON")}>JSON</Button>
            <Button variant={format === "XML" ? "default" : "outline"} size="sm" onClick={() => setFormat("XML")}>XML</Button>
          </div>
          <Button onClick={() => setShowPreview(true)}>Generate FHIR Bundle</Button>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader><CardTitle>Bundle Preview ({format})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-60">{sampleBundle}</pre>
            <Button onClick={() => toast.success("FHIR Bundle downloaded successfully")}>Download Bundle</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">HL7 FHIR R4 Compliant</Badge>
        <Badge variant="secondary">ABDM Compatible</Badge>
        <Badge variant="secondary">NDHM Standard</Badge>
      </div>
    </div>
  );
}
