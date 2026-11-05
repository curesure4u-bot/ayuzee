import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, ShieldCheck, Trash2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; user_id: string; role: "admin" | "super_admin"; email: string | null };

const AdminManagement = () => {
  const [isSuper, setIsSuper] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { data: own } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "super_admin")
      .maybeSingle();
    setIsSuper(!!own);

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("id, user_id, role")
      .in("role", ["admin", "super_admin"]);

    if (roleRows && roleRows.length) {
      // Look up emails via doctors / profiles tables (best effort)
      const ids = [...new Set(roleRows.map((r) => r.user_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);
      const profMap = new Map((profs ?? []).map((p) => [p.user_id, p.full_name]));
      setRows(
        roleRows.map((r) => ({
          id: r.id,
          user_id: r.user_id,
          role: r.role as "admin" | "super_admin",
          email: profMap.get(r.user_id) ?? r.user_id.slice(0, 8),
        })),
      );
    } else {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const promote = async (asSuper: boolean) => {
    if (!email.trim()) return;
    setAdding(true);
    // Look up user by email via profiles table joined with auth indirectly: requires RPC or use rpc.
    // Simpler: search doctors / profiles by email for now.
    // We'll query profiles where the user has signed up.
    const { data: matches } = await supabase
      .from("doctors")
      .select("user_id, email")
      .ilike("email", email.trim())
      .not("user_id", "is", null)
      .limit(1);
    let uid = matches?.[0]?.user_id ?? null;

    if (!uid) {
      // Fallback — use the rpc lookup via auth: we don't have it. Show clear error.
      toast.error("User not found. They must sign up first (any role) so we can promote their account.");
      setAdding(false);
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: uid, role: asSuper ? "super_admin" : "admin" });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Granted ${asSuper ? "super admin" : "admin"} access`);
    setEmail("");
    load();
  };

  const revoke = async (id: string, role: string) => {
    if (!confirm(`Revoke ${role} access?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Access revoked");
      load();
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!isSuper) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 font-display text-2xl">Super admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only super admins can manage admin access. Contact a super admin if you need to promote
          someone.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Admin management</h1>
        <p className="text-sm text-muted-foreground">
          Promote teammates to admin or super admin. Super admins can manage other admins.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg">Grant admin access</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The user must have an existing Ayuzee account (sign up via any role first), then we
          promote their account here.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => promote(false)} disabled={adding} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Make Admin
          </Button>
          <Button onClick={() => promote(true)} disabled={adding}>
            <Crown className="mr-2 h-4 w-4" /> Make Super Admin
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                  No admins yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.email}</TableCell>
                <TableCell>
                  {r.role === "super_admin" ? (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                      <Crown className="mr-1 h-3 w-3" /> Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => revoke(r.id, r.role)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminManagement;
