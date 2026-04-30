import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Package, AlertTriangle, Tag, TrendingUp, Search, Download, Copy, Plus, Minus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  product_type: string | null;
  ayush_system: string | null;
  price: number;
  discount_price: number | null;
  mrp: number | null;
  stock: number;
  image_url: string | null;
  is_bulk: boolean;
  is_surgical: boolean | null;
  is_offers: boolean | null;
  health_conditions: string[] | null;
  description: string | null;
  unit: string | null;
  dosage_form: string | null;
  treatment_use: string | null;
  is_prescription_required: boolean | null;
  approval_status: string | null;
  is_approved: boolean | null;
  tags: string[] | null;
};

const EMPTY: Partial<Product> = {
  name: "", brand: "", category: "", product_type: "medicine",
  ayush_system: "Ayurveda", price: 0, discount_price: null, mrp: null,
  stock: 0, image_url: "", is_bulk: false, is_surgical: false,
  is_offers: false, health_conditions: [], description: "", unit: "",
  dosage_form: "", treatment_use: "", is_prescription_required: false,
  approval_status: "approved", is_approved: true, tags: [],
};

const AYUSH_SYSTEMS = ["Ayurveda", "Homeopathy", "Unani", "Siddha", "Yoga", "Naturopathy"];
const CATEGORIES = ["Medicine", "Churna", "Tablet", "Capsule", "Syrup", "Oil", "Ghrita", "Kwath", "Asava", "Panchakarma", "Oils", "Wellness", "Supplement", "Device", "Surgical", "Kit", "Book", "Yoga Product"];
const DOSAGE_FORMS = ["Tablet", "Capsule", "Syrup", "Liquid", "Oil", "Powder/Churna", "Ghrita/Ghee", "Cream/Ointment", "Drops", "Granules", "Injection", "Other"];
const PRODUCT_TYPES = ["medicine", "treatment_kit", "surgical", "panchakarma", "yoga", "book", "device"];

const CSV_HEADERS = "name,brand,category,product_type,ayush_system,price,discount_price,mrp,stock,unit,dosage_form,description,health_conditions,treatment_use,image_url,is_offers";
const CSV_EXAMPLE = "Triphala Churna 200g,Dabur,Churna,medicine,Ayurveda,180,150,200,500,200g,Powder/Churna,Classical three-fruit formulation,Digestive|Constipation,,,false";

const AdminProducts = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [typeF, setTypeF] = useState("all");
  const [systemF, setSystemF] = useState("all");
  const [cond, setCond] = useState("");
  const [stockF, setStockF] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Product[]);
  };
  useEffect(() => { document.title = "Products — Admin"; load(); }, []);

  const stats = useMemo(() => ({
    total: rows.filter(p => p.stock !== -1).length,
    lowStock: rows.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: rows.filter(p => p.stock === 0).length,
    offers: rows.filter(p => p.is_offers).length,
    pending: rows.filter(p => p.approval_status === "pending").length,
  }), [rows]);

  const filtered = useMemo(() => rows.filter(p => {
    if (p.stock === -1) return false;
    if (typeF !== "all" && p.product_type !== typeF) return false;
    if (systemF !== "all" && p.ayush_system !== systemF) return false;
    if (cond && !(p.health_conditions ?? []).join(" ").toLowerCase().includes(cond.toLowerCase())) return false;
    if (stockF === "in" && p.stock <= 0) return false;
    if (stockF === "low" && !(p.stock > 0 && p.stock <= 10)) return false;
    if (stockF === "out" && p.stock !== 0) return false;
    if (stockF === "pending" && p.approval_status !== "pending") return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, typeF, systemF, cond, stockF, searchQ]);

  const save = async () => {
    if (!editing?.name || !editing.brand || !editing.category) return toast.error("Name, brand and category are required");
    setSaving(true);
    const payload: any = {
      ...editing,
      price: Number(editing.price || 0),
      discount_price: editing.discount_price ? Number(editing.discount_price) : null,
      mrp: editing.mrp ? Number(editing.mrp) : null,
      stock: Number(editing.stock || 0),
      health_conditions: Array.isArray(editing.health_conditions)
        ? editing.health_conditions
        : String(editing.health_conditions || "").split(",").map(s => s.trim()).filter(Boolean),
      tags: Array.isArray(editing.tags)
        ? editing.tags
        : String(editing.tags || "").split(",").map(s => s.trim()).filter(Boolean),
      is_approved: editing.approval_status === "approved",
    };
    const q = editing.id
      ? supabase.from("products").update(payload).eq("id", editing.id)
      : supabase.from("products").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Product updated!" : "Product added!");
    setEditing(null);
    load();
  };

  const duplicate = async (p: Product) => {
    const { id, ...rest } = p;
    const { error } = await supabase.from("products").insert({
      ...rest,
      name: `${p.name} (Copy)`,
      stock: 0,
      is_offers: false,
      approval_status: "pending",
      is_approved: false,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Product duplicated — review and approve");
    load();
  };

  const updateStock = async (id: string, delta: number, current: number) => {
    const newStock = Math.max(0, current + delta);
    setRows(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    await supabase.from("products").update({ stock: newStock }).eq("id", id);
  };

  const approve = async (id: string) => {
    await (supabase as any).from("products").update({ approval_status: "approved", is_approved: true }).eq("id", id);
    toast.success("Product approved — now live in store");
    load();
  };
  const reject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    await (supabase as any).from("products").update({ approval_status: "rejected", is_approved: false, rejection_reason: reason }).eq("id", id);
    toast.success("Product rejected");
    load();
  };

  const softDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await supabase.from("products").update({ stock: -1 }).eq("id", p.id);
    toast.success("Product removed from store");
    load();
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
    const keys = head.split(",").map(s => s.trim());
    const items = lines
      .map(line => Object.fromEntries(line.split(",").map((v, i) => [keys[i], v.trim()])))
      .map((r: any) => ({
        name: r.name, brand: r.brand || "Ayuzee",
        category: r.category || "Medicine",
        price: Number(r.price || 0),
        discount_price: r.discount_price ? Number(r.discount_price) : null,
        mrp: r.mrp ? Number(r.mrp) : null,
        stock: Number(r.stock || 0),
        unit: r.unit || null,
        dosage_form: r.dosage_form || null,
        description: r.description || null,
        image_url: r.image_url || null,
        product_type: r.product_type || "medicine",
        ayush_system: r.ayush_system || "Ayurveda",
        health_conditions: r.health_conditions ? r.health_conditions.split("|") : [],
        treatment_use: r.treatment_use || null,
        is_offers: r.is_offers === "true",
        approval_status: "approved",
        is_approved: true,
      }));
    const { error } = await supabase.from("products").insert(items as any);
    if (error) toast.error(error.message);
    else { toast.success(`✅ Imported ${items.length} products`); load(); }
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const csv = `${CSV_HEADERS}\n${CSV_EXAMPLE}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ayuzee_products_template.csv";
    a.click();
  };

  const discPct = (p: Product) => {
    const base = Number(p.mrp || p.price);
    const sell = Number(p.discount_price ?? p.price);
    return base > sell ? Math.round(((base - sell) / base) * 100) : 0;
  };

  const approvalBadge = (p: Product) => {
    if (p.approval_status === "pending") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">⏳ Pending</Badge>;
    if (p.approval_status === "rejected") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Rejected</Badge>;
    if (p.is_approved !== false) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Live</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

  const statCards = [
    { icon: Package, label: "Total Products", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: TrendingUp, label: "Active Offers", value: stats.offers, color: "text-green-600", bg: "bg-green-50" },
    { icon: AlertTriangle, label: "Low Stock (≤10)", value: stats.lowStock, color: "text-amber-600", bg: "bg-amber-50" },
    { icon: AlertTriangle, label: "Out of Stock", value: stats.outOfStock, color: "text-red-600", bg: "bg-red-50" },
    { icon: Tag, label: "Pending Approval", value: stats.pending, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products / Store</h1>
          <p className="text-sm text-muted-foreground">Manage medicine catalog, offers, and approvals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="gap-1.5">
            <Download className="h-4 w-4" /> CSV Template
          </Button>
          <Label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 text-sm hover:bg-accent">
            📥 Bulk Import
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </Label>
          <Button onClick={() => setEditing(EMPTY)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product name or brand..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeF} onValueChange={setTypeF}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {PRODUCT_TYPES.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={systemF} onValueChange={setSystemF}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All systems</SelectItem>
              {AYUSH_SYSTEMS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Health condition" value={cond} onChange={e => setCond(e.target.value)} className="w-44" />
          <Select value={stockF} onValueChange={setStockF}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock</SelectItem>
              <SelectItem value="in">In stock</SelectItem>
              <SelectItem value="low">Low (≤10)</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
              <SelectItem value="pending">Pending approval</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>System</TableHead>
                <TableHead>MRP / Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(p => (
                <TableRow
                  key={p.id}
                  className={p.stock === 0 ? "bg-red-50/40" : p.stock > 0 && p.stock <= 5 ? "bg-amber-50/40" : ""}
                >
                  <TableCell>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-10 w-10 rounded object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                        {p.name?.[0] ?? "?"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium" title={p.description ?? ""}>{p.name}</div>
                    {p.unit && <div className="text-xs text-muted-foreground">{p.unit}</div>}
                    {p.is_prescription_required && (
                      <Badge variant="outline" className="mt-1 text-[10px]">Rx required</Badge>
                    )}
                  </TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>
                    <div className="text-sm">{p.category}</div>
                    <Badge variant="outline" className="text-[10px]">{p.product_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.ayush_system}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">₹{Number(p.discount_price ?? p.price).toLocaleString("en-IN")}</span>
                      {(p.mrp || p.discount_price) && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{Number(p.mrp || p.price).toLocaleString("en-IN")}
                        </span>
                      )}
                      {discPct(p) > 0 && (
                        <Badge className="mt-0.5 w-fit bg-green-100 text-green-800 hover:bg-green-100 text-[10px]">
                          {discPct(p)}% OFF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateStock(p.id, -1, p.stock)}
                        className="grid h-6 w-6 place-items-center rounded border border-border hover:bg-accent"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className={`w-8 text-center text-sm font-medium ${p.stock <= 5 ? "text-red-600" : ""}`}>
                        {p.stock}
                      </span>
                      <button
                        onClick={() => updateStock(p.id, 1, p.stock)}
                        className="grid h-6 w-6 place-items-center rounded border border-border hover:bg-accent"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {p.stock === 0 && (
                      <div className="mt-1 text-[10px] font-medium text-red-600">Out of stock</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {approvalBadge(p)}
                      {p.is_offers && (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-[10px]">🏷️ Offer</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={p.is_offers ? "border-orange-300 text-orange-600" : ""}
                        onClick={() => supabase.from("products").update({ is_offers: !p.is_offers }).eq("id", p.id).then(load)}
                      >
                        {p.is_offers ? "Remove Offer" : "Mark Offer"}
                      </Button>
                      {p.approval_status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approve(p.id)}>
                            ✅ Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>
                            ❌ Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => duplicate(p)} title="Duplicate">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => softDelete(p)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "✏️ Edit Product" : "➕ Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="grid max-h-[70vh] gap-4 overflow-auto pr-2 md:grid-cols-2">
            <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
              Basic Information
            </div>

            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input value={editing?.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Triphala Churna 200g" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand / Manufacturer *</Label>
              <Input value={editing?.brand ?? ""} onChange={e => setEditing({ ...editing, brand: e.target.value })} placeholder="e.g. Dabur" />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={editing?.category ?? ""} onValueChange={v => setEditing({ ...editing, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>AYUSH System *</Label>
              <Select value={editing?.ayush_system ?? ""} onValueChange={v => setEditing({ ...editing, ayush_system: v })}>
                <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>{AYUSH_SYSTEMS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Product Type</Label>
              <Select value={editing?.product_type ?? ""} onValueChange={v => setEditing({ ...editing, product_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{PRODUCT_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dosage Form</Label>
              <Select value={editing?.dosage_form ?? ""} onValueChange={v => setEditing({ ...editing, dosage_form: v })}>
                <SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger>
                <SelectContent>{DOSAGE_FORMS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Unit / Pack Size</Label>
              <Input value={editing?.unit ?? ""} onChange={e => setEditing({ ...editing, unit: e.target.value })} placeholder="e.g. 200g, 60 tablets, 100ml" />
            </div>

            <div className="md:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
              Pricing
            </div>

            <div className="space-y-1.5">
              <Label>MRP (₹) — printed on pack</Label>
              <Input type="number" value={editing?.mrp ?? ""} placeholder="0.00"
                onChange={e => setEditing({ ...editing, mrp: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-1.5">
              <Label>Selling Price (₹) *</Label>
              <Input type="number" value={editing?.price ?? ""} placeholder="0.00"
                onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Discounted Price (₹)</Label>
              <Input type="number" value={editing?.discount_price ?? ""} placeholder="Leave blank if no discount"
                onChange={e => setEditing({ ...editing, discount_price: e.target.value ? Number(e.target.value) : null })} />
              {editing?.mrp && editing?.discount_price && (
                <div className="text-xs text-green-600 font-medium">
                  {Math.round(((Number(editing.mrp) - Number(editing.discount_price)) / Number(editing.mrp)) * 100)}% off MRP
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Stock Quantity *</Label>
              <Input type="number" value={editing?.stock ?? ""} placeholder="0"
                onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })} />
            </div>

            <div className="md:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
              Description & Use
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Product Description</Label>
              <Textarea rows={3} value={editing?.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Treatment Use / Indicated for</Label>
              <Textarea rows={2} value={editing?.treatment_use ?? ""} onChange={e => setEditing({ ...editing, treatment_use: e.target.value })} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Health Conditions (comma separated)</Label>
              <Input
                value={Array.isArray(editing?.health_conditions) ? editing!.health_conditions!.join(", ") : (editing?.health_conditions as any) ?? ""}
                onChange={e => setEditing({ ...editing, health_conditions: e.target.value.split(",").map(s => s.trim()) })}
                placeholder="Diabetes, Acidity, Constipation"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={Array.isArray(editing?.tags) ? editing!.tags!.join(", ") : (editing?.tags as any) ?? ""}
                onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map(s => s.trim()) })}
                placeholder="bestseller, classical, organic"
              />
            </div>

            <div className="md:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
              Image
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Product Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={editing?.image_url ?? ""}
                  onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1"
                />
                {editing?.image_url && (
                  <img
                    src={editing.image_url}
                    alt="preview"
                    className="h-12 w-12 rounded border object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a direct image URL. Recommended: upload to storage, then paste the public URL here.
              </p>
            </div>

            <div className="md:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
              Settings & Approval
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Approval Status</Label>
              <Select
                value={editing?.approval_status ?? "approved"}
                onValueChange={v => setEditing({ ...editing, approval_status: v, is_approved: v === "approved" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">✅ Approved — Live in store</SelectItem>
                  <SelectItem value="pending">⏳ Pending — Under review</SelectItem>
                  <SelectItem value="rejected">❌ Rejected — Not visible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              {[
                { key: "is_offers", label: "🏷️ Show in Offers / Deals section" },
                { key: "is_bulk", label: "📦 Available for Bulk Purchase" },
                { key: "is_surgical", label: "🏥 Surgical / Equipment product" },
                { key: "is_prescription_required", label: "📋 Prescription Required" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <Label className="cursor-pointer">{label}</Label>
                  <Switch
                    checked={Boolean((editing as any)?.[key])}
                    onCheckedChange={v => setEditing({ ...editing, [key]: v })}
                  />
                </div>
              ))}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : editing?.id ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
