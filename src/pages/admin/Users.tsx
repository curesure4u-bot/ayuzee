import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import { UserTable } from "@/components/admin/UserTable";
import { UserRoleDialog } from "@/components/admin/UserRoleDialog";
import { ALL_ROLES, useAdminUsers, type AdminUserRow } from "@/hooks/useAdminUsers";

const PAGE_SIZE = 20;

const useDebounced = <T,>(value: T, delay = 500) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const Users = () => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 500);
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUserRow | null>(null);
  const [profileUser, setProfileUser] = useState<AdminUserRow | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ user: AdminUserRow; next: boolean } | null>(null);
  const [bulkRole, setBulkRole] = useState("");

  usePageSEO({ title: "Admin · User Management — Ayuzee", noIndex: true });

  useEffect(() => {
    setPage(1);
  }, [search, role, status, fromDate, toDate]);

  const { rows, total, loading, refresh } = useAdminUsers({
    search,
    role,
    status,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleSelect = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };
  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map((r) => r.user_id)) : new Set());
  };

  const handleToggleActive = (user: AdminUserRow, next: boolean) => {
    setConfirmToggle({ user, next });
  };

  const performToggleActive = async () => {
    if (!confirmToggle) return;
    const { user, next } = confirmToggle;
    // Optimistic refresh after DB write
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ is_active: next })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${user.full_name || "User"} ${next ? "activated" : "suspended"}`);
      const { data: actor } = await supabase.auth.getUser();
      await (supabase as any).from("admin_audit_log").insert({
        actor_user_id: actor.user?.id ?? null,
        target_user_id: user.user_id,
        action: next ? "user_activated" : "user_suspended",
        details: {},
      });
      // Best-effort email notification (won't fail the action if the function isn't deployed)
      if (user.email) {
        supabase.functions
          .invoke("send-transactional-email", {
            body: {
              templateName: next ? "account-activated" : "account-suspended",
              recipientEmail: user.email,
              idempotencyKey: `status-${user.user_id}-${next ? "active" : "suspended"}-${Date.now()}`,
              templateData: { name: user.full_name ?? "" },
            },
          })
          .catch(() => {});
      }
      refresh();
    }
    setConfirmToggle(null);
  };

  const handleBulkRole = async () => {
    if (!bulkRole || selected.size === 0) return;
    try {
      const ids = Array.from(selected);
      const del = await (supabase as any).from("user_roles").delete().in("user_id", ids);
      if (del.error) throw del.error;
      const ins = await (supabase as any)
        .from("user_roles")
        .insert(ids.map((user_id) => ({ user_id, role: bulkRole })));
      if (ins.error) throw ins.error;
      const { data: actor } = await supabase.auth.getUser();
      await (supabase as any).from("admin_audit_log").insert(
        ids.map((user_id) => ({
          actor_user_id: actor.user?.id ?? null,
          target_user_id: user_id,
          action: "role_changed_bulk",
          details: { to: bulkRole },
        })),
      );
      toast.success(`Role "${bulkRole}" assigned to ${ids.length} user(s)`);
      setSelected(new Set());
      setBulkRole("");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Bulk update failed");
    }
  };

  const exportCsv = () => {
    const target = selected.size > 0 ? rows.filter((r) => selected.has(r.user_id)) : rows;
    if (target.length === 0) return toast.error("No rows to export");
    const headers = ["Name", "Email", "Phone", "Roles", "Status", "City", "State", "Registered"];
    const lines = [
      headers.join(","),
      ...target.map((r) =>
        [
          r.full_name,
          r.email,
          r.phone,
          r.roles.join("|"),
          r.is_active ? "active" : "inactive",
          r.city,
          r.state,
          r.created_at,
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roleOptions = useMemo(() => ALL_ROLES, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Search, filter, assign roles, and manage user accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, email, or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r === "all" ? "All roles" : r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">
            {total} user{total === 1 ? "" : "s"}
            {selected.size > 0 ? ` · ${selected.size} selected` : ""}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <>
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Bulk assign role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions
                      .filter((r) => r !== "all")
                      .map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button size="sm" disabled={!bulkRole} onClick={handleBulkRole}>
                  Apply role
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable
            rows={rows}
            loading={loading}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onEditRole={setRoleDialogUser}
            onViewProfile={setProfileUser}
            onToggleActive={handleToggleActive}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserRoleDialog
        user={roleDialogUser}
        open={!!roleDialogUser}
        onOpenChange={(o) => !o && setRoleDialogUser(null)}
        onSaved={refresh}
      />

      <Sheet open={!!profileUser} onOpenChange={(o) => !o && setProfileUser(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Profile · {profileUser?.full_name || profileUser?.email}</SheetTitle>
          </SheetHeader>
          {profileUser && (
            <div className="mt-6 grid gap-3 text-sm">
              {Object.entries(profileUser).map(([key, value]) => (
                <div key={key} className="rounded-md border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">{key.replace(/_/g, " ")}</p>
                  <p className="mt-1 break-words font-medium">
                    {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmToggle} onOpenChange={(o) => !o && setConfirmToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.next ? "Activate" : "Suspend"} {confirmToggle?.user.full_name || "user"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.next
                ? "The user will regain access to their account."
                : "The user will be marked inactive. They may lose access depending on your access rules."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performToggleActive}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
