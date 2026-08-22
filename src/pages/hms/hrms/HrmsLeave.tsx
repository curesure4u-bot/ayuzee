import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ClipboardList, Plus, CheckCircle2, XCircle, Clock,
  Loader2, AlertTriangle, Calendar, FileText,
} from "lucide-react";
import { useHrmsLeave, type ApplyLeaveInput } from "@/hooks/hrms/useHrmsLeave";
import { useHrmsPermissions, canAccessHrmsModule } from "@/hooks/hrms/useHrmsPermissions";

const statusStyles: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  manager_approved: { label: "Manager OK", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  revoked: { label: "Revoked", color: "bg-slate-100 text-slate-700" },
};

const HrmsLeave = () => {
  const permissions = useHrmsPermissions();
  const isHrAdmin = canAccessHrmsModule(permissions, "settings");
  const {
    leaveTypes, balances, requests, pendingRequests,
    loading, error, applyLeave, approveLeave, rejectLeave, cancelLeave,
  } = useHrmsLeave();

  // Apply Leave Dialog
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState<Partial<ApplyLeaveInput>>({
    isHalfDay: false,
    totalDays: 1,
  });

  // Reject Dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Calculate total days
  const calcDays = (from: string, to: string, isHalf: boolean): number => {
    if (!from || !to) return isHalf ? 0.5 : 1;
    const diff = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24) + 1;
    return isHalf ? 0.5 : Math.max(1, diff);
  };

  const handleApply = async () => {
    if (!form.leaveTypeId || !form.fromDate || !form.toDate || !form.reason) {
      toast.error("Please fill all required fields");
      return;
    }
    const days = calcDays(form.fromDate, form.toDate, form.isHalfDay || false);
    const success = await applyLeave({ ...form, totalDays: days } as ApplyLeaveInput);
    if (success) {
      toast.success("Leave applied successfully");
      setApplyOpen(false);
      setForm({ isHalfDay: false, totalDays: 1 });
    } else {
      toast.error("Failed to apply leave");
    }
  };

  const handleApprove = async (id: string) => {
    const success = await approveLeave(id, "Approved");
    if (success) toast.success("Leave approved");
    else toast.error("Failed to approve");
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason) {
      toast.error("Please provide a reason");
      return;
    }
    const success = await rejectLeave(rejectId, rejectReason);
    if (success) {
      toast.success("Leave rejected");
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason("");
    } else {
      toast.error("Failed to reject");
    }
  };

  const handleCancel = async (id: string) => {
    const success = await cancelLeave(id);
    if (success) toast.success("Leave cancelled");
    else toast.error("Failed to cancel");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-purple-600" /> Leave Management
          </h1>
          <p className="text-sm text-muted-foreground">Apply, approve & track employee leaves</p>
        </div>
        <Button onClick={() => setApplyOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Apply Leave
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo data. {error}
          </CardContent>
        </Card>
      )}

      {/* Leave Balances */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {balances.map((b) => (
          <Card key={b.id} className="border-l-4" style={{ borderLeftColor: b.color }}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{b.leaveTypeCode}</p>
                <Badge variant="outline" className="text-[9px]">{b.leaveTypeName}</Badge>
              </div>
              <p className="text-2xl font-bold mt-1" style={{ color: b.color }}>{b.available}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Used: {b.used}</span>
                <span>Pending: {b.pending}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((b.used + b.pending) / b.credited) * 100)}%`, backgroundColor: b.color }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={isHrAdmin ? "approvals" : "my-leaves"}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          {isHrAdmin && <TabsTrigger value="approvals">Approvals ({pendingRequests.length})</TabsTrigger>}
          <TabsTrigger value="my-leaves">All Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ─── Approvals Tab (HR) ─────────────────────────────────────────── */}
        {isHrAdmin && (
          <TabsContent value="approvals" className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No pending leave requests</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{req.employeeName}</p>
                            <Badge className={`text-[9px] border-0 ${statusStyles[req.status]?.color}`}>
                              {statusStyles[req.status]?.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.employeeCode} &middot; {req.department}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(req.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              {req.fromDate !== req.toDate && ` — ${new Date(req.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                            </span>
                            <Badge variant="outline" className="text-[10px]">{req.leaveTypeCode}</Badge>
                            <span className="text-xs text-muted-foreground">{req.totalDays} day{req.totalDays !== 1 ? "s" : ""}</span>
                            {req.isHalfDay && <Badge variant="outline" className="text-[9px]">{req.halfDayType === "first_half" ? "1st Half" : "2nd Half"}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 italic">"{req.reason}"</p>
                          {req.managerRemarks && (
                            <p className="text-xs mt-1 text-blue-600">Manager: {req.managerRemarks}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(req.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setRejectId(req.id); setRejectOpen(true); }}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ─── All Requests Tab ───────────────────────────────────────────── */}
        <TabsContent value="my-leaves" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium">Employee</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">From</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">To</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Days</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Reason</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Status</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <p className="font-medium text-xs">{req.employeeName}</p>
                          <p className="text-[10px] text-muted-foreground">{req.department}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-[10px]">{req.leaveTypeCode}</Badge>
                        </td>
                        <td className="px-3 py-2 text-xs">{new Date(req.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                        <td className="px-3 py-2 text-xs">{new Date(req.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                        <td className="px-3 py-2 text-center text-xs font-medium">{req.totalDays}</td>
                        <td className="px-3 py-2 text-xs max-w-[150px] truncate" title={req.reason}>{req.reason}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge className={`text-[9px] border-0 ${statusStyles[req.status]?.color}`}>
                            {statusStyles[req.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {req.status === "pending" && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-600" onClick={() => handleCancel(req.id)}>
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">No leave requests found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── History Tab ────────────────────────────────────────────────── */}
        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium">Employee</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Dates</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Days</th>
                      <th className="px-3 py-2 text-center text-xs font-medium">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter((r) => r.status === "approved" || r.status === "rejected" || r.status === "cancelled").map((req) => (
                      <tr key={req.id} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <p className="text-xs font-medium">{req.employeeName}</p>
                        </td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{req.leaveTypeCode}</Badge></td>
                        <td className="px-3 py-2 text-xs">
                          {new Date(req.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          {req.fromDate !== req.toDate && ` – ${new Date(req.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                        </td>
                        <td className="px-3 py-2 text-center text-xs">{req.totalDays}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge className={`text-[9px] border-0 ${statusStyles[req.status]?.color}`}>
                            {statusStyles[req.status]?.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                          {req.hrRemarks || req.managerRemarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Apply Leave Dialog ───────────────────────────────────────────── */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Apply Leave</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Leave Type *</Label>
              <Select value={form.leaveTypeId || ""} onValueChange={(v) => setForm((f) => ({ ...f, leaveTypeId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt.color }} />
                        {lt.name} ({lt.code})
                        {!lt.isPaid && <Badge variant="outline" className="text-[8px] ml-1">Unpaid</Badge>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">From Date *</Label>
                <Input type="date" className="h-9" value={form.fromDate || ""} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value, toDate: f.toDate || e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Date *</Label>
                <Input type="date" className="h-9" value={form.toDate || ""} min={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isHalfDay || false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isHalfDay: v, toDate: v ? f.fromDate : f.toDate }))}
                />
                <Label className="text-xs">Half Day</Label>
              </div>
              {form.isHalfDay && (
                <Select value={form.halfDayType || "first_half"} onValueChange={(v) => setForm((f) => ({ ...f, halfDayType: v }))}>
                  <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_half">First Half</SelectItem>
                    <SelectItem value="second_half">Second Half</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {form.fromDate && form.toDate && (
              <div className="text-sm font-medium text-center py-1 bg-muted/50 rounded">
                Total: {calcDays(form.fromDate, form.toDate, form.isHalfDay || false)} day(s)
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Reason *</Label>
              <Textarea className="text-sm min-h-[60px]" placeholder="Reason for leave..." value={form.reason || ""} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>

            {form.leaveTypeId && leaveTypes.find((lt) => lt.id === form.leaveTypeId)?.requiresDocument && (
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                This leave type requires a supporting document (e.g. medical certificate)
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reject Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Reason for Rejection *</Label>
              <Textarea className="text-sm min-h-[80px]" placeholder="Provide reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrmsLeave;
