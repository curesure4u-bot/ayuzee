import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Shield, MoreHorizontal, Mail, Ban, CheckCircle2, Activity } from "lucide-react";
import type { AdminUserRow } from "@/hooks/useAdminUsers";

const roleColor: Record<string, string> = {
  super_admin: "bg-red-500/15 text-red-600 border-red-300",
  admin: "bg-rose-500/15 text-rose-600 border-rose-300",
  doctor: "bg-emerald-500/15 text-emerald-600 border-emerald-300",
  patient: "bg-sky-500/15 text-sky-600 border-sky-300",
  student: "bg-violet-500/15 text-violet-600 border-violet-300",
  therapist: "bg-amber-500/15 text-amber-600 border-amber-300",
  venue_owner: "bg-orange-500/15 text-orange-600 border-orange-300",
  provider: "bg-indigo-500/15 text-indigo-600 border-indigo-300",
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

type Props = {
  rows: AdminUserRow[];
  loading: boolean;
  selected: Set<string>;
  onToggleSelect: (userId: string) => void;
  onToggleAll: (checked: boolean) => void;
  onEditRole: (user: AdminUserRow) => void;
  onViewProfile: (user: AdminUserRow) => void;
  onToggleActive: (user: AdminUserRow, next: boolean) => void;
};

export const UserTable = ({
  rows,
  loading,
  selected,
  onToggleSelect,
  onToggleAll,
  onEditRole,
  onViewProfile,
  onToggleActive,
}: Props) => {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.user_id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => onToggleAll(!!v)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                Loading users…
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                No users match the current filters.
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            rows.map((r) => {
              const initials = (r.full_name || r.email || "U")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.user_id)}
                      onCheckedChange={() => onToggleSelect(r.user_id)}
                      aria-label={`Select ${r.full_name ?? r.email ?? "user"}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={r.avatar_url ?? undefined} alt={r.full_name ?? ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-tight">{r.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.email || "—"}</TableCell>
                  <TableCell className="text-sm">{r.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={roleColor[role] ?? "bg-muted text-foreground"}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.is_active}
                        onCheckedChange={(v) => onToggleActive(r, v)}
                      />
                      <span className={`text-xs ${r.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{fmtDate(r.created_at)}</TableCell>
                  <TableCell className="text-sm">{fmtDate(r.updated_at || r.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEditRole(r)}>
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onViewProfile(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
