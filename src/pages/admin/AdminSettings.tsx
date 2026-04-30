import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type Flag = { key: string; enabled: boolean; description: string | null };
type Info = { id: string; brand_name: string; support_email: string; phone: string; address: string };
type Admin = { id: string; user_id: string; profiles?: { email: string | null; full_name: string | null } | null };

const AdminSettings = () => {
  const [splits, setSplits] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<Partial<Info>>({});
  const [flags, setFlags] = useState<Flag[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [productEmail, setProductEmail] = useState("");
  const [productAdmins, setProductAdmins] = useState<Admin[]>([]);

  const load = async () => {
    const [s, i, f, a, pa] = await Promise.all([
      (supabase as any).from("revenue_split_config").select("key,value"),
      (supabase as any).from("company_info").select("*").limit(1).maybeSingle(),
      (supabase as any).from("feature_flags").select("*"),
      (supabase as any).from("user_roles").select("id,user_id,profiles(email,full_name)").eq("role", "admin"),
      (supabase as any).from("user_roles").select("id, user_id, profiles(email, full_name)").eq("role", "product_admin"),
    ]);
    setSplits(Object.fromEntries((s.data ?? []).map((r: any) => [r.key, String(r.value)])));
    setInfo(i.data ?? {});
    setFlags(f.data ?? []);
    setAdmins(a.data ?? []);
    setProductAdmins(pa.data ?? []);
  };

  useEffect(() => { document.title = "Settings — Admin"; load(); }, []);

  const saveSplits = async () => {
    const total = Object.values(splits).reduce((a, v) => a + Number(v || 0), 0);
    if (Math.abs(total - 100) > .01) return toast.error("Revenue split must total 100%");
    for (const [key, value] of Object.entries(splits)) await (supabase as any).from("revenue_split_config").upsert({ key, value: Number(value) });
    toast.success("Revenue split saved");
  };
  const saveInfo = async () => { await (supabase as any).from("company_info").upsert(info); toast.success("Platform info saved"); load(); };
  const toggle = async (f: Flag) => { await (supabase as any).from("feature_flags").update({ enabled: !f.enabled }).eq("key", f.key); load(); };
  const grant = async () => {
    const { data: p } = await supabase.from("profiles").select("user_id").eq("email", email).maybeSingle();
    if (!p) return toast.error("User not found");
    await (supabase as any).from("user_roles").upsert({ user_id: p.user_id, role: "admin" });
    toast.success("Admin granted"); setEmail(""); load();
  };
  const remove = async (id: string) => { await (supabase as any).from("user_roles").delete().eq("id", id); toast.success("Admin removed"); load(); };

  const grantProductAdmin = async () => {
    if (!productEmail.trim()) return toast.error("Enter an email address");
    const { data: p } = await supabase.from("profiles").select("user_id").eq("email", productEmail.trim().toLowerCase()).maybeSingle();
    if (!p) return toast.error("No account found with that email. Ask them to sign up at /admin/auth first.");
    const { error } = await (supabase as any).from("user_roles").upsert({ user_id: p.user_id, role: "product_admin" });
    if (error) return toast.error(error.message);
    toast.success(`✅ Product Admin access granted to ${productEmail}`);
    setProductEmail(""); load();
  };
  const removeProductAdmin = async (id: string) => {
    await (supabase as any).from("user_roles").delete().eq("id", id);
    toast.success("Product Admin access removed"); load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage platform configuration, admins, and feature flags.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue Split Config</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          {Object.keys(splits).map(k => (
            <div key={k}>
              <Label>{k.replace(/_/g, " ")}</Label>
              <Input type="number" value={splits[k]} onChange={e => setSplits({ ...splits, [k]: e.target.value })} />
            </div>
          ))}
          <Button className="self-end" onClick={saveSplits}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platform Info</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Platform name" value={info.brand_name ?? ""} onChange={e => setInfo({ ...info, brand_name: e.target.value })} />
          <Input placeholder="Support email" value={info.support_email ?? ""} onChange={e => setInfo({ ...info, support_email: e.target.value })} />
          <Input placeholder="Support phone" value={info.phone ?? ""} onChange={e => setInfo({ ...info, phone: e.target.value })} />
          <Input placeholder="Address" value={info.address ?? ""} onChange={e => setInfo({ ...info, address: e.target.value })} />
          <Button onClick={saveInfo}>Save info</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Admin Accounts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="User email" value={email} onChange={e => setEmail(e.target.value)} />
            <Button onClick={grant}>Grant admin</Button>
          </div>
          {admins.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <span>{a.profiles?.email ?? a.user_id}</span>
              <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>Remove</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛒 Product Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Product Admins can only manage products and blogs. They cannot access orders, users, finance, or settings.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="user@example.com"
              value={productEmail}
              onChange={e => setProductEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && grantProductAdmin()}
            />
            <Button onClick={grantProductAdmin}>Grant Product Admin</Button>
          </div>

          {productAdmins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No product admins assigned yet</p>
          ) : (
            <div className="space-y-2">
              {productAdmins.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{a.profiles?.full_name || "—"}</span>
                    <span className="text-sm text-muted-foreground">{a.profiles?.email || a.user_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Product Admin</Badge>
                    <Button size="sm" variant="destructive" onClick={() => removeProductAdmin(a.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to set up a Product Admin:</p>
            <ol className="ml-4 mt-1 list-decimal space-y-0.5">
              <li>Ask them to sign up at ayuzee.com/admin/auth with their email</li>
              <li>Enter their email above and click "Grant Product Admin"</li>
              <li>They login at the same /admin/auth page</li>
              <li>They will only see Products and Blogs — nothing else</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {flags.map(f => (
            <div key={f.key} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="font-medium">{f.key}</p>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
              <Switch checked={f.enabled} onCheckedChange={() => toggle(f)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
