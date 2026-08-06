import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileCheck, Clock, CheckCircle, XCircle, IndianRupee,
  User, Calendar, ArrowRight, Plus, Send, AlertTriangle
} from "lucide-react";

type Estimate = {
  id: string;
  patient_name: string;
  treatment: string;
  department: string;
  created_by: string;
  created_at: string;
  total_amount: number;
  line_items: { description: string; amount: number }[];
  status: "draft" | "pending_approval" | "approved" | "rejected" | "sent_to_patient";
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  patient_response?: "accepted" | "negotiating" | "declined" | null;
  validity_days: number;
};

const mockEstimates: Estimate[] = [
  {
    id: "EST-2026-001", patient_name: "Rajesh Kumar", treatment: "14-Day Panchakarma Package", department: "Panchakarma",
    created_by: "Dr. Saleem", created_at: "Jul 28, 10:00 AM", total_amount: 85000,
    line_items: [
      { description: "Abhyanga + Swedana (14 sessions)", amount: 35000 },
      { description: "Vamana (1 session)", amount: 12000 },
      { description: "Virechana (1 session)", amount: 10000 },
      { description: "Basti (5 sessions)", amount: 15000 },
      { description: "Room charges (14 days)", amount: 8000 },
      { description: "Medicines & Oils", amount: 5000 },
    ],
    status: "pending_approval", validity_days: 7, patient_response: null
  },
  {
    id: "EST-2026-002", patient_name: "Priya Sharma", treatment: "Knee Joint Therapy (Janu Basti)", department: "Ayurveda OPD",
    created_by: "Dr. Meena", created_at: "Jul 27, 3:00 PM", total_amount: 18000,
    line_items: [
      { description: "Janu Basti (7 sessions)", amount: 10500 },
      { description: "Pizhichil (3 sessions)", amount: 4500 },
      { description: "Medicines", amount: 3000 },
    ],
    status: "approved", approved_by: "Dr. Saleem (Owner)", approved_at: "Jul 27, 5:30 PM", validity_days: 14, patient_response: "accepted"
  },
  {
    id: "EST-2026-003", patient_name: "Amit Patel", treatment: "IPD Admission (Liver Detox)", department: "IPD",
    created_by: "Dr. Anitha", created_at: "Jul 26, 11:00 AM", total_amount: 125000,
    line_items: [
      { description: "Room (Private, 10 days)", amount: 50000 },
      { description: "Doctor visits (10)", amount: 15000 },
      { description: "Panchakarma therapies", amount: 35000 },
      { description: "Lab investigations", amount: 12000 },
      { description: "Pharmacy & consumables", amount: 13000 },
    ],
    status: "rejected", approved_by: "Dr. Saleem (Owner)", approved_at: "Jul 26, 2:00 PM",
    rejection_reason: "Room charges too high for this duration. Revise to semi-private.",
    validity_days: 7, patient_response: null
  },
  {
    id: "EST-2026-004", patient_name: "Sunita Devi", treatment: "Kshar Sutra Procedure", department: "Parasurgical",
    created_by: "Dr. Saleem", created_at: "Jul 29, 9:00 AM", total_amount: 32000,
    line_items: [
      { description: "Kshar Sutra procedure", amount: 20000 },
      { description: "Follow-up visits (4)", amount: 4000 },
      { description: "Medicines", amount: 5000 },
      { description: "Dressing & consumables", amount: 3000 },
    ],
    status: "sent_to_patient", approved_by: "Auto-approved (< ₹50K)", approved_at: "Jul 29, 9:01 AM",
    validity_days: 10, patient_response: "negotiating"
  },
];

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Clock },
  pending_approval: { color: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
  sent_to_patient: { color: "bg-blue-100 text-blue-800", icon: Send },
};

const HmsEstimateApproval = () => {
  const [estimates] = useState<Estimate[]>(mockEstimates);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Estimate | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = estimates.filter(e => filterStatus === "all" || e.status === filterStatus);

  const handleApprove = (id: string) => {
    toast.success("Estimate approved! Patient will be notified via WhatsApp with cost breakdown.");
    setDetailOpen(false);
  };

  const handleReject = (id: string) => {
    toast.error("Estimate rejected. Doctor will be notified to revise.");
    setDetailOpen(false);
  };

  const handleSendToPatient = (id: string) => {
    toast.success("Estimate sent to patient via WhatsApp + App notification.");
  };

  const openDetail = (est: Estimate) => {
    setSelected(est);
    setDetailOpen(true);
  };

  const pendingCount = estimates.filter(e => e.status === "pending_approval").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" /> Estimate Approval Workflow
          </h1>
          <p className="text-sm text-muted-foreground">
            Doctor creates estimate → Manager/Owner approves → Patient is notified
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/billing"}>Billing</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Estimate</Button>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800 font-medium">{pendingCount} estimate(s) awaiting your approval</span>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{estimates.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{estimates.filter(e => e.status === "pending_approval").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{estimates.filter(e => e.status === "approved" || e.status === "sent_to_patient").length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{estimates.filter(e => e.status === "rejected").length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">₹{(estimates.reduce((s, e) => s + (e.status === "approved" || e.status === "sent_to_patient" ? e.total_amount : 0), 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Approved Value</p></CardContent></Card>
      </div>

      {/* Filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-48"><SelectValue placeholder="All Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending_approval">Pending Approval</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="sent_to_patient">Sent to Patient</SelectItem>
        </SelectContent>
      </Select>

      {/* Estimates List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estimates ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map(est => {
            const config = statusConfig[est.status];
            const StatusIcon = config.icon;
            return (
              <div key={est.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/20 cursor-pointer" onClick={() => openDetail(est)}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full grid place-items-center ${config.color}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{est.patient_name}</p>
                      <Badge variant="outline" className="text-xs">{est.id}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{est.treatment} · {est.department}</p>
                    <p className="text-xs text-muted-foreground">By: {est.created_by} · {est.created_at}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{est.total_amount.toLocaleString()}</p>
                  <Badge className={config.color}>{est.status.replace(/_/g, " ")}</Badge>
                  {est.patient_response && (
                    <p className="text-xs mt-0.5 text-muted-foreground">Patient: {est.patient_response}</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Estimate Detail — {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> <strong>{selected.patient_name}</strong></div>
                <div><span className="text-muted-foreground">Treatment:</span> <strong>{selected.treatment}</strong></div>
                <div><span className="text-muted-foreground">Department:</span> {selected.department}</div>
                <div><span className="text-muted-foreground">Created by:</span> {selected.created_by}</div>
                <div><span className="text-muted-foreground">Valid for:</span> {selected.validity_days} days</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusConfig[selected.status].color}>{selected.status.replace(/_/g, " ")}</Badge></div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Line Items</p>
                <div className="space-y-1">
                  {selected.line_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-dashed pb-1">
                      <span>{item.description}</span>
                      <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Total</span>
                    <span>₹{selected.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {selected.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
                  <strong>Rejection Reason:</strong> {selected.rejection_reason}
                </div>
              )}
              {selected.approved_by && (
                <p className="text-xs text-muted-foreground">
                  {selected.status === "rejected" ? "Rejected" : "Approved"} by: {selected.approved_by} · {selected.approved_at}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            {selected?.status === "pending_approval" && (
              <>
                <Button variant="destructive" onClick={() => handleReject(selected.id)}>Reject</Button>
                <Button onClick={() => handleApprove(selected.id)}>Approve & Notify Patient</Button>
              </>
            )}
            {selected?.status === "approved" && (
              <Button onClick={() => handleSendToPatient(selected.id)}><Send className="mr-1 h-4 w-4" /> Send to Patient</Button>
            )}
            {(selected?.status === "sent_to_patient" || selected?.status === "rejected") && (
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsEstimateApproval;
