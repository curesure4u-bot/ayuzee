import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Pencil, Plus, ShieldCheck } from "lucide-react";

type FoodItem = {
  id: string;
  name: string;
  name_local: string | null;
  category: string | null;
  rasa: string[] | null;
  guna: string[] | null;
  virya: string | null;
  vipaka: string | null;
  dosha_effect_vata: number | null;
  dosha_effect_pitta: number | null;
  dosha_effect_kapha: number | null;
  calories_per_100g: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  source: string | null;
  verified_by: string | null;
  created_by: string | null;
  created_at: string;
};

const RASA_OPTIONS = ["sweet", "sour", "salty", "pungent", "bitter", "astringent"];
const GUNA_OPTIONS = ["light", "heavy", "dry", "oily", "hot", "cold", "sharp", "dull", "soft", "hard"];
const CATEGORIES = ["grain", "vegetable", "fruit", "dairy", "spice", "legume", "meat", "oil", "sweetener", "beverage", "nut", "other"];

const emptyForm = {
  name: "",
  name_local: "",
  category: "grain",
  rasa: [] as string[],
  guna: [] as string[],
  virya: "heating",
  vipaka: "sweet",
  dosha_effect_vata: 0,
  dosha_effect_pitta: 0,
  dosha_effect_kapha: 0,
  calories_per_100g: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  fiber_g: "",
  source: "manual",
};

export default function AdminFoodDatabase() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("name");
    if (error) {
      toast({ title: "Failed to load foods", description: error.message, variant: "destructive" });
    } else {
      setItems((data as FoodItem[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (categoryFilter !== "all" && it.category !== categoryFilter) return false;
      if (search && !`${it.name} ${it.name_local ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, categoryFilter]);

  const startNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const startEdit = (it: FoodItem) => {
    setEditingId(it.id);
    setForm({
      name: it.name,
      name_local: it.name_local ?? "",
      category: it.category ?? "grain",
      rasa: it.rasa ?? [],
      guna: it.guna ?? [],
      virya: it.virya ?? "heating",
      vipaka: it.vipaka ?? "sweet",
      dosha_effect_vata: it.dosha_effect_vata ?? 0,
      dosha_effect_pitta: it.dosha_effect_pitta ?? 0,
      dosha_effect_kapha: it.dosha_effect_kapha ?? 0,
      calories_per_100g: it.calories_per_100g?.toString() ?? "",
      protein_g: it.protein_g?.toString() ?? "",
      carbs_g: it.carbs_g?.toString() ?? "",
      fat_g: it.fat_g?.toString() ?? "",
      fiber_g: it.fiber_g?.toString() ?? "",
      source: it.source ?? "manual",
    });
    setOpen(true);
  };

  const toggleTag = (field: "rasa" | "guna", value: string) => {
    setForm((f) => {
      const list = f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value];
      return { ...f, [field]: list };
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    const payload = {
      name: form.name.trim(),
      name_local: form.name_local.trim() || null,
      category: form.category,
      rasa: form.rasa,
      guna: form.guna,
      virya: form.virya,
      vipaka: form.vipaka,
      dosha_effect_vata: Number(form.dosha_effect_vata),
      dosha_effect_pitta: Number(form.dosha_effect_pitta),
      dosha_effect_kapha: Number(form.dosha_effect_kapha),
      calories_per_100g: form.calories_per_100g === "" ? null : Number(form.calories_per_100g),
      protein_g: form.protein_g === "" ? null : Number(form.protein_g),
      carbs_g: form.carbs_g === "" ? null : Number(form.carbs_g),
      fat_g: form.fat_g === "" ? null : Number(form.fat_g),
      fiber_g: form.fiber_g === "" ? null : Number(form.fiber_g),
      source: form.source,
      ...(editingId ? {} : { created_by: uid ?? null }),
    };
    const res = editingId
      ? await supabase.from("food_items").update(payload).eq("id", editingId)
      : await supabase.from("food_items").insert(payload);
    if (res.error) {
      toast({ title: "Save failed", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Food updated" : "Food added" });
    setOpen(false);
    load();
  };

  const verify = async (it: FoodItem) => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    const { error } = await supabase.from("food_items").update({ verified_by: uid }).eq("id", it.id);
    if (error) {
      toast({ title: "Verify failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Marked as verified" });
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Food Database</h1>
          <p className="text-sm text-muted-foreground">Master list of foods with Ayurvedic + nutritional properties.</p>
        </div>
        <Button onClick={startNew}><Plus className="w-4 h-4 mr-2" /> Add Food</Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex gap-2 flex-1 max-w-2xl">
            <Input placeholder="Search foods…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">{filtered.length} items</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rasa</TableHead>
                  <TableHead>Virya</TableHead>
                  <TableHead>V / P / K</TableHead>
                  <TableHead>kcal/100g</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No foods yet.</TableCell></TableRow>
                ) : filtered.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <div className="font-medium">{it.name}</div>
                      {it.name_local && <div className="text-xs text-muted-foreground">{it.name_local}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{it.category}</Badge></TableCell>
                    <TableCell className="text-xs">{(it.rasa ?? []).join(", ") || "—"}</TableCell>
                    <TableCell className="text-xs capitalize">{it.virya ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {it.dosha_effect_vata ?? 0} / {it.dosha_effect_pitta ?? 0} / {it.dosha_effect_kapha ?? 0}
                    </TableCell>
                    <TableCell>{it.calories_per_100g ?? "—"}</TableCell>
                    <TableCell>
                      {it.verified_by
                        ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
                        : <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unverified</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => startEdit(it)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                      {!it.verified_by && (
                        <Button size="sm" onClick={() => verify(it)}><ShieldCheck className="w-3 h-3 mr-1" />Verify</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit food" : "Add food"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Local name</Label><Input value={form.name_local} onChange={(e) => setForm({ ...form, name_local: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">manual</SelectItem>
                    <SelectItem value="NIN">NIN</SelectItem>
                    <SelectItem value="INDB">INDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Rasa (taste)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {RASA_OPTIONS.map((r) => (
                  <Badge key={r} variant={form.rasa.includes(r) ? "default" : "outline"}
                    className="cursor-pointer" onClick={() => toggleTag("rasa", r)}>{r}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Guna (quality)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {GUNA_OPTIONS.map((g) => (
                  <Badge key={g} variant={form.guna.includes(g) ? "default" : "outline"}
                    className="cursor-pointer" onClick={() => toggleTag("guna", g)}>{g}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Virya</Label>
                <Select value={form.virya} onValueChange={(v) => setForm({ ...form, virya: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heating">heating (ushna)</SelectItem>
                    <SelectItem value="cooling">cooling (sheeta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vipaka</Label>
                <Select value={form.vipaka} onValueChange={(v) => setForm({ ...form, vipaka: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sweet">sweet (madhura)</SelectItem>
                    <SelectItem value="sour">sour (amla)</SelectItem>
                    <SelectItem value="pungent">pungent (katu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["dosha_effect_vata", "dosha_effect_pitta", "dosha_effect_kapha"] as const).map((k) => (
                <div key={k}>
                  <Label className="capitalize">{k.replace("dosha_effect_", "")} effect (−2 to 2)</Label>
                  <Input type="number" min={-2} max={2} value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {(["calories_per_100g", "protein_g", "carbs_g", "fat_g", "fiber_g"] as const).map((k) => (
                <div key={k}>
                  <Label className="text-xs">{k.replace(/_/g, " ")}</Label>
                  <Input type="number" step="0.1" value={form[k] as string}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? "Save changes" : "Add food"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
