import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, FileText, IndianRupee, Clock, CheckCircle2, XCircle, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

type ClaimStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Settled" | "Rejected";

const schemes = ["CGHS", "ECHS", "PMJAY", "ESI", "TN CMCHIS", "Railway Medical"] as const;
const documentTypes = ["Pre-authorization Letter", "Claim Form", "Discharge Summary", "Bill Summary", "Treatment Details"];

const statusColors: Record<ClaimStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Settled: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const mockClaims = [
  { id: "CLM-001", patient: "Ramesh Kumar", scheme: "CGHS", amount: 45000, date: "2026-07-20", status: "Approved" as ClaimStatus, docs: 5 },
  { id: "CLM-002", patient: "Lakshmi Devi", scheme: "PMJAY", amount: 125000, date: "2026-07-18", status: "Settled" as ClaimStatus, docs: 5 },
  { id: "CLM-003", patient: "Col. Suresh (Retd)", scheme: "ECHS", amount: 68000, date: "2026-07-22", status: "Under Review" as ClaimStatus, docs: 4 },
  { id: "CLM-004", patient: "Kavitha M", scheme: "ESI", amount: 32000, date: "2026-07-19", status: "Rejected" as ClaimStatus, docs: 5 },
  { id: "CLM-005", patient: "Anand Raj", scheme: "TN CMCHIS", amount: 89000, date: "2026-07-21", status: "Submitted" as ClaimStatus, docs: 3 },
  { id: "CLM-006", patient: "Priya Sharma", scheme: "Railway Medical", amount: 56000, date: "2026-07-23", status: "Draft" as ClaimStatus, docs: 2 },
];

const kpiData = [
  { label: "Total Claims (Month)", value: "28", icon: FileText, color: "text-blue-600" },
  { label: "Approved", value: "18", icon: CheckCircle2, color: "text-green-600" },
  { label: "Pending", value: "7", icon: Clock, color: "text-yellow-600" },
  { label: "Rejected", value: "3", icon: XCircle, color: "text-red-600" },
  { label: "Amount Claimed", value: "₹4.2L", icon: IndianRupee, color: "text-purple-600" },
  { label: "Amount Settled", value: "₹2.8L", icon: IndianRupee, color: "text-emerald-600" },
];

const StateFundDocs = () => {
  const [selectedScheme, setSelectedScheme] = useState<string>("all");

  const filteredClaims = selectedScheme === "all"
    ? mockClaims
    : mockClaims.filter((c) => c.scheme === selectedScheme);

  const handleGenerateDocs = () => {
    if (selectedScheme === "all") {
      toast.error("Please select a specific scheme to generate claim documents.");
      return;
    }
    toast.success(`Generating claim documents for ${selectedScheme}...`, { description: "Pre-auth, claim form, discharge summary, bill summary & treatment details will be auto-filled." });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">State Fund / Govt Scheme Claims</h1>
          <p className="text-sm text-muted-foreground">Auto-generate documents for CGHS, ECHS, PMJAY, ESI, CMCHIS & Railway Medical</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedScheme} onValueChange={setSelectedScheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Schemes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schemes</SelectItem>
              {schemes.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateDocs} className="gap-2">
            <Shield className="h-4 w-4" /> Generate Claim Documents
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <kpi.icon className={`h-5 w-5 mb-1 ${kpi.color}`} />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Types Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document Types Generated Per Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((dt) => (
              <Badge key={dt} variant="outline" className="text-xs">{dt}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Batch Submission Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs">
            {(["Draft", "Submitted", "Under Review", "Approved", "Settled", "Rejected"] as ClaimStatus[]).map((s) => (
              <Badge key={s} className={statusColors[s]}>{s} → </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Claims ({filteredClaims.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Docs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                  <TableCell>{claim.patient}</TableCell>
                  <TableCell><Badge variant="outline">{claim.scheme}</Badge></TableCell>
                  <TableCell className="text-right">₹{claim.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-xs">{claim.date}</TableCell>
                  <TableCell><Badge className={statusColors[claim.status]}>{claim.status}</Badge></TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                      <Download className="h-3 w-3" /> {claim.docs}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StateFundDocs;
