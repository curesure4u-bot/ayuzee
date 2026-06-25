import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, AlertTriangle, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type IP = {
  id: string;
  label: string;
  ip_address: string;
  branch_id: string | null;
  is_active: boolean;
  added_by: string | null;
  notes: string | null;
  created_at: string;
};

type Branch = { id: string; branch_name: string };

const TrustedIpMaster = () => {
  const [rows, setRows] = useState<IP[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "", ip_address: "", branch_id: "", notes: "" });
  const [detectedIp, setDetectedIp] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, b] = await Promise.all([
      supabase.from("hms_trusted_ips").select("*").order("created_at", { ascending: false }),
      supabase.from("hms_branches").select("id, branch_name").order("name"),
    ]);
    setRows((r.data as IP[]) || []);
    setBranches(((b.data as any) ?? []) as Branch[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const detectIp = async () => {
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const j = await r.json();
      setDetectedIp(j.ip);
    } catch { toast.error("Could not detect IP"); }
  };

  const addIp = async () => {
    if (!form.label || !form.ip_address) { toast.error("Label and IP required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("hms_trusted_ips").insert({
      label: form.label, ip_address: form.ip_address,
      branch_id: form.branch_id || null, notes: form.notes || null,
      added_by: user?.id ?? null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("IP added");
    setOpen(false);
    setForm({ label: "", ip_address: "", branch_id: "", notes: "" });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("hms_trusted_ips").update({ is_active: active }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this trusted IP?")) return;
    const { error } = await supabase.from("hms_trusted_ips").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const branchName = (id: string | null) => branches.find((b) => b.id === id)?.name ?? "All branches";

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🔒 Trusted IP Master"
        description="Restrict HMS Tools Ultra access to approved clinic IP addresses."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={detectIp}>
              <Search className="mr-2 h-4 w-4" />Detect My Current IP
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add IP Address</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add trusted IP</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Kadayanallur Main" /></div>
                  <div><Label>IP Address</Label><Input value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} placeholder="203.0.113.42" /></div>
                  <div>
                    <Label>Branch</Label>
                    <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                      <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.branch_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={addIp}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          If you enable IP restriction, HMS Tools Ultra access will be blocked from any IP not listed here. Add all clinic IPs first.
        </AlertDescription>
      </Alert>

      {detectedIp && (
        <Alert className="mb-4">
          <AlertTitle>Your current IP</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            <code className="rounded bg-muted px-2 py-1 font-mono">{detectedIp}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(detectedIp); toast.success("Copied"); }}>
              <Copy className="mr-1 h-3 w-3" />Copy
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead><TableHead>IP Address</TableHead>
              <TableHead>Branch</TableHead><TableHead>Status</TableHead>
              <TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              : rows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No trusted IPs yet.</TableCell></TableRow>
              : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="font-mono text-xs">{r.ip_address}</TableCell>
                  <TableCell className="text-xs">{branchName(r.branch_id)}</TableCell>
                  <TableCell><Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.created_at.slice(0, 10)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TrustedIpMaster;
