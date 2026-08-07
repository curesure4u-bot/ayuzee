import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sun, CloudRain, Snowflake, Leaf, Wind, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StockLevel = { product_name: string; quantity_available: number; min_stock_level: number };

const ritus = [
  { name: "Vasanta (Spring)", months: "Mar–Apr", icon: Leaf, color: "text-green-600", bgColor: "bg-green-50", monthRange: [3, 4] },
  { name: "Grishma (Summer)", months: "May–Jun", icon: Sun, color: "text-amber-600", bgColor: "bg-amber-50", monthRange: [5, 6] },
  { name: "Varsha (Monsoon)", months: "Jul–Aug", icon: CloudRain, color: "text-blue-600", bgColor: "bg-blue-50", monthRange: [7, 8] },
  { name: "Sharad (Autumn)", months: "Sep–Oct", icon: Wind, color: "text-orange-600", bgColor: "bg-orange-50", monthRange: [9, 10] },
  { name: "Hemanta (Pre-winter)", months: "Nov–Dec", icon: Snowflake, color: "text-cyan-600", bgColor: "bg-cyan-50", monthRange: [11, 12] },
  { name: "Shishira (Winter)", months: "Jan–Feb", icon: Flame, color: "text-purple-600", bgColor: "bg-purple-50", monthRange: [1, 2] },
];

const seasonalMedicines: Record<string, { medicines: string[]; reason: string }> = {
  "Varsha (Monsoon)": { medicines: ["Dashamoolarishtam", "Rasnasaptakam", "Simhanada Guggulu", "Kottamchukkadi Taila"], reason: "Vata aggravation, joint pain, dampness" },
  "Sharad (Autumn)": { medicines: ["Chandraprabha Vati", "Ashwagandha Churna"], reason: "Pitta Prakopa, UTI, hormonal" },
  "Hemanta (Pre-winter)": { medicines: ["Ashwagandha Churna", "Dashamoolarishtam"], reason: "Immunity boost, Vata balance" },
  "Shishira (Winter)": { medicines: ["Ashwagandha Churna", "Triphala Churna"], reason: "Cold weather, Kapha management" },
  "Vasanta (Spring)": { medicines: ["Triphala Churna", "Simhanada Guggulu"], reason: "Kapha liquefaction, detox" },
  "Grishma (Summer)": { medicines: ["Chandraprabha Vati", "Dashamoolarishtam"], reason: "Pitta management, hydration" },
};

export default function SeasonalDemandAI() {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentRitu = ritus.find(r => r.monthRange.includes(currentMonth)) || ritus[2];
  const currentDemand = seasonalMedicines[currentRitu.name] || { medicines: [], reason: "" };

  useEffect(() => { loadStock(); }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("product_name, quantity_available, min_stock_level")
        .order("product_name");
      setStockLevels(data || []);
    } catch (err: any) {
      toast.error("Failed to load stock");
    }
    setLoading(false);
  };

  const getStockForMedicine = (name: string) => {
    const match = stockLevels.find(s => s.product_name.toLowerCase().includes(name.toLowerCase()));
    return match ? { qty: match.quantity_available, low: match.quantity_available <= match.min_stock_level } : null;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-blue-600" /> Seasonal Demand AI (Ritucharya)</h1>
        <p className="text-muted-foreground mt-1">Predict inventory needs by Ayurvedic Ritu — with live stock levels from Supabase.</p>
      </div>

      {/* Ritu selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ritus.map((ritu, i) => {
          const Icon = ritu.icon;
          const isCurrent = ritu.name === currentRitu.name;
          return (
            <Card key={i} className={isCurrent ? `ring-2 ring-blue-500 ${ritu.bgColor}` : ""}>
              <CardContent className="p-2 text-center">
                <Icon className={`h-5 w-5 mx-auto ${ritu.color}`} />
                <p className="text-[10px] font-bold mt-1">{ritu.name.split(" ")[0]}</p>
                <p className="text-[9px] text-muted-foreground">{ritu.months}</p>
                {isCurrent && <Badge className="text-[8px] mt-1">Current</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current season demand with live stock */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1">Current Season: {currentRitu.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{currentDemand.reason}</p>
          <div className="space-y-2">
            {currentDemand.medicines.map((med, i) => {
              const stock = getStockForMedicine(med);
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-xs font-medium">{med}</span>
                  <div className="flex items-center gap-2">
                    {stock ? (
                      <>
                        <span className={`text-xs font-bold ${stock.low ? "text-red-600" : "text-green-600"}`}>{stock.qty} in stock</span>
                        <Badge variant={stock.low ? "destructive" : "outline"} className={`text-[10px] ${!stock.low ? "text-green-600" : ""}`}>
                          {stock.low ? "Reorder!" : "OK"}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Not in stock</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Seasonal Intelligence</p>
            <p className="text-sm text-purple-700">
              Current Ritu: <strong>{currentRitu.name}</strong>. Demand medicines checked against live stock.
              {currentDemand.medicines.filter(m => getStockForMedicine(m)?.low).length > 0 &&
                ` Warning: ${currentDemand.medicines.filter(m => getStockForMedicine(m)?.low).length} seasonal medicines are low — reorder recommended.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
