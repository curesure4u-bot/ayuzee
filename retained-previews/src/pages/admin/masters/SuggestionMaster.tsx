import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Sug = {
  id: string;
  suggestion_type: string;
  ayush_system: string | null;
  language: string;
  suggestion_text: string;
  short_code: string | null;
  is_active: boolean;
  usage_count: number;
};

const TYPES = [
  { value: "chief_complaint", label: "Chief Complaints" },
  { value: "diagnosis", label: "Diagnoses" },
  { value: "examination", label: "Examination" },
  { value: "treatment_advice", label: "Treatment" },
  { value: "diet_advice", label: "Diet" },
  { value: "medicine_name", label: "Medicines" },
  { value: "referral_note", label: "Referral" },
];

const empty = { id: "", suggestion_type: "chief_complaint", suggestion_text: "", short_code: "", ayush_system: "Ayurveda" };

const SuggestionMaster = () => {
  const [rows, setRows] = useState<Sug[]>([]);
  const [tab, setTab] = useState("chief_complaint");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("hms_suggestions").select("*").order("usage_count", { ascending: false });
    setRows(((data as any) ?? []) as Sug[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => r.suggestion_type === tab && (!q || r.suggestion_text.toLowerCase().includes(q) || (r.short_code || "").toLowerCase().includes(q)));
  }, [rows, tab, search]);

  const save = async () => {
    if (!form.suggestion_text) { toast.error("Text required"); return; }
    const payload: any = {
      suggestion_type: form.suggestion_type, suggestion_text: form.suggestion_text,
      short_code: form.short_code || null, ayush_system: form.ayush_system,
    };
    const q = form.id
      ? supabase.from("hms_suggestions").update(payload).eq("id", form.id)
      : supabase.from("hms_suggestions").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setForm({ ...empty, suggestion_type: tab }); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_suggestions").delete().eq("id", id);
    load();
  };
  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_suggestions").update({ is_active: v }).eq("id", id);
    load();
  };

  const onCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [headerLine, ...body] = lines;
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
    const idx = (k: string) => headers.indexOf(k);
    const rowsToInsert = body.map((l) => {
      const cols = l.split(",");
      return {
        suggestion_type: cols[idx("type")]?.trim(),
        suggestion_text: cols[idx("text")]?.trim(),
        short_code: cols[idx("short_code")]?.trim() || null,
        ayush_system: cols[idx("ayush_system")]?.trim() || null,
      };
    }).filter((r) => r.suggestion_type && r.suggestion_text);
    if (rowsToInsert.length === 0) { toast.error("No valid rows"); return; }
    const { error } = await supabase.from("hms_suggestions").insert(rowsToInsert);
    if (error) { toast.error(error.message); return; }
    toast.success(`Imported ${rowsToInsert.length} rows`);
    load();
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="💡 Suggestion Master"
        description="Autocomplete for complaints, diagnosis, diet advice — used in consultations."
        actions={
          <>
            <label>
              <input type="file" accept=".csv" hidden onChange={onCsv} />
              <Button size="sm" variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Import CSV</span></Button>
            </label>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm({ ...empty, suggestion_type: tab }); }}>
              <DialogTrigger asChild><Button size="sm" onClick={() => setForm({ ...empty, suggestion_type: tab })}><Plus className="mr-2 h-4 w-4" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} suggestion</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.suggestion_type} onValueChange={(v) => setForm({ ...form, suggestion_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Short code</Label><Input value={form.short_code} onChange={(e) => setForm({ ...form, short_code: e.target.value })} placeholder="bkp" /></div>
                    <div><Label>AYUSH system</Label><Input value={form.ayush_system} onChange={(e) => setForm({ ...form, ayush_system: e.target.value })} /></div>
                  </div>
                  <div><Label>Text</Label><Textarea value={form.suggestion_text} onChange={(e) => setForm({ ...form, suggestion_text: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-3">
        <TabsList className="flex-wrap">
          {TYPES.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Input placeholder="Search within this tab…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />

      <div className="space-y-2">
        {filtered.map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-3">
            <div className="flex flex-1 items-center gap-3">
              {s.short_code && <Badge variant="outline" className="font-mono">{s.short_code}</Badge>}
              <span className="text-sm">{s.suggestion_text}</span>
              {s.usage_count > 0 && <Badge className="ml-auto bg-primary/10 text-primary" variant="outline">{s.usage_count} uses</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={s.is_active} onCheckedChange={(v) => toggle(s.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => { setForm({ id: s.id, suggestion_type: s.suggestion_type, suggestion_text: s.suggestion_text, short_code: s.short_code || "", ayush_system: s.ayush_system || "Ayurveda" }); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No suggestions in this tab.</p>}
      </div>
    </div>
  );
};

export default SuggestionMaster;
