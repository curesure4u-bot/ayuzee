import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Upload, Eye, RefreshCw, Database } from "lucide-react";
import { Link } from "react-router-dom";

type Disease = {
  id: string;
  category_id: string | null;
  chapter_number: number | null;
  name: string;
  name_modern: string | null;
  is_published: boolean;
  definition: string | null;
};

type Category = { id: string; name: string; icon: string | null };
type AuditRow = { id: string; action: string; created_at: string; details: any; actor_id: string | null };

export default function ASTGManagement() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Disease | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvDisease, setCsvDisease] = useState<string>("");

  async function load() {
    setLoading(true);
    const [{ data: dxs }, { data: cats }, { data: aud }] = await Promise.all([
      supabase.from("astg_diseases").select("id,category_id,chapter_number,name,name_modern,is_published,definition").order("chapter_number"),
      supabase.from("astg_categories").select("id,name,icon").order("sort_order"),
      supabase.from("astg_audit_log").select("id,action,created_at,details,actor_id").order("created_at", { ascending: false }).limit(20),
    ]);
    setDiseases((dxs as Disease[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setAudit((aud as AuditRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function runSeed() {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-astg-data");
      if (error) throw error;
      toast.success(`Seeded: +${(data as any).diseases_added} diseases, +${(data as any).categories_added} categories`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Seed failed");
    } finally { setSeeding(false); }
  }

  async function togglePublish(d: Disease) {
    const { error } = await supabase.from("astg_diseases").update({ is_published: !d.is_published }).eq("id", d.id);
    if (error) return toast.error(error.message);
    const { data: sess } = await supabase.auth.getUser();
    await supabase.from("astg_audit_log").insert({
      actor_id: sess.user?.id, action: d.is_published ? "unpublish" : "publish", disease_id: d.id,
      details: { name: d.name },
    });
    toast.success(`${d.name} ${d.is_published ? "unpublished" : "published"}`);
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    const { error } = await supabase.from("astg_diseases").update({
      name: editing.name, name_modern: editing.name_modern, definition: editing.definition, category_id: editing.category_id,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    const { data: sess } = await supabase.auth.getUser();
    await supabase.from("astg_audit_log").insert({
      actor_id: sess.user?.id, action: "edit", disease_id: editing.id, details: { name: editing.name },
    });
    toast.success("Saved");
    setEditing(null);
    load();
  }

  async function importCsv() {
    if (!csvDisease) return toast.error("Pick a disease");
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return toast.error("CSV needs a header + at least one row");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const idx = (k: string) => headers.indexOf(k);
    const rows = lines.slice(1).map((ln, i) => {
      const cols = ln.split(",").map(c => c.trim());
      return {
        disease_id: csvDisease,
        medicine_name: cols[idx("medicine_name")] ?? cols[0],
        dosha_type: idx("dosha_type") >= 0 ? cols[idx("dosha_type")] : null,
        formulation_type: idx("formulation_type") >= 0 ? cols[idx("formulation_type")] : null,
        dose: idx("dose") >= 0 ? cols[idx("dose")] : null,
        anupana: idx("anupana") >= 0 ? cols[idx("anupana")] : null,
        duration: idx("duration") >= 0 ? cols[idx("duration")] : null,
        notes: idx("notes") >= 0 ? cols[idx("notes")] : null,
        sort_order: i,
      };
    }).filter(r => r.medicine_name);

    const { error } = await supabase.from("astg_medicines").insert(rows);
    if (error) return toast.error(error.message);
    const { data: sess } = await supabase.auth.getUser();
    await supabase.from("astg_audit_log").insert({
      actor_id: sess.user?.id, action: "import_medicines", disease_id: csvDisease,
      details: { count: rows.length },
    });
    toast.success(`Imported ${rows.length} medicines`);
    setCsvOpen(false); setCsvText(""); setCsvDisease("");
    load();
  }

  const filtered = diseases.filter(d =>
    !filter || d.name.toLowerCase().includes(filter.toLowerCase()) || (d.name_modern ?? "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">ASTG Content Management</h1>
          <p className="text-sm text-muted-foreground">Manage the 38 Ayurveda Standard Treatment Guideline protocols.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button onClick={runSeed} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Database className="h-4 w-4 mr-1" />}
            Seed 38 Diseases
          </Button>
          <Button variant="secondary" onClick={() => setCsvOpen(true)}><Upload className="h-4 w-4 mr-1" />Import Medicines (CSV)</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diseases ({filtered.length})</CardTitle>
          <Input placeholder="Search…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ch.</TableHead>
                <TableHead>Sanskrit</TableHead>
                <TableHead>Modern</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => {
                const cat = categories.find(c => c.id === d.category_id);
                return (
                  <TableRow key={d.id}>
                    <TableCell>{d.chapter_number ?? "—"}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.name_modern ?? "—"}</TableCell>
                    <TableCell>{cat ? <Badge variant="outline">{cat.icon} {cat.name}</Badge> : "—"}</TableCell>
                    <TableCell><Switch checked={d.is_published} onCheckedChange={() => togglePublish(d)} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>Edit</Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/doctor/astg-reference" target="_blank"><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length && !loading && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No diseases. Click "Seed 38 Diseases" to populate.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {audit.map(a => (
            <div key={a.id} className="text-sm flex justify-between border-b pb-1">
              <span><Badge variant="outline" className="mr-2">{a.action}</Badge>{a.details?.name ?? a.details?.count ?? ""}</span>
              <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
            </div>
          ))}
          {!audit.length && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Disease</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Sanskrit name" />
              <Input value={editing.name_modern ?? ""} onChange={(e) => setEditing({ ...editing, name_modern: e.target.value })} placeholder="Modern equivalent" />
              <Textarea value={editing.definition ?? ""} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} placeholder="Definition" rows={4} />
              <select className="w-full border rounded p-2 bg-background" value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}>
                <option value="">— No category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Import Medicines (CSV)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Target Disease</label>
              <select className="w-full border rounded p-2 bg-background" value={csvDisease} onChange={(e) => setCsvDisease(e.target.value)}>
                <option value="">— Select disease —</option>
                {diseases.map(d => <option key={d.id} value={d.id}>{d.name} · {d.name_modern}</option>)}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Required header: <code>medicine_name</code>. Optional: <code>dosha_type, formulation_type, dose, anupana, duration, notes</code>.
            </p>
            <Textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={10}
              placeholder="medicine_name,dosha_type,dose,duration&#10;Trikatu Churna,kapha,3g BD,2 weeks" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvOpen(false)}>Cancel</Button>
            <Button onClick={importCsv}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
