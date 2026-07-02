import { usePageSEO } from "@/hooks/usePageSEO";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronLeft, ChevronRight, Save, Check, X } from "lucide-react";

type Status = "all" | "pending" | "extracted" | "reviewed" | "approved" | "rejected";

interface Formulation {
  id: string;
  afi_number: string | null;
  afi_part: number | null;
  name: string;
  name_original: string | null;
  formulation_type_id: string | null;
  classical_reference: string | null;
  classical_text: string | null;
  chapter_reference: string | null;
  verse_numbers: string | null;
  dose: string | null;
  dose_min: string | null;
  dose_max: string | null;
  dose_unit: string | null;
  indications: string[] | null;
  indications_modern: string[] | null;
  special_notes: string | null;
  is_published: boolean;
  extraction_status: string;
  raw_text: string | null;
  rejection_reason: string | null;
}

interface Ingredient {
  id?: string;
  formulation_id?: string;
  serial_number: number | null;
  name: string;
  name_sanskrit: string | null;
  common_name: string | null;
  part_used: string | null;
  part_used_full: string | null;
  quantity: number | null;
  unit: string | null;
  is_prakshepa: boolean;
}

interface FType { id: string; code: string; name: string }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-200 text-gray-800",
  extracted: "bg-orange-100 text-orange-800",
  reviewed: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminAfiManagement() {
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<FType[]>([]);
  const [rows, setRows] = useState<Formulation[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status>("extracted");
  const [partFilter, setPartFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ total: 0, pending: 0, extracted: 0, reviewed: 0, approved: 0, rejected: 0 });
  const [openId, setOpenId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Formulation | null>(null);
  const [editIngs, setEditIngs] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);

  usePageSEO({ title: "AFI Management — Admin", noIndex: true });

  const fetchAll = async () => {
    setLoading(true);
    const { data: t } = await supabase.from("afi_formulation_types").select("id,code,name").order("sort_order");
    setTypes((t as FType[]) || []);

    let q = supabase.from("afi_formulations").select("*").order("afi_number", { ascending: true, nullsFirst: false });
    if (statusFilter !== "all") {
      if (statusFilter === "approved") q = q.eq("is_published", true);
      else q = q.eq("extraction_status", statusFilter);
    }
    if (partFilter !== "all") q = q.eq("afi_part", Number(partFilter));
    if (typeFilter !== "all") q = q.eq("formulation_type_id", typeFilter);
    if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
    const { data, error } = await q.limit(500);
    if (error) toast.error(error.message);
    setRows((data as Formulation[]) || []);

    const { data: counts } = await supabase.from("afi_formulations").select("extraction_status,is_published");
    const c = { total: 0, pending: 0, extracted: 0, reviewed: 0, approved: 0, rejected: 0 };
    (counts || []).forEach((r: any) => {
      c.total++;
      if (r.is_published) c.approved++;
      else if (r.extraction_status === "rejected") c.rejected++;
      else if (r.extraction_status === "reviewed") c.reviewed++;
      else if (r.extraction_status === "extracted") c.extracted++;
      else c.pending++;
    });
    setCounts(c);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [statusFilter, partFilter, typeFilter]);

  const openReview = async (id: string) => {
    setOpenId(id);
    const { data: f } = await supabase.from("afi_formulations").select("*").eq("id", id).single();
    setEditForm(f as Formulation);
    const { data: ings } = await supabase
      .from("afi_ingredients").select("*").eq("formulation_id", id).order("serial_number");
    setEditIngs((ings as Ingredient[]) || []);
  };

  const closeReview = () => { setOpenId(null); setEditForm(null); setEditIngs([]); };

  const navigateSibling = (dir: 1 | -1) => {
    if (!openId) return;
    const idx = rows.findIndex(r => r.id === openId);
    const next = rows[idx + dir];
    if (next) openReview(next.id);
  };

  const saveEdits = async (publish = false, reject = false) => {
    if (!editForm) return;
    setSaving(true);
    const status = reject ? "rejected" : publish ? "approved" : "reviewed";
    const update: any = {
      afi_number: editForm.afi_number,
      name: editForm.name,
      formulation_type_id: editForm.formulation_type_id,
      classical_reference: editForm.classical_reference,
      dose: editForm.dose,
      indications: editForm.indications,
      indications_modern: editForm.indications_modern,
      special_notes: editForm.special_notes,
      extraction_status: status,
      is_published: publish,
      rejection_reason: reject ? editForm.rejection_reason : null,
      reviewed_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("afi_formulations").update(update).eq("id", editForm.id);
    if (error) { toast.error(error.message); setSaving(false); return; }

    // replace ingredients
    await supabase.from("afi_ingredients").delete().eq("formulation_id", editForm.id);
    if (editIngs.length > 0) {
      await supabase.from("afi_ingredients").insert(
        editIngs.map(i => ({ ...i, id: undefined, formulation_id: editForm.id }))
      );
    }
    await supabase.from("afi_extraction_log").insert({
      formulation_id: editForm.id, action: status, notes: reject ? editForm.rejection_reason : null,
    });
    toast.success(reject ? "Rejected" : publish ? "Approved & published" : "Saved");
    setSaving(false);
    await fetchAll();
    if (publish || reject) closeReview();
  };

  const updateInd = (key: "indications" | "indications_modern", val: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [key]: val.split(",").map(s => s.trim()).filter(Boolean) });
  };

  const addIng = () => setEditIngs([...editIngs, {
    serial_number: editIngs.length + 1, name: "", name_sanskrit: null, common_name: null,
    part_used: null, part_used_full: null, quantity: null, unit: null, is_prakshepa: false,
  }]);
  const removeIng = (i: number) => setEditIngs(editIngs.filter((_, idx) => idx !== i));
  const updIng = (i: number, k: keyof Ingredient, v: any) => {
    const next = [...editIngs]; (next[i] as any)[k] = v; setEditIngs(next);
  };

  const progress = counts.total ? Math.round((counts.approved / counts.total) * 100) : 0;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">AFI Formulary Management</h1>
        <p className="text-sm text-muted-foreground">Review AI-extracted formulations before publishing to doctors</p>
      </div>

      {/* Stats */}
      <Card><CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-bold">{counts.total}</div></div>
          <div><div className="text-xs text-muted-foreground">Pending Review</div><div className="text-2xl font-bold text-orange-600">{counts.extracted}</div></div>
          <div><div className="text-xs text-muted-foreground">Reviewed</div><div className="text-2xl font-bold text-blue-600">{counts.reviewed}</div></div>
          <div><div className="text-xs text-muted-foreground">Approved & Live</div><div className="text-2xl font-bold text-green-600">{counts.approved}</div></div>
          <div><div className="text-xs text-muted-foreground">Rejected</div><div className="text-2xl font-bold text-red-600">{counts.rejected}</div></div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs mb-1"><span>Approval Progress</span><span>{progress}%</span></div>
            <Progress value={progress} />
          </div>
        </div>
      </CardContent></Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="extracted">Needs Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved / Live</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partFilter} onValueChange={setPartFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parts</SelectItem>
            <SelectItem value="1">Part I</SelectItem>
            <SelectItem value="2">Part II</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAll()} className="max-w-xs" />
        <Button onClick={fetchAll} variant="secondary">Search</Button>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No formulations match filters</div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>AFI No.</TableHead><TableHead>Name</TableHead>
              <TableHead>Part</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.afi_number || "—"}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>Part {r.afi_part || "?"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[r.is_published ? "approved" : r.extraction_status] || ""}>
                      {r.is_published ? "Live" : r.extraction_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => openReview(r.id)}>Review & Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      {/* Review Modal */}
      <Dialog open={!!openId} onOpenChange={(o) => !o && closeReview()}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{editForm?.name || "Review"}</DialogTitle>
              <div className="flex gap-2 mr-8">
                <Button size="sm" variant="outline" onClick={() => navigateSibling(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => navigateSibling(1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </DialogHeader>
          {editForm && (
            <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-y-auto p-1">
              {/* LEFT: edit form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>AFI Number</Label>
                    <Input value={editForm.afi_number || ""} onChange={(e) => setEditForm({ ...editForm, afi_number: e.target.value })} /></div>
                  <div><Label>Name</Label>
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                </div>
                <div><Label>Formulation Type</Label>
                  <Select value={editForm.formulation_type_id || ""} onValueChange={(v) => setEditForm({ ...editForm, formulation_type_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Classical Reference</Label>
                  <Input value={editForm.classical_reference || ""} onChange={(e) => setEditForm({ ...editForm, classical_reference: e.target.value })} /></div>
                <div><Label>Dose</Label>
                  <Input value={editForm.dose || ""} onChange={(e) => setEditForm({ ...editForm, dose: e.target.value })} /></div>
                <div><Label>Indications (Sanskrit, comma-separated)</Label>
                  <Input value={(editForm.indications || []).join(", ")} onChange={(e) => updateInd("indications", e.target.value)} /></div>
                <div><Label>Modern Indications (comma-separated)</Label>
                  <Input value={(editForm.indications_modern || []).join(", ")} onChange={(e) => updateInd("indications_modern", e.target.value)} /></div>
                <div><Label>Special Notes</Label>
                  <Textarea rows={2} value={editForm.special_notes || ""} onChange={(e) => setEditForm({ ...editForm, special_notes: e.target.value })} /></div>

                {/* Ingredients */}
                <div className="border rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Ingredients ({editIngs.length})</Label>
                    <Button size="sm" variant="outline" onClick={addIng}><Plus className="h-3 w-3 mr-1" />Add</Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {editIngs.map((ing, i) => (
                      <div key={i} className="grid grid-cols-12 gap-1 items-center text-xs">
                        <Input className="col-span-1 h-8" type="number" value={ing.serial_number || ""} onChange={(e) => updIng(i, "serial_number", Number(e.target.value))} />
                        <Input className="col-span-3 h-8" placeholder="Name" value={ing.name} onChange={(e) => updIng(i, "name", e.target.value)} />
                        <Input className="col-span-2 h-8" placeholder="Common" value={ing.common_name || ""} onChange={(e) => updIng(i, "common_name", e.target.value)} />
                        <Input className="col-span-2 h-8" placeholder="Part" value={ing.part_used || ""} onChange={(e) => updIng(i, "part_used", e.target.value)} />
                        <Input className="col-span-2 h-8" type="number" step="0.001" placeholder="Qty" value={ing.quantity || ""} onChange={(e) => updIng(i, "quantity", Number(e.target.value))} />
                        <Input className="col-span-1 h-8" placeholder="Unit" value={ing.unit || ""} onChange={(e) => updIng(i, "unit", e.target.value)} />
                        <Button size="sm" variant="ghost" className="col-span-1 h-8" onClick={() => removeIng(i)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                {editForm.extraction_status === "rejected" || editForm.rejection_reason ? (
                  <div><Label>Rejection Reason</Label>
                    <Textarea rows={2} value={editForm.rejection_reason || ""} onChange={(e) => setEditForm({ ...editForm, rejection_reason: e.target.value })} /></div>
                ) : null}
              </div>

              {/* RIGHT: raw PDF text */}
              <div>
                <Label>Original PDF Extract (read-only)</Label>
                <Textarea readOnly value={editForm.raw_text || ""} className="font-mono text-xs h-[calc(95vh-200px)]" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={closeReview}>Cancel</Button>
            <Button variant="outline" onClick={() => saveEdits(false, false)} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />Save Changes
            </Button>
            <Button variant="destructive" onClick={() => saveEdits(false, true)} disabled={saving}>
              <X className="h-4 w-4 mr-1" />Reject
            </Button>
            <Button onClick={() => saveEdits(true, false)} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" />Approve & Publish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
