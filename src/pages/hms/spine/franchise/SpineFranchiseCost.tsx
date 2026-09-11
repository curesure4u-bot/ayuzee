import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Calculator, IndianRupee, Package, CheckCircle2, Circle,
  Building2, Store, Wifi, Layers, Download, TrendingUp,
  Stethoscope, Syringe, Sparkles, Armchair, Home, Wrench,
} from "lucide-react";

// ─── Equipment items grouped by room/category ───
interface EquipItem {
  id: string;
  name: string;
  cost: number;
  essential: boolean;
  models: string[];
  qty?: number;
}

interface EquipCategory {
  id: string;
  name: string;
  icon: any;
  items: EquipItem[];
}

const categories: EquipCategory[] = [
  {
    id: "reception", name: "Reception & Waiting", icon: Armchair,
    items: [
      { id: "r1", name: "Front desk / reception counter", cost: 15000, essential: true, models: ["physical", "hybrid"] },
      { id: "r2", name: "Computer + HMS terminal", cost: 35000, essential: true, models: ["physical", "online", "hybrid"] },
      { id: "r3", name: "Waiting chairs (set of 10)", cost: 20000, essential: true, models: ["physical", "hybrid"] },
      { id: "r4", name: "Digital education screen (TV)", cost: 25000, essential: false, models: ["physical", "hybrid"] },
      { id: "r5", name: "Token display system", cost: 8000, essential: false, models: ["physical", "hybrid"] },
      { id: "r6", name: "Dermatome wall chart + signage", cost: 5000, essential: true, models: ["physical", "hybrid"] },
      { id: "r7", name: "Water dispenser", cost: 8000, essential: false, models: ["physical", "hybrid"] },
      { id: "r8", name: "QR check-in tablet", cost: 15000, essential: false, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "examination", name: "Examination Room", icon: Stethoscope,
    items: [
      { id: "e1", name: "Examination couch (adjustable)", cost: 18000, essential: true, models: ["physical", "hybrid"] },
      { id: "e2", name: "Doctor's desk + chairs", cost: 12000, essential: true, models: ["physical", "hybrid"] },
      { id: "e3", name: "Posture analysis tablet + app", cost: 25000, essential: true, models: ["physical", "hybrid"] },
      { id: "e4", name: "Goniometer + inclinometer", cost: 3000, essential: true, models: ["physical", "hybrid"] },
      { id: "e5", name: "VAS charts + assessment forms", cost: 2000, essential: true, models: ["physical", "online", "hybrid"] },
      { id: "e6", name: "BP monitor + basic vitals kit", cost: 8000, essential: true, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "level1", name: "Level 1 Therapy", icon: Syringe,
    items: [
      { id: "l1", name: "Agnikarma kit (Panchdhatu Shalaka + burner)", cost: 12000, essential: true, models: ["physical", "hybrid"] },
      { id: "l2", name: "Cupping set (silicone + glass + pump)", cost: 6000, essential: true, models: ["physical", "hybrid"] },
      { id: "l3", name: "Acupuncture + dry needling needles (stock)", cost: 8000, essential: true, models: ["physical", "hybrid"] },
      { id: "l4", name: "Electroacupuncture unit", cost: 12000, essential: false, models: ["physical", "hybrid"] },
      { id: "l5", name: "Trigger point / Marma therapy table", cost: 15000, essential: true, models: ["physical", "hybrid"] },
      { id: "l6", name: "Marma oils + therapy oils (initial stock)", cost: 10000, essential: true, models: ["physical", "hybrid"] },
      { id: "l7", name: "Sterilization + sharps disposal setup", cost: 8000, essential: true, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "panchakarma", name: "Panchakarma Room", icon: Sparkles,
    items: [
      { id: "p1", name: "Droni (Panchakarma table with drainage)", cost: 45000, essential: true, models: ["physical", "hybrid"] },
      { id: "p2", name: "Steam / Swedana unit", cost: 25000, essential: true, models: ["physical", "hybrid"] },
      { id: "p3", name: "Oil warmers (2 units)", cost: 8000, essential: true, models: ["physical", "hybrid"] },
      { id: "p4", name: "Basti equipment + dough setup", cost: 10000, essential: true, models: ["physical", "hybrid"] },
      { id: "p5", name: "Medicated oils bulk (Dhanwantaram, Ksheerabala, etc.)", cost: 40000, essential: true, models: ["physical", "hybrid"] },
      { id: "p6", name: "Privacy curtains + linen (initial)", cost: 12000, essential: true, models: ["physical", "hybrid"] },
      { id: "p7", name: "Wash area + water heater", cost: 20000, essential: true, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "pharmacy", name: "Pharmacy / Dispensary", icon: Package,
    items: [
      { id: "ph1", name: "Medicine storage racks", cost: 15000, essential: true, models: ["physical", "hybrid"] },
      { id: "ph2", name: "Initial medicine inventory (30-day)", cost: 60000, essential: true, models: ["physical", "hybrid"] },
      { id: "ph3", name: "Refrigerator (for certain meds)", cost: 18000, essential: false, models: ["physical", "hybrid"] },
      { id: "ph4", name: "Billing counter + POS", cost: 12000, essential: true, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "online", name: "Online / Digital Setup", icon: Wifi,
    items: [
      { id: "o1", name: "HD webcam + ring light", cost: 8000, essential: true, models: ["online", "hybrid"] },
      { id: "o2", name: "Professional microphone", cost: 5000, essential: true, models: ["online", "hybrid"] },
      { id: "o3", name: "Dual monitor setup", cost: 25000, essential: true, models: ["online", "hybrid"] },
      { id: "o4", name: "Home therapy kit inventory (100 kits)", cost: 30000, essential: true, models: ["online", "hybrid"] },
      { id: "o5", name: "Video recording setup (for LMS)", cost: 15000, essential: false, models: ["online", "hybrid"] },
      { id: "o6", name: "High-speed internet + backup (annual)", cost: 24000, essential: true, models: ["online", "hybrid"] },
      { id: "o7", name: "Courier / logistics tie-up (deposit)", cost: 10000, essential: false, models: ["online", "hybrid"] },
    ],
  },
  {
    id: "utility", name: "Utility & Setup", icon: Wrench,
    items: [
      { id: "u1", name: "Interior + painting + branding", cost: 80000, essential: true, models: ["physical", "hybrid"] },
      { id: "u2", name: "AC units (2)", cost: 60000, essential: true, models: ["physical", "hybrid"] },
      { id: "u3", name: "UPS / inverter backup", cost: 25000, essential: true, models: ["physical", "online", "hybrid"] },
      { id: "u4", name: "Staff furniture + lockers", cost: 15000, essential: false, models: ["physical", "hybrid"] },
      { id: "u5", name: "Fire safety + first aid", cost: 8000, essential: true, models: ["physical", "hybrid"] },
      { id: "u6", name: "Signboard + exterior branding", cost: 30000, essential: true, models: ["physical", "hybrid"] },
    ],
  },
  {
    id: "fees", name: "Fees & Licensing", icon: Building2,
    items: [
      { id: "f1", name: "Franchise fee (Ayuzee brand)", cost: 200000, essential: true, models: ["physical", "online", "hybrid"] },
      { id: "f2", name: "AYUSH clinic registration", cost: 15000, essential: true, models: ["physical", "hybrid"] },
      { id: "f3", name: "Drug license", cost: 10000, essential: true, models: ["physical", "hybrid"] },
      { id: "f4", name: "GST + business registration", cost: 5000, essential: true, models: ["physical", "online", "hybrid"] },
      { id: "f5", name: "Insurance (annual)", cost: 20000, essential: true, models: ["physical", "hybrid"] },
      { id: "f6", name: "Staff training + certification", cost: 40000, essential: true, models: ["physical", "online", "hybrid"] },
    ],
  },
];

export default function SpineFranchiseCost() {
  const [model, setModel] = useState("physical");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [expandedCat, setExpandedCat] = useState<string | null>("reception");

  // Filter items applicable to model, and not excluded
  const applicableCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(i => i.models.includes(model)),
  })).filter(cat => cat.items.length > 0);

  const toggleExclude = (id: string) => {
    setExcluded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  // Totals
  const totals = useMemo(() => {
    let essential = 0, optional = 0, excludedTotal = 0;
    applicableCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (excluded.has(item.id)) { excludedTotal += item.cost; return; }
        if (item.essential) essential += item.cost;
        else optional += item.cost;
      });
    });
    return { essential, optional, total: essential + optional, excludedTotal };
  }, [applicableCategories, excluded]);

  const catTotal = (cat: EquipCategory) =>
    cat.items.filter(i => !excluded.has(i.id)).reduce((s, i) => s + i.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-green-600" />
            Equipment & Setup Cost Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Room-wise equipment with live cost totals — plan your investment precisely
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #4
        </Badge>
      </div>

      {/* Model selector */}
      <div className="flex gap-1">
        {[{ id: "physical", label: "Physical", icon: Store }, { id: "hybrid", label: "Hybrid", icon: Layers }, { id: "online", label: "Online", icon: Wifi }].map(m => {
          const Icon = m.icon;
          return (
            <Button key={m.id} variant={model === m.id ? "default" : "outline"} size="sm" onClick={() => { setModel(m.id); setExcluded(new Set()); }} className="text-xs gap-1">
              <Icon className="h-3 w-3" /> {m.label}
            </Button>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-300 bg-green-50"><CardContent className="pt-4 pb-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold text-green-700 mt-1">₹{(totals.total / 100000).toFixed(2)}L</p><p className="text-[9px] text-muted-foreground">Total Investment</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><CheckCircle2 className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-700 mt-1">₹{(totals.essential / 100000).toFixed(2)}L</p><p className="text-[9px] text-muted-foreground">Essential Only</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><Circle className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-700 mt-1">₹{(totals.optional / 100000).toFixed(2)}L</p><p className="text-[9px] text-muted-foreground">Optional Add-ons</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-700 mt-1">₹{(totals.total / 100000 * 0.15).toFixed(2)}L</p><p className="text-[9px] text-muted-foreground">Working Capital (15%)</p></CardContent></Card>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {applicableCategories.map(cat => {
          const Icon = cat.icon;
          const isExpanded = expandedCat === cat.id;
          return (
            <Card key={cat.id}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{cat.name}</span>
                  <Badge variant="secondary" className="text-[9px]">{cat.items.length} items</Badge>
                </div>
                <span className="font-bold text-sm text-green-700">₹{catTotal(cat).toLocaleString()}</span>
              </div>
              {isExpanded && (
                <CardContent className="pt-0 pb-3 space-y-1">
                  {cat.items.map(item => {
                    const isExcluded = excluded.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleExclude(item.id)}
                        className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer transition ${isExcluded ? "bg-gray-50 opacity-50 line-through" : "hover:bg-muted/50"}`}
                      >
                        {isExcluded ? <Circle className="h-4 w-4 text-muted-foreground shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                        <span className="flex-1">{item.name}</span>
                        {item.essential ? <Badge className="bg-red-50 text-red-600 text-[8px]">Essential</Badge> : <Badge variant="outline" className="text-[8px]">Optional</Badge>}
                        <span className="font-medium w-[80px] text-right">₹{item.cost.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">Click any item to include/exclude from your budget</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Investment Breakdown */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><IndianRupee className="h-4 w-4 text-green-600" /> Investment Breakdown ({model})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {applicableCategories.map(cat => {
            const pct = totals.total > 0 ? (catTotal(cat) / totals.total) * 100 : 0;
            return (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="text-[10px] w-[120px] truncate">{cat.name}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-green-500 rounded" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-medium w-[70px] text-right">₹{(catTotal(cat) / 1000).toFixed(0)}k</span>
              </div>
            );
          })}
          <Separator className="my-2" />
          <div className="flex items-center justify-between font-bold text-sm">
            <span>Total Setup Investment</span>
            <span className="text-green-700">₹{totals.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>+ Working capital (15% recommended)</span>
            <span>₹{Math.round(totals.total * 0.15).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-sm border-t pt-2">
            <span>Grand Total (with buffer)</span>
            <span className="text-green-700">₹{Math.round(totals.total * 1.15).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => {
          const report = `SPINE AYUSH FRANCHISE — EQUIPMENT & COST ESTIMATE (${model.toUpperCase()})\n${"=".repeat(50)}\n\n${applicableCategories.map(cat => `${cat.name}: ₹${catTotal(cat).toLocaleString()}\n${cat.items.filter(i => !excluded.has(i.id)).map(i => `  • ${i.name} — ₹${i.cost.toLocaleString()} ${i.essential ? "(Essential)" : "(Optional)"}`).join("\n")}`).join("\n\n")}\n\n${"=".repeat(50)}\nEssential Total: ₹${totals.essential.toLocaleString()}\nOptional Total: ₹${totals.optional.toLocaleString()}\nSetup Total: ₹${totals.total.toLocaleString()}\nWorking Capital (15%): ₹${Math.round(totals.total * 0.15).toLocaleString()}\nGRAND TOTAL: ₹${Math.round(totals.total * 1.15).toLocaleString()}`;
          navigator.clipboard.writeText(report);
          toast.success("Cost estimate copied to clipboard!");
        }}>
          <Download className="h-3 w-3" /> Copy Cost Estimate
        </Button>
      </div>
    </div>
  );
}
