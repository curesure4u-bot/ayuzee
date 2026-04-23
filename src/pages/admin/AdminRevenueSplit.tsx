import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Row { key: string; value: number; description: string | null; }

const KEYS = ["therapist_pct", "venue_pct", "doctor_pct", "platform_pct"] as const;

const AdminRevenueSplit = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("revenue_split_config").select("*").in("key", KEYS as unknown as string[]);
    const list = (data ?? []) as Row[];
    setRows(list);
    setDraft(Object.fromEntries(list.map(r => [r.key, String(r.value)])));
    setLoading(false);
  };
  useEffect(() => { document.title = "Revenue Split — Admin"; load(); }, []);

  const total = KEYS.reduce((s, k) => s + Number(draft[k] ?? 0), 0);

  const save = async () => {
    if (Math.abs(total - 100) > 0.01) return toast.error("Percentages must total exactly 100%");
    setSaving(true);
    for (const k of KEYS) {
      await supabase.from("revenue_split_config").update({ value: Number(draft[k]) }).eq("key", k);
    }
    setSaving(false);
    toast.success("Revenue split updated. Applies to new sessions only.");
    load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Revenue split</h1><p className="text-sm text-muted-foreground">Adjust how each therapy fee is divided. Changes apply to new sessions only.</p></div>
      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Card>
          <CardHeader><CardTitle>Percentages (must total 100%)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {rows.map(r => (
              <div key={r.key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <Label className="capitalize">{r.key.replace("_pct", "").replace("_", " ")}</Label>
                <Input type="number" step="0.5" value={draft[r.key] ?? ""} onChange={(e) => setDraft({ ...draft, [r.key]: e.target.value })} />
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            ))}
            <div className={`text-sm font-medium ${Math.abs(total - 100) < 0.01 ? "text-foreground" : "text-destructive"}`}>Total: {total}%</div>
            <Button onClick={save} disabled={saving || Math.abs(total - 100) > 0.01}>{saving ? "Saving…" : "Save changes"}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminRevenueSplit;
