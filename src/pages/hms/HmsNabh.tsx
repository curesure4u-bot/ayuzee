import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, CheckCircle, AlertTriangle, FileText, Activity, TrendingUp } from "lucide-react";

const HmsNabh = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" /> NABH & Quality Compliance
          </h1>
          <p className="text-sm text-muted-foreground">Quality indicators, NABH/NABL checklists, clinical audit, infection control & incident reporting</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-300">NABH Entry Level Ready</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">82%</p><p className="text-xs text-muted-foreground">Overall Compliance</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">145/178</p><p className="text-xs text-muted-foreground">Standards Met</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">28</p><p className="text-xs text-muted-foreground">Action Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">2</p><p className="text-xs text-muted-foreground">Incidents (Month)</p></CardContent></Card>
      </div>

      <Tabs defaultValue="checklist">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="checklist">NABH Checklist</TabsTrigger>
          <TabsTrigger value="indicators">Quality Indicators</TabsTrigger>
          <TabsTrigger value="infection">Infection Control</TabsTrigger>
          <TabsTrigger value="incidents">Incident Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          {[
            { chapter: "Access, Assessment & Continuity of Care (AAC)", total: 25, met: 22, items: ["Patient assessment within 30 min of admission", "Documented initial nursing assessment", "Care plan within 24 hours", "Discharge planning documented", "Follow-up communication within 48 hrs"] },
            { chapter: "Care of Patients (COP)", total: 30, met: 25, items: ["Medication reconciliation done", "Informed consent obtained", "Pain assessment documented", "Restraint use policy followed", "High-risk patient identified"] },
            { chapter: "Management of Medication (MOM)", total: 20, met: 18, items: ["Drug storage as per guidelines", "High-alert medicines labelled", "Adverse drug reaction reported", "Prescription legibility maintained", "Look-alike sound-alike separated"] },
            { chapter: "Patient Rights & Education (PRE)", total: 15, met: 12, items: ["Patient rights displayed", "Complaint mechanism available", "Privacy maintained", "Education on medications given", "Consent for procedures"] },
            { chapter: "Hospital Infection Control (HIC)", total: 22, met: 19, items: ["Hand hygiene compliance > 80%", "Biomedical waste segregation", "Sterilization records maintained", "Surgical site infection rate < 2%", "Antibiotic policy followed"] },
            { chapter: "Facility Management & Safety (FMS)", total: 18, met: 15, items: ["Fire safety drill conducted", "Equipment maintenance log", "Disaster plan tested", "CCTV operational", "Emergency exits marked"] },
          ].map((ch) => (
            <Card key={ch.chapter}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{ch.chapter}</CardTitle>
                  <Badge variant={ch.met === ch.total ? "outline" : "secondary"} className={`text-xs ${ch.met === ch.total ? "text-green-600" : ""}`}>{ch.met}/{ch.total}</Badge>
                </div>
                <Progress value={(ch.met / ch.total) * 100} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {ch.items.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs p-1 rounded hover:bg-muted/30 cursor-pointer">
                      <Checkbox defaultChecked={i < ch.met - (ch.total - ch.items.length)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Clinical Quality Indicators</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { indicator: "Hand Hygiene Compliance Rate", value: "85%", target: ">80%", status: "met" },
                  { indicator: "Patient Falls Rate (per 1000 patient days)", value: "0.5", target: "<1.0", status: "met" },
                  { indicator: "Medication Error Rate", value: "0.2%", target: "<0.5%", status: "met" },
                  { indicator: "Surgical Site Infection Rate", value: "1.2%", target: "<2%", status: "met" },
                  { indicator: "Average Length of Stay (Panchakarma)", value: "12 days", target: "7-14 days", status: "met" },
                  { indicator: "Re-admission Rate (30 days)", value: "4.5%", target: "<5%", status: "met" },
                  { indicator: "Patient Satisfaction Score", value: "4.6/5", target: ">4.0", status: "met" },
                  { indicator: "Panchakarma Outcome Improvement Rate", value: "78%", target: ">70%", status: "met" },
                  { indicator: "Consent Documentation Compliance", value: "92%", target: "100%", status: "not_met" },
                  { indicator: "Adverse Event Reporting Rate", value: "85%", target: "100%", status: "not_met" },
                ].map((qi) => (
                  <div key={qi.indicator} className="flex items-center justify-between p-2 rounded border">
                    <div><p className="text-sm">{qi.indicator}</p><p className="text-xs text-muted-foreground">Target: {qi.target}</p></div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{qi.value}</p>
                      {qi.status === "met" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infection" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Infection Control Dashboard</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Biomedical Waste Management</p>
                  {["Yellow bag (Infectious)", "Red bag (Contaminated)", "Blue box (Sharps)", "Black bag (General)"].map(w => (
                    <div key={w} className="flex items-center justify-between p-2 rounded border text-xs">
                      <span>{w}</span><Badge variant="outline" className="text-[9px] text-green-600">Compliant</Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Monthly Surveillance</p>
                  {[{ metric: "HAI Rate", value: "0.8%", ok: true }, { metric: "CAUTI Rate", value: "0", ok: true }, { metric: "CLABSI Rate", value: "0", ok: true }, { metric: "SSI Rate", value: "1.2%", ok: true }].map(m => (
                    <div key={m.metric} className="flex items-center justify-between p-2 rounded border text-xs">
                      <span>{m.metric}</span><span className="font-medium text-green-600">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Incident Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: "2026-07-08", type: "Medication", desc: "Wrong dose dispensed (caught before administration)", severity: "Near Miss", action: "Pharmacy double-check protocol reinforced" },
                  { date: "2026-07-02", type: "Patient Fall", desc: "Patient slipped in bathroom (no injury)", severity: "Minor", action: "Anti-slip mat installed, handrails added" },
                ].map((inc, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={inc.severity === "Near Miss" ? "secondary" : "outline"} className="text-[10px]">{inc.type}</Badge>
                        <span className="text-xs text-muted-foreground">{inc.date}</span>
                      </div>
                      <Badge variant={inc.severity === "Near Miss" ? "secondary" : "default"} className="text-[10px]">{inc.severity}</Badge>
                    </div>
                    <p className="text-xs">{inc.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1"><strong>Action:</strong> {inc.action}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={() => toast.info("Opening incident form...")}>Report New Incident</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsNabh;
