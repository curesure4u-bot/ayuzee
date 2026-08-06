import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Leaf, Brain, CheckCircle, AlertTriangle, FlaskConical, Calendar, MapPin } from "lucide-react";

const herbs = [
  { name: "Rasna (Pluchea lanceolata)", source: "Kerala farmers cooperative", region: "Wayanad, Kerala", season: "Aug-Oct", grade: "A", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "Pass", moisture: "8.2%", lastProcured: "15 Jul 2026", stock: "12 kg", pricePerKg: 850, status: "in_stock" },
  { name: "Guduchi (Tinospora cordifolia)", source: "NMPB supplier", region: "Nashik, Maharashtra", season: "Year-round", grade: "A", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "Pass", moisture: "7.8%", lastProcured: "10 Jul 2026", stock: "8 kg", pricePerKg: 420, status: "in_stock" },
  { name: "Bala (Sida cordifolia)", source: "Local herb market", region: "Mysore, Karnataka", season: "Sep-Nov", grade: "B", tlc: "Pass", heavyMetal: "Borderline", aflatoxin: "Pass", moisture: "9.5%", lastProcured: "05 Jul 2026", stock: "5 kg", pricePerKg: 380, status: "low_stock" },
  { name: "Shatavari (Asparagus racemosus)", source: "Contract farmer", region: "Rajasthan", season: "Oct-Dec", grade: "A+", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "Pass", moisture: "6.8%", lastProcured: "28 Jun 2026", stock: "15 kg", pricePerKg: 650, status: "in_stock" },
  { name: "Ashwagandha (Withania somnifera)", source: "Neemuch Mandi", region: "MP", season: "Jan-Mar", grade: "A", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "Pass", moisture: "7.2%", lastProcured: "20 Jun 2026", stock: "20 kg", pricePerKg: 520, status: "in_stock" },
  { name: "Devadaru (Cedrus deodara)", source: "Forest dept auction", region: "Himachal Pradesh", season: "Nov-Jan", grade: "B+", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "N/A", moisture: "10.1%", lastProcured: "01 Jun 2026", stock: "3 kg", pricePerKg: 1200, status: "low_stock" },
  { name: "Guggulu (Commiphora wightii)", source: "Rajasthan cooperative", region: "Jodhpur, Rajasthan", season: "Mar-May", grade: "A", tlc: "Pass", heavyMetal: "Pass", aflatoxin: "N/A", moisture: "5.2%", lastProcured: "15 May 2026", stock: "6 kg", pricePerKg: 2800, status: "in_stock" },
];

const seasonalCalendar = [
  { month: "Jan", herbs: ["Ashwagandha", "Devadaru"], peak: true },
  { month: "Feb", herbs: ["Ashwagandha"], peak: true },
  { month: "Mar", herbs: ["Guggulu", "Ashwagandha"], peak: true },
  { month: "Apr", herbs: ["Guggulu"], peak: false },
  { month: "May", herbs: ["Guggulu"], peak: false },
  { month: "Jun", herbs: ["Guduchi"], peak: false },
  { month: "Jul", herbs: ["Guduchi", "Rasna"], peak: false },
  { month: "Aug", herbs: ["Rasna", "Guduchi"], peak: true },
  { month: "Sep", herbs: ["Rasna", "Bala"], peak: true },
  { month: "Oct", herbs: ["Rasna", "Bala", "Shatavari"], peak: true },
  { month: "Nov", herbs: ["Bala", "Shatavari", "Devadaru"], peak: true },
  { month: "Dec", herbs: ["Shatavari", "Devadaru"], peak: true },
];

const qualityTests = [
  { test: "TLC (Thin Layer Chromatography)", purpose: "Identity & purity confirmation", frequency: "Every batch", standard: "API/AYUSH Pharmacopoeia" },
  { test: "Heavy Metal (Pb, As, Hg, Cd)", purpose: "Safety — WHO limits", frequency: "Every batch", standard: "<10 ppm Pb, <3 ppm As" },
  { test: "Aflatoxin (B1, B2, G1, G2)", purpose: "Fungal contamination", frequency: "Every batch", standard: "<5 ppb total" },
  { test: "Moisture Content", purpose: "Storage stability", frequency: "Every batch", standard: "Churna <10%, Root <12%" },
  { test: "Microbial Load (TPC/TYC)", purpose: "Bacterial/fungal count", frequency: "Every batch", standard: "<10⁵ CFU/g (AYUSH standard)" },
  { test: "Ash Value (Total & Acid-insoluble)", purpose: "Purity — detect adulteration", frequency: "Quarterly", standard: "Per API monograph" },
];

export default function HerbProcurement() {
  const inStock = herbs.filter(h => h.status === "in_stock").length;
  const lowStock = herbs.filter(h => h.status === "low_stock").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" /> Herb Procurement & Quality (Raw Drug)
        </h1>
        <p className="text-muted-foreground mt-1">Source herbs from farmers/markets, quality grading, seasonal availability — GMP-grade raw material management</p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="inventory" className="text-xs">Raw Drug Inventory</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs">Quality Tests</TabsTrigger>
          <TabsTrigger value="seasonal" className="text-xs">Seasonal Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{herbs.length}</p><p className="text-xs text-muted-foreground">Raw Herbs</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{inStock}</p><p className="text-xs text-muted-foreground">In Stock</p></CardContent></Card>
            <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{lowStock}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Herb (Latin)</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-center">Grade</th>
                  <th className="px-3 py-2 text-center">TLC</th>
                  <th className="px-3 py-2 text-center">Heavy Metal</th>
                  <th className="px-3 py-2 text-center">Moisture</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right">₹/kg</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {herbs.map((h, i) => (
                  <tr key={i} className={`border-b ${h.status === "low_stock" ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs"><span className="font-medium">{h.name}</span><br/><span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{h.region}</span></td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{h.source}</td>
                    <td className="px-3 py-2 text-center"><Badge variant={h.grade.includes("A") ? "outline" : "secondary"} className={`text-[10px] ${h.grade.includes("A") ? "text-green-600" : ""}`}>{h.grade}</Badge></td>
                    <td className="px-3 py-2 text-center text-[10px] text-green-600">{h.tlc}</td>
                    <td className="px-3 py-2 text-center text-[10px]"><span className={h.heavyMetal === "Pass" ? "text-green-600" : "text-amber-600"}>{h.heavyMetal}</span></td>
                    <td className="px-3 py-2 text-center text-[10px]">{h.moisture}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{h.stock}</td>
                    <td className="px-3 py-2 text-right text-xs">₹{h.pricePerKg.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge variant={h.status === "in_stock" ? "outline" : "destructive"} className={`text-[10px] ${h.status === "in_stock" ? "text-green-600" : ""}`}>{h.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Quality control tests performed on every raw herb batch — AYUSH GMP compliance</p>
          <div className="space-y-2">
            {qualityTests.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-blue-600" /> {t.test}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px]">{t.frequency}</p>
                    <p className="text-[10px] text-muted-foreground">{t.standard}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Optimal procurement windows — buy during peak harvest for best quality & price</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {seasonalCalendar.map((m, i) => (
              <Card key={i} className={`${m.month === "Jul" ? "ring-2 ring-blue-500" : ""} ${m.peak ? "bg-green-50/50" : ""}`}>
                <CardContent className="p-2 text-center">
                  <p className="text-[10px] font-bold">{m.month}</p>
                  {m.herbs.map((h, j) => <p key={j} className="text-[8px] text-muted-foreground truncate">{h}</p>)}
                  {m.peak && <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mt-1" />}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Peak harvest season</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded ring-2 ring-blue-500" /> Current month</span>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Herb Procurement</p>
            <p className="text-sm text-purple-700">
              Bala (heavy metal borderline): AI recommends switching to certified organic supplier in Coimbatore (₹420/kg vs ₹380 — 10% premium but zero compliance risk).
              Devadaru low stock (3 kg) — next forest auction in Nov. Pre-book 10 kg via Himachal cooperative.
              Guggulu prices rising (₹2,800→₹3,200 predicted by Dec) — stock up now during off-season.
              Rasna peak season starting Aug — best quality available. Place order for 25 kg.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
