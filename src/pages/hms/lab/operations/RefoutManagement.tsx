import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Truck, Clock, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

type RefoutOrder = {
  id: string;
  patient: string;
  test: string;
  referredLab: string;
  sentDate: string;
  expectedDate: string;
  status: "sent" | "received" | "reported" | "overdue";
  trackingId: string;
};

const mockRefouts: RefoutOrder[] = [
  { id: "1", patient: "Ramesh Kumar (UH-4521)", test: "HLA-B27", referredLab: "SRL Diagnostics", sentDate: "2026-08-05", expectedDate: "2026-08-08", status: "reported", trackingId: "SRL-87654" },
  { id: "2", patient: "Meera Nair (UH-2987)", test: "Vitamin D (25-OH)", referredLab: "Thyrocare", sentDate: "2026-08-06", expectedDate: "2026-08-08", status: "received", trackingId: "TC-12345" },
  { id: "3", patient: "Sunil Menon (UH-5120)", test: "Anti-CCP Antibody", referredLab: "SRL Diagnostics", sentDate: "2026-08-07", expectedDate: "2026-08-10", status: "sent", trackingId: "SRL-87690" },
  { id: "4", patient: "Lakshmi Devi (UH-3892)", test: "Genetic Panel (MTHFR)", referredLab: "Medgenome", sentDate: "2026-08-01", expectedDate: "2026-08-07", status: "overdue", trackingId: "MG-5521" },
  { id: "5", patient: "Anil K (UH-6034)", test: "Thyroid Antibodies (Anti-TPO)", referredLab: "Thyrocare", sentDate: "2026-08-06", expectedDate: "2026-08-09", status: "sent", trackingId: "TC-12380" },
];

const partnerLabs = [
  { name: "SRL Diagnostics", tests: 45, avgTAT: "2.5 days", active: true },
  { name: "Thyrocare", tests: 32, avgTAT: "1.5 days", active: true },
  { name: "Medgenome", tests: 12, avgTAT: "7 days", active: true },
  { name: "Metropolis (Backup)", tests: 8, avgTAT: "2 days", active: false },
];

const RefoutManagement = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = filterStatus === "all" ? mockRefouts : mockRefouts.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" /> Referral-Out (RefOut) Management
          </h2>
          <p className="text-sm text-muted-foreground">Track samples sent to external labs, TAT monitoring & result integration</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New referral-out created")}>New RefOut</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{mockRefouts.filter(r => r.status === "sent").length}</p><p className="text-xs text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{mockRefouts.filter(r => r.status === "reported").length}</p><p className="text-xs text-muted-foreground">Results Ready</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{mockRefouts.filter(r => r.status === "overdue").length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold mt-1">{partnerLabs.filter(l => l.active).length}</p><p className="text-xs text-muted-foreground">Partner Labs</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Test</th>
                <th className="px-3 py-2 text-left font-medium">Lab</th>
                <th className="px-3 py-2 text-left font-medium">Sent</th>
                <th className="px-3 py-2 text-left font-medium">Expected</th>
                <th className="px-3 py-2 text-left font-medium">Tracking</th>
                <th className="px-3 py-2 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={`border-b hover:bg-muted/30 ${r.status === "overdue" ? "bg-red-50/30" : ""}`}>
                  <td className="px-3 py-2 font-medium text-xs">{r.patient}</td>
                  <td className="px-3 py-2 text-xs">{r.test}</td>
                  <td className="px-3 py-2 text-xs">{r.referredLab}</td>
                  <td className="px-3 py-2 text-xs">{r.sentDate}</td>
                  <td className="px-3 py-2 text-xs">{r.expectedDate}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.trackingId}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={r.status === "reported" ? "outline" : r.status === "overdue" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${r.status === "reported" ? "text-green-600" : ""}`}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Partner Labs */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Partner Labs</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partnerLabs.map(lab => (
              <div key={lab.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{lab.name}</p>
                  <p className="text-xs text-muted-foreground">{lab.tests} tests · Avg TAT: {lab.avgTAT}</p>
                </div>
                <Badge variant={lab.active ? "outline" : "secondary"} className={`text-xs ${lab.active ? "text-green-600" : ""}`}>{lab.active ? "Active" : "Inactive"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefoutManagement;
