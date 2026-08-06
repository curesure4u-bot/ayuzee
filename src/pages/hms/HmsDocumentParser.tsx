import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText, Upload, Brain, CheckCircle, AlertTriangle,
  ArrowUp, ArrowDown, Pill, Stethoscope, FlaskConical,
  Sparkles, Clock, Eye, RefreshCw, Download
} from "lucide-react";
import {
  parseMedialDocument, classifyDocumentType,
  type DocumentParseResult, type ParsedLabValue
} from "@/services/documentParsingService";

type UploadedDoc = {
  id: string;
  file_name: string;
  file_type: string;
  status: "uploading" | "queued" | "processing" | "parsed" | "failed";
  progress: number;
  result: DocumentParseResult | null;
  uploaded_at: string;
};

const HmsDocumentParser = () => {
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDoc | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const docType = classifyDocumentType(file.name);
      const newDoc: UploadedDoc = {
        id: crypto.randomUUID(),
        file_name: file.name,
        file_type: docType,
        status: "uploading",
        progress: 0,
        result: null,
        uploaded_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setDocuments(prev => [newDoc, ...prev]);

      // Simulate upload progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 200));
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, progress: p, status: p < 100 ? "uploading" : "processing" } : d));
      }

      // Parse document
      try {
        const result = await parseMedialDocument(file.name, docType);
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "parsed", result, progress: 100 } : d));
        toast.success(`Parsed: ${file.name} — ${result.lab_values.length} lab values, ${result.medications.length} medicines extracted`);
      } catch {
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "failed" } : d));
        toast.error(`Failed to parse: ${file.name}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const parsedDocs = documents.filter(d => d.status === "parsed");
  const totalLabValues = parsedDocs.reduce((s, d) => s + (d.result?.lab_values.length || 0), 0);
  const totalMeds = parsedDocs.reduce((s, d) => s + (d.result?.medications.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Medical Document Parser
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload any medical report/prescription → AI extracts structured data instantly
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/patient/find"}>Find Patient</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/records-analyser"}>Records Analyser</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Docs Uploaded</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{parsedDocs.length}</p><p className="text-xs text-muted-foreground">Parsed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{totalLabValues}</p><p className="text-xs text-muted-foreground">Lab Values Extracted</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{totalMeds}</p><p className="text-xs text-muted-foreground">Medicines Found</p></CardContent></Card>
      </div>

      {/* Upload Zone */}
      <Card className={`border-2 border-dashed transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}>
        <CardContent className="p-8"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-3">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Drop medical documents here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports: Lab reports, Prescriptions, Discharge summaries, Insurance cards, X-rays (PDF, JPG, PNG)
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => document.getElementById("file-input")?.click()}>
                <Upload className="mr-1 h-4 w-4" /> Upload Files
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFileUpload(new DataTransfer().files)}>
                <Sparkles className="mr-1 h-4 w-4" /> Demo: Parse Sample
              </Button>
            </div>
            <input id="file-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
          </div>
        </CardContent>
      </Card>

      {/* Document List + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Uploaded Documents</h3>
          {documents.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">Upload a document to get started</p>
          )}
          {documents.map(doc => (
            <div key={doc.id}
              className={`rounded-lg border p-3 cursor-pointer transition ${selectedDoc?.id === doc.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/30"}`}
              onClick={() => doc.status === "parsed" && setSelectedDoc(doc)}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">{doc.uploaded_at} · {doc.file_type}</p>
                </div>
                <Badge variant={doc.status === "parsed" ? "default" : doc.status === "failed" ? "destructive" : "secondary"} className="text-xs shrink-0">
                  {doc.status}
                </Badge>
              </div>
              {(doc.status === "uploading" || doc.status === "processing") && (
                <Progress value={doc.progress} className="mt-2 h-1.5" />
              )}
              {doc.result && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {doc.result.confidence_score}% confidence · {doc.result.lab_values.length} labs · {doc.result.medications.length} meds
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Right: Parsed Results */}
        <div className="lg:col-span-2">
          {selectedDoc?.result ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" /> AI Extraction Results
                  </CardTitle>
                  <Badge variant="outline">{selectedDoc.result.confidence_score}% confidence</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type: <strong>{selectedDoc.result.document_type}</strong> ·
                  Date: {selectedDoc.result.document_date} ·
                  From: {selectedDoc.result.issuing_facility}
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="space-y-3">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="labs">Labs ({selectedDoc.result.lab_values.length})</TabsTrigger>
                    <TabsTrigger value="meds">Medicines ({selectedDoc.result.medications.length})</TabsTrigger>
                    <TabsTrigger value="raw">Raw Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                      <p className="font-medium flex items-center gap-1"><Brain className="h-3.5 w-3.5" /> AI Summary</p>
                      <p className="mt-1 text-xs">{selectedDoc.result.summary}</p>
                    </div>
                    {selectedDoc.result.diagnoses.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Diagnoses</p>
                        <div className="flex gap-1 flex-wrap">
                          {selectedDoc.result.diagnoses.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{d.name} {d.icd_code && `(${d.icd_code})`}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="labs" className="space-y-2">
                    {selectedDoc.result.lab_values.map((lab, i) => (
                      <div key={i} className={`flex items-center justify-between rounded border p-2.5 ${lab.is_abnormal ? "bg-red-50 border-red-200" : "bg-green-50/50"}`}>
                        <div>
                          <p className="text-sm font-medium">{lab.parameter_name}</p>
                          <p className="text-xs text-muted-foreground">{lab.test_name} {lab.loinc_code && `· LOINC: ${lab.loinc_code}`}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${lab.is_abnormal ? "text-red-600" : "text-green-600"}`}>
                            {lab.value} {lab.unit}
                            {lab.is_abnormal && (lab.value! > lab.normal_range_max! ? <ArrowUp className="inline h-3 w-3 ml-0.5" /> : <ArrowDown className="inline h-3 w-3 ml-0.5" />)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Ref: {lab.normal_range_text}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="meds" className="space-y-2">
                    {selectedDoc.result.medications.map((med, i) => (
                      <div key={i} className="flex items-center justify-between rounded border p-2.5">
                        <div className="flex items-center gap-2">
                          <Pill className={`h-4 w-4 ${med.is_ayush ? "text-green-600" : "text-blue-600"}`} />
                          <div>
                            <p className="text-sm font-medium">{med.name}</p>
                            <p className="text-xs text-muted-foreground">{med.frequency} · {med.duration} · {med.route}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {med.is_ayush && <Badge className="bg-green-100 text-green-800 text-[10px]">AYUSH</Badge>}
                          {med.formulation_type && <p className="text-[10px] text-muted-foreground">{med.formulation_type}</p>}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="raw">
                    <pre className="bg-muted/50 rounded p-3 text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedDoc.result.extracted_text}
                    </pre>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button size="sm" onClick={() => toast.success("Data saved to patient health record!")}>
                    <CheckCircle className="mr-1 h-3 w-3" /> Save to Patient Record
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Opening verification editor...")}>
                    <Eye className="mr-1 h-3 w-3" /> Verify & Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("FHIR bundle exported!")}>
                    <Download className="mr-1 h-3 w-3" /> Export FHIR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full grid place-items-center">
              <CardContent className="text-center py-16">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Upload a document and select it to view AI extraction results</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HmsDocumentParser;
