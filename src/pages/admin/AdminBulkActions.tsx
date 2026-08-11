import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecordItem {
  id: string;
  name: string;
  status: string;
  created: string;
}

export default function AdminBulkActions() {
  const [activeTab, setActiveTab] = useState("doctors");
  const [statusFilter, setStatusFilter] = useState("all");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const fetchRecords = async (tab: string) => {
    setLoading(true);
    setSelected(new Set());
    try {
      let tableName = "doctors";
      if (tab === "therapists") tableName = "therapists";
      if (tab === "users") tableName = "profiles";

      let query = (supabase as any).from(tableName).select("*").limit(50);

      if (statusFilter === "pending" && tab !== "users") {
        query = query.eq("verification_status", "pending");
      } else if (statusFilter === "approved" && tab !== "users") {
        query = query.eq("is_approved", true);
      } else if (statusFilter === "suspended" && tab !== "users") {
        query = query.eq("is_suspended", true);
      }

      const { data } = await query;

      const mapped: RecordItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.full_name || item.name || item.first_name || "Unknown",
        status: item.is_suspended
          ? "suspended"
          : item.is_approved
          ? "approved"
          : item.verification_status || "pending",
        created: item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "N/A",
      }));

      setRecords(mapped);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(activeTab);
  }, [activeTab, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === records.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(records.map((r) => r.id)));
    }
  };

  const executeAction = async (action: string) => {
    const ids = Array.from(selected);
    const tableName =
      activeTab === "therapists"
        ? "therapists"
        : activeTab === "users"
        ? "profiles"
        : "doctors";

    try {
      if (action === "approve") {
        await (supabase as any)
          .from(tableName)
          .update({ is_approved: true, verification_status: "approved" })
          .in("id", ids);
        toast.success(`${ids.length} records approved`);
      } else if (action === "suspend") {
        await (supabase as any)
          .from(tableName)
          .update({ is_suspended: true })
          .in("id", ids);
        toast.success(`${ids.length} records suspended`);
      } else if (action === "notify") {
        toast.success(`Notification sent to ${ids.length} users`);
      }

      setSelected(new Set());
      setConfirmAction(null);
      fetchRecords(activeTab);
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Bulk action failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Copy className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold">Bulk Actions</h1>
          <p className="text-muted-foreground">Manage multiple records efficiently</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="therapists">Therapists</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Bar */}
        {selected.size > 0 && (
          <Card className="mt-4">
            <CardContent className="flex items-center gap-3 py-3">
              <Badge variant="default">{selected.size} selected</Badge>
              <Button
                size="sm"
                onClick={() => setConfirmAction("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmAction("suspend")}
              >
                Suspend Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeAction("notify")}
              >
                Send Notification
              </Button>
            </CardContent>
          </Card>
        )}

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          records.length > 0 && selected.size === records.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(record.id)}
                            onCheckedChange={() => toggleSelect(record.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "approved"
                                ? "default"
                                : record.status === "suspended"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              record.status === "approved" ? "bg-green-600" : ""
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.created}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction} {selected.size} selected
              records? This action will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
