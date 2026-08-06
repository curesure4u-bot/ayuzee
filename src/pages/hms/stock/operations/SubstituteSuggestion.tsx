import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Brain, Search, ArrowRight, CheckCircle, Pill } from "lucide-react";

const substitutes = [
  { original: "Rasnasaptakam Kashayam (AVN)", outOfStock: true, alternatives: [
    { name: "Rasnasaptakam Kashayam (Kottakkal)", price: 245, stock: 30, match: 98, reason: "Same formulation, different manufacturer" },
    { name: "Rasnadi Kashayam", price: 220, stock: 45, match: 85, reason: "Similar action (Vata-hara), slightly different composition" },
    { name: "Maharasnadi Kashayam", price: 260, stock: 22, match: 80, reason: "Enhanced formulation with extra anti-inflammatory herbs" },
  ]},
  { original: "Simhanada Guggulu (SD Pharmacy)", outOfStock: true, alternatives: [
    { name: "Simhanada Guggulu (Dabur)", price: 180, stock: 60, match: 95, reason: "Same AFI formulation, different brand" },
    { name: "Yogaraja Guggulu", price: 170, stock: 85, match: 75, reason: "Similar indication (Amavata) but different mechanism" },
    { name: "Amvatari Ras", price: 150, stock: 40, match: 70, reason: "Alternative for RA, Rasa Shastra preparation" },
  ]},
];

const SubstituteSuggestion = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> Substitute Medicine Suggestion (AI)</h1><p className="text-muted-foreground mt-1">Out of stock? AI suggests equivalent alternatives from available inventory</p></div>
      </div>
      <div className="flex gap-2 max-w-md"><Search className="h-4 w-4 mt-2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search out-of-stock medicine..." /><Button size="sm">Find Substitute</Button></div>

      {substitutes.map((s, idx) => (
        <Card key={idx} className="border-amber-200">
          <CardHeader className="pb-2 bg-amber-50"><CardTitle className="text-sm flex items-center gap-2"><Pill className="h-4 w-4 text-red-500" />{s.original}<Badge variant="destructive" className="text-[10px] ml-2">Out of Stock</Badge></CardTitle></CardHeader>
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground mb-2">AI-suggested alternatives (ranked by match %):</p>
            <div className="space-y-2">
              {s.alternatives.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs ${a.match >= 90 ? "text-green-600 border-green-300" : a.match >= 80 ? "text-blue-600 border-blue-300" : "text-amber-600 border-amber-300"}`}>{a.match}% match</Badge>
                    <div><p className="text-sm font-medium">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.reason}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><p className="text-xs font-bold">₹{a.price}</p><p className="text-[10px] text-green-600">{a.stock} in stock</p></div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success(`${a.name} selected as substitute`)}><ArrowRight className="h-3 w-3 mr-1" /> Use</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Matching Logic</p><p className="text-sm text-purple-700">Substitutes ranked by: Same formulation (different brand) &gt; Similar indication (same Dosha action) &gt; Same therapeutic category. AI checks drug interactions with patient's current medications before suggesting.</p></div></CardContent>
      </Card>
    </div>
  );
};

export default SubstituteSuggestion;
