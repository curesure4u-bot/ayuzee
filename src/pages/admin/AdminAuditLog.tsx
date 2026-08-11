import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditEntry {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action_type: string;
  module: string | null;
  resource_type: string | null;
  resource_id: string | null;
  description: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  severity: string;
  created_at: string;
}

const ACTION_TYPES = [
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "suspend",
  "login",
  "settings_change",
];

const MODULES = [
  "users",
  "doctors",
  "therapists",
  "venues",
  "sessions",
  "orders",
  "finance",
  "settings",
];

const SEVERITIES = ["info", "warning", "critical"];

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getActionBadgeColor(action: string): string {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "delete":
      return "bg-red-100 text-red-800";
    case "approve":
      return "bg-emerald-100 text-emerald-800";
    case "reject":
      return "bg-orange-100 text-orange-800";
    case "suspend":
      return "bg-purple-100 text-purple-800";
    case "login":
      return "bg-gray-100 text-gray-800";
    case "settings_change":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getSeverityDotColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-amber-500";
    default:
      return "bg-blue-500";
  }
}

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const PAGE_SIZE = 50;

  const fetchStats = async () => {
    const { count: total } = await (supabase as any)
      .from("platform_audit_log")
      .select("*", { count: "exact", head: true });
    setTotalCount(total || 0);

    const { count: critical } = await (supabase as any)
      .from("platform_audit_log")
      .select("*", { count: "exact", head: true })
      .eq("severity", "critical");
    setCriticalCount(critical || 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: today } = await (supabase as any)
      .from("platform_audit_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());
    setTodayCount(today || 0);
  };

  const fetchEntries = async (pageNum: number, append = false) => {
    setLoading(true);
    let query = (supabase as any)
      .from("platform_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (filterAction && filterAction !== "all") {
      query = query.eq("action_type", filterAction);
    }
    if (filterModule && filterModule !== "all") {
      query = query.eq("module", filterModule);
    }
    if (filterSeverity && filterSeverity !== "all") {
      query = query.eq("severity", filterSeverity);
    }
    if (filterDateFrom) {
      query = query.gte("created_at", new Date(filterDateFrom).toISOString());
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      query = query.lte("created_at", to.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch audit log: " + error.message);
      setLoading(false);
      return;
    }

    if (append) {
      setEntries((prev) => [...prev, ...(data || [])]);
    } else {
      setEntries(data || []);
    }
    setHasMore((data || []).length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchEntries(0);
  }, [filterAction, filterModule, filterSeverity, filterDateFrom, filterDateTo]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage, true);
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold">Audit Log</h1>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Critical Events</p>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today's Activity</p>
            <p className="text-2xl font-bold">{todayCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTION_TYPES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {MODULES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <>
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedRow(expandedRow === entry.id ? null : entry.id)
                    }
                  >
                    <TableCell>
                      {expandedRow === entry.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell title={new Date(entry.created_at).toLocaleString()}>
                      <span className="text-sm">
                        {getRelativeTime(entry.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{entry.actor_email || "System"}</span>
                        {entry.actor_role && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {entry.actor_role}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadgeColor(entry.action_type)}>
                        {entry.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{entry.module || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm line-clamp-2">
                        {entry.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getSeverityDotColor(
                            entry.severity
                          )}`}
                        />
                        <span className="text-sm capitalize">{entry.severity}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === entry.id && (
                    <TableRow key={`${entry.id}-detail`}>
                      <TableCell colSpan={7}>
                        <div className="p-4 bg-muted/30 rounded-md space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Old Values
                              </p>
                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                {entry.old_values
                                  ? JSON.stringify(entry.old_values, null, 2)
                                  : "null"}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                New Values
                              </p>
                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                {entry.new_values
                                  ? JSON.stringify(entry.new_values, null, 2)
                                  : "null"}
                              </pre>
                            </div>
                          </div>
                          {entry.metadata && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Metadata
                              </p>
                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Resource: {entry.resource_type || "-"} / {entry.resource_id || "-"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {entries.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No audit entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {hasMore && (
            <div className="flex justify-center p-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
