import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Signoff {
  id: string;
  session_id: string;
  therapist_id: string;
  doctor_id: string | null;
  status: string;
  doctor_rating: number | null;
  doctor_comments: string | null;
  revision_reason: string | null;
  earnings_amount: number | null;
  earnings_released: boolean;
  earnings_released_at: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  auto_approve_after: string | null;
  therapist_name?: string;
}

function getOverdueHours(autoApproveAfter: string): number {
  const now = new Date();
  const deadline = new Date(autoApproveAfter);
  const diffMs = now.getTime() - deadline.getTime();
  return Math.max(0, Math.round(diffMs / 3600000));
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 1) return "< 1h ago";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function AdminDoctorSignoffQueue() {
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedToday, setApprovedToday] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalEarningsPending, setTotalEarningsPending] = useState(0);

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [reason, setReason] = useState("");

  const fetchSignoffs = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("therapist_session_signoffs")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      toast.error("Failed to load sign-offs: " + error.message);
      setLoading(false);
      return;
    }

    // Fetch therapist names
    const therapistIds = [...new Set((data || []).map((s: any) => s.therapist_id))];
    let therapistMap: Record<string, string> = {};
    if (therapistIds.length > 0) {
      const { data: therapists } = await (supabase as any)
        .from("therapists")
        .select("id, name")
        .in("id", therapistIds);
      if (therapists) {
        therapists.forEach((t: any) => {
          therapistMap[t.id] = t.name;
        });
      }
    }

    const enriched = (data || []).map((s: any) => ({
      ...s,
      therapist_name: therapistMap[s.therapist_id] || "Unknown",
    }));

    setSignoffs(enriched);
    computeStats(enriched);
    setLoading(false);
  };

  const computeStats = (data: Signoff[]) => {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const pending = data.filter((s) => s.status === "pending");
    setPendingCount(pending.length);

    const approvedTodayList = data.filter(
      (s) => s.status === "approved" && s.reviewed_at && new Date(s.reviewed_at) >= todayStart
    );
    setApprovedToday(approvedTodayList.length);

    const overdue = data.filter(
      (s) =>
        s.status === "pending" &&
        s.auto_approve_after &&
        new Date(s.auto_approve_after) < now
    );
    setOverdueCount(overdue.length);

    const earningsPending = pending.reduce(
      (sum, s) => sum + (s.earnings_amount || 0),
      0
    );
    setTotalEarningsPending(earningsPending);
  };

  useEffect(() => {
    fetchSignoffs();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await (supabase as any)
      .from("therapist_session_signoffs")
      .update({
        status: "approved",
        earnings_released: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Failed to approve: " + error.message);
      return;
    }
    toast.success("Sign-off approved");
    fetchSignoffs();
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    const { error } = await (supabase as any)
      .from("therapist_session_signoffs")
      .update({
        status: "rejected",
        doctor_comments: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedId);
    if (error) {
      toast.error("Failed to reject: " + error.message);
      return;
    }
    toast.success("Sign-off rejected");
    setRejectDialogOpen(false);
    setReason("");
    fetchSignoffs();
  };

  const handleRevision = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    const { error } = await (supabase as any)
      .from("therapist_session_signoffs")
      .update({
        status: "revision_requested",
        revision_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedId);
    if (error) {
      toast.error("Failed to request revision: " + error.message);
      return;
    }
    toast.success("Revision requested");
    setRevisionDialogOpen(false);
    setReason("");
    fetchSignoffs();
  };

  const handleBatchApprove = async (filter: "pending" | "overdue") => {
    const now = new Date();
    let items: Signoff[];
    if (filter === "pending") {
      items = signoffs.filter((s) => s.status === "pending");
    } else {
      items = signoffs.filter(
        (s) =>
          s.status === "pending" &&
          s.auto_approve_after &&
          new Date(s.auto_approve_after) < now
      );
    }

    if (items.length === 0) {
      toast.info("No items to approve");
      return;
    }

    const ids = items.map((s) => s.id);
    const { error } = await (supabase as any)
      .from("therapist_session_signoffs")
      .update({
        status: "approved",
        earnings_released: true,
        reviewed_at: now.toISOString(),
      })
      .in("id", ids);

    if (error) {
      toast.error("Batch approve failed: " + error.message);
      return;
    }
    toast.success(`${ids.length} sign-offs approved`);
    fetchSignoffs();
  };

  const filterByStatus = (status: string): Signoff[] => {
    const now = new Date();
    if (status === "overdue") {
      return signoffs.filter(
        (s) =>
          s.status === "pending" &&
          s.auto_approve_after &&
          new Date(s.auto_approve_after) < now
      );
    }
    return signoffs.filter((s) => s.status === status);
  };

  const renderTable = (items: Signoff[], showOverdue = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Therapist</TableHead>
          <TableHead>Earnings</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Auto-Approve</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((s) => {
          const isOverdue =
            s.status === "pending" &&
            s.auto_approve_after &&
            new Date(s.auto_approve_after) < new Date();
          return (
            <TableRow
              key={s.id}
              className={isOverdue ? "bg-red-50 border-l-4 border-l-red-500" : ""}
            >
              <TableCell className="font-mono text-sm">
                {s.session_id.slice(0, 8)}...
              </TableCell>
              <TableCell>{s.therapist_name}</TableCell>
              <TableCell className="font-medium">
                {s.earnings_amount != null ? `$${s.earnings_amount.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="text-sm">
                {formatTimeAgo(s.submitted_at)}
              </TableCell>
              <TableCell className="text-sm">
                {s.auto_approve_after ? (
                  isOverdue ? (
                    <span className="text-red-600 font-medium">
                      Overdue by {getOverdueHours(s.auto_approve_after)}h
                    </span>
                  ) : (
                    new Date(s.auto_approve_after).toLocaleDateString()
                  )
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "approved"
                      ? "default"
                      : s.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell>
                {s.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleApprove(s.id)}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedId(s.id);
                        setRejectDialogOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedId(s.id);
                        setRevisionDialogOpen(true);
                      }}
                    >
                      Revise
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No sign-offs found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-7 w-7 text-indigo-600" />
        <h1 className="text-2xl font-bold">Doctor Sign-off Queue</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved Today</p>
            <p className="text-2xl font-bold text-green-600">{approvedToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Earnings Pending</p>
            <p className="text-2xl font-bold">${totalEarningsPending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Actions */}
      <div className="flex gap-2">
        <Button onClick={() => handleBatchApprove("pending")} variant="outline">
          Approve All Pending
        </Button>
        <Button onClick={() => handleBatchApprove("overdue")} variant="outline" className="text-red-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Approve All Overdue
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {renderTable(filterByStatus("pending"))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              {renderTable(filterByStatus("overdue"), true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="p-0">
              {renderTable(filterByStatus("approved"))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="p-0">
              {renderTable(filterByStatus("rejected"))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Sign-off</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button onClick={handleReject} variant="destructive" className="w-full">
              Confirm Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Reason for revision request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button onClick={handleRevision} className="w-full">
              Request Revision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
