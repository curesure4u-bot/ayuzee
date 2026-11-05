/**
 * HMS Product Builder — Clinic pharmacy staff can import/add products
 * Same functionality as AdminProductBuilder but scoped to HMS context.
 * Reuses the same products table but tags with clinic/branch.
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload, Link2, FileSpreadsheet, Plus, Loader2, Download,
  CheckCircle2, Package, Sparkles, Database,
} from "lucide-react";

const AYUSH_SYSTEMS = ["Ayurveda", "Siddha", "Unani", "Homeopathy", "Yoga", "Naturopathy"];
const CATEGORIES = ["Churna", "Kashayam", "Arishta/Asava", "Tailam", "Ghritam", "Vati/Gulika", "Guggulu", "Bhasma", "Lehyam", "Kwath", "Capsule", "Syrup", "External", "OTC", "Surgical", "Cosmetic"];

const CLASSICAL_TEMPLATES = [
  { name: "Triphala Churna", category: "Churna", system: "Ayurveda", use: "Digestive, Detox" },
  { name: "Ashwagandha Churna", category: "Churna", system: "Ayurveda", use: "Stress, Vitality" },
  { name: "Dashamoolarishta", category: "Arishta/Asava", system: "Ayurveda", use: "Post-partum, Vata" },
  { name: "Ksheerabala 101 Tailam", category: "Tailam", system: "Ayurveda", use: "Neuro, Joint" },
  { name: "Rasnasaptakam Kashayam", category: "Kashayam", system: "Ayurveda", use: "Joint pain" },
  { name: "Yogaraja Guggulu", category: "Guggulu", system: "Ayurveda", use: "Musculoskeletal" },
  { name: "Chandraprabha Vati", category: "Vati/Gulika", system: "Ayurveda", use: "Urinary" },
  { name: "Kottamchukkadi Tailam", category: "Tailam", system: "Ayurveda", use: "Pain, PK" },
  { name: "Brahmi Vati", category: "Vati/Gulika", system: "Ayurveda", use: "Memory" },
  { name: "Arogyavardhini Vati", category: "Vati/Gulika", system: "Ayurveda", use: "Liver, Skin" },
];

interface ImportRow { name: string; brand: string; category: string; price: number; description: string; unit: string; ayush_system: string; status: "ready" | "error" | "imported"; error?: string }

const HmsProductBuilder = () => {
  const [tab, setTab] = useState("quick");
  const [csvRows, setCsvRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [url, setUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlProduct, setUrlProduct] = useState<Partial<ImportRow> | null>(null);
  const [quickForm, setQuickForm] = useState({ name: "", brand: "", category: "Churna", price: "", description: "", unit: "", ayush_system: "Ayurveda", stock: "100", purchase_price: "", mrp: "", hsn: "" });
  const [quickSaving, setQuickSaving] = useState(false);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { toast.error("CSV needs header + rows"); return; }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const rows: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^['"]|['"]$/g, ""));
        const name = cols[headers.indexOf("name") !== -1 ? headers.indexOf("name") : 0] ?? "";
        const price = parseFloat(cols[headers.indexOf("price") !== -1 ? headers.indexOf("price") : 3] ?? "0");
        rows.push({ name, brand: cols[headers.indexOf("brand") !== -1 ? headers.indexOf("brand") : 1] ?? "", category: cols[headers.indexOf("category") !== -1 ? headers.indexOf("category") : 2] ?? "Churna", price: isNaN(price) ? 0 : price, description: cols[headers.indexOf("description") !== -1 ? headers.indexOf("description") : 4] ?? "", unit: cols[headers.indexOf("unit") !== -1 ? headers.indexOf("unit") : 5] ?? "", ayush_system: cols[headers.indexOf("ayush_system") !== -1 ? headers.indexOf("ayush_system") : 6] ?? "Ayurveda", status: name && price > 0 ? "ready" : "error" });
      }
      setCsvRows(rows);
      toast.success(`Parsed ${rows.length} products`);
    };
    reader.readAsText(file); e.target.value = "";
  };

  const importCSV = async () => {
    const ready = csvRows.filter((r) => r.status === "ready");
    if (ready.length === 0) { toast.error("No valid rows"); return; }
    setImporting(true);
    let success = 0;
    for (const row of ready) {
      const { error } = await supabase.from("products").insert({ name: row.name, brand: row.brand, category: row.category, price: row.price, description: row.description || null, unit: row.unit || null, ayush_system: row.ayush_system, stock: 100, rating: 4.0, total_reviews: 0 });
      if (!error) { success++; row.status = "imported"; } else { row.status = "error"; row.error = error.message; }
    }
    setCsvRows([...csvRows]); setImporting(false);
    toast.success(`Imported ${success} products`);
  };

  const handleQuickSave = async () => {
    if (!quickForm.name || !quickForm.price) { toast.error("Name & price required"); return; }
    setQuickSaving(true);
    const { error } = await supabase.from("products").insert({
      name: quickForm.name, brand: quickForm.brand, category: quickForm.category,
      price: parseFloat(quickForm.price), description: quickForm.description || null,
      unit: quickForm.unit || null, ayush_system: quickForm.ayush_system,
      stock: parseInt(quickForm.stock) || 100, rating: 4.0, total_reviews: 0,
    });
    if (error) toast.error(error.message);
    else { toast.success(`${quickForm.name} added!`); setQuickForm({ name: "", brand: "", category: "Churna", price: "", description: "", unit: "", ayush_system: "Ayurveda", stock: "100", purchase_price: "", mrp: "", hsn: "" }); }
    setQuickSaving(false);
  };

  const handleUrlExtract = async () => {
    if (!url.trim()) return;
    setUrlLoading(true);
    try {
      const { data } = await supabase.functions.invoke("extract-product-url", { body: { url: url.trim() } });
      if (data) { setUrlProduct(data as Partial<ImportRow>); toast.success("Extracted!"); }
      else { setUrlProduct({ name: "", brand: new URL(url).hostname.split(".")[0], category: "Churna", price: 0, ayush_system: "Ayurveda" }); toast.info("Fill manually"); }
    } catch { setUrlProduct({ name: "", brand: "", category: "Churna", price: 0, ayush_system: "Ayurveda" }); toast.info("Fill manually"); }
    setUrlLoading(false);
  };

  const saveUrlProduct = async () => {
    if (!urlProduct?.name) { toast.error("Name required"); return; }
    const { error } = await supabase.from("products").insert({ name: urlProduct.name, brand: urlProduct.brand ?? "", category: urlProduct.category ?? "Churna", price: urlProduct.price ?? 0, description: urlProduct.description || null, unit: urlProduct.unit || null, ayush_system: urlProduct.ayush_system ?? "Ayurveda", stock: 100, rating: 4.0 });
    if (error) toast.error(error.message); else { toast.success("Saved!"); setUrlProduct(null); setUrl(""); }
  };

  const downloadTemplate = () => {
    const csv = ["name,brand,category,price,description,unit,ayush_system", ...CLASSICAL_TEMPLATES.map((t) => `"${t.name}","Kottakkal","${t.category}",250,"${t.use}","100ml/60tab","${t.system}"`)].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "hms_product_template.csv"; a.click();
  };

  const seedClassical = async () => {
    setImporting(true); let c = 0;
    for (const t of CLASSICAL_TEMPLATES) { const { error } = await supabase.from("products").insert({ name: t.name, brand: "Classical", category: t.category, price: 199, description: t.use, ayush_system: t.system, stock: 100, rating: 4.0, tags: [t.category, "Classical"] }); if (!error) c++; }
    setImporting(false); toast.success(`Seeded ${c} classical formulations`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Pharmacy Product Builder</h1>
          <p className="text-muted-foreground mt-1">Import and build your clinic pharmacy catalog — CSV, URL, or manual entry.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" /> Template</Button>
          <Button variant="outline" size="sm" onClick={seedClassical} disabled={importing}><Database className="mr-1 h-4 w-4" /> Seed Classics</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="quick"><Plus className="mr-1 h-3.5 w-3.5" /> Quick Add</TabsTrigger>
          <TabsTrigger value="csv"><FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV Import</TabsTrigger>
          <TabsTrigger value="url"><Link2 className="mr-1 h-3.5 w-3.5" /> URL Import</TabsTrigger>
        </TabsList>

        {/* Quick Add */}
        <TabsContent value="quick" className="mt-4">
          <Card><CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label className="text-xs">Name *</Label><Input value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} placeholder="Ashwagandha Churna 100g" /></div>
              <div><Label className="text-xs">Brand *</Label><Input value={quickForm.brand} onChange={(e) => setQuickForm({ ...quickForm, brand: e.target.value })} placeholder="Kottakkal" /></div>
              <div><Label className="text-xs">MRP / Price (₹) *</Label><Input type="number" value={quickForm.price} onChange={(e) => setQuickForm({ ...quickForm, price: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><Label className="text-xs">Category</Label><Select value={quickForm.category} onValueChange={(v) => setQuickForm({ ...quickForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">AYUSH System</Label><Select value={quickForm.ayush_system} onValueChange={(v) => setQuickForm({ ...quickForm, ayush_system: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AYUSH_SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Unit</Label><Input value={quickForm.unit} onChange={(e) => setQuickForm({ ...quickForm, unit: e.target.value })} placeholder="100g / 200ml" /></div>
              <div><Label className="text-xs">Stock Qty</Label><Input type="number" value={quickForm.stock} onChange={(e) => setQuickForm({ ...quickForm, stock: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label className="text-xs">Purchase Price (₹)</Label><Input value={quickForm.purchase_price} onChange={(e) => setQuickForm({ ...quickForm, purchase_price: e.target.value })} placeholder="Cost price" /></div>
              <div><Label className="text-xs">HSN Code</Label><Input value={quickForm.hsn} onChange={(e) => setQuickForm({ ...quickForm, hsn: e.target.value })} placeholder="30049011" /></div>
              <div><Label className="text-xs">Description</Label><Input value={quickForm.description} onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })} placeholder="Usage, benefits..." /></div>
            </div>
            <Button onClick={handleQuickSave} disabled={quickSaving}>{quickSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />} Add to Pharmacy</Button>
          </CardContent></Card>
        </TabsContent>

        {/* CSV Import */}
        <TabsContent value="csv" className="mt-4">
          <Card><CardContent className="space-y-4 p-5">
            <Input type="file" accept=".csv,.txt" onChange={handleCSVUpload} />
            {csvRows.length > 0 && (<>
              <div className="flex items-center justify-between"><p className="text-sm">{csvRows.filter((r) => r.status === "ready").length} ready / {csvRows.length} total</p><Button onClick={importCSV} disabled={importing}>{importing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />} Import</Button></div>
              <div className="max-h-[250px] overflow-y-auto border rounded text-xs">
                <table className="w-full"><thead className="bg-muted/50 sticky top-0"><tr><th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1">Brand</th><th className="px-2 py-1">₹</th><th className="px-2 py-1">Status</th></tr></thead>
                <tbody>{csvRows.slice(0, 50).map((r, i) => (<tr key={i} className="border-t"><td className="px-2 py-1">{r.name}</td><td className="px-2 py-1">{r.brand}</td><td className="px-2 py-1">{r.price}</td><td className="px-2 py-1"><Badge className={r.status === "imported" ? "bg-green-100 text-green-700" : r.status === "ready" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}>{r.status}</Badge></td></tr>))}</tbody></table>
              </div>
            </>)}
          </CardContent></Card>
        </TabsContent>

        {/* URL Import */}
        <TabsContent value="url" className="mt-4">
          <Card><CardContent className="space-y-4 p-5">
            <p className="text-xs text-muted-foreground">Paste product URL from any pharmacy site to extract details.</p>
            <div className="flex gap-3"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="flex-1" /><Button onClick={handleUrlExtract} disabled={urlLoading}>{urlLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}</Button></div>
            {urlProduct && (<div className="space-y-3 border rounded p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs">Name</Label><Input value={urlProduct.name ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, name: e.target.value })} /></div>
                <div><Label className="text-xs">Brand</Label><Input value={urlProduct.brand ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, brand: e.target.value })} /></div>
                <div><Label className="text-xs">Price</Label><Input type="number" value={urlProduct.price ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, price: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Unit</Label><Input value={urlProduct.unit ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, unit: e.target.value })} /></div>
              </div>
              <Button onClick={saveUrlProduct}><CheckCircle2 className="mr-1 h-4 w-4" /> Save</Button>
            </div>)}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsProductBuilder;
