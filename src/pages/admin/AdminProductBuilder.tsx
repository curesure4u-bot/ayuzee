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
  CheckCircle2, AlertCircle, Package, Sparkles, Database,
} from "lucide-react";

// Classical formulation templates for quick seeding
const CLASSICAL_TEMPLATES = [
  { name: "Triphala Churna", category: "Churna", system: "Ayurveda", use: "Digestive, Detox", dosage: "3-5g with warm water" },
  { name: "Ashwagandha Churna", category: "Churna", system: "Ayurveda", use: "Stress, Vitality", dosage: "3-6g with milk" },
  { name: "Dashamoolarishta", category: "Arishta", system: "Ayurveda", use: "Post-partum, Vata", dosage: "15-30ml after food" },
  { name: "Ksheerabala 101 Tailam", category: "Tailam", system: "Ayurveda", use: "Neuro, Joint pain", dosage: "External application" },
  { name: "Rasnasaptakam Kashayam", category: "Kashayam", system: "Ayurveda", use: "Joint pain, Vata", dosage: "15ml BD before food" },
  { name: "Yogaraja Guggulu", category: "Guggulu", system: "Ayurveda", use: "Musculoskeletal", dosage: "2 tabs BD" },
  { name: "Chandraprabha Vati", category: "Vati", system: "Ayurveda", use: "Urinary, General", dosage: "2 tabs BD" },
  { name: "Kottamchukkadi Tailam", category: "Tailam", system: "Ayurveda", use: "Pain, Panchakarma", dosage: "External" },
  { name: "Brahmi Vati", category: "Vati", system: "Ayurveda", use: "Memory, Cognition", dosage: "1-2 tabs BD" },
  { name: "Arogyavardhini Vati", category: "Vati", system: "Ayurveda", use: "Liver, Skin", dosage: "2 tabs BD" },
];

const AYUSH_SYSTEMS = ["Ayurveda", "Siddha", "Unani", "Homeopathy", "Yoga", "Naturopathy"];
const CATEGORIES = ["Churna", "Kashayam", "Arishta/Asava", "Tailam", "Ghritam", "Vati/Gulika", "Guggulu", "Bhasma", "Lehyam", "Kwath", "Capsule", "Syrup", "External", "OTC"];

interface ImportRow {
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  unit: string;
  ayush_system: string;
  status: "ready" | "error" | "imported";
  error?: string;
}

const AdminProductBuilder = () => {
  const [tab, setTab] = useState("csv");
  const [csvRows, setCsvRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  // URL Import
  const [url, setUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlProduct, setUrlProduct] = useState<Partial<ImportRow> | null>(null);

  // Quick Add
  const [quickForm, setQuickForm] = useState({
    name: "", brand: "", category: "Churna", price: "", description: "",
    unit: "", ayush_system: "Ayurveda", stock: "100", image_url: "",
    health_conditions: "", tags: "", dosage_form: "",
  });
  const [quickSaving, setQuickSaving] = useState(false);

  // ─── CSV IMPORT ───
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { toast.error("CSV must have header + data rows"); return; }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const rows: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^['"]|['"]$/g, ""));
        const nameIdx = headers.indexOf("name") !== -1 ? headers.indexOf("name") : 0;
        const brandIdx = headers.indexOf("brand") !== -1 ? headers.indexOf("brand") : 1;
        const catIdx = headers.indexOf("category") !== -1 ? headers.indexOf("category") : 2;
        const priceIdx = headers.indexOf("price") !== -1 ? headers.indexOf("price") : 3;
        const descIdx = headers.indexOf("description") !== -1 ? headers.indexOf("description") : 4;
        const unitIdx = headers.indexOf("unit") !== -1 ? headers.indexOf("unit") : 5;
        const sysIdx = headers.indexOf("ayush_system") !== -1 ? headers.indexOf("ayush_system") : headers.indexOf("system") !== -1 ? headers.indexOf("system") : 6;

        const name = cols[nameIdx] ?? "";
        const price = parseFloat(cols[priceIdx] ?? "0");
        if (!name) continue;
        rows.push({
          name, brand: cols[brandIdx] ?? "", category: cols[catIdx] ?? "Churna",
          price: isNaN(price) ? 0 : price, description: cols[descIdx] ?? "",
          unit: cols[unitIdx] ?? "", ayush_system: cols[sysIdx] ?? "Ayurveda",
          status: name && price > 0 ? "ready" : "error",
          error: !name ? "Missing name" : price <= 0 ? "Invalid price" : undefined,
        });
      }
      setCsvRows(rows);
      toast.success(`Parsed ${rows.length} products from CSV`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const importCSV = async () => {
    const ready = csvRows.filter((r) => r.status === "ready");
    if (ready.length === 0) { toast.error("No valid rows to import"); return; }
    setImporting(true);
    let success = 0; let failed = 0;
    for (const row of ready) {
      const { error } = await supabase.from("products").insert({
        name: row.name, brand: row.brand, category: row.category,
        price: row.price, description: row.description || null,
        unit: row.unit || null, ayush_system: row.ayush_system,
        stock: 100, rating: 4.0, total_reviews: 0,
      });
      if (error) { failed++; row.status = "error"; row.error = error.message; }
      else { success++; row.status = "imported"; }
    }
    setCsvRows([...csvRows]);
    setImportResult({ success, failed });
    setImporting(false);
    toast.success(`Imported ${success} products. ${failed} failed.`);
  };

  // ─── URL IMPORT ───
  const handleUrlExtract = async () => {
    if (!url.trim()) return;
    setUrlLoading(true);
    try {
      // Try to extract product info via edge function or simple fetch
      const { data, error } = await supabase.functions.invoke("extract-product-url", {
        body: { url: url.trim() },
      });
      if (error || !data) {
        // Fallback: just pre-fill with URL domain as brand
        const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
        setUrlProduct({ name: "", brand: domain, category: "Churna", price: 0, ayush_system: "Ayurveda", description: "", unit: "" });
        toast.info("Could not auto-extract. Please fill details manually.");
      } else {
        setUrlProduct(data as Partial<ImportRow>);
        toast.success("Product details extracted!");
      }
    } catch {
      const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
      setUrlProduct({ name: "", brand: domain, category: "Churna", price: 0, ayush_system: "Ayurveda", description: "", unit: "" });
      toast.info("Fill details manually — extraction not available for this site.");
    }
    setUrlLoading(false);
  };

  const saveUrlProduct = async () => {
    if (!urlProduct?.name) { toast.error("Product name is required"); return; }
    const { error } = await supabase.from("products").insert({
      name: urlProduct.name, brand: urlProduct.brand ?? "", category: urlProduct.category ?? "Churna",
      price: urlProduct.price ?? 0, description: urlProduct.description || null,
      unit: urlProduct.unit || null, ayush_system: urlProduct.ayush_system ?? "Ayurveda",
      stock: 100, rating: 4.0, total_reviews: 0,
    });
    if (error) toast.error(error.message); else { toast.success("Product saved!"); setUrlProduct(null); setUrl(""); }
  };

  // ─── QUICK ADD ───
  const handleQuickSave = async () => {
    if (!quickForm.name || !quickForm.price) { toast.error("Name and price required"); return; }
    setQuickSaving(true);
    const { error } = await supabase.from("products").insert({
      name: quickForm.name, brand: quickForm.brand, category: quickForm.category,
      price: parseFloat(quickForm.price), description: quickForm.description || null,
      unit: quickForm.unit || null, ayush_system: quickForm.ayush_system,
      stock: parseInt(quickForm.stock) || 100, image_url: quickForm.image_url || null,
      health_conditions: quickForm.health_conditions ? quickForm.health_conditions.split(",").map((s) => s.trim()) : null,
      tags: quickForm.tags ? quickForm.tags.split(",").map((s) => s.trim()) : null,
      dosage_form: quickForm.dosage_form || null, rating: 4.0, total_reviews: 0,
    });
    if (error) toast.error(error.message);
    else { toast.success(`${quickForm.name} added!`); setQuickForm({ name: "", brand: "", category: "Churna", price: "", description: "", unit: "", ayush_system: "Ayurveda", stock: "100", image_url: "", health_conditions: "", tags: "", dosage_form: "" }); }
    setQuickSaving(false);
  };

  // ─── TEMPLATE DOWNLOAD ───
  const downloadTemplate = () => {
    const headers = "name,brand,category,price,description,unit,ayush_system";
    const rows = CLASSICAL_TEMPLATES.map((t) => `"${t.name}","Kottakkal","${t.category}",250,"${t.use}","100ml/60tab","${t.system}"`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ayuzee_product_template.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded — fill in your products and upload!");
  };

  const seedClassical = async () => {
    setImporting(true);
    let count = 0;
    for (const t of CLASSICAL_TEMPLATES) {
      const { error } = await supabase.from("products").insert({
        name: t.name, brand: "Classical (Generic)", category: t.category,
        price: 199, description: t.use, unit: "As per formulation",
        ayush_system: t.system, stock: 100, rating: 4.0, total_reviews: 0,
        tags: [t.category, t.system, "Classical"],
      });
      if (!error) count++;
    }
    setImporting(false);
    toast.success(`Seeded ${count} classical formulations!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Product Builder</h1>
        <p className="text-muted-foreground">Rapidly build your AYUSH product catalog — import from CSV, URL, or use templates.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-sm" onClick={downloadTemplate}>
          <CardContent className="pt-5 pb-4 text-center">
            <Download className="mx-auto h-5 w-5 text-blue-600 mb-1" />
            <p className="text-xs font-bold">Download CSV Template</p>
            <p className="text-[10px] text-muted-foreground">Pre-filled with 10 classics</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm" onClick={seedClassical}>
          <CardContent className="pt-5 pb-4 text-center">
            <Database className="mx-auto h-5 w-5 text-emerald-600 mb-1" />
            <p className="text-xs font-bold">Seed Classical Formulas</p>
            <p className="text-[10px] text-muted-foreground">Add 10 standard medicines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <FileSpreadsheet className="mx-auto h-5 w-5 text-violet-600 mb-1" />
            <p className="text-xs font-bold">CSV Bulk Import</p>
            <p className="text-[10px] text-muted-foreground">Upload hundreds at once</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Link2 className="mx-auto h-5 w-5 text-orange-600 mb-1" />
            <p className="text-xs font-bold">URL Import</p>
            <p className="text-[10px] text-muted-foreground">Paste product URL to extract</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="csv"><FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV Import</TabsTrigger>
          <TabsTrigger value="url"><Link2 className="mr-1 h-3.5 w-3.5" /> URL Import</TabsTrigger>
          <TabsTrigger value="quick"><Plus className="mr-1 h-3.5 w-3.5" /> Quick Add</TabsTrigger>
        </TabsList>

        {/* CSV Tab */}
        <TabsContent value="csv" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Upload CSV File</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                CSV columns: name, brand, category, price, description, unit, ayush_system. <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={downloadTemplate}>Download template</Button>
              </p>
              <Input type="file" accept=".csv,.txt" onChange={handleCSVUpload} />
              {csvRows.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{csvRows.length} rows parsed · {csvRows.filter((r) => r.status === "ready").length} ready · {csvRows.filter((r) => r.status === "error").length} errors</p>
                    <Button onClick={importCSV} disabled={importing}>{importing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />} Import All</Button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto rounded border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0"><tr><th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1">Brand</th><th className="px-2 py-1">Price</th><th className="px-2 py-1">System</th><th className="px-2 py-1">Status</th></tr></thead>
                      <tbody>{csvRows.slice(0, 50).map((r, i) => (
                        <tr key={i} className="border-t"><td className="px-2 py-1 font-medium">{r.name}</td><td className="px-2 py-1">{r.brand}</td><td className="px-2 py-1">₹{r.price}</td><td className="px-2 py-1">{r.ayush_system}</td><td className="px-2 py-1"><Badge className={r.status === "ready" ? "bg-blue-100 text-blue-700" : r.status === "imported" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{r.status}</Badge></td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                  {importResult && <p className="text-sm text-green-700"><CheckCircle2 className="inline h-4 w-4 mr-1" />{importResult.success} imported, {importResult.failed} failed</p>}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Import from Product URL</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Paste a product URL from any AYUSH pharmacy site (1mg, PharmAyush, Kottakkal, etc.) and we'll try to extract product details.</p>
              <div className="flex gap-3">
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://pharmayush.com/product/ashwagandha-churna" className="flex-1" />
                <Button onClick={handleUrlExtract} disabled={urlLoading}>{urlLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Extract</Button>
              </div>
              {urlProduct && (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label className="text-xs">Name *</Label><Input value={urlProduct.name ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, name: e.target.value })} /></div>
                    <div><Label className="text-xs">Brand</Label><Input value={urlProduct.brand ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, brand: e.target.value })} /></div>
                    <div><Label className="text-xs">Price (₹)</Label><Input type="number" value={urlProduct.price ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, price: Number(e.target.value) })} /></div>
                    <div><Label className="text-xs">Unit</Label><Input value={urlProduct.unit ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, unit: e.target.value })} /></div>
                  </div>
                  <div><Label className="text-xs">Description</Label><Textarea value={urlProduct.description ?? ""} onChange={(e) => setUrlProduct({ ...urlProduct, description: e.target.value })} rows={2} /></div>
                  <Button onClick={saveUrlProduct}><CheckCircle2 className="mr-1 h-4 w-4" /> Save Product</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Add Tab */}
        <TabsContent value="quick" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Add Product</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label className="text-xs">Name *</Label><Input value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} placeholder="Ashwagandha Churna 100g" /></div>
                <div><Label className="text-xs">Brand *</Label><Input value={quickForm.brand} onChange={(e) => setQuickForm({ ...quickForm, brand: e.target.value })} placeholder="Kottakkal" /></div>
                <div><Label className="text-xs">Price (₹) *</Label><Input type="number" value={quickForm.price} onChange={(e) => setQuickForm({ ...quickForm, price: e.target.value })} placeholder="199" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><Label className="text-xs">Category</Label>
                  <Select value={quickForm.category} onValueChange={(v) => setQuickForm({ ...quickForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">AYUSH System</Label>
                  <Select value={quickForm.ayush_system} onValueChange={(v) => setQuickForm({ ...quickForm, ayush_system: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AYUSH_SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Unit</Label><Input value={quickForm.unit} onChange={(e) => setQuickForm({ ...quickForm, unit: e.target.value })} placeholder="100g / 200ml / 60 tabs" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs">Stock</Label><Input type="number" value={quickForm.stock} onChange={(e) => setQuickForm({ ...quickForm, stock: e.target.value })} /></div>
                <div><Label className="text-xs">Image URL</Label><Input value={quickForm.image_url} onChange={(e) => setQuickForm({ ...quickForm, image_url: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div><Label className="text-xs">Description</Label><Textarea value={quickForm.description} onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })} rows={2} placeholder="Benefits, usage, ingredients..." /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="text-xs">Health Conditions (comma separated)</Label><Input value={quickForm.health_conditions} onChange={(e) => setQuickForm({ ...quickForm, health_conditions: e.target.value })} placeholder="Joint Pain, Arthritis, Vata" /></div>
                <div><Label className="text-xs">Tags (comma separated)</Label><Input value={quickForm.tags} onChange={(e) => setQuickForm({ ...quickForm, tags: e.target.value })} placeholder="Classical, Organic, GMP" /></div>
              </div>
              <Button onClick={handleQuickSave} disabled={quickSaving}>{quickSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />} Add Product</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductBuilder;
