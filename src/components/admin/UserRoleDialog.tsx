import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ALL_ROLES, type AdminUserRow } from "@/hooks/useAdminUsers";

type Props = {
  user: AdminUserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

const assignableRoles = ALL_ROLES.filter((r) => r !== "all");

export const UserRoleDialog = ({ user, open, onOpenChange, onSaved }: Props) => {
  const [newRole, setNewRole] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setNewRole("");
    setConfirming(false);
    setSaving(false);
  };

  const handleSave = async () => {
    if (!user || !newRole) return;
    setSaving(true);
    try {
      const { data: actor } = await supabase.auth.getUser();
      // Replace existing roles with the new one (single primary role model)
      const del = await (supabase as any)
        .from("user_roles")
        .delete()
        .eq("user_id", user.user_id);
      if (del.error) throw del.error;
      const ins = await (supabase as any)
        .from("user_roles")
        .insert({ user_id: user.user_id, role: newRole });
      if (ins.error) throw ins.error;

      await (supabase as any).from("admin_audit_log").insert({
        actor_user_id: actor.user?.id ?? null,
        target_user_id: user.user_id,
        action: "role_changed",
        details: { from: user.roles, to: newRole },
      });

      toast.success(`Role updated to ${newRole}`);
      onSaved?.();
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit role · {user?.full_name || user?.email || "User"}</DialogTitle>
          <DialogDescription>
            Current role{user?.roles && user.roles.length > 1 ? "s" : ""}:{" "}
            {user?.roles.map((r) => (
              <Badge key={r} variant="secondary" className="mr-1">
                {r}
              </Badge>
            ))}
          </DialogDescription>
        </DialogHeader>

        {!confirming ? (
          <div className="space-y-3">
            <label className="text-sm font-medium">Assign new role</label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm">
            Replace all existing roles with <Badge>{newRole}</Badge>? This action will be logged.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          {!confirming ? (
            <Button disabled={!newRole} onClick={() => setConfirming(true)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Confirm change"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleDialog;
