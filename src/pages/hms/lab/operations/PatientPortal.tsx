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
  Globe, Link2, MessageSquare, Phone, Mail, QrCode,
  Eye, Download, Shield, Clock, CheckCircle2, Users,
  Settings, Copy, ExternalLink, Lock, Smartphone,
} from "lucide-react";

interface PatientAccess {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  reportCount: number;
  lastAccessed?: string;
  accessMethod: "OTP" | "Link" | "QR" | "WhatsApp";
  linkGenerated: boolean;
  linkUrl?: string;
  linkExpiresAt?: string;
  accessCount: number;
  status: "Active" | "Expired" | "Blocked";
}

interface PortalReport {
  id: string;
  patientId: string;
  orderNo: string;
  testName: string;
  reportDate: string;
  viewCount: number;
  downloadCount: number;
  sharedVia: string[];
  accessLink: string;
  isPublished: boolean;
}

interface AccessLog {
  id: string;
  patientId: string;
  patientName: string;
  action: "View" | "Download" | "Share" | "OTP Verified" | "Link Accessed";
  reportName?: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

const mockPatientAccess: PatientAccess[] = [
  { id: "1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@email.com", reportCount: 5, lastAccessed: "2026-07-24 09:30 AM", accessMethod: "OTP", linkGenerated: true, linkUrl: "https://reports.ayuzee.com/r/xK9mP2", linkExpiresAt: "2026-08-24", accessCount: 12, status: "Active" },
  { id: "2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", phone: "+91 87654 32109", reportCount: 3, lastAccessed: "2026-07-23 04:15 PM", accessMethod: "WhatsApp", linkGenerated: true, linkUrl: "https://reports.ayuzee.com/r/aB3nQ7", linkExpiresAt: "2026-08-23", accessCount: 6, status: "Active" },
  { id: "3", patientId: "AL-15320", patientName: "Mr. Suresh Babu", phone: "+91 76543 21098", email: "suresh.b@email.com", reportCount: 2, lastAccessed: undefined, accessMethod: "Link", linkGenerated: true, linkUrl: "https://reports.ayuzee.com/r/yZ5wR1", linkExpiresAt: "2026-08-24", accessCount: 0, status: "Active" },
  { id: "4", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", phone: "+91 65432 10987", reportCount: 8, lastAccessed: "2026-07-22 11:00 AM", accessMethod: "OTP", linkGenerated: true, linkUrl: "https://reports.ayuzee.com/r/cD8sT4", linkExpiresAt: "2026-07-22", accessCount: 24, status: "Expired" },
  { id: "5", patientId: "AL-16001", patientName: "Ms. Kavitha R", phone: "+91 54321 09876", reportCount: 1, accessMethod: "QR", linkGenerated: false, accessCount: 0, status: "Active" },
];

const mockPortalReports: PortalReport[] = [
  { id: "r1", patientId: "AL-12543", orderNo: "ORD-2026-0047", testName: "Renal Function Test", reportDate: "2026-07-24", viewCount: 3, downloadCount: 1, sharedVia: ["whatsapp", "email"], accessLink: "https://reports.ayuzee.com/r/xK9mP2/rft-0047", isPublished: true },
  { id: "r2", patientId: "AL-12543", orderNo: "ORD-2026-0038", testName: "Complete Blood Count", reportDate: "2026-07-20", viewCount: 5, downloadCount: 2, sharedVia: ["whatsapp"], accessLink: "https://reports.ayuzee.com/r/xK9mP2/cbc-0038", isPublished: true },
  { id: "r3", patientId: "AL-14201", orderNo: "ORD-2026-0048", testName: "CBC + Iron Studies", reportDate: "2026-07-24", viewCount: 0, downloadCount: 0, sharedVia: [], accessLink: "https://reports.ayuzee.com/r/aB3nQ7/cbc-0048", isPublished: true },
  { id: "r4", patientId: "AL-15320", orderNo: "ORD-2026-0049", testName: "Lipid Profile + LFT", reportDate: "2026-07-24", viewCount: 0, downloadCount: 0, sharedVia: [], accessLink: "https://reports.ayuzee.com/r/yZ5wR1/lip-0049", isPublished: false },
];

const mockAccessLogs: AccessLog[] = [
  { id: "l1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", action: "View", reportName: "RFT", timestamp: "2026-07-24 09:30 AM", ipAddress: "103.45.xx.xx", device: "Android / Chrome" },
  { id: "l2", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", action: "Download", reportName: "RFT", timestamp: "2026-07-24 09:31 AM", ipAddress: "103.45.xx.xx", device: "Android / Chrome" },
  { id: "l3", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", action: "OTP Verified", timestamp: "2026-07-24 09:29 AM", ipAddress: "103.45.xx.xx", device: "Android / Chrome" },
  { id: "l4", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", action: "Link Accessed", timestamp: "2026-07-23 04:15 PM", ipAddress: "157.32.xx.xx", device: "iPhone / Safari" },
  { id: "l5", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", action: "View", reportName: "CBC", timestamp: "2026-07-23 04:16 PM", ipAddress: "157.32.xx.xx", device: "iPhone / Safari" },
  { id: "l6", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", action: "Download", reportName: "Thyroid Profile", timestamp: "2026-07-22 11:02 AM", ipAddress: "202.12.xx.xx", device: "Windows / Edge" },
];

const PatientPortal = () => {
  const [patients] = useState<PatientAccess[]>(mockPatientAccess);
  const [reports] = useState<PortalReport[]>(mockPortalReports);
  const [logs] = useState<AccessLog[]>(mockAccessLogs);
  const [activeTab, setActiveTab] = useState("patients");
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientAccess | null>(null);

  const totalPublished = reports.filter(r => r.isPublished).length;
  const totalViews = reports.reduce((sum, r) => sum + r.viewCount, 0);
  const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);
  const activePatients = patients.filter(p => p.status === "Active").length;

  const filteredPatients = patients.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleGenerateLink = (patient: PatientAccess) => {
    toast.success(`Access link generated for ${patient.patientName}`);
  };

  const handleSendOTP = (patient: PatientAccess) => {
    toast.success(`OTP sent to ${patient.phone}`);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Globe className="h-5 w-5" /> Patient Report Portal
        </h2>
        <Badge variant="outline" className="text-green-600 border-green-300">
          <Globe className="h-3 w-3 mr-1" /> Portal Active
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{activePatients}</p>
            <p className="text-[10px] text-muted-foreground">Active Patients</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{totalPublished}</p>
            <p className="text-[10px] text-muted-foreground">Published Reports</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <Eye className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{totalViews}</p>
            <p className="text-[10px] text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Download className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{totalDownloads}</p>
            <p className="text-[10px] text-muted-foreground">Downloads</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="patients">Patient Access</TabsTrigger>
          <TabsTrigger value="reports">Published Reports</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="settings">Portal Settings</TabsTrigger>
        </TabsList>

        {/* Patient Access Tab */}
        <TabsContent value="patients" className="space-y-3">
          <div className="relative max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-8 text-sm" placeholder="Search patient, ID, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Contact</th>
                    <th className="px-3 py-2 text-center">Reports</th>
                    <th className="px-3 py-2 text-center">Access</th>
                    <th className="px-3 py-2 text-left">Last Accessed</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b">
                      <td className="px-3 py-2">
                        <p className="font-medium">{patient.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{patient.patientId}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-[10px]">{patient.phone}</p>
                        {patient.email && <p className="text-[10px] text-muted-foreground">{patient.email}</p>}
                      </td>
                      <td className="px-3 py-2 text-center font-medium">{patient.reportCount}</td>
                      <td className="px-3 py-2 text-center">{patient.accessCount} views</td>
                      <td className="px-3 py-2 text-muted-foreground">{patient.lastAccessed || "Never"}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`text-[10px] ${patient.status === "Active" ? "bg-green-100 text-green-700" : patient.status === "Expired" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{patient.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => handleSendOTP(patient)}><Smartphone className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => handleGenerateLink(patient)}><Link2 className="h-3 w-3" /></Button>
                          {patient.linkUrl && <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => handleCopyLink(patient.linkUrl!)}><Copy className="h-3 w-3" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Published Reports Tab */}
        <TabsContent value="reports" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient ID</th>
                    <th className="px-3 py-2 text-left">Test</th>
                    <th className="px-3 py-2 text-left">Order</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">Views</th>
                    <th className="px-3 py-2 text-center">Downloads</th>
                    <th className="px-3 py-2 text-center">Shared Via</th>
                    <th className="px-3 py-2 text-center">Published</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{report.patientId}</td>
                      <td className="px-3 py-2">{report.testName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{report.orderNo}</td>
                      <td className="px-3 py-2">{report.reportDate}</td>
                      <td className="px-3 py-2 text-center">{report.viewCount}</td>
                      <td className="px-3 py-2 text-center">{report.downloadCount}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {report.sharedVia.includes("whatsapp") && <MessageSquare className="h-3 w-3 text-green-600" />}
                          {report.sharedVia.includes("email") && <Mail className="h-3 w-3 text-red-500" />}
                          {report.sharedVia.includes("sms") && <Phone className="h-3 w-3 text-blue-500" />}
                          {report.sharedVia.length === 0 && <span className="text-muted-foreground">-</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {report.isPublished ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => handleCopyLink(report.accessLink)}><Copy className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Report preview opened")}><Eye className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Patient Access Audit Log</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Timestamp</th>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Report</th>
                    <th className="px-3 py-2 text-left">Device</th>
                    <th className="px-3 py-2 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-3 py-2 text-muted-foreground">{log.timestamp}</td>
                      <td className="px-3 py-2 font-medium">{log.patientName}<br /><span className="text-[10px] text-muted-foreground">{log.patientId}</span></td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{log.action}</Badge></td>
                      <td className="px-3 py-2">{log.reportName || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{log.device}</td>
                      <td className="px-3 py-2 text-muted-foreground">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portal Settings Tab */}
        <TabsContent value="settings" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Portal Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Portal URL</label>
                  <div className="flex gap-2">
                    <Input className="h-8 text-xs" defaultValue="https://reports.ayuzee.com" readOnly />
                    <Button size="sm" variant="outline" className="h-8" onClick={() => toast.info("URL copied")}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Link Expiry Duration</label>
                  <Select defaultValue="30">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value="0">Never Expire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Authentication Method</label>
                  <Select defaultValue="otp">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otp">OTP (SMS)</SelectItem>
                      <SelectItem value="otp_wa">OTP (WhatsApp)</SelectItem>
                      <SelectItem value="link">Direct Link (No Auth)</SelectItem>
                      <SelectItem value="dob">Date of Birth Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Auto-Publish Reports</label>
                  <Select defaultValue="validated">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="validated">After Validation</SelectItem>
                      <SelectItem value="dispatched">After Dispatch</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium">Features</p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Allow report download (PDF)</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Show historical reports</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Send auto-notification on publish</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Allow report sharing by patient</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Show AI interpretation to patient</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Enable patient feedback/rating</span></div>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Portal settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientPortal;
