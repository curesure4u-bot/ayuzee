import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Lock, Plus, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
  id: string;
  role_name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
  tier_level: number;
}

interface Module {
  id: string;
  module_key: string;
  display_name: string;
  category: string | null;
  sort_order: number;
}

interface Permission {
  id: string;
  role_id: string;
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

interface UserAssignment {
  id: string;
  user_id: string;
  role_id: string;
  scope_type: string | null;
  scope_value: string | null;
  assigned_by: string | null;
  is_active: boolean;
}

export default function AdminRolePermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New role dialog
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDisplayName, setNewRoleDisplayName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleTier, setNewRoleTier] = useState("1");

  // New assignment dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRoleId, setAssignRoleId] = useState("");
  const [assignScopeType, setAssignScopeType] = useState("");
  const [assignScopeValue, setAssignScopeValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [rolesRes, modulesRes, permsRes, assignRes] = await Promise.all([
      (supabase as any).from("platform_roles").select("*").order("tier_level"),
      (supabase as any).from("platform_modules").select("*").order("sort_order"),
      (supabase as any).from("platform_role_permissions").select("*"),
      (supabase as any).from("platform_user_roles").select("*").order("is_active", { ascending: false }),
    ]);

    if (rolesRes.error) toast.error("Failed to load roles: " + rolesRes.error.message);
    if (modulesRes.error) toast.error("Failed to load modules: " + modulesRes.error.message);
    if (permsRes.error) toast.error("Failed to load permissions: " + permsRes.error.message);
    if (assignRes.error) toast.error("Failed to load assignments: " + assignRes.error.message);

    setRoles(rolesRes.data || []);
    setModules(modulesRes.data || []);
    setPermissions(permsRes.data || []);
    setAssignments(assignRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPermission = (roleId: string, moduleId: string): Permission | undefined => {
    return permissions.find((p) => p.role_id === roleId && p.module_id === moduleId);
  };

  const togglePermission = (roleId: string, moduleId: string, field: keyof Permission) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.role_id === roleId && p.module_id === moduleId);
      if (existing) {
        return prev.map((p) =>
          p.role_id === roleId && p.module_id === moduleId
            ? { ...p, [field]: !p[field] }
            : p
        );
      }
      const newPerm: Permission = {
        id: `temp-${roleId}-${moduleId}`,
        role_id: roleId,
        module_id: moduleId,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_approve: false,
        can_export: false,
        [field]: true,
      };
      return [...prev, newPerm];
    });
  };

  const savePermissions = async () => {
    setSaving(true);
    for (const perm of permissions) {
      const payload = {
        role_id: perm.role_id,
        module_id: perm.module_id,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete,
        can_approve: perm.can_approve,
        can_export: perm.can_export,
      };

      if (perm.id.startsWith("temp-")) {
        await (supabase as any).from("platform_role_permissions").insert(payload);
      } else {
        await (supabase as any)
          .from("platform_role_permissions")
          .update(payload)
          .eq("id", perm.id);
      }
    }
    toast.success("Permissions saved successfully");
    setSaving(false);
    fetchData();
  };

  const createRole = async () => {
    if (!newRoleName || !newRoleDisplayName) {
      toast.error("Role name and display name are required");
      return;
    }
    const { error } = await (supabase as any).from("platform_roles").insert({
      role_name: newRoleName,
      display_name: newRoleDisplayName,
      description: newRoleDescription || null,
      tier_level: parseInt(newRoleTier),
      is_system_role: false,
    });
    if (error) {
      toast.error("Failed to create role: " + error.message);
      return;
    }
    toast.success("Role created");
    setNewRoleOpen(false);
    setNewRoleName("");
    setNewRoleDisplayName("");
    setNewRoleDescription("");
    setNewRoleTier("1");
    fetchData();
  };

  const deleteRole = async (roleId: string) => {
    const { error } = await (supabase as any)
      .from("platform_roles")
      .delete()
      .eq("id", roleId);
    if (error) {
      toast.error("Failed to delete role: " + error.message);
      return;
    }
    toast.success("Role deleted");
    fetchData();
  };

  const createAssignment = async () => {
    if (!assignEmail || !assignRoleId) {
      toast.error("Email and role are required");
      return;
    }
    const { error } = await (supabase as any).from("platform_user_roles").insert({
      user_id: assignEmail,
      role_id: assignRoleId,
      scope_type: assignScopeType || null,
      scope_value: assignScopeValue || null,
      is_active: true,
    });
    if (error) {
      toast.error("Failed to assign role: " + error.message);
      return;
    }
    toast.success("Role assigned");
    setAssignOpen(false);
    setAssignEmail("");
    setAssignRoleId("");
    setAssignScopeType("");
    setAssignScopeValue("");
    fetchData();
  };

  const revokeAssignment = async (id: string) => {
    const { error } = await (supabase as any)
      .from("platform_user_roles")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      toast.error("Failed to revoke: " + error.message);
      return;
    }
    toast.success("Assignment revoked");
    fetchData();
  };

  const groupedModules = modules.reduce<Record<string, Module[]>>((acc, mod) => {
    const cat = mod.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  const permFields: (keyof Permission)[] = [
    "can_view",
    "can_create",
    "can_edit",
    "can_delete",
    "can_approve",
    "can_export",
  ];

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
        <Shield className="h-7 w-7 text-indigo-600" />
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="roles">Manage Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        {/* Tab 1: Permission Matrix */}
        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Module</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{role.display_name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            T{role.tier_level}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedModules).map(([category, mods]) => (
                    <>
                      <TableRow key={`cat-${category}`}>
                        <TableCell
                          colSpan={roles.length + 1}
                          className="bg-muted/50 font-semibold text-sm"
                        >
                          {category}
                        </TableCell>
                      </TableRow>
                      {mods.map((mod) => (
                        <TableRow key={mod.id}>
                          <TableCell className="text-sm">{mod.display_name}</TableCell>
                          {roles.map((role) => {
                            const perm = getPermission(role.id, mod.id);
                            return (
                              <TableCell key={`${role.id}-${mod.id}`} className="text-center">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {permFields.map((field) => (
                                    <label
                                      key={field}
                                      className="flex items-center gap-0.5 text-[10px]"
                                      title={field.replace("can_", "")}
                                    >
                                      <Checkbox
                                        checked={!!(perm && perm[field])}
                                        onCheckedChange={() =>
                                          togglePermission(role.id, mod.id, field)
                                        }
                                        className="h-3 w-3"
                                      />
                                      <span>{field.replace("can_", "")[0].toUpperCase()}</span>
                                    </label>
                                  ))}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Button onClick={savePermissions} disabled={saving}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </TabsContent>

        {/* Tab 2: Manage Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Role name (e.g. clinic_admin)"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                  <Input
                    placeholder="Display name"
                    value={newRoleDisplayName}
                    onChange={(e) => setNewRoleDisplayName(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Tier level"
                    value={newRoleTier}
                    onChange={(e) => setNewRoleTier(e.target.value)}
                  />
                  <Button onClick={createRole} className="w-full">
                    Create Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {role.is_system_role && <Lock className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.display_name}</span>
                        <Badge variant="outline">Tier {role.tier_level}</Badge>
                        {role.is_system_role && (
                          <Badge variant="secondary">System</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description || role.role_name}
                      </p>
                    </div>
                  </div>
                  {!role.is_system_role && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: User Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Role to User</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="User email or ID"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                  />
                  <Select value={assignRoleId} onValueChange={setAssignRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Scope type (e.g. clinic, global)"
                    value={assignScopeType}
                    onChange={(e) => setAssignScopeType(e.target.value)}
                  />
                  <Input
                    placeholder="Scope value"
                    value={assignScopeValue}
                    onChange={(e) => setAssignScopeValue(e.target.value)}
                  />
                  <Button onClick={createAssignment} className="w-full">
                    Assign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => {
                    const role = roles.find((r) => r.id === a.role_id);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-mono">
                          {a.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {role?.display_name || a.role_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.scope_type ? `${a.scope_type}: ${a.scope_value}` : "Global"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={a.is_active ? "default" : "secondary"}
                          >
                            {a.is_active ? "Active" : "Revoked"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeAssignment(a.id)}
                              className="text-red-600"
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
