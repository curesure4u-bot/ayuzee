import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Brain, CheckCircle, Clock, Syringe, Printer } from "lucide-react";

const recentProcedures = [
  { id: "PROC-401", date: "22 Jul 2026", patient: "Rajesh Kumar", procedure: "Kati Vasti", category: "Panchakarma", duration: "45 min", anesthesia: "None", findings: "Oil retained for 40 min. Mild erythema at site (normal). Patient tolerated well.", outcome: "Improvement in VAS pain from 7/10 to 4/10 post-procedure.", complications: "None", followup: "Next session in 2 days", consent: "Signed (digital)", status: "completed" },
  { id: "PROC-400", date: "21 Jul 2026", patient: "Meera Nair", procedure: "Agnikarma (Thermal cautery)", category: "Surgical", duration: "15 min", anesthesia: "Local (ice numbing)", findings: "Agnikarma applied at 3 trigger points on right knee (Samyak Dagdha Lakshana achieved — white blister formation).", outcome: "Immediate relief in joint stiffness. Patient walking without support.", complications: "None. Haridra paste applied.", followup: "Review in 7 days. No water contact for 24 hrs.", consent: "Signed (digital + video)", status: "completed" },
  { id: "PROC-399", date: "20 Jul 2026", patient: "Suresh Menon", procedure: "Raktamokshana (Leech therapy)", category: "Surgical", duration: "30 min", anesthesia: "None", findings: "2 leeches applied at medial knee joint. Blood let: ~15ml per leech. Leeches detached after satiation (25 min).", outcome: "Swelling reduced visibly. Warmth decreased at joint.", complications: "Mild oozing for 2 hours (normal). Pressure bandage applied.", followup: "Can repeat after 15 days if needed", consent: "Signed (digital)", status: "completed" },
  { id: "PROC-398", date: "19 Jul 2026", patient: "Priya Sharma", procedure: "Ksharasutra (Medicated thread)", category: "Surgical", duration: "20 min", anesthesia: "Local (Lidocaine 2%)", findings: "Ksharasutra applied to Grade 2 fistula-in-ano. Thread changed (3rd sitting). Track length reduced from 4cm to 2.5cm.", outcome: "Healing progressing. Discharge reduced. No bleeding.", complications: "Mild discomfort during insertion (expected).", followup: "Thread change after 7 days.", consent: "Signed (procedure-specific)", status: "completed" },
  { id: "PROC-397", date: "18 Jul 2026", patient: "Anand Patel", procedure: "Jalaukavacharana (Leech at varicose)", category: "Surgical", duration: "35 min", anesthesia: "None", findings: "3 leeches applied along varicose vein (great saphenous territory, left leg). Good suction achieved.", outcome: "Heaviness reduced. Skin color improved post-procedure.", complications: "Oozing from one site for 3 hours — extra bandage applied.", followup: "Review in 10 days. Elevation + compression stocking.", consent: "Signed (digital)", status: "completed" },
];

const procedureTemplates = [
  { name: "Kati Vasti", category: "Panchakarma", fields: ["Oil used", "Duration of retention", "Temperature maintained", "Area covered", "Skin reaction"] },
  { name: "Agnikarma", category: "Surgical", fields: ["Instrument (Shalaka type)", "Number of points", "Dagdha Lakshana", "Area treated", "Post-procedure application"] },
  { name: "Raktamokshana", category: "Surgical", fields: ["Method (Leech/Syringe/Shringa)", "Number of leeches", "Blood volume", "Detachment time", "Post-care"] },
  { name: "Ksharasutra", category: "Surgical", fields: ["Sitting number", "Track length (before/after)", "Thread type (Snuhi/Apamarga)", "Discharge status", "Healing assessment"] },
  { name: "Vamana (Emesis)", category: "Panchakarma", fields: ["Purvakarma days", "Vamana drug", "Vegas (rounds)", "Pittanta Lakshana", "Output volume"] },
  { name: "Virechana (Purgation)", category: "Panchakarma", fields: ["Snehapana days + dose", "Virechana drug", "Vegas count", "Samyak Lakshana", "Samsarjana Krama plan"] },
  { name: "Nasya", category: "Panchakarma", fields: ["Type (Shodhana/Shamana)", "Drug used", "Drops per nostril", "Patient position", "Post-nasya observation"] },
  { name: "Viddha Karma (Puncturing)", category: "Surgical", fields: ["Points treated", "Needle type/size", "Depth", "Response (bleeding/fluid)", "Post-procedure care"] },
];

export default function DoctorProcedureNotes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Syringe className="h-6 w-6 text-red-600" /> Procedure & Surgery Notes</h1>
          <p className="text-muted-foreground mt-1">Document AYUSH procedures — Agnikarma, Raktamokshana, Ksharasutra, Panchakarma. Medicolegal + insurance.</p>
        </div>
        <Button onClick={() => toast.success("New procedure note started")}>+ New Procedure</Button>
      </div>

      <Tabs defaultValue="recent">
        <TabsList><TabsTrigger value="recent" className="text-xs">Recent Procedures</TabsTrigger><TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger><TabsTrigger value="new" className="text-xs">New Note</TabsTrigger></TabsList>

        <TabsContent value="recent" className="space-y-3 mt-4">
          {recentProcedures.map((proc) => (
            <Card key={proc.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {proc.procedure}
                    <Badge variant="outline" className="text-[10px]">{proc.category}</Badge>
                    <Badge variant="outline" className="text-[10px] text-green-600">{proc.status}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{proc.date}</span>
                    <Button size="sm" variant="ghost" className="h-6"><Printer className="h-3 w-3" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{proc.patient} • {proc.id} • Duration: {proc.duration} • Anesthesia: {proc.anesthesia}</p>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <p><strong>Findings:</strong> {proc.findings}</p>
                <p><strong>Outcome:</strong> <span className="text-green-700">{proc.outcome}</span></p>
                <p><strong>Complications:</strong> {proc.complications}</p>
                <p><strong>Follow-up:</strong> {proc.followup}</p>
                <p><strong>Consent:</strong> <Badge variant="outline" className="text-[10px] text-green-600">{proc.consent}</Badge></p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">Pre-built templates for common AYUSH procedures — click to start a note</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {procedureTemplates.map((t, i) => (
              <Card key={i} className="hover:shadow-sm cursor-pointer transition-shadow" onClick={() => toast.success(`${t.name} template loaded`)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">{t.fields.map((f, j) => <Badge key={j} variant="outline" className="text-[9px] font-normal">{f}</Badge>)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Patient" /></SelectTrigger><SelectContent><SelectItem value="rajesh">Rajesh Kumar</SelectItem><SelectItem value="meera">Meera Nair</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Procedure" /></SelectTrigger><SelectContent>{procedureTemplates.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="Duration" className="h-9 text-xs" />
            <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Anesthesia" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="local">Local</SelectItem><SelectItem value="sedation">Sedation</SelectItem></SelectContent></Select>
          </div>
          <Textarea placeholder="Procedure findings and observations..." className="min-h-[100px] text-xs" />
          <Textarea placeholder="Outcome / immediate result..." className="min-h-[60px] text-xs" />
          <Textarea placeholder="Complications (if any)..." className="min-h-[40px] text-xs" />
          <Input placeholder="Follow-up plan..." className="h-9 text-xs" />
          <Button onClick={() => toast.success("Procedure note saved")}>Save Procedure Note</Button>
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Procedure Intelligence</p><p className="text-sm text-purple-700">Auto-suggests post-procedure care based on procedure type. Agnikarma → Haridra paste + no water 24hrs. Raktamokshana → pressure bandage + elevation. Tracks healing across sittings (Ksharasutra: 4cm → 2.5cm in 3 sittings = excellent progress). Links to insurance: Procedure codes auto-mapped for TPA claims. Medicolegal: Timestamped, non-editable once saved.</p></div></CardContent></Card>
    </div>
  );
}
