import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Scan, Upload, FileText, CheckCircle, Clock, Brain,
  Calendar, Pill, Activity, AlertTriangle, Sparkles,
  Image, File,
} from "lucide-react";

type AnalysedRecord = {
  id: string;
  fileName: string;
  uploadedAt: string;
  type: "prescription" | "lab_report" | "discharge" | "imaging" | "handwritten";
  status: "processing" | "completed" | "failed";
  extractedData?: {
    date: string;
    doctor: string;
    facility: string;
    diagnosis: string;
    medicines: string[];
    investigations: string[];
    notes: string;
  };
};

const mockRecords: AnalysedRecord[] = [
  {
    id: "1", fileName: "old_prescription_2024.jpg", uploadedAt: "2026-07-15 09:30",
    type: "handwritten", status: "completed",
    extractedData: {
      date: "2024-08-15", doctor: "Dr. Raghavan", facility: "Govt. Ayurveda Hospital, Trivandrum",
      diagnosis: "Sandhivata (OA Knee Bilateral)",
      medicines: ["Yogaraja Guggulu 2 TDS", "Rasnaerandadi Kashayam 15ml BD", "Dhanwantharam 101 capsule 1 HS"],
      investigations: ["ESR", "RA Factor", "X-Ray Knee"],
      notes: "Advised Panchakarma after 1 month of internal medicines. Avoid cold exposure.",
    },
  },
  {
    id: "2", fileName: "lab_report_dec2025.pdf", uploadedAt: "2026-07-15 09:32",
    type: "lab_report", status: "completed",
    extractedData: {
      date: "2025-12-10", doctor: "Dr. Pathology", facility: "SRL Diagnostics, Kochi",
      diagnosis: "Lab Investigation Report",
      medicines: [],
      investigations: ["Hb: 12.8 g/dL", "ESR: 32 mm/hr (H)", "CRP: 15.2 mg/L (H)", "RA Factor: Negative", "Vit D3: 18 ng/ml (L)"],
      notes: "Elevated inflammatory markers. Low Vitamin D levels.",
    },
  },
  {
    id: "3", fileName: "discharge_summary_kottakkal.pdf", uploadedAt: "2026-07-15 09:35",
    type: "discharge", status: "completed",
    extractedData: {
      date: "2025-12-20", doctor: "Dr. Meena Patel", facility: "Kottakkal Arya Vaidya Sala",
      diagnosis: "Sandhivata - Post Panchakarma Discharge",
      medicines: ["Guggulutiktakam Kashayam 15ml BD", "Dhanwantharam Tailam ext", "Ashwagandha Churnam 3g HS"],
      investigations: [],
      notes: "14-day admission. Virechana + Kashaya Vasti (7 days). Significant improvement in ROM and pain VAS. Advised to continue follow-up.",
    },
  },
  { id: "4", fileName: "xray_knee_apr2026.jpg", uploadedAt: "2026-07-15 09:38", type: "imaging", status: "processing", extractedData: undefined },
  { id: "5", fileName: "blurry_old_note.jpg", uploadedAt: "2026-07-15 09:40", type: "handwritten", status: "failed", extractedData: undefined },
];

const HmsRecordsAnalyser = () => {
  const [records] = useState<AnalysedRecord[]>(mockRecords);
  const [selectedRecord, setSelectedRecord] = useState<AnalysedRecord | null>(records[0]);

  const completed = records.filter((r) => r.status === "completed").length;
  const processing = records.filter((r) => r.status === "processing").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Scan className="h-6 w-6 text-orange-600" /> Medical Records Analyser
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload old prescriptions & reports · AI extracts structured data · Build complete patient history
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
          <Brain className="h-3 w-3 mr-1" /> AI-Powered OCR
        </Badge>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Drop medical records here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports: Photos of handwritten prescriptions, PDF reports, Lab reports, Discharge summaries, X-Ray/MRI images
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Button variant="outline" size="sm"><Image className="mr-1 h-3 w-3" /> Camera</Button>
              <Button variant="outline" size="sm"><File className="mr-1 h-3 w-3" /> Browse Files</Button>
              <Button variant="outline" size="sm"><Scan className="mr-1 h-3 w-3" /> Scan Document</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><FileText className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{records.length}</p><p className="text-xs text-muted-foreground">Uploaded</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{completed}</p><p className="text-xs text-muted-foreground">Analysed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{processing}</p><p className="text-xs text-muted-foreground">Processing</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Sparkles className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">94%</p><p className="text-xs text-muted-foreground">Accuracy</p></CardContent></Card>
      </div>

      {/* Records List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Records List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-base">Uploaded Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border cursor-pointer transition ${selectedRecord?.id === r.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => r.status === "completed" && setSelectedRecord(r)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.type === "handwritten" && <Image className="h-4 w-4 text-amber-600" />}
                      {r.type === "lab_report" && <Activity className="h-4 w-4 text-purple-600" />}
                      {r.type === "discharge" && <FileText className="h-4 w-4 text-blue-600" />}
                      {r.type === "imaging" && <Scan className="h-4 w-4 text-green-600" />}
                      <p className="text-xs font-medium truncate max-w-[140px]">{r.fileName}</p>
                    </div>
                    <Badge variant={r.status === "completed" ? "outline" : r.status === "processing" ? "secondary" : "destructive"} className={`text-[10px] ${r.status === "completed" ? "text-green-600" : ""}`}>
                      {r.status === "processing" && <Clock className="h-2 w-2 mr-1 animate-spin" />}
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{r.uploadedAt} · {r.type.replace("_", " ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data View */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600" /> Extracted Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRecord?.extractedData ? (
              <div className="text-center py-12 text-muted-foreground">
                <Scan className="h-10 w-10 mx-auto opacity-20" />
                <p className="text-sm mt-3">Select an analysed record to view extracted data</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                    <p className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{selectedRecord.extractedData.date}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase">Doctor</p>
                    <p className="text-sm font-medium">{selectedRecord.extractedData.doctor}</p>
                  </div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Facility</p>
                  <p className="text-sm">{selectedRecord.extractedData.facility}</p>
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200">
                  <p className="text-[10px] text-blue-600 uppercase font-medium">Diagnosis</p>
                  <p className="text-sm font-medium">{selectedRecord.extractedData.diagnosis}</p>
                </div>
                {selectedRecord.extractedData.medicines.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Medicines Extracted</p>
                    <div className="space-y-1">
                      {selectedRecord.extractedData.medicines.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-emerald-50 border border-emerald-100">
                          <Pill className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRecord.extractedData.investigations.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Investigations</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecord.extractedData.investigations.map((inv, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{inv}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Notes</p>
                  <p className="text-xs">{selectedRecord.extractedData.notes}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" onClick={() => toast.success("Added to patient timeline")}>Add to Timeline</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Editing extracted data...")}>Edit Data</Button>
                  <Button size="sm" variant="outline">Share via ABDM</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-700">
            <p className="font-medium">AI-Powered Recognition</p>
            <p className="text-orange-600 mt-0.5">Recognizes handwritten Ayurveda prescriptions in multiple scripts (Devanagari, Malayalam, Tamil). Identifies AYUSH medicine names, dosages, and frequencies from even poor quality images. Structures data into FHIR-compliant format for ABDM sharing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsRecordsAnalyser;
