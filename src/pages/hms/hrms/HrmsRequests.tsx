import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, CheckCircle2, XCircle, Clock, Plus } from "lucide-react";

const MOCK_REQUESTS = [
  { id: "r1", employeeName: "Sunita M", employeeCode: "EMP-0004", type: "attendance_correction", subject: "Missing punch on Aug 19", description: "Forgot to check out. Worked till 6pm.", status: "submitted", createdAt: "2026-08-20" },
  { id: "r2", employeeName: "Mohan P", employeeCode: "EMP-0009", type: "salary_advance", subject: "Salary advance ₹10,000", description: "Need advance for family emergency.", amount: 10000, status: "under_review", createdAt: "2026-08-18" },
  { id: "r3", employeeName: "Rajesh K", employeeCode: "EMP-0003", type: "experience_certificate", subject: "Experience certificate request", description: "Need for bank loan application.", status: "approved", createdAt: "2026-08-15" },
  { id: "r4", employeeName: "Priya Therapist", employeeCode: "EMP-0008", type: "shift_change", subject: "Shift change request for September", description: "Request to move from morning to general shift.", status: "submitted", createdAt: "2026-08-19" },
  { id: "r5", employeeName: "Vikram R", employeeCode: "EMP-0005", type: "reimbursement", subject: "Travel reimbursement ₹1,500", description: "Attended pharmacy conference in Chennai.", amount: 1500, status: "completed", createdAt: "2026-08-10" },
];

const statusStyles: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
};

const typeLabels: Record<string, string> = {
  attendance_correction: "Attendance", shift_change: "Shift Change", on_duty: "On Duty",
  salary_advance: "Advance", loan: "Loan", document_request: "Document",
  experience_certificate: "Exp. Cert", hr_query: "HR Query", reimbursement: "Reimburse",
  id_card: "ID Card", uniform: "Uniform", other: "Other",
};

const HrmsRequests = () => {
  const [requests] = useState(MOCK_REQUESTS);
  const pending = requests.filter((r) => r.status === "submitted" || r.status === "under_review");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-cyan-600" /> Requests & Approvals</h1>
          <p className="text-sm text-muted-foreground">Employee self-service requests</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> New Request</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{requests.length}</p><p className="text-[9px] text-muted-foreground">Total Requests</p></CardContent></Card>
        <Card className="border-amber-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-700">{pending.length}</p><p className="text-[9px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-700">{requests.filter((r) => r.status === "completed" || r.status === "approved").length}</p><p className="text-[9px] text-muted-foreground">Resolved</p></CardContent></Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No pending requests</CardContent></Card>
          ) : (
            pending.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{req.subject}</p>
                      <Badge className={`text-[9px] border-0 ${statusStyles[req.status]?.color}`}>{statusStyles[req.status]?.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.employeeName} ({req.employeeCode}) &middot; {typeLabels[req.type]}</p>
                    <p className="text-xs mt-1">{req.description}</p>
                    {(req as any).amount && <p className="text-xs font-medium mt-1">Amount: ₹{(req as any).amount.toLocaleString("en-IN")}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => toast.success("Approved")}><CheckCircle2 className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => toast.info("Rejected")}><XCircle className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40"><tr>
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Subject</th>
                <th className="px-3 py-2 text-center font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
              </tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{r.employeeName}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[8px]">{typeLabels[r.type]}</Badge></td>
                    <td className="px-3 py-2">{r.subject}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] border-0 ${statusStyles[r.status]?.color}`}>{statusStyles[r.status]?.label}</Badge></td>
                    <td className="px-3 py-2 text-[10px]">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsRequests;
