import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, UserPlus, Trash2, Mail, Clock } from "lucide-react";

const ROLES = [
  { role: "admin", label: "Admin", icon: "👑", color: "bg-blue-600", textColor: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", description: "Full platform access — all menus, all data", access: ["All Menus", "All Data", "Settings", "Finance"] },
  { role: "product_admin", label: "Product Admin", icon: "🛒", color: "bg-amber-500", textColor: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", description: "Manage products, blogs, and store content only", access: ["Products", "Blogs", "Therapies Catalog"] },
  { role: "orders_admin", label: "Orders Admin", icon: "📦", color: "bg-green-600", textColor: "text-green-700", bg: "bg-green-50", border: "border-green-200", description: "Manage orders, dispatch, and prescription orders", access: ["Orders", "Prescriptions", "Logistics"] },
  { role: "accounts_admin", label: "Accounts Admin", icon: "💰", color: "bg-purple-600", textColor: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", description: "Finance, commissions, payouts, and reports only", access: ["Commissions", "Payments", "Reports"] },
  { role: "doctor_admin", label: "Doctor Admin", icon: "🩺", color: "bg-rose-600", textColor: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", description: "Manage doctors, therapists, venues, and appointments", access: ["Doctors", "Therapists", "Appointments"] },
  { role: "content_admin", label: "Content Admin", icon: "📚", color: "bg-sky-600", textColor: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", description: "Blogs, learning modules, webinars, jobs board", access: ["Blogs", "Learning", "Jobs Board"] },
  { role: "ayush_admin", label: "AYUSH Help Admin", icon: "❤️", color: "bg-pink-600", textColor: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200", description: "ATMRI cases, safety flags, notifications", access: ["ATMRI Help", "Safety", "Notifications"] },
  { role: "support_admin", label: "Support Admin", icon: "👥", color: "bg-teal-600", textColor: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", description: "View all users and send WhatsApp messages only", access: ["All Users (view)", "WhatsApp"] },
];

type TeamMember = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null;
};

const AdminTeam = () => {
  usePageSEO({ title: "Team Management — Admin", noIndex: true });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [granting, setGranting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("user_roles")
      .select("id, user_id, role, created_at, profiles(full_name, email, phone)")
      .in("role", ROLES.map(r => r.role))
      .order("created_at", { ascending: false });
    setTeam(data || []);
    setLoading(false);
  };

  useEffect(() => { load();
  }, []);

  const grant = async (role: string) => {
    const email = emailInputs[role]?.trim().toLowerCase();
    if (!email) return toast.error("Enter an email address");

    setGranting(role);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        toast.error(`No account found for ${email}. Ask them to sign up at ayuzee.com/admin/auth first.`);
        return;
      }

      if (team.find(t => t.user_id === profile.user_id && t.role === role)) {
        toast.error(`${email} already has ${role} access`);
        return;
      }

      const { error } = await (supabase as any).from("user_roles").upsert({ user_id: profile.user_id, role });
      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      await (supabase as any).from("admin_team_log").insert({
        action: "grant",
        granted_by: session?.user.id,
        granted_to: profile.user_id,
        role,
        notes: "Granted by Super Admin",
      });

      toast.success(`✅ ${ROLES.find(r => r.role === role)?.label} access granted to ${profile.full_name || email}`);
      setEmailInputs(prev => ({ ...prev, [role]: "" }));
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to grant access");
    } finally {
      setGranting(null);
    }
  };

  const revoke = async (member: TeamMember) => {
    const roleLabel = ROLES.find(r => r.role === member.role)?.label || member.role;
    const name = member.profiles?.email || member.user_id;
    if (!window.confirm(`Remove ${roleLabel} access from ${name}?`)) return;

    await (supabase as any).from("user_roles").delete().eq("id", member.id);
    const { data: { session } } = await supabase.auth.getSession();
    await (supabase as any).from("admin_team_log").insert({
      action: "revoke",
      granted_by: session?.user.id,
      granted_to: member.user_id,
      role: member.role,
    });
    toast.success(`${roleLabel} access removed from ${name}`);
    load();
  };

  const membersByRole = ROLES.reduce((acc, r) => {
    acc[r.role] = team.filter(m => m.role === r.role);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Team Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Delegate admin access to your support team. Super Admin (you) controls all roles.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{team.length}</div>
          <div className="text-xs text-muted-foreground">Team members</div>
        </div>
      </div>

      <Card className="border-blue-300 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ Super Admin
            <Badge variant="secondary">Protected</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Full platform access. This role cannot be delegated or removed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-white p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white text-sm font-bold">SA</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">Dr. Mohamed Saleem</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> curesure4u@gmail.com
              </p>
            </div>
            <Badge className="bg-blue-600">Super Admin</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {ROLES.filter(r => r.role !== "admin").map(roleDef => {
          const members = membersByRole[roleDef.role] || [];
          return (
            <Card key={roleDef.role} className={`${roleDef.border} ${roleDef.bg}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{roleDef.icon}</span>
                      <span className={roleDef.textColor}>{roleDef.label}</span>
                      {members.length > 0 && (
                        <Badge variant="secondary" className="ml-2">{members.length} active</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{roleDef.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {roleDef.access.map(a => (
                        <span key={a} className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] text-muted-foreground">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={emailInputs[roleDef.role] || ""}
                    onChange={e => setEmailInputs(prev => ({ ...prev, [roleDef.role]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && grant(roleDef.role)}
                    className="flex-1 text-sm bg-white"
                  />
                  <Button
                    onClick={() => grant(roleDef.role)}
                    disabled={granting === roleDef.role}
                    className={`shrink-0 gap-1.5 ${roleDef.color} hover:opacity-90 text-white`}
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    {granting === roleDef.role ? "Granting..." : "Grant"}
                  </Button>
                </div>

                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No one assigned yet — enter email above to grant access
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center gap-3 rounded-md border border-border bg-white p-3">
                        <div className={`grid h-9 w-9 place-items-center rounded-full ${roleDef.color} text-white text-sm font-semibold`}>
                          {(member.profiles?.full_name || member.profiles?.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {member.profiles?.full_name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.profiles?.email || member.user_id}
                          </p>
                          {member.profiles?.phone && (
                            <p className="text-xs text-muted-foreground">📞 {member.profiles.phone}</p>
                          )}
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(member.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revoke(member)}
                          title="Remove access"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📋 How to add a team member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Ask your team member to go to <strong>ayuzee.com/admin/auth</strong> and create an account with their work email.</p>
          <p>2. Come back here → find their role card → enter their email → click <strong>Grant</strong>.</p>
          <p>3. They log in at <strong>ayuzee.com/admin/auth</strong> — they will see only their permitted sections.</p>
          <p>4. To remove access at any time: click the red trash icon next to their name.</p>
          <p className="pt-2 text-foreground">
            🔒 <strong>Security:</strong> Each role has strict access limits. Product Admin cannot see orders. Accounts Admin cannot change products. Only you (Super Admin) can grant or revoke roles.
          </p>
        </CardContent>
      </Card>

      {loading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
};

export default AdminTeam;
