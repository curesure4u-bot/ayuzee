import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Shield, Search, CheckCircle, XCircle, Link2, FileText,
  Send, Download, Clock, Users, Lock, Unlock, AlertCircle,
  RefreshCw,
} from "lucide-react";

type PatientAbha = {
  id: string;
  name: string;
  abhaNumber: string;
  abhaAddress: string;
  gender: string;
  dob: string;
  verified: boolean;
  linkedRecords: number;
};

type ConsentRequest = {
  id: string;
  patientName: string;
  abhaId: string;
  purpose: string;
  hiTypes: string[];
  dateRange: string;
  status: "requested" | "granted" | "denied" | "expired" | "revoked";
  requestedAt: string;
};

type HealthRecord = {
  id: string;
  type: string;
  facility: string;
  date: string;
  description: string;
  status: "available" | "fetched" | "pending";
};

const mockPatients: PatientAbha[] = [
  { id: "1", name: "Ramesh Kumar", abhaNumber: "91-1234-5678-9012", abhaAddress: "ramesh@abdm", gender: "Male", dob: "1975-03-15", verified: true, linkedRecords: 8 },
  { id: "2", name: "Lakshmi Devi", abhaNumber: "91-2345-6789-0123", abhaAddress: "lakshmi.d@abdm", gender: "Female", dob: "1982-07-22", verified: true, linkedRecords: 5 },
  { id: "3", name: "Sunil Menon", abhaNumber: "91-3456-7890-1234", abhaAddress: "sunil.m@abdm", gender: "Male", dob: "1968-11-08", verified: false, linkedRecords: 0 },
];

const mockConsents: ConsentRequest[] = [
  { id: "1", patientName: "Ramesh Kumar", abhaId: "91-1234-5678-9012", purpose: "Care Management", hiTypes: ["Prescription", "Diagnostic Report", "Discharge Summary"], dateRange: "Jan 2024 - Jul 2026", status: "granted", requestedAt: "2026-07-10" },
  { id: "2", patientName: "Lakshmi Devi", abhaId: "91-2345-6789-0123", purpose: "Care Management", hiTypes: ["Prescription", "OP Consultation"], dateRange: "Apr 2026 - Jul 2026", status: "granted", requestedAt: "2026-07-12" },
  { id: "3", patientName: "Sunil Menon", abhaId: "91-3456-7890-1234", purpose: "Care Management", hiTypes: ["All Records"], dateRange: "Jan 2020 - Present", status: "requested", requestedAt: "2026-07-15" },
  { id: "4", patientName: "Meera Nair", abhaId: "91-4567-8901-2345", purpose: "Investigation", hiTypes: ["Diagnostic Report"], dateRange: "Jun 2026 - Jul 2026", status: "denied", requestedAt: "2026-07-08" },
];

const mockRecords: HealthRecord[] = [
  { id: "1", type: "Prescription", facility: "Apollo Hospital, Chennai", date: "2026-05-10", description: "Orthopedic consultation - OA Knee", status: "fetched" },
  { id: "2", type: "Diagnostic Report", facility: "SRL Diagnostics", date: "2026-06-15", description: "CBC, ESR, CRP, RA Factor, Uric Acid", status: "fetched" },
  { id: "3", type: "Discharge Summary", facility: "Kottakkal AVS Hospital", date: "2025-12-20", description: "14-day Panchakarma admission for Sandhivata", status: "fetched" },
  { id: "4", type: "Prescription", facility: "PHC Trivandrum", date: "2026-03-01", description: "Ayurveda OPD - Gridhrasi treatment", status: "available" },
  { id: "5", type: "Imaging", facility: "Sunrise Imaging Center", date: "2026-04-20", description: "X-Ray Knee AP/Lateral Bilateral", status: "pending" },
];

const HmsAbdm = () => {
  const [searchAbha, setSearchAbha] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" /> ABDM Connect
          </h1>
          <p className="text-sm text-muted-foreground">
            Ayushman Bharat Digital Mission · ABHA Verification · Consent-based Health Records
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-300">NHA Approved</Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">FHIR Compliant</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">156</p><p className="text-xs text-muted-foreground">ABHA Linked</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Lock className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">89</p><p className="text-xs text-muted-foreground">Active Consents</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><FileText className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">342</p><p className="text-xs text-muted-foreground">Records Fetched</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Send className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">215</p><p className="text-xs text-muted-foreground">Records Shared</p></CardContent></Card>
      </div>

      {/* ABHA Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by ABHA Number (XX-XXXX-XXXX-XXXX) or ABHA Address (@abdm)" value={searchAbha} onChange={(e) => setSearchAbha(e.target.value)} />
            </div>
            <Button onClick={() => setVerifyOpen(true)}>
              <Shield className="mr-1 h-4 w-4" /> Verify ABHA
            </Button>
            <Button variant="outline" onClick={() => toast.info("Creating new ABHA for patient...")}>
              Create ABHA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="patients">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="patients">Linked Patients</TabsTrigger>
          <TabsTrigger value="consents">Consent Management</TabsTrigger>
          <TabsTrigger value="records">Health Records</TabsTrigger>
          <TabsTrigger value="push">Push Records</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">ABHA-Linked Patients</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPatients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full grid place-items-center ${p.verified ? "bg-green-100" : "bg-amber-100"}`}>
                        {p.verified ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.abhaNumber}</p>
                        <p className="text-xs text-muted-foreground">{p.abhaAddress} · {p.gender} · DOB: {p.dob}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={p.verified ? "outline" : "secondary"} className={`text-xs ${p.verified ? "text-green-600" : ""}`}>
                        {p.verified ? "Verified" : "Pending"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{p.linkedRecords} records</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Consent Requests</CardTitle>
                <Button size="sm" onClick={() => setConsentOpen(true)}>Request Consent</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConsents.map((c) => (
                  <div key={c.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{c.patientName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.abhaId}</p>
                      </div>
                      <Badge variant={
                        c.status === "granted" ? "outline" :
                        c.status === "denied" || c.status === "revoked" ? "destructive" :
                        c.status === "expired" ? "secondary" : "default"
                      } className={`text-xs capitalize ${c.status === "granted" ? "text-green-600" : ""}`}>
                        {c.status === "granted" && <Unlock className="h-3 w-3 mr-1" />}
                        {c.status === "denied" && <XCircle className="h-3 w-3 mr-1" />}
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {c.hiTypes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Purpose: {c.purpose} · Period: {c.dateRange} · Requested: {c.requestedAt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Fetched Health Records (via Consent)</CardTitle>
                <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-3 w-3" /> Fetch New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 grid place-items-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.description}</p>
                        <p className="text-xs text-muted-foreground">{r.facility} · {r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.type}</Badge>
                      {r.status === "fetched" && (
                        <Button size="sm" variant="ghost"><Download className="h-3 w-3" /></Button>
                      )}
                      {r.status === "available" && (
                        <Button size="sm" variant="outline" className="text-xs">Fetch</Button>
                      )}
                      {r.status === "pending" && (
                        <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Push Records to ABDM</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share patient health records from your facility to the ABDM network. Records will be available to the patient and other facilities with consent.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: "OP Consultation", desc: "Push today's consultation notes and prescriptions", count: 12 },
                  { type: "Discharge Summary", desc: "Push Panchakarma/IP discharge summaries", count: 3 },
                  { type: "Diagnostic Report", desc: "Push lab results and imaging reports", count: 8 },
                  { type: "Prescription", desc: "Push AYUSH prescriptions with medicine details", count: 25 },
                ].map((item) => (
                  <Card key={item.type} className="border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{item.type}</p>
                        <Badge variant="outline" className="text-xs">{item.count} pending</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                      <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => toast.success(`${item.type} records pushed to ABDM`)}>
                        <Send className="mr-1 h-3 w-3" /> Push to ABDM
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verify ABHA Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verify Patient ABHA</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>ABHA Number or Address</Label>
              <Input placeholder="XX-XXXX-XXXX-XXXX or username@abdm" />
            </div>
            <div>
              <Label>Verification Method</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar_otp">Aadhaar OTP</SelectItem>
                  <SelectItem value="mobile_otp">Mobile OTP</SelectItem>
                  <SelectItem value="demographics">Demographics</SelectItem>
                  <SelectItem value="qr_scan">QR Code Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                <Shield className="inline h-3 w-3 mr-1" />
                Patient identity will be verified through NHA's ABDM gateway. OTP will be sent to patient's registered mobile.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("OTP sent to patient's mobile"); setVerifyOpen(false); }}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Consent Dialog */}
      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Health Record Consent</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient ABHA</Label><Input placeholder="ABHA Number or Address" /></div>
            <div>
              <Label>Purpose of Request</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="care">Care Management</SelectItem>
                  <SelectItem value="investigation">Investigation/Diagnosis</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="insurance">Insurance Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Health Information Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Prescription", "Diagnostic Report", "OP Consultation", "Discharge Summary", "Immunization Record", "Wellness Record"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Date</Label><Input type="date" /></div>
              <div><Label>To Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            </div>
            <div>
              <Label>Consent Expiry</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsentOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Consent request sent to patient"); setConsentOpen(false); }}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compliance Footer */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">ABDM Compliant · FHIR R4 · HIPAA Aligned</p>
            <p className="text-blue-600 mt-0.5">All data exchange follows NHA guidelines. Patient consent is mandatory for record access. Data encrypted in transit and at rest.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsAbdm;
