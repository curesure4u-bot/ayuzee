import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain, Beaker, Package, Tag, Droplets, FlaskConical,
  CheckCircle, AlertTriangle, Printer, Users, Clock,
} from "lucide-react";

// ─── TAB 1: MIXING STATION ───
function MixingStationTab() {
  const pendingMixes = [
    {
      id: "MIX-4001", patient: "Rajesh Kumar", rx: "Rx#4525", doctor: "Dr. Arun", date: "22 Jul 2026",
      components: [
        { medicine: "Rasnasaptakam Kashayam", portion: "100ml", source: "Bottle #RSK-0726-A (450ml)", remaining: "150ml" },
        { medicine: "Dhanwantharam Kashayam", portion: "100ml", source: "Bottle #DHK-0726-B (450ml)", remaining: "200ml" },
      ],
      prakshepam: [{ item: "Gorochana tablet", qty: "10 tabs", action: "Crush & mix" }],
      totalVolume: "200ml + 10 tabs", price: 148, status: "pending",
    },
    {
      id: "MIX-4002", patient: "Meera Nair", rx: "Rx#4526", doctor: "Dr. Arun", date: "22 Jul 2026",
      components: [
        { medicine: "Dasamoolarishtam", portion: "100ml", source: "Bottle #DMA-0726-E (450ml)", remaining: "250ml" },
        { medicine: "Abhayarishtam", portion: "50ml", source: "Bottle #ABH-0726-C (450ml)", remaining: "300ml" },
        { medicine: "Kumaryasava", portion: "50ml", source: "Bottle #KMA-0726-D (450ml)", remaining: "350ml" },
      ],
      prakshepam: [{ item: "Honey (Prakshepam)", qty: "10ml", action: "Mix before dispensing" }],
      totalVolume: "200ml + 10ml honey", price: 135, status: "pending",
    },
    {
      id: "MIX-4003", patient: "Suresh Menon", rx: "Rx#4527", doctor: "Dr. Priya", date: "22 Jul 2026",
      components: [
        { medicine: "Rasnasaptakam Kashayam", portion: "100ml", source: "Bottle #RSK-0726-A (450ml)", remaining: "50ml" },
        { medicine: "Guggulutiktam Kashayam", portion: "100ml", source: "Bottle #GTK-0726-F (450ml)", remaining: "350ml" },
      ],
      prakshepam: [],
      totalVolume: "200ml", price: 142, status: "mixing",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Doctor Rx → Auto-calculate portions → Mix → Dispense</p>
        <Badge className="bg-amber-100 text-amber-700 text-xs">{pendingMixes.filter(m => m.status === "pending").length} pending mixes</Badge>
      </div>
      <div className="space-y-3">
        {pendingMixes.map((mix) => (
          <Card key={mix.id} className={mix.status === "mixing" ? "border-blue-300" : "border-amber-200"}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {mix.id} — {mix.patient}
                    <Badge variant={mix.status === "mixing" ? "default" : "secondary"} className="text-[10px]">{mix.status}</Badge>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">{mix.rx} • {mix.doctor} • {mix.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{mix.price}</p>
                  <p className="text-[10px] text-muted-foreground">{mix.totalVolume}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                {mix.components.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">{comp.medicine}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-600">{comp.portion}</span>
                      <span className="text-[10px] text-muted-foreground">from {comp.source}</span>
                      <Badge variant="outline" className="text-[10px]">Left: {comp.remaining}</Badge>
                    </div>
                  </div>
                ))}
                {mix.prakshepam.length > 0 && mix.prakshepam.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-amber-50">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-3 w-3 text-amber-600" />
                      <span className="font-medium text-amber-800">{p.item}</span>
                    </div>
                    <span className="text-amber-700">{p.qty} — {p.action}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {mix.status === "pending" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${mix.id} mixing started`)}>Start Mix</Button>}
                {mix.status === "mixing" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${mix.id} completed & labeled`)}>Complete & Label</Button>}
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Label preview generated")}><Printer className="h-3 w-3 mr-1" />Print Label</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 2: PARTIAL BOTTLE MANAGEMENT ───
function PartialBottleTab() {
  const openBottles = [
    { id: "RSK-0726-A", medicine: "Rasnasaptakam Kashayam", original: 450, remaining: 50, unit: "ml", openedDate: "20 Jul", patients: 4, estExpiry: "27 Jul (7 days after opening)", status: "low" },
    { id: "DHK-0726-B", medicine: "Dhanwantharam Kashayam", original: 450, remaining: 200, unit: "ml", openedDate: "21 Jul", patients: 2, estExpiry: "28 Jul", status: "ok" },
    { id: "DMA-0726-E", medicine: "Dasamoolarishtam", original: 450, remaining: 250, unit: "ml", openedDate: "22 Jul", patients: 1, estExpiry: "N/A (Arishtam — unlimited)", status: "ok" },
    { id: "ABH-0726-C", medicine: "Abhayarishtam", original: 450, remaining: 300, unit: "ml", openedDate: "22 Jul", patients: 1, estExpiry: "N/A (Arishtam)", status: "ok" },
    { id: "KMA-0726-D", medicine: "Kumaryasava", original: 450, remaining: 350, unit: "ml", openedDate: "22 Jul", patients: 1, estExpiry: "N/A (Asava)", status: "ok" },
    { id: "GTK-0726-F", medicine: "Guggulutiktam Kashayam", original: 450, remaining: 350, unit: "ml", openedDate: "22 Jul", patients: 1, estExpiry: "29 Jul", status: "ok" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Track open bottles — remaining volume, patients served, residual expiry</p>
        <Badge variant="destructive" className="text-xs">{openBottles.filter(b => b.status === "low").length} low/expiring</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Bottle ID</th><th className="px-3 py-2 text-left">Medicine</th><th className="px-3 py-2 text-center">Original</th><th className="px-3 py-2 text-center">Remaining</th><th className="px-3 py-2 text-center">Used %</th><th className="px-3 py-2 text-center">Patients</th><th className="px-3 py-2 text-center">Opened</th><th className="px-3 py-2 text-left">Mixed Expiry</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {openBottles.map((b, i) => {
            const usedPct = Math.round(((b.original - b.remaining) / b.original) * 100);
            return (
              <tr key={i} className={`border-b ${b.status === "low" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono">{b.id}</td>
                <td className="px-3 py-2 text-xs font-medium">{b.medicine}</td>
                <td className="px-3 py-2 text-center text-xs">{b.original}{b.unit}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{b.remaining}{b.unit}</td>
                <td className="px-3 py-2 text-center"><Progress value={usedPct} className="w-12 h-1.5 mx-auto" /></td>
                <td className="px-3 py-2 text-center text-xs">{b.patients}</td>
                <td className="px-3 py-2 text-center text-xs">{b.openedDate}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{b.estExpiry}</td>
                <td className="px-3 py-2 text-center"><Badge variant={b.status === "low" ? "destructive" : "outline"} className={`text-[10px] ${b.status === "ok" ? "text-green-600" : ""}`}>{b.status}</Badge></td>
              </tr>
            );
          })}
        </tbody></table>
      </div>
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 text-xs text-amber-700">
          <strong>Rule:</strong> Kashayam bottles once opened must be used within 7 days (microbial risk). Arishtam/Asava — no limit (self-preserving due to alcohol content). Churna — 30 days once opened. AI auto-flags bottles nearing open-expiry.
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 3: MRP CALCULATOR ───
function MrpCalculatorTab() {
  const priceBreakdown = [
    { medicine: "Rasnasaptakam Kashayam 450ml", mrp: 210, perMl: 0.47, portion50: 23, portion100: 47, portion150: 70, portion200: 93 },
    { medicine: "Dhanwantharam Kashayam 450ml", mrp: 195, perMl: 0.43, portion50: 22, portion100: 43, portion150: 65, portion200: 87 },
    { medicine: "Dasamoolarishtam 450ml", mrp: 185, perMl: 0.41, portion50: 21, portion100: 41, portion150: 62, portion200: 82 },
    { medicine: "Abhayarishtam 450ml", mrp: 165, perMl: 0.37, portion50: 18, portion100: 37, portion150: 55, portion200: 73 },
    { medicine: "Kumaryasava 450ml", mrp: 175, perMl: 0.39, portion50: 19, portion100: 39, portion150: 58, portion200: 78 },
    { medicine: "Guggulutiktam Kashayam 450ml", mrp: 220, perMl: 0.49, portion50: 24, portion100: 49, portion150: 73, portion200: 98 },
    { medicine: "Kottamchukkadi Taila 200ml", mrp: 280, perMl: 1.40, portion50: 70, portion100: 140, portion150: 210, portion200: 280 },
    { medicine: "Mahanarayan Taila 200ml", mrp: 320, perMl: 1.60, portion50: 80, portion100: 160, portion150: 240, portion200: 320 },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Auto-split MRP proportionally — charge per ml/tab/gram. Fair pricing for partial dispensing.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Medicine</th><th className="px-3 py-2 text-center">Full MRP</th><th className="px-3 py-2 text-center">₹/ml</th><th className="px-3 py-2 text-center">50ml</th><th className="px-3 py-2 text-center">100ml</th><th className="px-3 py-2 text-center">150ml</th><th className="px-3 py-2 text-center">200ml</th></tr></thead><tbody>
          {priceBreakdown.map((p, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{p.medicine}</td>
              <td className="px-3 py-2 text-center text-xs">₹{p.mrp}</td>
              <td className="px-3 py-2 text-center text-xs font-bold text-blue-600">₹{p.perMl.toFixed(2)}</td>
              <td className="px-3 py-2 text-center text-xs">₹{p.portion50}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">₹{p.portion100}</td>
              <td className="px-3 py-2 text-center text-xs">₹{p.portion150}</td>
              <td className="px-3 py-2 text-center text-xs">₹{p.portion200}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700">
          <strong>Pricing formula:</strong> Portion Price = (MRP ÷ Total Volume) × Dispensed Volume + Mixing Charge (₹10 flat per mix). Prakshepam items charged separately at MRP. GST included in MRP (5% for AYUSH medicines).
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 4: MIX LABEL GENERATOR ───
function LabelGeneratorTab() {
  const sampleLabel = {
    patient: "Rajesh Kumar", age: 45, id: "P-1001",
    mixId: "MIX-4001", date: "22 Jul 2026",
    contents: [
      "Rasnasaptakam Kashayam — 100ml (Batch: RSK-0726-A)",
      "Dhanwantharam Kashayam — 100ml (Batch: DHK-0726-B)",
      "Gorochana Tablet — 10 nos (crushed & mixed)",
    ],
    dosage: "30ml twice daily, before food, with warm water",
    duration: "15 days",
    mixedExpiry: "29 Jul 2026 (7 days from mixing — Kashayam rule)",
    doctor: "Dr. Arun Sharma (BAMS, MD)",
    branch: "Spine Ayush — Central Pharmacy",
    storage: "Refrigerate after opening. Shake well before use.",
    warnings: "Do not mix with cold water. Avoid sour foods 1 hour after intake.",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Auto-generate patient-specific labels for mixed medicines — print-ready</p>
      <Card className="border-2 border-dashed border-gray-300 max-w-md mx-auto">
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="text-center border-b pb-2">
            <p className="font-bold text-sm">AYUZEE PHARMACY</p>
            <p className="text-[10px] text-muted-foreground">Mixed Medicine — For External/Internal Use</p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <p><strong>Patient:</strong> {sampleLabel.patient} ({sampleLabel.age}y)</p>
            <p><strong>ID:</strong> {sampleLabel.id}</p>
            <p><strong>Mix ID:</strong> {sampleLabel.mixId}</p>
            <p><strong>Date:</strong> {sampleLabel.date}</p>
          </div>
          <div className="border-t pt-2">
            <p className="font-bold mb-1">Contents:</p>
            {sampleLabel.contents.map((c, i) => <p key={i} className="ml-2">• {c}</p>)}
          </div>
          <div className="border-t pt-2 space-y-1">
            <p><strong>Dosage:</strong> {sampleLabel.dosage}</p>
            <p><strong>Duration:</strong> {sampleLabel.duration}</p>
            <p><strong>Storage:</strong> {sampleLabel.storage}</p>
            <p className="text-red-600"><strong>Use before:</strong> {sampleLabel.mixedExpiry}</p>
            <p className="text-amber-700"><strong>Note:</strong> {sampleLabel.warnings}</p>
          </div>
          <div className="border-t pt-2 text-center text-[10px] text-muted-foreground">
            <p>{sampleLabel.doctor} • {sampleLabel.branch}</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-2">
        <Button size="sm" onClick={() => toast.success("Label sent to printer")}><Printer className="h-3.5 w-3.5 mr-1" /> Print Label</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("QR code added to label")}>+ Add QR Code</Button>
      </div>
    </div>
  );
}


// ─── TAB 5: PRAKSHEPAM REGISTER ───
function PrakshepamTab() {
  const prakshepams = [
    { item: "Honey (Madhu)", type: "Anupana/Prakshepam", stock: "2.5 L", usage: "10ml per mix", thisMonth: 45, cost: "₹12/10ml", rule: "Add after cooling. Never heat honey (Ayurveda rule)." },
    { item: "Ghee (Ghrita)", type: "Anupana", stock: "1.8 L", usage: "5-10ml per mix", thisMonth: 22, cost: "₹8/10ml", rule: "Clarified butter. Mix with warm kashayam." },
    { item: "Gorochana Tablet", type: "Prakshepam Dravya", stock: "200 tabs", usage: "5-10 tabs per mix", thisMonth: 180, cost: "₹3/tab", rule: "Crush and dissolve in kashayam." },
    { item: "Trikatu Churna", type: "Prakshepam", stock: "500g", usage: "2-3g per mix", thisMonth: 85, cost: "₹1/g", rule: "Bioavailability enhancer. Mix just before dispensing." },
    { item: "Jaggery water", type: "Anupana", stock: "Freshly prepared", usage: "20ml per dose", thisMonth: 30, cost: "₹2/20ml", rule: "Prepare fresh each day. Discard unused." },
    { item: "Warm water (Ushnodaka)", type: "Vehicle", stock: "Unlimited", usage: "As needed", thisMonth: 0, cost: "—", rule: "Standard vehicle for Kashayam administration." },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Track additives mixed with medicines — honey, ghee, Gorochana, Trikatu etc.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Prakshepam</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-center">Per Mix</th><th className="px-3 py-2 text-center">Used (Jul)</th><th className="px-3 py-2 text-center">Cost</th><th className="px-3 py-2 text-left">Rule</th></tr></thead><tbody>
          {prakshepams.map((p, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{p.item}</td>
              <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{p.type}</Badge></td>
              <td className="px-3 py-2 text-center text-xs">{p.stock}</td>
              <td className="px-3 py-2 text-center text-xs">{p.usage}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">{p.thisMonth}x</td>
              <td className="px-3 py-2 text-center text-xs">{p.cost}</td>
              <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px]">{p.rule}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

// ─── TAB 6: BATCH TRACE ───
function BatchTraceTab() {
  const traces = [
    { mixId: "MIX-4001", patient: "Rajesh Kumar", date: "22 Jul", components: [
      { medicine: "Rasnasaptakam", batch: "RSK-0726-A", supplier: "AVN Kottakkal", mfg: "Jul 2026", expiry: "Jun 2028" },
      { medicine: "Dhanwantharam", batch: "DHK-0726-B", supplier: "Arya Vaidya Pharmacy", mfg: "Jul 2026", expiry: "Jun 2028" },
      { medicine: "Gorochana Tab", batch: "GRC-0626-X", supplier: "X Pharmaceuticals", mfg: "Jun 2026", expiry: "May 2028" },
    ]},
    { mixId: "MIX-4002", patient: "Meera Nair", date: "22 Jul", components: [
      { medicine: "Dasamoolarishtam", batch: "DMA-0726-E", supplier: "AVN Kottakkal", mfg: "Jul 2026", expiry: "Unlimited" },
      { medicine: "Abhayarishtam", batch: "ABH-0726-C", supplier: "SNA Oushadhasala", mfg: "Jul 2026", expiry: "Unlimited" },
      { medicine: "Kumaryasava", batch: "KMA-0726-D", supplier: "Nagarjuna Herbal", mfg: "Jul 2026", expiry: "Unlimited" },
      { medicine: "Honey", batch: "HON-0726", supplier: "Local (organic)", mfg: "Jun 2026", expiry: "Dec 2027" },
    ]},
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Complete traceability — which batch from which supplier went into which patient's mix</p>
      {traces.map((trace) => (
        <Card key={trace.mixId}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{trace.mixId} — {trace.patient} ({trace.date})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/30"><tr><th className="px-3 py-1 text-left">Medicine</th><th className="px-3 py-1 text-center">Batch</th><th className="px-3 py-1 text-left">Supplier</th><th className="px-3 py-1 text-center">Mfg</th><th className="px-3 py-1 text-center">Expiry</th></tr></thead><tbody>
              {trace.components.map((c, i) => (
                <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{c.medicine}</td><td className="px-3 py-1.5 text-center font-mono">{c.batch}</td><td className="px-3 py-1.5 text-muted-foreground">{c.supplier}</td><td className="px-3 py-1.5 text-center">{c.mfg}</td><td className="px-3 py-1.5 text-center">{c.expiry}</td></tr>
              ))}
            </tbody></table></div>
          </CardContent>
        </Card>
      ))}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700">
          <strong>Adverse reaction tracing:</strong> If patient reports issue, trace back to exact batch → supplier → recall if needed. Complete chain: Patient → Mix ID → Component batches → Supplier → Manufacturing batch.
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 7: AI WASTE MINIMIZER ───
function AiWasteTab() {
  const suggestions = [
    { type: "Batch Patients", icon: Users, title: "Group similar prescriptions", description: "3 patients today need Rasnasaptakam 100ml each (= 300ml from 1 bottle of 450ml). Schedule them in same slot → only 150ml residual instead of opening 3 bottles.", saving: "₹140 saved (2 bottles)", priority: "high" },
    { type: "Residual Alert", icon: AlertTriangle, title: "RSK-0726-A has only 50ml left", description: "50ml remaining in Rasnasaptakam bottle (opened 2 days ago, expires in 5 days). Find patient who needs 50ml Rasnasaptakam in next 2 days. Match: Patient Anand (follow-up tomorrow, needs 50ml).", saving: "₹23 wastage avoided", priority: "high" },
    { type: "Volume Optimization", icon: Droplets, title: "Switch to 200ml bottles for low-volume items", description: "Guggulutiktam Kashayam: Only 2 patients/week need it (100ml each). 450ml bottle = 250ml wasted every week. Recommendation: Stock 200ml bottles instead (available from same supplier at ₹105).", saving: "₹220/month", priority: "medium" },
    { type: "Arishtam Priority", icon: Clock, title: "Use Arishtam/Asava for mixing when possible", description: "Arishtam/Asava have unlimited shelf-life even after opening. Prioritize mixing these over Kashayam (7-day post-opening limit). Reduces time pressure on dispensing.", saving: "Zero wastage on self-preserved medicines", priority: "info" },
    { type: "Pre-mix Batches", icon: Beaker, title: "Popular combinations — pre-mix in morning", description: "Top 3 prescribed mixes (Rasna+Dhanwa, Dashamool+Abhaya, Guggulu+Rasna) account for 60% of daily mixes. Pre-mix 5 doses each morning → faster dispensing, less measurement error.", saving: "15 min/day time saved + 5% less spillage", priority: "medium" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI suggests ways to minimize wastage from partial bottle usage and mixing</p>
      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className={s.priority === "high" ? "border-green-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${s.priority === "high" ? "text-green-600" : s.priority === "medium" ? "text-blue-600" : "text-purple-600"}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{s.title}</p>
                      <Badge variant={s.priority === "high" ? "default" : "secondary"} className="text-[10px]">{s.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                    <p className="text-xs font-bold text-green-700 mt-1">💰 {s.saving}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


// ─── MAIN COMPONENT ───
export default function MedicineMixing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Beaker className="h-6 w-6 text-purple-600" /> Medicine Mixing &amp; Dispensing
        </h1>
        <p className="text-muted-foreground mt-1">
          Break bulk → Mix portions → Label → Dispense. Partial bottle tracking, MRP splitting, batch traceability.
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 text-xs text-indigo-700">
          <strong>Kerala Model:</strong> Doctor prescribes combination (e.g., Rasnasaptakam 100ml + Dhanwantharam 100ml + Gorochana 10 tabs).
          Pharmacist measures from bulk bottles, mixes with Prakshepam, labels with patient details, dispenses as ready-to-consume dose.
          Patient gets exactly what they need — no confusion, better adherence, no leftover medicine waste at patient end.
        </CardContent>
      </Card>

      <Tabs defaultValue="mixing" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="mixing" className="text-xs">Mixing Station</TabsTrigger>
          <TabsTrigger value="bottles" className="text-xs">Open Bottles</TabsTrigger>
          <TabsTrigger value="mrp" className="text-xs">MRP Calculator</TabsTrigger>
          <TabsTrigger value="label" className="text-xs">Label Generator</TabsTrigger>
          <TabsTrigger value="prakshepam" className="text-xs">Prakshepam</TabsTrigger>
          <TabsTrigger value="trace" className="text-xs">Batch Trace</TabsTrigger>
          <TabsTrigger value="ai-waste" className="text-xs">AI Waste Minimizer</TabsTrigger>
        </TabsList>

        <TabsContent value="mixing"><MixingStationTab /></TabsContent>
        <TabsContent value="bottles"><PartialBottleTab /></TabsContent>
        <TabsContent value="mrp"><MrpCalculatorTab /></TabsContent>
        <TabsContent value="label"><LabelGeneratorTab /></TabsContent>
        <TabsContent value="prakshepam"><PrakshepamTab /></TabsContent>
        <TabsContent value="trace"><BatchTraceTab /></TabsContent>
        <TabsContent value="ai-waste"><AiWasteTab /></TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Mixing Intelligence</p>
            <p className="text-sm text-purple-700">
              <strong>Today:</strong> 12 mixes prepared, 3 pending. Wastage: only 50ml (from RSK bottle — will be used tomorrow).
              <br/><strong>Monthly savings from mixing model vs full-bottle dispensing:</strong> ₹18,500 (patients pay only for what they consume).
              <br/><strong>Patient adherence impact:</strong> Mixed-dose patients show 91% adherence vs 68% for full-bottle patients
              (no confusion about measuring, no leftover medicine going bad).
              <br/><strong>Quality check:</strong> All mixes today used bottles opened within 5 days — compliant.
              Gorochana stock will last 4 more days at current usage — reorder suggested.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
