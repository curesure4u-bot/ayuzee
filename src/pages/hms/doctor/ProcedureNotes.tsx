import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, Upload, ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const procedureTemplates = [
  { id: "ksharasutra", name: "Ksharasutra Application", category: "Para-Surgical" },
  { id: "agnikarma", name: "Agnikarma (Thermal Cautery)", category: "Para-Surgical" },
  { id: "jalaukavacharana", name: "Jalaukavacharana (Leech Therapy)", category: "Para-Surgical" },
  { id: "basti", name: "Basti (Therapeutic Enema)", category: "Panchakarma" },
  { id: "kati-basti", name: "Kati Basti", category: "Panchakarma" },
  { id: "nasya", name: "Nasya (Nasal Medication)", category: "Panchakarma" },
  { id: "vamana", name: "Vamana (Therapeutic Emesis)", category: "Panchakarma" },
];

const mockProcedureNote = {
  procedure: "Kati Basti",
  patient: "Rajesh Kumar (UHID-2024-00342)",
  date: "2024-01-15",
  preOp: "Patient counselled. Consent obtained. Vitals stable (BP: 120/80, Pulse: 72/min). NBM not required. Area cleaned with lukewarm water. Dough ring prepared with black gram flour.",
  intraProcedure: "Patient positioned prone. Dough ring placed at L4-L5 level. Warm Dhanwantaram Taila (38-40°C) poured within ring. Oil maintained at therapeutic temperature for 30 minutes. Oil replaced every 10 min to maintain warmth. Patient comfortable throughout.",
  postProcedure: "Dough ring removed. Area wiped clean. Light Abhyanga performed on lumbosacral region. Patient advised to rest 15 min. Post-procedure vitals stable. Patient advised to avoid heavy lifting for 24 hours.",
  findings: "Tenderness reduced post-procedure. Patient reports 40% immediate pain relief. Warmth retained at L4-L5 for 2+ hours post-procedure. No adverse reaction observed.",
  complications: "None",
  outcome: "Successful. Session 3 of 7 completed. Cumulative improvement: 60% pain reduction since Day 1.",
};

export default function ProcedureNotes() {
  const [selectedProcedure, setSelectedProcedure] = useState("kati-basti");
  const [preOp, setPreOp] = useState(mockProcedureNote.preOp);
  const [intraProcedure, setIntraProcedure] = useState(mockProcedureNote.intraProcedure);
  const [postProcedure, setPostProcedure] = useState(mockProcedureNote.postProcedure);
  const [findings, setFindings] = useState(mockProcedureNote.findings);
  const [complications, setComplications] = useState(mockProcedureNote.complications);
  const [outcome, setOutcome] = useState(mockProcedureNote.outcome);

  const handleSave = () => toast.success("Procedure note saved to patient record.");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procedure & OT Notes</h1>
          <p className="text-muted-foreground">Document AYUSH procedures with structured templates</p>
        </div>
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Save Note</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <label className="text-xs font-medium">Procedure Type</label>
            <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {procedureTemplates.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.category})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <label className="text-xs font-medium">Patient</label>
            <p className="text-sm font-medium mt-1">{mockProcedureNote.patient}</p>
            <p className="text-xs text-muted-foreground">Date: {mockProcedureNote.date}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <label className="text-xs font-medium">Consent Status</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Consent Obtained</Badge>
              <Button size="sm" variant="outline">View Consent</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pre-op">
        <TabsList>
          <TabsTrigger value="pre-op">Pre-Procedure</TabsTrigger>
          <TabsTrigger value="intra">Intra-Procedure</TabsTrigger>
          <TabsTrigger value="post">Post-Procedure</TabsTrigger>
          <TabsTrigger value="findings">Findings & Outcome</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-op">
          <Card>
            <CardHeader><CardTitle className="text-base">Pre-Procedure Documentation</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={preOp} onChange={(e) => setPreOp(e.target.value)} rows={6} placeholder="Document pre-procedure preparation, consent, vitals..." />
              <p className="text-xs text-muted-foreground mt-2">Include: Patient consent, vitals, preparation steps, contraindications checked</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intra">
          <Card>
            <CardHeader><CardTitle className="text-base">Intra-Procedure Documentation</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={intraProcedure} onChange={(e) => setIntraProcedure(e.target.value)} rows={6} placeholder="Step-by-step procedure documentation..." />
              <p className="text-xs text-muted-foreground mt-2">Include: Position, materials used, technique, duration, patient response</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post">
          <Card>
            <CardHeader><CardTitle className="text-base">Post-Procedure Documentation</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={postProcedure} onChange={(e) => setPostProcedure(e.target.value)} rows={6} placeholder="Post-procedure care and instructions..." />
              <p className="text-xs text-muted-foreground mt-2">Include: Immediate care, instructions given, follow-up plan</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Findings</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={4} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Complications</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={complications} onChange={(e) => setComplications(e.target.value)} rows={4} placeholder="None / Describe any complications..." />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" />Outcome</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={3} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base">Attach Clinical Photos</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop procedure photos or click to upload</p>
            <Button variant="outline" size="sm" className="mt-3">Browse Files</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
