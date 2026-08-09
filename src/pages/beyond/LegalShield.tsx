import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Scale,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════
// CONSENT FORM TEMPLATES
// ════════════════════════════════════════════════════════════

const CONSENT_TEMPLATES = [
  { id: "general", name: "General Procedure Consent", content: `INFORMED CONSENT FORM\n\nI, _________________ (Patient Name), aged ___ years,\nS/o / D/o / W/o _________________, residing at _________________\n\nI hereby give my voluntary consent for the following procedure/treatment:\nProcedure: _________________\nDoctor: Dr. _________________\n\nI have been explained:\n☐ The nature and purpose of the procedure\n☐ Expected benefits and outcomes\n☐ Possible risks and complications\n☐ Alternative treatment options available\n☐ Consequences of not undergoing the procedure\n\nI have had the opportunity to ask questions and all my questions have been answered satisfactorily.\n\nI understand that no guarantee has been given regarding the outcome.\n\nPatient Signature: _____________ Date: _________\nWitness Signature: _____________ Date: _________\nDoctor Signature: ______________ Date: _________` },
  { id: "panchakarma", name: "Panchakarma Therapy Consent", content: `PANCHAKARMA THERAPY CONSENT\n\nPatient: _________________ Age: ___ Gender: ___\n\nTherapy Planned: ☐ Vamana ☐ Virechana ☐ Basti ☐ Nasya ☐ Raktamokshana\nDuration: ___ days\n\nI understand that:\n☐ Pre-treatment preparation (Snehana/Swedana) is necessary\n☐ Dietary restrictions must be followed strictly\n☐ Temporary discomfort, weakness, or detox symptoms may occur\n☐ I must remain under observation during the treatment period\n☐ I will inform the doctor about all medications I am currently taking\n☐ I have disclosed my complete medical history including allergies\n\nContraindications checked:\n☐ Not pregnant ☐ No active infections ☐ No cardiac issues ☐ BP stable\n\nPatient Signature: _____________ Date: _________\nDoctor Signature: ______________ Date: _________` },
  { id: "minor", name: "Minor Procedure / OPD Consent", content: `OPD PROCEDURE CONSENT\n\nPatient: _________________ Age: ___\nProcedure: _________________\n\nI consent to the above minor procedure.\nI understand there may be minimal discomfort, local bruising, or minor bleeding.\nI have been advised about post-procedure care.\n\nPatient Signature: _____________ Date: _________` },
  { id: "teleconsult", name: "Teleconsultation Consent", content: `TELECONSULTATION CONSENT\n\nPatient: _________________ Contact: _________________\n\nI understand that:\n☐ This consultation is conducted remotely via video/audio/chat\n☐ Physical examination is not possible in teleconsultation\n☐ The doctor may advise in-person visit if needed\n☐ Prescription will be sent digitally\n☐ I consent to my health information being stored securely\n☐ In emergency, I will visit the nearest hospital\n\nPatient Signature/Verbal Consent: _____________ Date: _________` },
];

function ConsentTemplates() {
  const [search, setSearch] = useState("");
  const filtered = CONSENT_TEMPLATES.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Consent Form Templates</CardTitle>
        <CardDescription className="text-xs">Ready-to-use consent forms. Copy, customize, print.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {filtered.map((tmpl) => (
          <div key={tmpl.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{tmpl.name}</p>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { navigator.clipboard.writeText(tmpl.content); toast.success(`${tmpl.name} copied!`); }}>
                <ClipboardCopy className="h-3 w-3" /> Copy
              </Button>
            </div>
            <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap max-h-[150px] overflow-y-auto bg-muted/40 p-2 rounded">{tmpl.content}</pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// COMPLIANCE CHECKLISTS
// ════════════════════════════════════════════════════════════

const CHECKLISTS = [
  { name: "Documentation Best Practices", items: [
    "Record date, time, and duration of every patient interaction",
    "Write legibly or use electronic records",
    "Document patient consent BEFORE any procedure",
    "Note all advice given, even if patient refuses",
    "Record follow-up instructions clearly",
    "Keep copies of referral letters sent and received",
    "Document telephone/WhatsApp medical advice given",
    "If it isn't written, it didn't happen (legally)",
  ]},
  { name: "NABH Clinic Standards (Key Points)", items: [
    "Display registration certificate and doctor qualifications",
    "Maintain patient rights charter visibly",
    "Infection control: hand hygiene station at entry",
    "Biomedical waste segregation (4 color bins)",
    "Fire safety: extinguisher accessible and serviced",
    "Emergency drug tray: Adrenaline, Hydrocortisone, Atropine",
    "Patient feedback mechanism in place",
    "Staff training records maintained",
  ]},
  { name: "PCPNDT Act Compliance (Ultrasound)", items: [
    "Form F filled for every ultrasound",
    "No disclosure of sex of foetus — verbal or written",
    "Display board: 'Sex determination is illegal'",
    "Maintain register of all referrals",
    "Report machine downtime",
    "Annual renewal of registration",
    "Only registered practitioners operate equipment",
  ]},
  { name: "Telemedicine Guidelines (MCI/NMC)", items: [
    "Patient identity verified before consultation",
    "Written or recorded verbal consent obtained",
    "Prescription follows eSanjeevani/NMC format",
    "No Schedule X drugs prescribed via teleconsult",
    "First-time patients: only OTC or Schedule H drugs",
    "Follow-up patients: regular prescription allowed",
    "Emergency: advise immediate hospital visit",
    "Records retained for minimum 3 years",
  ]},
];

function ComplianceChecklists() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Compliance Checklists</CardTitle>
        <CardDescription className="text-xs">Essential legal and regulatory checklists for practicing doctors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {CHECKLISTS.map((checklist) => (
          <div key={checklist.name} className="rounded-lg border p-3">
            <p className="text-sm font-medium mb-2">{checklist.name}</p>
            <div className="space-y-1">
              {checklist.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// KNOW YOUR RIGHTS
// ════════════════════════════════════════════════════════════

function KnowYourRights() {
  const rights = [
    { title: "Right to Refuse Treatment", desc: "A doctor can refuse to treat a patient (non-emergency) if the patient is abusive, non-compliant, or if the case is outside your expertise. Document the refusal and suggest alternatives." },
    { title: "Protection Under IPC 52", desc: "A doctor acting in good faith with reasonable care is protected. Medical negligence requires proof of duty, breach, causation, and damage — all four must be proven." },
    { title: "Consumer Protection Act 2019", desc: "Medical services are covered under CPA. Patients can file complaints in consumer courts. Defence: proper consent, standard protocols followed, documented care." },
    { title: "Right to Fair Fees", desc: "No law mandates free treatment (except emergency stabilization). You can set your own consultation fees. Display fee structure clearly." },
    { title: "Violence Against Doctors", desc: "Many states have specific acts protecting doctors from violence. File FIR immediately. Hospital should have security protocol. Document injuries with photos." },
    { title: "Second Opinion is Not Defamation", desc: "A doctor giving a genuine second opinion — even if it contradicts the first — is not liable for defamation. Clinical disagreement is legitimate." },
    { title: "Prescription Liability", desc: "You are liable for what you prescribe. Always check allergies, interactions, contraindications. Document that you checked. Rational prescribing protects you." },
    { title: "Medical Records Ownership", desc: "Records belong to the doctor/hospital. Patient has RIGHT TO ACCESS copies. You must provide within 72 hours of written request. Cannot be refused." },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-amber-500" /> Know Your Rights</CardTitle>
        <CardDescription className="text-xs">Legal rights every practicing doctor should know.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rights.map((right) => (
          <div key={right.title} className="rounded-lg border p-3">
            <p className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {right.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{right.desc}</p>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          This is general legal awareness, not legal advice. Consult a medico-legal expert for specific situations.
        </p>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════

const LegalShield = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <Shield className="h-7 w-7 text-rose-500" />
          Doctor's Legal Shield
        </h1>
        <p className="text-muted-foreground">Know your rights. Protect your practice. Stay compliant.</p>
      </div>

      <Tabs defaultValue="consent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consent" className="text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Consent Forms</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Checklists</TabsTrigger>
          <TabsTrigger value="rights" className="text-xs gap-1"><Scale className="h-3.5 w-3.5" /> Your Rights</TabsTrigger>
        </TabsList>
        <TabsContent value="consent"><ConsentTemplates /></TabsContent>
        <TabsContent value="compliance"><ComplianceChecklists /></TabsContent>
        <TabsContent value="rights"><KnowYourRights /></TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalShield;
