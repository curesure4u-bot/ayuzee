import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminEssentialHomeopathyDrugs = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    (supabase as any).from("essential_homeopathy_drugs")
      .select("id, serial_no, name, slug, kingdom, available_potencies, available_forms")
      .order("serial_no").limit(500)
      .then(({ data }: any) => { setRows(data || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this remedy?")) return;
    const { error } = await (supabase as any).from("essential_homeopathy_drugs").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const filtered = rows.filter((r) => q === "" || r.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Essential Homeopathy Drugs</h1>
        <p className="text-sm text-muted-foreground">{rows.length} remedies in library</p>
      </div>
      <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="border rounded-lg divide-y">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs text-muted-foreground w-8">{r.serial_no}</span>
                <span className="font-medium truncate">{r.name}</span>
                <Badge variant="outline" className="text-[10px]">{r.kingdom}</Badge>
                <div className="flex gap-1">
                  {r.available_potencies?.slice(0, 4).map((p: string) => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{p}</span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminEssentialHomeopathyDrugs;
