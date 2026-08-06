import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Shield, Search, Upload, CheckCircle2, Clock, Link2,
  FileText, Users, RefreshCw, AlertTriangle, Globe,
  Smartphone, Key, Database, Share2, Eye,
} from "lucide-react";

interface ABHALinkedPatient {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  abhaAddress: string;
  phone: string;
  linkedAt: string;
  consentStatus: "Active" | "Expired" | "Revoked" | "Pending";
  recordsPushed: number;
  lastPushedAt?: string;
}

interface HealthRecord {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  recordType: "DiagnosticReport" | "ImagingStudy" | "Observation";
  testName: string;
  orderNo: string;
  reportDate: string;
  fhirBundle?: string;
  pushStatus: "Pushed" | "Pending" | "Failed" | "Not Linked";
  pushedAt?: string;
  hipId: string;
  careContextId?: string;
  errorMessage?: string;
}

interface ConsentRequest {
  id: string;
  patientName: string;
  abhaNumber: string;
  requestedBy: string;
  purpose: "Care Management" | "Investigation" | "Self Requested";
  hiTypes: string[];
  dateFrom: string;
  dateTo: string;
  status: "Granted" | "Denied" | "Expired" | "Requested";
  grantedAt?: string;
  expiresAt?: string;
}

const mockLinkedPatients: ABHALinkedPatient[] = [
  { id: "1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", abhaNumber: "91-1234-5678-9012", abhaAddress: "rajesh.kumar@abdm", phone: "+91 98765 43210", linkedAt: "2026-05-15", consentStatus: "Active", recordsPushed: 5, lastPushedAt: "2026-07-24" },
  { id: "2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", abhaNumber: "91-2345-6789-0123", abhaAddress: "lakshmi.devi@abdm", phone: "+91 87654 32109", linkedAt: "2026-06-20", consentStatus: "Active", recordsPushed: 3, lastPushedAt: "2026-07-24" },
  { id: "3", patientId: "AL-15320", patientName: "Mr. Suresh Babu", abhaNumber: "91-3456-7890-1234", abhaAddress: "suresh.b@abdm", phone: "+91 76543 21098", linkedAt: "2026-07-01", consentStatus: "Pending", recordsPushed: 0 },
  { id: "4", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", abhaNumber: "91-4567-8901-2345", abhaAddress: "priya.sharma@abdm", phone: "+91 65432 10987", linkedAt: "2026-04-10", consentStatus: "Expired", recordsPushed: 8, lastPushedAt: "2026-06-30" },
  { id: "5", patientId: "AL-16050", patientName: "Mrs. Saraswathi", abhaNumber: "", abhaAddress: "", phone: "+91 54321 09876", linkedAt: "", consentStatus: "Pending", recordsPushed: 0 },
];

const mockHealthRecords: HealthRecord[] = [
  { id: "h1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", abhaNumber: "91-1234-5678-9012", recordType: "DiagnosticReport", testName: "Renal Function Test", orderNo: "ORD-2026-0047", reportDate: "2026-07-24", pushStatus: "Pushed", pushedAt: "2026-07-24 02:30 PM", hipId: "AYUZEE-LAB-KDY", careContextId: "CC-2026-0047" },
  { id: "h2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", abhaNumber: "91-2345-6789-0123", recordType: "DiagnosticReport", testName: "CBC + Iron Studies", orderNo: "ORD-2026-0048", reportDate: "2026-07-24", pushStatus: "Pending", hipId: "AYUZEE-LAB-KDY" },
  { id: "h3", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", abhaNumber: "91-1234-5678-9012", recordType: "ImagingStudy", testName: "Chest X-Ray", orderNo: "RAD-2026-0112", reportDate: "2026-07-24", pushStatus: "Pushed", pushedAt: "2026-07-24 03:00 PM", hipId: "AYUZEE-LAB-KDY", careContextId: "CC-RAD-0112" },
  { id: "h4", patientId: "AL-15320", patientName: "Mr. Suresh Babu", abhaNumber: "91-3456-7890-1234", recordType: "DiagnosticReport", testName: "Lipid Profile", orderNo: "ORD-2026-0049", reportDate: "2026-07-24", pushStatus: "Failed", hipId: "AYUZEE-LAB-KDY", errorMessage: "Consent not active - patient has not approved data sharing" },
  { id: "h5", patientId: "AL-16050", patientName: "Mrs. Saraswathi", abhaNumber: "", recordType: "DiagnosticReport", testName: "X-Ray Knee", orderNo: "RAD-2026-0115", reportDate: "2026-07-24", pushStatus: "Not Linked", hipId: "AYUZEE-LAB-KDY" },
  { id: "h6", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", abhaNumber: "91-4567-8901-2345", recordType: "DiagnosticReport", testName: "Thyroid Profile", orderNo: "ORD-2026-0045", reportDate: "2026-07-24", pushStatus: "Pushed", pushedAt: "2026-07-24 10:30 AM", hipId: "AYUZEE-LAB-KDY", careContextId: "CC-2026-0045" },
];

const mockConsents: ConsentRequest[] = [
  { id: "c1", patientName: "Mr. Rajesh Kumar", abhaNumber: "91-1234-5678-9012", requestedBy: "Dr. Mohamad Saleem", purpose: "Care Management", hiTypes: ["DiagnosticReport", "ImagingStudy"], dateFrom: "2026-01-01", dateTo: "2027-01-01", status: "Granted", grantedAt: "2026-05-15", expiresAt: "2027-01-01" },
  { id: "c2", patientName: "Mrs. Lakshmi Devi", abhaNumber: "91-2345-6789-0123", requestedBy: "Dr. Anitha Kumari", purpose: "Care Management", hiTypes: ["DiagnosticReport"], dateFrom: "2026-06-01", dateTo: "2026-12-31", status: "Granted", grantedAt: "2026-06-20", expiresAt: "2026-12-31" },
  { id: "c3", patientName: "Mr. Suresh Babu", abhaNumber: "91-3456-7890-1234", requestedBy: "System", purpose: "Self Requested", hiTypes: ["DiagnosticReport", "ImagingStudy", "Observation"], dateFrom: "2026-07-01", dateTo: "2027-07-01", status: "Requested", grantedAt: undefined, expiresAt: undefined },
  { id: "c4", patientName: "Mrs. Priya Sharma", abhaNumber: "91-4567-8901-2345", requestedBy: "Dr. Mohamad Saleem", purpose: "Investigation", hiTypes: ["DiagnosticReport"], dateFrom: "2026-01-01", dateTo: "2026-06-30", status: "Expired", grantedAt: "2026-04-10", expiresAt: "2026-06-30" },
];

const ABDMLabIntegration = () => {
  const [linkedPatients] = useState<ABHALinkedPatient[]>(mockLinkedPatients);
  const [healthRecords] = useState<HealthRecord[]>(mockHealthRecords);
  const [consents] = useState<ConsentRequest[]>(mockConsents);
  const [activeTab, setActiveTab] = useState("records");
  const [search, setSearch] = useState("");

  const totalLinked = linkedPatients.filter(p => p.abhaNumber).length;
  const totalPushed = healthRecords.filter(r => r.pushStatus === "Pushed").length;
  const pendingPush = healthRecords.filter(r => r.pushStatus === "Pending").length;
  const failedPush = healthRecords.filter(r => r.pushStatus === "Failed").length;

  const getConsentColor = (status: string) => {
    switch (status) { case "Active": case "Granted": return "bg-green-100 text-green-700"; case "Pending": case "Requested": return "bg-amber-100 text-amber-700"; case "Expired": return "bg-gray-100 text-gray-700"; case "Revoked": case "Denied": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getPushColor = (status: string) => {
    switch (status) { case "Pushed": return "bg-green-100 text-green-700"; case "Pending": return "bg-amber-100 text-amber-700"; case "Failed": return "bg-red-100 text-red-700"; case "Not Linked": return "bg-gray-100 text-gray-500"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Shield className="h-5 w-5" /> ABDM / ABHA Integration for Lab
        </h2>
        <Badge variant="outline" className="text-green-600 border-green-300">
          <Globe className="h-3 w-3 mr-1" /> HIP Connected
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{totalLinked}</p>
            <p className="text-[10px] text-muted-foreground">ABHA Linked</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{totalPushed}</p>
            <p className="text-[10px] text-muted-foreground">Records Pushed</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{pendingPush}</p>
            <p className="text-[10px] text-muted-foreground">Pending Push</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{failedPush}</p>
            <p className="text-[10px] text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <Key className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{consents.filter(c => c.status === "Granted").length}</p>
            <p className="text-[10px] text-muted-foreground">Active Consents</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Health Records</TabsTrigger>
          <TabsTrigger value="patients">ABHA Linked Patients</TabsTrigger>
          <TabsTrigger value="consents">Consent Management</TabsTrigger>
          <TabsTrigger value="config">HIP Configuration</TabsTrigger>
        </TabsList>

        {/* Health Records Push */}
        <TabsContent value="records" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search patient, order..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Pushed">Pushed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Not Linked">Not Linked</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-auto" onClick={() => toast.success("Bulk push initiated for pending records")}>
              <Upload className="mr-1 h-3 w-3" /> Push All Pending
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">ABHA No</th>
                    <th className="px-3 py-2 text-left">Record Type</th>
                    <th className="px-3 py-2 text-left">Test/Study</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">Push Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {healthRecords.filter(r => search === "" || r.patientName.toLowerCase().includes(search.toLowerCase())).map((rec) => (
                    <tr key={rec.id} className={`border-b ${rec.pushStatus === "Failed" ? "bg-red-50" : ""}`}>
                      <td className="px-3 py-2">
                        <p className="font-medium">{rec.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{rec.patientId} | {rec.orderNo}</p>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{rec.abhaNumber || <span className="text-red-500">Not Linked</span>}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{rec.recordType}</Badge></td>
                      <td className="px-3 py-2">{rec.testName}</td>
                      <td className="px-3 py-2">{rec.reportDate}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`text-[10px] ${getPushColor(rec.pushStatus)}`}>{rec.pushStatus}</Badge>
                        {rec.errorMessage && <p className="text-[9px] text-red-500 mt-0.5 max-w-[150px]">{rec.errorMessage}</p>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {rec.pushStatus === "Pending" && <Button size="sm" className="h-5 text-[9px] bg-green-600" onClick={() => toast.success("Record pushed to ABDM")}><Upload className="h-3 w-3" /></Button>}
                          {rec.pushStatus === "Failed" && <Button size="sm" variant="outline" className="h-5 text-[9px] text-orange-600" onClick={() => toast.info("Retrying push...")}><RefreshCw className="h-3 w-3" /></Button>}
                          {rec.pushStatus === "Pushed" && <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABHA Linked Patients */}
        <TabsContent value="patients" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">ABHA Number</th>
                    <th className="px-3 py-2 text-left">ABHA Address</th>
                    <th className="px-3 py-2 text-left">Linked On</th>
                    <th className="px-3 py-2 text-center">Consent</th>
                    <th className="px-3 py-2 text-right">Records</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedPatients.map((patient) => (
                    <tr key={patient.id} className="border-b">
                      <td className="px-3 py-2"><p className="font-medium">{patient.patientName}</p><p className="text-[10px] text-muted-foreground">{patient.patientId}</p></td>
                      <td className="px-3 py-2">{patient.abhaNumber || <span className="text-red-500 italic">Not linked</span>}</td>
                      <td className="px-3 py-2 text-muted-foreground">{patient.abhaAddress || "-"}</td>
                      <td className="px-3 py-2">{patient.linkedAt || "-"}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getConsentColor(patient.consentStatus)}`}>{patient.consentStatus}</Badge></td>
                      <td className="px-3 py-2 text-right">{patient.recordsPushed}</td>
                      <td className="px-3 py-2 text-center">
                        {!patient.abhaNumber ? (
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("ABHA linking flow initiated")}><Link2 className="h-3 w-3 mr-0.5" /> Link</Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Patient PHR records fetched")}><Database className="h-3 w-3" /></Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Management */}
        <TabsContent value="consents" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4 text-purple-600" /> Consent Artefacts</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Purpose</th>
                    <th className="px-3 py-2 text-left">HI Types</th>
                    <th className="px-3 py-2 text-left">Period</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-left">Expires</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((consent) => (
                    <tr key={consent.id} className="border-b">
                      <td className="px-3 py-2"><p className="font-medium">{consent.patientName}</p><p className="text-[10px] text-muted-foreground">{consent.abhaNumber}</p></td>
                      <td className="px-3 py-2">{consent.purpose}</td>
                      <td className="px-3 py-2">{consent.hiTypes.map((t, i) => <Badge key={i} variant="outline" className="text-[8px] mr-0.5">{t}</Badge>)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{consent.dateFrom} to {consent.dateTo}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${getConsentColor(consent.status)}`}>{consent.status}</Badge></td>
                      <td className="px-3 py-2">{consent.expiresAt || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        {consent.status === "Requested" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Consent reminder sent")}>Remind</Button>}
                        {consent.status === "Expired" && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Re-consent request sent")}>Renew</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HIP Configuration */}
        <TabsContent value="config" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Health Information Provider (HIP) Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">HIP ID</label>
                  <Input className="h-8 text-xs" defaultValue="AYUZEE-LAB-KDY" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">HIP Name</label>
                  <Input className="h-8 text-xs" defaultValue="Ayuzee Diagnostics - Kadayanallur" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">ABDM Gateway URL</label>
                  <Input className="h-8 text-xs" defaultValue="https://dev.abdm.gov.in/gateway" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Bridge URL (Callback)</label>
                  <Input className="h-8 text-xs" defaultValue="https://api.ayuzee.com/abdm/callback" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Client ID</label>
                  <Input className="h-8 text-xs" defaultValue="SBX_••••••••" type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Client Secret</label>
                  <Input className="h-8 text-xs" defaultValue="••••••••••••" type="password" />
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium">Auto-Push Settings</p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Auto-push lab reports after validation</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Auto-push radiology reports</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Push to DigiLocker automatically</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Create care context per visit</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Include AI interpretation in FHIR bundle</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Notify patient on record push</span></div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("ABDM settings saved")}>Save Settings</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Connection test successful - ABDM Gateway reachable")}><RefreshCw className="mr-1 h-3 w-3" /> Test Connection</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ABDMLabIntegration;
