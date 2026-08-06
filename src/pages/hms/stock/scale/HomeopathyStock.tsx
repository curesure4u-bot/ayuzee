import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain, Pill, Droplets, AlertTriangle, CheckCircle,
  Package, FlaskConical, Shield, Thermometer, BarChart3,
} from "lucide-react";

// ─── TAB 1: POTENCY MATRIX ───
function PotencyMatrixTab() {
  const remedies = [
    { name: "Rhus Toxicodendron", potencies: { "6C": 2, "30C": 5, "200C": 3, "1M": 2, "10M": 1, "CM": 0 }, forms: { dilution: true, globules: true, tablets: false }, usage: "high" },
    { name: "Bryonia Alba", potencies: { "6C": 1, "30C": 4, "200C": 3, "1M": 2, "10M": 1, "CM": 1 }, forms: { dilution: true, globules: true, tablets: false }, usage: "high" },
    { name: "Arnica Montana", potencies: { "6C": 3, "30C": 6, "200C": 4, "1M": 2, "10M": 1, "CM": 0 }, forms: { dilution: true, globules: true, tablets: true }, usage: "high" },
    { name: "Nux Vomica", potencies: { "6C": 2, "30C": 5, "200C": 3, "1M": 1, "10M": 1, "CM": 0 }, forms: { dilution: true, globules: true, tablets: false }, usage: "high" },
    { name: "Calcarea Carbonica", potencies: { "6C": 0, "30C": 3, "200C": 2, "1M": 2, "10M": 1, "CM": 1 }, forms: { dilution: true, globules: true, tablets: false }, usage: "medium" },
    { name: "Lycopodium", potencies: { "6C": 1, "30C": 3, "200C": 2, "1M": 2, "10M": 1, "CM": 0 }, forms: { dilution: true, globules: true, tablets: false }, usage: "medium" },
    { name: "Sulphur", potencies: { "6C": 2, "30C": 4, "200C": 2, "1M": 1, "10M": 0, "CM": 0 }, forms: { dilution: true, globules: true, tablets: false }, usage: "medium" },
    { name: "Thuja Occidentalis", potencies: { "6C": 1, "30C": 2, "200C": 2, "1M": 1, "10M": 0, "CM": 0 }, forms: { dilution: true, globules: false, tablets: false }, usage: "low" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Medicine × Potency × Form grid — track stock at potency level</p>
        <Badge className="bg-blue-100 text-blue-700 text-xs">{remedies.length} remedies × 6 potencies = {remedies.length * 6} SKUs</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Remedy</th><th className="px-3 py-2 text-center">6C</th><th className="px-3 py-2 text-center">30C</th><th className="px-3 py-2 text-center">200C</th><th className="px-3 py-2 text-center">1M</th><th className="px-3 py-2 text-center">10M</th><th className="px-3 py-2 text-center">CM</th><th className="px-3 py-2 text-center">Forms</th><th className="px-3 py-2 text-center">Usage</th></tr></thead><tbody>
          {remedies.map((r, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{r.name}</td>
              {Object.entries(r.potencies).map(([pot, qty]) => (
                <td key={pot} className="px-3 py-2 text-center">
                  <span className={`text-xs font-bold ${qty === 0 ? "text-red-500" : qty <= 1 ? "text-amber-600" : "text-green-600"}`}>{qty}</span>
                </td>
              ))}
              <td className="px-3 py-2 text-center text-[10px]">
                {r.forms.dilution && <Badge variant="outline" className="text-[8px] mr-0.5">Dil</Badge>}
                {r.forms.globules && <Badge variant="outline" className="text-[8px] mr-0.5">Glob</Badge>}
                {r.forms.tablets && <Badge variant="outline" className="text-[8px]">Tab</Badge>}
              </td>
              <td className="px-3 py-2 text-center"><Badge variant={r.usage === "high" ? "default" : r.usage === "medium" ? "secondary" : "outline"} className="text-[10px]">{r.usage}</Badge></td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
          <strong>Zero stock:</strong> Rhus Tox CM, Calcarea 6C, Thuja 10M/CM — AI recommends stocking CM only for polycrest remedies. Low-demand potencies: Order on-demand from SBL/Schwabe.
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 2: DISPENSING STATION ───
function DispensingStationTab() {
  const dispensingLog = [
    { time: "10:42 AM", patient: "Arun K.", remedy: "Rhus Tox", potency: "200C", form: "Globules", bulkBottle: "RT200-BLK-01 (120g)", dispensed: "4 globules", vial: "2 dram", remaining: "115g", doses: "~28 doses left" },
    { time: "10:30 AM", patient: "Priya M.", remedy: "Nux Vomica", potency: "30C", form: "Dilution", bulkBottle: "NV30-BLK-03 (30ml)", dispensed: "2 drops in 15ml aqua", vial: "15ml dropper", remaining: "26ml", doses: "~13 doses left" },
    { time: "10:15 AM", patient: "Suresh R.", remedy: "Bryonia Alba", potency: "1M", form: "Globules", bulkBottle: "BA1M-BLK-01 (60g)", dispensed: "4 globules (single dose)", vial: "Paper fold", remaining: "58g", doses: "~29 doses left" },
    { time: "09:55 AM", patient: "Kavitha S.", remedy: "Arnica Montana", potency: "30C", form: "Dilution", bulkBottle: "AM30-BLK-02 (30ml)", dispensed: "2 drops × 3 doses in aqua", vial: "15ml dropper", remaining: "22ml", doses: "~11 multi-dose left" },
    { time: "09:30 AM", patient: "Rajan P.", remedy: "Calcarea Carb", potency: "200C", form: "Globules", bulkBottle: "CC200-BLK-01 (60g)", dispensed: "4 globules × 7 days", vial: "4 dram", remaining: "32g", doses: "~8 weekly doses left" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Dispense from bulk stock bottles into patient vials — auto-deduct per dose</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Droplets className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold">12</p><p className="text-[10px] text-muted-foreground">Dispensed Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold">85</p><p className="text-[10px] text-muted-foreground">Active Bulk Bottles</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Pill className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold">4</p><p className="text-[10px] text-muted-foreground">Near Empty (&lt;10%)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">₹45</p><p className="text-[10px] text-muted-foreground">Avg Cost/Dispensing</p></CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Time</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Remedy + Potency</th><th className="px-3 py-2 text-center">Form</th><th className="px-3 py-2 text-center">Dispensed</th><th className="px-3 py-2 text-left">Bulk Source</th><th className="px-3 py-2 text-center">Remaining</th></tr></thead><tbody>
            {dispensingLog.map((d, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">{d.time}</td>
                <td className="px-3 py-2 text-xs font-medium">{d.patient}</td>
                <td className="px-3 py-2 text-xs">{d.remedy} <Badge variant="outline" className="text-[8px] ml-1">{d.potency}</Badge></td>
                <td className="px-3 py-2 text-center text-[10px]">{d.form}</td>
                <td className="px-3 py-2 text-center text-xs font-bold text-blue-600">{d.dispensed}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{d.bulkBottle}</td>
                <td className="px-3 py-2 text-center text-xs">{d.remaining}<br/><span className="text-[9px] text-muted-foreground">{d.doses}</span></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 3: ANTIDOTING & STORAGE RULES ───
function AntidotingTab() {
  const antidotes = [
    { remedy: "Camphor (Camphora)", antidotes: "Almost ALL remedies", rule: "Store in separate locked cabinet. Minimum 6 feet from other remedies.", zone: "Zone C (isolated)", severity: "critical" },
    { remedy: "Coffee (Coffea)", antidotes: "Nux Vomica, Ignatia, Chamomilla", rule: "Separate shelf. Patients advised to avoid coffee during treatment.", zone: "Zone B", severity: "high" },
    { remedy: "Menthol / Mint", antidotes: "Most remedies (controversial)", rule: "Store separately. Keep mint-based products in different cabinet.", zone: "Zone B", severity: "high" },
    { remedy: "Nux Vomica", antidotes: "Coffea, Ignatia, Chamomilla", rule: "Can store normally but flag if prescribed together.", zone: "Zone A (general)", severity: "medium" },
    { remedy: "Pulsatilla", antidotes: "Chamomilla, Coffea, Ignatia, Nux Vomica", rule: "Normal storage. AI alerts if prescribed with antidoting remedy.", zone: "Zone A", severity: "low" },
  ];

  const storageZones = [
    { zone: "Zone A (General)", description: "All regular potencies, polycrest remedies", conditions: "Room temp, dark cabinet, away from sunlight", items: "~450 remedies" },
    { zone: "Zone B (Separation)", description: "Coffee, Menthol, strong-smelling remedies", conditions: "Separate cabinet, sealed containers", items: "~15 remedies" },
    { zone: "Zone C (Isolated)", description: "Camphor, Eucalyptus, essential oils", conditions: "Locked separate cabinet, minimum 6 feet from Zone A", items: "~5 items" },
    { zone: "Zone D (Mother Tinctures)", description: "All MT/Q preparations", conditions: "Cool, dark, amber glass. Track expiry (5 years).", items: "~120 MTs" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Homeopathic antidoting rules — certain remedies cancel each other's action. Storage separation critical.</p>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600 flex items-center gap-2"><Shield className="h-4 w-4" /> Antidoting Remedies</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Remedy</th><th className="px-3 py-2 text-left">Antidotes</th><th className="px-3 py-2 text-left">Storage Rule</th><th className="px-3 py-2 text-center">Zone</th><th className="px-3 py-2 text-center">Severity</th></tr></thead><tbody>
            {antidotes.map((a, i) => (
              <tr key={i} className={`border-b ${a.severity === "critical" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-medium">{a.remedy}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{a.antidotes}</td>
                <td className="px-3 py-2 text-[10px]">{a.rule}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{a.zone}</Badge></td>
                <td className="px-3 py-2 text-center"><Badge variant={a.severity === "critical" ? "destructive" : a.severity === "high" ? "default" : "secondary"} className="text-[10px]">{a.severity}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Storage Zones</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {storageZones.map((z, i) => (
            <div key={i} className="p-2 rounded border text-xs flex items-center justify-between">
              <div><p className="font-bold">{z.zone}</p><p className="text-muted-foreground">{z.description} | {z.conditions}</p></div>
              <Badge variant="outline" className="text-[10px]">{z.items}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 4: DEAD POTENCY ANALYSIS ───
function DeadPotencyTab() {
  const deadStock = [
    { remedy: "Apis Mellifica", potency: "CM", lastUsed: "Never", stock: 1, value: 320, suggestion: "Remove. CM rarely used. Keep up to 10M max." },
    { remedy: "Belladonna", potency: "6C", lastUsed: "8 months ago", stock: 3, value: 240, suggestion: "Reduce to 1. Use 30C as first potency instead." },
    { remedy: "Cantharis", potency: "10M", lastUsed: "Never", stock: 1, value: 280, suggestion: "Remove. Cantharis used mainly in 30C/200C for UTI." },
    { remedy: "Gelsemium", potency: "1M", lastUsed: "6 months ago", stock: 2, value: 180, suggestion: "Keep 1. Useful for chronic anxiety cases but rare." },
    { remedy: "Ignatia", potency: "CM", lastUsed: "Never", stock: 1, value: 350, suggestion: "Keep — polycrest remedy, CM useful for deep grief cases." },
    { remedy: "Kali Carb", potency: "6C", lastUsed: "1 year ago", stock: 2, value: 160, suggestion: "Remove. Kali Carb mainly used 30C+ for constitutional." },
    { remedy: "Medorrhinum", potency: "30C", lastUsed: "4 months ago", stock: 3, value: 270, suggestion: "Reduce to 1. Nosode — used rarely, mainly 200C/1M." },
    { remedy: "Sepia", potency: "6C", lastUsed: "10 months ago", stock: 2, value: 160, suggestion: "Remove. Sepia is constitutional — start at 200C." },
  ];

  const totalDeadValue = deadStock.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Potencies never/rarely used — tied-up capital. AI suggests minimum stock list.</p>
        <Badge variant="destructive" className="text-xs">₹{totalDeadValue.toLocaleString()} tied in dead potencies</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Remedy</th><th className="px-3 py-2 text-center">Potency</th><th className="px-3 py-2 text-center">Last Used</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-left">AI Suggestion</th></tr></thead><tbody>
          {deadStock.map((d, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{d.remedy}</td>
              <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{d.potency}</Badge></td>
              <td className="px-3 py-2 text-center text-xs text-red-600">{d.lastUsed}</td>
              <td className="px-3 py-2 text-center text-xs">{d.stock}</td>
              <td className="px-3 py-2 text-right text-xs">₹{d.value}</td>
              <td className="px-3 py-2 text-[10px] text-purple-700 max-w-[200px]">{d.suggestion}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700">
          <strong>AI Minimum Stock Rule:</strong> Polycrest remedies (top 50) — stock 30C, 200C, 1M always. Keep 10M/CM only for top 20. Small remedies — stock only the potency your doctor uses most. Review quarterly.
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 5: MOTHER TINCTURE EXPIRY ───
function MotherTinctureTab() {
  const tinctures = [
    { name: "Arnica Montana Q", supplier: "SBL", batch: "MT-AM-0122", mfg: "Jan 2022", expiry: "Dec 2026", stock: "3 × 30ml", daysLeft: 161, status: "ok" },
    { name: "Calendula Off. Q", supplier: "Schwabe", batch: "MT-CO-0321", mfg: "Mar 2021", expiry: "Feb 2026", stock: "2 × 30ml", daysLeft: -150, status: "expired" },
    { name: "Berberis Vulgaris Q", supplier: "Dr. Reckeweg", batch: "MT-BV-0622", mfg: "Jun 2022", expiry: "May 2027", stock: "2 × 30ml", daysLeft: 312, status: "ok" },
    { name: "Cineraria Maritima Q", supplier: "SBL", batch: "MT-CM-0423", mfg: "Apr 2023", expiry: "Mar 2028", stock: "1 × 10ml", daysLeft: 616, status: "ok" },
    { name: "Hypericum Perf. Q", supplier: "Schwabe", batch: "MT-HP-0121", mfg: "Jan 2021", expiry: "Dec 2025", stock: "1 × 30ml", daysLeft: -205, status: "expired" },
    { name: "Thuja Occ. Q", supplier: "SBL", batch: "MT-TO-0823", mfg: "Aug 2023", expiry: "Jul 2028", stock: "2 × 30ml", daysLeft: 738, status: "ok" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mother Tinctures (Q) have 5-year shelf-life. Potentized remedies (30C+) = unlimited if stored correctly.</p>
        <Badge variant="destructive" className="text-xs">{tinctures.filter(t => t.status === "expired").length} expired MTs</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Mother Tincture</th><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-center">Batch</th><th className="px-3 py-2 text-center">Mfg</th><th className="px-3 py-2 text-center">Expiry</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-center">Days Left</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {tinctures.map((t, i) => (
            <tr key={i} className={`border-b ${t.status === "expired" ? "bg-red-50/50" : ""}`}>
              <td className="px-3 py-2 text-xs font-medium">{t.name}</td>
              <td className="px-3 py-2 text-xs">{t.supplier}</td>
              <td className="px-3 py-2 text-center text-xs font-mono">{t.batch}</td>
              <td className="px-3 py-2 text-center text-xs">{t.mfg}</td>
              <td className="px-3 py-2 text-center text-xs">{t.expiry}</td>
              <td className="px-3 py-2 text-center text-xs">{t.stock}</td>
              <td className="px-3 py-2 text-center text-xs font-bold"><span className={t.daysLeft < 0 ? "text-red-600" : t.daysLeft < 180 ? "text-amber-600" : "text-green-600"}>{t.daysLeft}d</span></td>
              <td className="px-3 py-2 text-center"><Badge variant={t.status === "expired" ? "destructive" : "outline"} className={`text-[10px] ${t.status === "ok" ? "text-green-600" : ""}`}>{t.status}</Badge></td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 text-xs text-green-700">
          <strong>Key difference:</strong> Mother Tinctures (Q) = alcohol extract of raw plant → degrades in 5 years. Potentized medicines (6C, 30C, 200C, 1M etc.) = no physical molecule → theoretically unlimited shelf-life if stored in dark, sealed, away from strong odors. System tracks MT expiry but marks potentized as "No Expiry."
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 6: REPERTORY-BASED AI DEMAND ───
function RepertoryDemandTab() {
  const demandPatterns = [
    { constitution: "Nux Vomica type", patients: 18, topRemedies: ["Nux Vomica 200C", "Lycopodium 30C", "Sulphur 200C"], trend: "+15%", reason: "Urban stress, sedentary lifestyle, gastric issues rising in monsoon" },
    { constitution: "Pulsatilla type", patients: 12, topRemedies: ["Pulsatilla 200C", "Sepia 200C", "Calcarea Carb 30C"], trend: "+8%", reason: "Women hormonal issues, PCOD cases increasing" },
    { constitution: "Rhus Tox type", patients: 22, topRemedies: ["Rhus Tox 200C", "Bryonia 30C", "Arnica 200C"], trend: "+25%", reason: "Monsoon arthritis flare-up — Spine Ayush referrals" },
    { constitution: "Calcarea type", patients: 8, topRemedies: ["Calcarea Carb 200C", "Silicea 200C", "Baryta Carb 30C"], trend: "+5%", reason: "Pediatric cases — slow development, recurring infections" },
    { constitution: "Sulphur type", patients: 10, topRemedies: ["Sulphur 200C", "Nux Vomica 30C", "Psorinum 200C"], trend: "0%", reason: "Chronic skin cases — stable demand" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI analyzes patient constitution patterns to predict remedy demand — unlike disease-based forecasting</p>
      <div className="space-y-3">
        {demandPatterns.map((d, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{d.constitution}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.patients} active patients | Top: {d.topRemedies.join(", ")}</p>
                  <p className="text-[10px] mt-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">{d.reason}</p>
                </div>
                <Badge variant={d.trend.includes("+") && parseInt(d.trend) > 10 ? "default" : "secondary"} className="text-xs">{d.trend}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Repertory Demand Prediction</p><p className="text-[10px] text-purple-700">Unlike Ayurveda (disease-based demand), Homeopathy demand depends on constitutional patterns in your patient base. Rhus Tox type surging +25% (monsoon joints) — stock 200C and 1M extra. Nux Vomica always high (urban patients). AI predicts next month: increase Bryonia 30C (monsoon respiratory) and Dulcamara 200C (damp-cold aggravation).</p></div></CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 7: COMBINATION PRODUCTS ───
function CombinationProductsTab() {
  const products = [
    { brand: "SBL", product: "Drops No.1 (Hair)", composition: "Arnica, Jaborandi, Cantharis, Wiesbaden", pack: "30ml", mrp: 165, stock: 12, usage: "high" },
    { brand: "Schwabe", product: "Alpha-Liv (Liver)", composition: "Carduus Mar, Chelidonium, Lycopodium, Nux Vom", pack: "30ml", mrp: 195, stock: 8, usage: "medium" },
    { brand: "Dr. Reckeweg", product: "R1 (Inflammation)", composition: "Apis, Belladonna, Bryonia, Echinacea", pack: "22ml", mrp: 285, stock: 6, usage: "high" },
    { brand: "Dr. Reckeweg", product: "R89 (Hair Lipocaps)", composition: "Acidum Phos, Kalium Phos, Lycopodium", pack: "30 caps", mrp: 320, stock: 4, usage: "medium" },
    { brand: "SBL", product: "Stobal Cough Syrup", composition: "Drosera, Rumex, Ipecac, Spongia", pack: "115ml", mrp: 125, stock: 15, usage: "high" },
    { brand: "Schwabe", product: "Biocombination No.12", composition: "Calc Sulph, Silicea, Nat Sulph, Kali Mur", pack: "100 tabs", mrp: 110, stock: 20, usage: "medium" },
    { brand: "SBL", product: "Clearstone Drops", composition: "Berberis, Sarsaparilla, Ocimum, Pareira", pack: "30ml", mrp: 145, stock: 10, usage: "medium" },
    { brand: "Dr. Reckeweg", product: "R19 (Glandular Male)", composition: "Agnus Cast, Conium, Damiana, Selenium", pack: "22ml", mrp: 285, stock: 3, usage: "low" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Branded combination medicines (SBL, Schwabe, Dr. Reckeweg) — different SKU logic from classical remedies</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Brand</th><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-left">Composition</th><th className="px-3 py-2 text-center">Pack</th><th className="px-3 py-2 text-center">MRP</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-center">Usage</th></tr></thead><tbody>
          {products.map((p, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs"><Badge variant="outline" className="text-[10px]">{p.brand}</Badge></td>
              <td className="px-3 py-2 text-xs font-medium">{p.product}</td>
              <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px]">{p.composition}</td>
              <td className="px-3 py-2 text-center text-xs">{p.pack}</td>
              <td className="px-3 py-2 text-center text-xs">₹{p.mrp}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">{p.stock}</td>
              <td className="px-3 py-2 text-center"><Badge variant={p.usage === "high" ? "default" : p.usage === "medium" ? "secondary" : "outline"} className="text-[10px]">{p.usage}</Badge></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}


// ─── MAIN COMPONENT ───
export default function HomeopathyStock() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-indigo-600" /> Homeopathy Stock Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Potency-wise tracking, bulk dispensing, antidoting rules, constitutional demand AI
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 text-xs text-indigo-700">
          <strong>Homeopathy is different:</strong> Same remedy exists in 6+ potencies × 3 forms = massive SKU multiplication.
          Demand is constitution-based (unpredictable). Dispensing is from bulk bottles into tiny patient vials.
          Storage requires separation zones (antidoting). Mother Tinctures expire but potentized remedies don't.
        </CardContent>
      </Card>

      <Tabs defaultValue="potency" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="potency" className="text-xs">Potency Matrix</TabsTrigger>
          <TabsTrigger value="dispensing" className="text-xs">Dispensing Station</TabsTrigger>
          <TabsTrigger value="antidoting" className="text-xs">Antidoting Rules</TabsTrigger>
          <TabsTrigger value="dead" className="text-xs">Dead Potencies</TabsTrigger>
          <TabsTrigger value="mt" className="text-xs">Mother Tinctures</TabsTrigger>
          <TabsTrigger value="demand" className="text-xs">AI Demand</TabsTrigger>
          <TabsTrigger value="combinations" className="text-xs">Combinations</TabsTrigger>
        </TabsList>

        <TabsContent value="potency"><PotencyMatrixTab /></TabsContent>
        <TabsContent value="dispensing"><DispensingStationTab /></TabsContent>
        <TabsContent value="antidoting"><AntidotingTab /></TabsContent>
        <TabsContent value="dead"><DeadPotencyTab /></TabsContent>
        <TabsContent value="mt"><MotherTinctureTab /></TabsContent>
        <TabsContent value="demand"><RepertoryDemandTab /></TabsContent>
        <TabsContent value="combinations"><CombinationProductsTab /></TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Homeopathy Stock Intelligence</p>
            <p className="text-sm text-purple-700">
              <strong>Current state:</strong> 520 remedies × avg 3 potencies = 1,560 SKUs. But only 180 are regularly used (12%).
              Dead stock tied capital: ₹1,960. AI recommends trimming to 300 active SKUs + order-on-demand for rare potencies.
              <br/><strong>Monsoon pattern:</strong> Rhus Tox (+25%), Dulcamara, Natrum Sulph demand rising — stock 200C extra.
              <br/><strong>Dispensing efficiency:</strong> Bulk globule bottles (120g) last avg 30 patients. Cost per dispensing: ₹45.
              One bulk bottle at ₹280 generates ₹1,350 in dispensing revenue (4.8x return).
              <br/><strong>Camphor alert:</strong> 2 new Camphor-based products received — auto-routed to Zone C storage.
              2 expired Mother Tinctures detected — remove from dispensing immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
