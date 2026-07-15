import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Plus, Copy, Trash2, Code2 } from "lucide-react";
import { toast } from "sonner";

const DeveloperApi = () => {
  const { userId } = useDoctor();
  const [keys, setKeys] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apiBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dev-api`;

  const load = async () => {
    if (!userId) return;
    const { data } = await (supabase as any)
      .from("developer_api_keys")
      .select("*")
      .eq("doctor_user_id", userId)
      .order("created_at", { ascending: false });
    setKeys(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const createKey = async () => {
    if (label.trim().length < 2) return toast.error("Label required");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("dev-api-keys", { body: { label } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setNewKey(data.key);
      setLabel("");
      load();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setBusy(false); }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this API key? Apps using it will stop working immediately.")) return;
    const { error } = await (supabase as any).from("developer_api_keys").update({ revoked: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Revoked");
    load();
  };

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl flex items-center gap-2"><Code2 className="h-5 w-5" /> Developer APIs</h1>
            <p className="text-xs text-muted-foreground mt-1">Issue API keys for partner apps to read your patients & consultations.</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setNewKey(null); }}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New API key</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create API key</DialogTitle></DialogHeader>
              {!newKey ? (
                <div className="space-y-3">
                  <div>
                    <Label>Label</Label>
                    <Input placeholder="e.g. My EHR Integration" value={label} onChange={(e) => setLabel(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">Default scopes: <code>read:patients</code>, <code>read:consultations</code></p>
                  <DialogFooter><Button onClick={createKey} disabled={busy}>{busy ? "Creating…" : "Create key"}</Button></DialogFooter>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                    <p className="text-sm font-semibold text-destructive">⚠️ Copy this key now. It won't be shown again.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-muted p-2 text-xs">{newKey}</code>
                    <Button size="sm" variant="outline" onClick={() => copy(newKey)}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <DialogFooter><Button onClick={() => setOpen(false)}>Done</Button></DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-lg">Your keys</h2>
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{k.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {k.key_prefix}… · created {new Date(k.created_at).toLocaleDateString()}
                      {k.last_used_at && ` · last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {k.revoked ? <Badge variant="outline">Revoked</Badge> : <Badge variant="secondary">Active</Badge>}
                  {!k.revoked && (
                    <Button size="sm" variant="ghost" onClick={() => revoke(k.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-lg">API reference</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">Base URL</p>
            <code className="block rounded bg-muted p-2 text-xs">{apiBase}</code>
          </div>
          <div>
            <p className="font-semibold">Authentication</p>
            <p className="text-muted-foreground">Send your key in the <code>x-api-key</code> header.</p>
          </div>
          <div>
            <p className="font-semibold">Endpoints</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li><code>GET /patients?limit=50</code> — list your patients</li>
              <li><code>GET /consultations?limit=50</code> — list consultations</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Example</p>
            <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
{`curl "${apiBase}/patients" \\
  -H "x-api-key: ayz_..."`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeveloperApi;
