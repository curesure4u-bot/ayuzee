import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Shield, Search, Download, Eye, Clock, User,
  Edit2, Printer, Trash2, CheckCircle2, AlertTriangle,
  FileText, RotateCcw, Filter, RefreshCw,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: "Result Entry" | "Result Edit" | "Result Delete" | "Validation" | "Report Print" | "Report Reprint" | "Order Create" | "Order Cancel" | "Order Edit" | "Amendment" | "Dispatch" | "QC Override" | "Critical Alert" | "Login" | "Logout" | "Settings Change";
  category: "Results" | "Orders" | "Reports" | "QC" | "System" | "Security";
  entityType: "Order" | "Test" | "Report" | "Patient" | "Setting" | "User";
  entityId: string;
  entityName: string;
  patientId?: string;
  patientName?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
  severity: "Info" | "Warning" | "Critical" | "High";
}

const mockAuditLogs: AuditLogEntry[] = [
  { id: "a1", timestamp: "2026-07-24 10:45 AM", userId: "U001", userName: "Tech. Arun", userRole: "Lab Technician", action: "Result Entry", category: "Results", entityType: "Test", entityId: "ORD-2026-0047", entityName: "RFT - Serum Creatinine", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", details: "Entered result value: 3.8 mg/dL", newValue: "3.8", ipAddress: "192.168.1.15", severity: "Info" },
  { id: "a2", timestamp: "2026-07-24 10:42 AM", userId: "U001", userName: "Tech. Arun", userRole: "Lab Technician", action: "Result Edit", category: "Results", entityType: "Test", entityId: "ORD-2026-0047", entityName: "RFT - Potassium", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", details: "Modified result value after re-run", previousValue: "7.8", newValue: "7.2", reason: "Re-run performed - initial sample slightly hemolysed", ipAddress: "192.168.1.15", severity: "High" },
  { id: "a3", timestamp: "2026-07-24 10:30 AM", userId: "U002", userName: "Dr. Mohamad Saleem", userRole: "Pathologist", action: "Validation", category: "Results", entityType: "Order", entityId: "ORD-2026-0045", entityName: "Thyroid Profile", patientId: "AL-13105", patientName: "Mrs. Priya Sharma", details: "All parameters validated and approved", ipAddress: "192.168.1.10", severity: "Info" },
  { id: "a4", timestamp: "2026-07-24 10:25 AM", userId: "U002", userName: "Dr. Mohamad Saleem", userRole: "Pathologist", action: "Amendment", category: "Results", entityType: "Test", entityId: "ORD-2026-0040", entityName: "LFT - SGPT", patientId: "AL-11890", patientName: "Mr. Karthik M", details: "Result amended after review", previousValue: "45", newValue: "145", reason: "Data entry error - decimal point missed", ipAddress: "192.168.1.10", severity: "Critical" },
  { id: "a5", timestamp: "2026-07-24 10:15 AM", userId: "U003", userName: "Rec. Priya", userRole: "Receptionist", action: "Report Reprint", category: "Reports", entityType: "Report", entityId: "ORD-2026-0042", entityName: "RFT Report", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", details: "Report reprinted - patient requested duplicate", reason: "Patient lost original copy", ipAddress: "192.168.1.20", severity: "Warning" },
  { id: "a6", timestamp: "2026-07-24 10:00 AM", userId: "U003", userName: "Rec. Priya", userRole: "Receptionist", action: "Order Cancel", category: "Orders", entityType: "Order", entityId: "ORD-2026-0050", entityName: "Urine Routine", patientId: "AL-16001", patientName: "Ms. Kavitha R", details: "Order cancelled - patient request", reason: "Patient opted out", ipAddress: "192.168.1.20", severity: "Warning" },
  { id: "a7", timestamp: "2026-07-24 09:50 AM", userId: "U001", userName: "Tech. Arun", userRole: "Lab Technician", action: "QC Override", category: "QC", entityType: "Test", entityId: "QC-HEM-L1", entityName: "Hematology QC Level 1", details: "QC result outside 2SD but accepted - reagent lot change", reason: "New lot calibration in progress", ipAddress: "192.168.1.15", severity: "High" },
  { id: "a8", timestamp: "2026-07-24 09:45 AM", userId: "U002", userName: "Dr. Mohamad Saleem", userRole: "Pathologist", action: "Critical Alert", category: "Results", entityType: "Test", entityId: "ORD-2026-0047", entityName: "RFT - Potassium 7.2", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", details: "Critical value alert triggered and acknowledged", ipAddress: "192.168.1.10", severity: "Critical" },
  { id: "a9", timestamp: "2026-07-24 09:30 AM", userId: "U004", userName: "Admin", userRole: "Administrator", action: "Settings Change", category: "System", entityType: "Setting", entityId: "SYS-TAT", entityName: "TAT Escalation Rules", details: "Modified Level 2 escalation timeout from 60min to 45min", previousValue: "60 min", newValue: "45 min", ipAddress: "192.168.1.5", severity: "Warning" },
  { id: "a10", timestamp: "2026-07-24 09:00 AM", userId: "U001", userName: "Tech. Arun", userRole: "Lab Technician", action: "Login", category: "Security", entityType: "User", entityId: "U001", entityName: "Tech. Arun", details: "User logged in", ipAddress: "192.168.1.15", severity: "Info" },
  { id: "a11", timestamp: "2026-07-24 08:55 AM", userId: "U002", userName: "Dr. Mohamad Saleem", userRole: "Pathologist", action: "Login", category: "Security", entityType: "User", entityId: "U002", entityName: "Dr. Mohamad Saleem", details: "User logged in", ipAddress: "192.168.1.10", severity: "Info" },
  { id: "a12", timestamp: "2026-07-24 10:50 AM", userId: "U003", userName: "Rec. Priya", userRole: "Receptionist", action: "Report Print", category: "Reports", entityType: "Report", entityId: "ORD-2026-0048", entityName: "CBC Report", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", details: "First print of report", ipAddress: "192.168.1.20", severity: "Info" },
];

const AuditTrail = () => {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchSearch = log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityName.toLowerCase().includes(search.toLowerCase()) ||
      (log.patientName || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || log.category === categoryFilter;
    const matchSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    const matchUser = userFilter === "ALL" || log.userId === userFilter;
    return matchSearch && matchCategory && matchSeverity && matchUser;
  });

  const criticalCount = logs.filter(l => l.severity === "Critical").length;
  const highCount = logs.filter(l => l.severity === "High").length;
  const amendmentCount = logs.filter(l => l.action === "Amendment").length;
  const reprintCount = logs.filter(l => l.action === "Report Reprint").length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-700 border-red-300";
      case "High": return "bg-orange-100 text-orange-700 border-orange-300";
      case "Warning": return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Result Entry": return <Edit2 className="h-3 w-3 text-green-600" />;
      case "Result Edit": case "Amendment": return <Edit2 className="h-3 w-3 text-orange-600" />;
      case "Validation": return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "Report Print": return <Printer className="h-3 w-3 text-blue-600" />;
      case "Report Reprint": return <Printer className="h-3 w-3 text-amber-600" />;
      case "Order Cancel": case "Result Delete": return <Trash2 className="h-3 w-3 text-red-600" />;
      case "Critical Alert": return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "QC Override": return <AlertTriangle className="h-3 w-3 text-orange-600" />;
      case "Settings Change": return <RefreshCw className="h-3 w-3 text-purple-600" />;
      case "Login": case "Logout": return <User className="h-3 w-3 text-gray-500" />;
      default: return <FileText className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Shield className="h-5 w-5" /> Audit Trail & Activity Log
        </h2>
        <Button size="sm" variant="outline" onClick={() => toast.info("Audit report exported as CSV")}>
          <Download className="mr-1 h-3 w-3" /> Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">{criticalCount}</p>
            <p className="text-[10px] text-muted-foreground">Critical Events</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-3 text-center">
            <Edit2 className="h-4 w-4 mx-auto text-orange-600" />
            <p className="text-xl font-bold text-orange-600 mt-1">{amendmentCount}</p>
            <p className="text-[10px] text-muted-foreground">Amendments</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Printer className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">{reprintCount}</p>
            <p className="text-[10px] text-muted-foreground">Reprints</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Shield className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">{highCount}</p>
            <p className="text-[10px] text-muted-foreground">High Severity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Results">Results</SelectItem>
            <SelectItem value="Orders">Orders</SelectItem>
            <SelectItem value="Reports">Reports</SelectItem>
            <SelectItem value="QC">QC</SelectItem>
            <SelectItem value="System">System</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severity</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Users</SelectItem>
            <SelectItem value="U001">Tech. Arun</SelectItem>
            <SelectItem value="U002">Dr. Mohamad Saleem</SelectItem>
            <SelectItem value="U003">Rec. Priya</SelectItem>
            <SelectItem value="U004">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`border-b transition ${log.severity === "Critical" ? "bg-red-50" : log.severity === "High" ? "bg-orange-50" : ""}`}>
                <div className="flex items-start gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                  <div className="mt-0.5">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium">{log.action}</span>
                      <Badge className={`text-[9px] ${getSeverityColor(log.severity)}`}>{log.severity}</Badge>
                      <Badge variant="outline" className="text-[9px]">{log.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {log.userName} ({log.userRole})</span>
                      {log.patientName && <span>Patient: {log.patientName}</span>}
                      <span>{log.entityId}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                    <p className="text-[9px] text-muted-foreground">{log.ipAddress}</p>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedLog === log.id && (
                  <div className="px-4 pb-3 ml-8 border-t border-dashed pt-2">
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Entity:</span> {log.entityType} - {log.entityName}</div>
                      <div><span className="text-muted-foreground">Entity ID:</span> {log.entityId}</div>
                      {log.previousValue && <div><span className="text-muted-foreground">Previous Value:</span> <span className="text-red-600 line-through">{log.previousValue}</span></div>}
                      {log.newValue && <div><span className="text-muted-foreground">New Value:</span> <span className="text-green-600 font-medium">{log.newValue}</span></div>}
                      {log.reason && <div className="sm:col-span-2"><span className="text-muted-foreground">Reason:</span> <span className="font-medium">{log.reason}</span></div>}
                      <div><span className="text-muted-foreground">User ID:</span> {log.userId}</div>
                      <div><span className="text-muted-foreground">IP Address:</span> {log.ipAddress}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;
