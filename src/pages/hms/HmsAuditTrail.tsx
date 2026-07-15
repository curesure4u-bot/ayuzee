import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Search, Lock, Clock, AlertTriangle, Hash, Eye, Download } from "lucide-react";

type AuditEntry = {
  id: string; timestamp: string; user: string; role: string;
  action: string; module: string; entity: string; entityId: string;
  details: string; ipAddress: string; hash: string;
  severity: "info" | "warning" | "critical";
};

type BreakGlass = {
  id: string; user: string; reason: string; requestedAt: string;
  expiresAt: string; status: "active" | "expired" | "revoked"; accessedRecords: number;
};

const mockAudit: AuditEntry[] = [
  { id: "1", timestamp: "2026-07-15 09:32:15", user: "Dr. Arun Sharma", role: "Doctor", action: "VIEW", module: "EMR", entity: "Patient Record", entityId: "PAT-001", details: "Viewed patient Ramesh Kumar medical history", ipAddress: "192.168.1.45", hash: "a3f2b8c1d4e5f6a7", severity: "info" },
  { id: "2", timestamp: "2026-07-15 09:35:42", user: "Dr. Arun Sharma", role: "Doctor", action: "CREATE", module: "Prescription", entity: "Prescription", entityId: "RX-0457", details: "Created prescription for Ramesh Kumar - 4 medicines", ipAddress: "192.168.1.45", hash: "b4e7c9d2f1a3e8b5", severity: "info" },
  { id: "3", timestamp: "2026-07-15 09:40:18", user: "Vikram R", role: "Pharmacist", action: "DISPENSE", module: "Pharmacy", entity: "Dispensing", entityId: "DISP-1245", details: "Dispensed Yogaraja Guggulu 60 tabs, Rasnasaptakam 2 bottles", ipAddress: "192.168.1.22", hash: "c5f8d3e4a2b6c9d7", severity: "info" },
  { id: "4", timestamp: "2026-07-15 10:15:00", user: "Rajesh K", role: "FrontOffice", action: "EDIT", module: "Billing", entity: "Bill", entityId: "BILL-3456", details: "Modified bill amount from ₹2500 to ₹2200 (discount applied)", ipAddress: "192.168.1.10", hash: "d6a9e5f7b3c8d1e2", severity: "warning" },
  { id: "5", timestamp: "2026-07-15 10:20:33", user: "Admin", role: "SuperAdmin", action: "DELETE", module: "Patient", entity: "Patient Record", entityId: "PAT-099", details: "Deleted duplicate patient record (merged with PAT-045)", ipAddress: "192.168.1.5", hash: "e7b1f6a8c4d9e3f5", severity: "critical" },
  { id: "6", timestamp: "2026-07-15 10:45:12", user: "Dr. Meena Patel", role: "Doctor", action: "SIGN", module: "EMR", entity: "Discharge Summary", entityId: "DS-089", details: "Digitally signed discharge summary for Sunil Menon", ipAddress: "192.168.1.48", hash: "f8c2d7e9a5b1f4c6", severity: "info" },
  { id: "7", timestamp: "2026-07-15 11:00:05", user: "System", role: "Automated", action: "PUSH", module: "ABDM", entity: "Health Record", entityId: "ABDM-HR-456", details: "Pushed prescription to ABDM for PAT-001 (consent verified)", ipAddress: "10.0.0.1", hash: "a1b2c3d4e5f6a7b8", severity: "info" },
  { id: "8", timestamp: "2026-07-14 22:15:00", user: "Night Nurse Sita", role: "Nurse", action: "BREAK_GLASS", module: "EMR", entity: "Emergency Access", entityId: "BG-012", details: "Emergency access to patient record PAT-078 - cardiac event", ipAddress: "192.168.1.33", hash: "b2c3d4e5f6a7b8c9", severity: "critical" },
];

const mockBreakGlass: BreakGlass[] = [
  { id: "1", user: "Night Nurse Sita", reason: "Patient PAT-078 sudden cardiac event - needed medication history urgently", requestedAt: "2026-07-14 22:15", expiresAt: "2026-07-14 23:15", status: "expired", accessedRecords: 3 },
  { id: "2", user: "Dr. Nair", reason: "Emergency surgery for unregistered patient - needed allergy info from referral hospital", requestedAt: "2026-07-10 08:30", expiresAt: "2026-07-10 09:30", status: "expired", accessedRecords: 1 },
];

const HmsAuditTrail = () => {
  const [audit] = useState<AuditEntry[]>(mockAudit);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filtered = audit.filter((a) => {
    const matchSearch = a.user.toLowerCase().includes(search.toLowerCase()) || a.action.toLowerCase().includes(search.toLowerCase()) || a.details.toLowerCase().includes(search.toLowerCase()) || a.module.toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSeverity === "all" || a.severity === filterSeverity;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-slate-600" /> Immutable Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground">INSERT-only WORM log · Hash-chained · Break-glass access · Medico-legal compliant</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-slate-100 text-slate-700 border-slate-300"><Lock className="h-3 w-3 mr-1" /> Tamper-Proof</Badge>
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export Audit</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{audit.length}</p><p className="text-xs text-muted-foreground">Events Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{audit.filter(a => a.severity === "warning").length}</p><p className="text-xs text-muted-foreground">Warnings</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{audit.filter(a => a.severity === "critical").length}</p><p className="text-xs text-muted-foreground">Critical</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mockBreakGlass.length}</p><p className="text-xs text-muted-foreground">Break-Glass</p></CardContent></Card>
      </div>

      <Tabs defaultValue="log">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="log">Audit Log</TabsTrigger>
          <TabsTrigger value="breakglass">Break-Glass Access</TabsTrigger>
          <TabsTrigger value="integrity">Chain Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search user, action, module, or details..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-2 py-2 text-left font-medium">Timestamp</th>
                <th className="px-2 py-2 text-left font-medium">User</th>
                <th className="px-2 py-2 text-left font-medium">Action</th>
                <th className="px-2 py-2 text-left font-medium">Module</th>
                <th className="px-2 py-2 text-left font-medium">Details</th>
                <th className="px-2 py-2 text-left font-medium">IP</th>
                <th className="px-2 py-2 text-left font-medium">Hash</th>
                <th className="px-2 py-2 text-left font-medium">Level</th>
              </tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2 font-mono text-[10px]">{a.timestamp}</td>
                    <td className="px-2 py-2"><p className="font-medium">{a.user}</p><p className="text-[9px] text-muted-foreground">{a.role}</p></td>
                    <td className="px-2 py-2"><Badge variant={a.action === "DELETE" ? "destructive" : a.action === "EDIT" ? "secondary" : a.action === "BREAK_GLASS" ? "destructive" : "outline"} className="text-[9px]">{a.action}</Badge></td>
                    <td className="px-2 py-2">{a.module}</td>
                    <td className="px-2 py-2 max-w-[200px] truncate">{a.details}</td>
                    <td className="px-2 py-2 font-mono text-[9px]">{a.ipAddress}</td>
                    <td className="px-2 py-2 font-mono text-[9px] text-muted-foreground">{a.hash.slice(0, 8)}...</td>
                    <td className="px-2 py-2"><div className={`h-2 w-2 rounded-full ${a.severity === "critical" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-500" : "bg-green-500"}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="breakglass" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Emergency Break-Glass Access Log</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Break-glass access allows emergency record viewing with mandatory justification. All access is logged and expires in 1 hour.</p>
              <div className="space-y-3">
                {mockBreakGlass.map((bg) => (
                  <div key={bg.id} className="p-3 rounded-lg border border-red-200 bg-red-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{bg.user}</p>
                      <Badge variant={bg.status === "active" ? "destructive" : "outline"} className={`text-xs ${bg.status === "expired" ? "text-muted-foreground" : ""}`}>{bg.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{bg.reason}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>Requested: {bg.requestedAt}</span>
                      <span>Expires: {bg.expiresAt}</span>
                      <span>Records accessed: {bg.accessedRecords}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Hash className="h-4 w-4" /> Hash Chain Integrity Verification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">Chain Integrity: VERIFIED</p>
                  <p className="text-xs text-green-600">All {audit.length} entries are hash-chained and tamper-free. Last verification: 5 min ago.</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">How it works:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>1. Every audit entry is INSERT-only (Write Once Read Many — WORM)</p>
                  <p>2. Each entry's hash includes the previous entry's hash (blockchain-like chain)</p>
                  <p>3. Entries cannot be modified or deleted — only appended</p>
                  <p>4. Periodic integrity checks verify the entire chain is unbroken</p>
                  <p>5. Break-glass access requires justification and expires automatically</p>
                </div>
              </div>
              <div className="p-3 rounded border bg-muted/30 font-mono text-[10px] overflow-auto">
                <p className="text-muted-foreground">Latest chain verification:</p>
                <p>Entry #8: hash=b2c3d4e5... prev=a1b2c3d4... <span className="text-green-600">VALID</span></p>
                <p>Entry #7: hash=a1b2c3d4... prev=f8c2d7e9... <span className="text-green-600">VALID</span></p>
                <p>Entry #6: hash=f8c2d7e9... prev=e7b1f6a8... <span className="text-green-600">VALID</span></p>
                <p>...</p>
                <p>Entry #1: hash=a3f2b8c1... prev=GENESIS <span className="text-green-600">VALID</span></p>
                <p className="mt-1 text-green-600 font-bold">Chain integrity: ALL ENTRIES VALID (8/8)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsAuditTrail;
