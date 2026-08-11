import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Ticket {
  id: string;
  submitter_user_id: string | null;
  submitter_email: string | null;
  submitter_role: string | null;
  submitter_name: string | null;
  category: string;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  admin_response: string | null;
  internal_notes: string | null;
  resolution_summary: string | null;
  resolved_at: string | null;
  sla_due_at: string | null;
  sla_breached: boolean;
  created_at: string;
}

const STATUSES = ["open", "assigned", "in_progress", "waiting_on_user", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const CATEGORIES = [
  "payment", "booking", "technical", "account", "safety",
  "feedback", "therapist_issue", "doctor_issue", "venue_issue", "other",
];
const ROLES = ["patient", "doctor", "therapist", "admin", "venue_owner"];

function getSlaDisplay(ticket: Ticket): { text: string; breached: boolean } {
  if (ticket.sla_breached) {
    if (ticket.sla_due_at) {
      const now = new Date();
      const due = new Date(ticket.sla_due_at);
      const diffMs = now.getTime() - due.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      return { text: `BREACHED (${diffHours}h ago)`, breached: true };
    }
    return { text: "BREACHED", breached: true };
  }
  if (!ticket.sla_due_at) return { text: "-", breached: false };
  const now = new Date();
  const due = new Date(ticket.sla_due_at);
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "BREACHED", breached: true };
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { text: `${hours}h ${mins}m remaining`, breached: false };
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 border-red-300";
    case "high": return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "open": return "bg-blue-100 text-blue-800";
    case "assigned": return "bg-indigo-100 text-indigo-800";
    case "in_progress": return "bg-purple-100 text-purple-800";
    case "waiting_on_user": return "bg-yellow-100 text-yellow-800";
    case "resolved": return "bg-green-100 text-green-800";
    case "closed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCount, setOpenCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [breachedCount, setBreachedCount] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Detail dialog
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("platform_support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus && filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterPriority && filterPriority !== "all") query = query.eq("priority", filterPriority);
    if (filterCategory && filterCategory !== "all") query = query.eq("category", filterCategory);
    if (filterRole && filterRole !== "all") query = query.eq("submitter_role", filterRole);

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load tickets: " + error.message);
      setLoading(false);
      return;
    }
    setTickets(data || []);
    computeStats(data || []);
    setLoading(false);
  };

  const computeStats = (data: Ticket[]) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    setOpenCount(data.filter((t) => t.status === "open").length);
    setUrgentCount(data.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length);
    setBreachedCount(data.filter((t) => t.sla_breached).length);
    setResolvedToday(
      data.filter(
        (t) => t.status === "resolved" && t.resolved_at && new Date(t.resolved_at) >= todayStart
      ).length
    );
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority, filterCategory, filterRole]);

  const openDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAdminResponse(ticket.admin_response || "");
    setInternalNotes(ticket.internal_notes || "");
    setNewStatus(ticket.status);
    setAssignTo(ticket.assigned_to || "");
    setDetailOpen(true);
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    const updates: any = {};
    if (adminResponse !== (selectedTicket.admin_response || "")) {
      updates.admin_response = adminResponse;
    }
    if (internalNotes !== (selectedTicket.internal_notes || "")) {
      updates.internal_notes = internalNotes;
    }
    if (newStatus !== selectedTicket.status) {
      updates.status = newStatus;
      if (newStatus === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (assignTo !== (selectedTicket.assigned_to || "")) {
      updates.assigned_to = assignTo || null;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    const { error } = await (supabase as any)
      .from("platform_support_tickets")
      .update(updates)
      .eq("id", selectedTicket.id);

    if (error) {
      toast.error("Failed to update ticket: " + error.message);
      return;
    }
    toast.success("Ticket updated");
    setDetailOpen(false);
    fetchTickets();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Headphones className="h-7 w-7 text-indigo-600" />
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Urgent</p>
            <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">SLA Breached</p>
            <p className="text-2xl font-bold text-red-600">{breachedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved Today</p>
            <p className="text-2xl font-bold text-green-600">{resolvedToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Submitter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const sla = getSlaDisplay(ticket);
                return (
                  <TableRow
                    key={ticket.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      ticket.priority === "urgent" && ticket.status !== "resolved" && ticket.status !== "closed"
                        ? "border-l-4 border-l-red-500"
                        : ""
                    }`}
                    onClick={() => openDetail(ticket)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{ticket.submitter_name || ticket.submitter_email || "-"}</span>
                        {ticket.submitter_role && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {ticket.submitter_role}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${sla.breached ? "text-red-600 font-semibold" : ""}`}>
                        {sla.text}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.assigned_to_name || ticket.assigned_to || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {tickets.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Submitter:</span>{" "}
                  {selectedTicket.submitter_name || selectedTicket.submitter_email}
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  {selectedTicket.submitter_role || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {selectedTicket.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>{" "}
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
                <p className="text-sm bg-muted/30 p-3 rounded">
                  {selectedTicket.description || "No description provided"}
                </p>
              </div>

              {/* Admin Response */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Admin Response</p>
                <textarea
                  className="w-full border rounded p-2 text-sm min-h-[80px] resize-y"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response to the user..."
                />
              </div>

              {/* Internal Notes */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Internal Notes</p>
                <textarea
                  className="w-full border rounded p-2 text-sm min-h-[60px] resize-y"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes (not visible to user)..."
                />
              </div>

              {/* Status & Assign */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Assign To</p>
                  <Input
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    placeholder="User ID or email"
                  />
                </div>
              </div>

              <Button onClick={handleSaveTicket} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
