import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";

const shelfLifeRules = [
  { form: "Churna (Powder)", standard: "2 years", reference: "AFI / Sharangdhara Samhita", reason: "Volatile oils evaporate, potency decreases", storage: "Airtight, cool, dry place", icon: "🌿" },
  { form: "Vati / Gutika (Tablets)", standard: "2 years", reference: "AFI", reason: "Binding agents degrade over time", storage: "Airtight, room temperature", icon: "💊" },
  { form: "Guggulu preparations", standard: "2 years", reference: "AFI / Rasa Tarangini", reason: "Guggulu resin hardens with age", storage: "Airtight, away from moisture", icon: "🔶" },
  { form: "Kashayam (Decoction)", standard: "1 year (fresh prep) / 2 years (tablet)", reference: "Sharangdhara", reason: "Water-based — microbial growth risk", storage: "Refrigerate after opening", icon: "🍵" },
  { form: "Taila (Medicated Oil)", standard: "16 months", reference: "Sharangdhara Samhita 9/1", reason: "Oxidation of oil base, rancidity", storage: "Dark glass, away from sunlight", icon: "🫒" },
  { form: "Ghrita (Medicated Ghee)", standard: "16 months", reference: "Sharangdhara Samhita", reason: "Similar to taila — oxidation", storage: "Airtight, cool dark place", icon: "🧈" },
  { form: "Asava / Arishta (Fermented)", standard: "Unlimited (improves with age)", reference: "Classical texts", reason: "Alcohol preserves; potency increases", storage: "Cool, dark place. No refrigeration needed.", icon: "🍶" },
  { form: "Leha / Avaleha (Confection)", standard: "2 years", reference: "AFI", reason: "Sugar/honey base protects but moisture risk", storage: "Airtight, room temperature", icon: "🍯" },
  { form: "Bhasma / Pishti (Ash/Metal)", standard: "Unlimited", reference: "Rasa Shastra texts", reason: "Inorganic — no degradation if stored properly", storage: "Airtight, moisture-proof", icon: "⚗️" },
  { form: "Arka (Distillate)", standard: "1 year", reference: "AFI", reason: "Volatile constituents escape quickly", storage: "Tightly sealed, cool place", icon: "💧" },
  { form: "Kwatha Churna (Coarse powder)", standard: "6 months", reference: "Sharangdhara", reason: "Larger surface area = faster degradation", storage: "Airtight, use within 6 months", icon: "🌾" },
  { form: "Lepa (External paste)", standard: "Freshly prepared", reference: "Classical", reason: "Active only when fresh", storage: "Prepare just before application", icon: "🧴" },
];

const currentInventoryStatus = [
  { item: "Rasnasaptakam Kashayam 450ml", form: "Kashayam", mfg: "Jan 2026", standardLife: "2 years", expiry: "Jan 2028", daysLeft: 558, pctUsed: 23, status: "safe" },
  { item: "Kottamchukkadi Taila 200ml", form: "Taila", mfg: "Mar 2026", standardLife: "16 months", expiry: "Jul 2027", daysLeft: 374, pctUsed: 22, status: "safe" },
  { item: "Dashamoolarishtam 450ml", form: "Arishta", mfg: "Jun 2022", standardLife: "Unlimited", expiry: "N/A", daysLeft: 999, pctUsed: 0, status: "improves" },
  { item: "Ashwagandha Churna 100g", form: "Churna", mfg: "Sep 2025", standardLife: "2 years", expiry: "Sep 2027", daysLeft: 435, pctUsed: 40, status: "safe" },
  { item: "Sahacharadi Taila 200ml", form: "Taila", mfg: "Oct 2024", standardLife: "16 months", expiry: "Feb 2026", daysLeft: -150, pctUsed: 100, status: "expired" },
  { item: "Vidaryadi Kwatha Churna 100g", form: "Kwatha Churna", mfg: "Apr 2026", standardLife: "6 months", expiry: "Oct 2026", daysLeft: 99, pctUsed: 67, status: "warning" },
  { item: "Swarna Bhasma 500mg", form: "Bhasma", mfg: "Jan 2020", standardLife: "Unlimited", expiry: "N/A", daysLeft: 999, pctUsed: 0, status: "improves" },
  { item: "Dasamula Arka 200ml", form: "Arka", mfg: "Jan 2026", standardLife: "1 year", expiry: "Jan 2027", daysLeft: 192, pctUsed: 47, status: "safe" },
];

export default function YogaKshema() {
  const expired = currentInventoryStatus.filter(i => i.status === "expired").length;
  const warning = currentInventoryStatus.filter(i => i.status === "warning").length;
  const improves = currentInventoryStatus.filter(i => i.status === "improves").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-600" /> Yoga Kshema (Shelf-life) Tracker
        </h1>
        <p className="text-muted-foreground mt-1">AYUSH-specific shelf-life rules per dosage form — Sharangdhara Samhita based expiry management</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{currentInventoryStatus.filter(i => i.status === "safe").length}</p><p className="text-[10px] text-muted-foreground">Safe</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{improves}</p><p className="text-[10px] text-muted-foreground">Improves with Age</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{warning}</p><p className="text-[10px] text-muted-foreground">Warning</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{expired}</p><p className="text-[10px] text-muted-foreground">Expired</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Current Inventory — Shelf-life Status</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Form</th>
                  <th className="px-3 py-2 text-center">Mfg Date</th>
                  <th className="px-3 py-2 text-center">Standard Life</th>
                  <th className="px-3 py-2 text-center">Expiry</th>
                  <th className="px-3 py-2 text-center">Life Used</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentInventoryStatus.map((item, i) => (
                  <tr key={i} className={`border-b ${item.status === "expired" ? "bg-red-50/50" : item.status === "warning" ? "bg-amber-50/50" : item.status === "improves" ? "bg-blue-50/30" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{item.item}</td>
                    <td className="px-3 py-2 text-center text-[10px]">{item.form}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.mfg}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{item.standardLife}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.expiry}</td>
                    <td className="px-3 py-2 text-center"><Progress value={Math.min(item.pctUsed, 100)} className="w-16 h-1.5 mx-auto" /></td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={item.status === "expired" ? "destructive" : item.status === "warning" ? "default" : item.status === "improves" ? "outline" : "outline"} className={`text-[10px] ${item.status === "safe" ? "text-green-600" : item.status === "improves" ? "text-blue-600" : ""}`}>
                        {item.status === "improves" ? "Improves ↑" : item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">AYUSH Shelf-life Rules (Sharangdhara Samhita)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Dosage Form</th>
                  <th className="px-3 py-2 text-center">Standard Shelf-life</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Storage</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                </tr>
              </thead>
              <tbody>
                {shelfLifeRules.map((rule, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium"><span className="mr-1">{rule.icon}</span>{rule.form}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{rule.standard}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{rule.reason}</td>
                    <td className="px-3 py-2 text-[10px]">{rule.storage}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{rule.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Yoga Kshema (Shelf-life Intelligence)</p>
            <p className="text-sm text-purple-700">
              Sahacharadi Taila expired 150 days ago (16-month Taila rule exceeded) — removed from dispensing.
              Vidaryadi Kwatha Churna has only 99 days left (6-month form) — prioritize for next dispensing.
              Dashamoolarishtam (4 years old): Getting better! Asava/Arishta category — potency increases with age.
              Swarna Bhasma (6 years): Perfectly fine — Bhasmas have unlimited shelf-life if stored properly.
              <strong>Key AYUSH differentiator:</strong> No other HMS tracks dosage-form-specific shelf-life rules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
