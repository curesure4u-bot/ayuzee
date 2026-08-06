import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Star, Truck, Clock, IndianRupee, RotateCcw, Award } from "lucide-react";

const vendors = [
  {
    name: "X Ayush Agency", type: "Internal",
    overall: 92, delivery: 95, quality: 90, pricing: 96, returns: 88,
    orders: 45, onTime: 43, avgLeadDays: 3, rejectRate: 1.2, creditTerms: "N/A",
    strengths: "Fastest delivery (3 days), best pricing on oils/kashayams",
    improvement: "2 batches had minor label issues",
    aiRecommend: "Primary supplier for all taila & kashayam categories",
  },
  {
    name: "X Pharmaceuticals", type: "Internal",
    overall: 88, delivery: 85, quality: 95, pricing: 92, returns: 82,
    orders: 28, onTime: 24, avgLeadDays: 5, rejectRate: 0.5, creditTerms: "N/A",
    strengths: "Highest quality (0.5% reject), excellent Guggulu formulations",
    improvement: "Delivery sometimes delayed by 1-2 days",
    aiRecommend: "Primary for vati/guggulu category, backup for others",
  },
  {
    name: "AVN Kottakkal", type: "External",
    overall: 85, delivery: 80, quality: 92, pricing: 78, returns: 90,
    orders: 38, onTime: 30, avgLeadDays: 7, rejectRate: 0.8, creditTerms: "30 days",
    strengths: "Premium quality, excellent return handling, wide range",
    improvement: "Pricing higher than alternatives, slower delivery (7 days)",
    aiRecommend: "Use for specialty kashayams not available elsewhere",
  },
  {
    name: "Arya Vaidya Pharmacy", type: "External",
    overall: 82, delivery: 78, quality: 88, pricing: 75, returns: 85,
    orders: 22, onTime: 17, avgLeadDays: 8, rejectRate: 1.5, creditTerms: "45 days",
    strengths: "Best credit terms (45 days), authentic Kerala formulations",
    improvement: "Highest lead time (8 days), 1.5% reject rate",
    aiRecommend: "Secondary supplier — use credit terms for cash flow",
  },
  {
    name: "Nagarjuna Herbal", type: "External",
    overall: 79, delivery: 82, quality: 78, pricing: 80, returns: 75,
    orders: 18, onTime: 15, avgLeadDays: 6, rejectRate: 2.1, creditTerms: "30 days",
    strengths: "Good pricing, reasonable delivery",
    improvement: "Quality inconsistency (2.1% reject), slow return processing",
    aiRecommend: "Reduce dependency — shift 30% volume to SNA",
  },
  {
    name: "SNA Oushadhasala", type: "External",
    overall: 86, delivery: 88, quality: 85, pricing: 84, returns: 88,
    orders: 20, onTime: 18, avgLeadDays: 5, rejectRate: 1.0, creditTerms: "21 days",
    strengths: "Balanced across all metrics, reliable",
    improvement: "Limited range — mainly oils and kashayams",
    aiRecommend: "Increase volume — best value-for-money external supplier",
  },
];

function RatingStars({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function VendorRating() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600" /> Vendor Rating & Performance
          </h1>
          <p className="text-muted-foreground mt-1">Rate suppliers on delivery, quality, pricing, returns — AI suggests best vendor per item</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v, i) => (
          <Card key={i} className={v.overall >= 90 ? "border-green-200" : v.overall >= 85 ? "border-blue-200" : v.overall >= 80 ? "border-amber-200" : "border-red-200"}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{v.name}</CardTitle>
                <Badge variant={v.type === "Internal" ? "default" : "secondary"} className="text-[10px]">{v.type}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RatingStars score={v.overall} />
                <span className="text-sm font-bold">{v.overall}/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Truck className="h-2.5 w-2.5" /> Delivery</span>
                  <div className="flex items-center gap-1"><Progress value={v.delivery} className="w-10 h-1" /><span className="font-bold">{v.delivery}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5" /> Quality</span>
                  <div className="flex items-center gap-1"><Progress value={v.quality} className="w-10 h-1" /><span className="font-bold">{v.quality}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><IndianRupee className="h-2.5 w-2.5" /> Pricing</span>
                  <div className="flex items-center gap-1"><Progress value={v.pricing} className="w-10 h-1" /><span className="font-bold">{v.pricing}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><RotateCcw className="h-2.5 w-2.5" /> Returns</span>
                  <div className="flex items-center gap-1"><Progress value={v.returns} className="w-10 h-1" /><span className="font-bold">{v.returns}</span></div>
                </div>
              </div>
              <div className="border-t pt-2 text-[10px] space-y-0.5">
                <p><strong>Orders:</strong> {v.orders} | On-time: {v.onTime} ({Math.round(v.onTime / v.orders * 100)}%) | Lead: {v.avgLeadDays}d</p>
                <p className="text-green-700"><strong>+</strong> {v.strengths}</p>
                <p className="text-red-600"><strong>−</strong> {v.improvement}</p>
              </div>
              <div className="border-t pt-2">
                <p className="text-[10px] text-purple-700 bg-purple-50 p-1.5 rounded"><strong>AI:</strong> {v.aiRecommend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Vendor Strategy</p>
            <p className="text-sm text-purple-700">
              <strong>Optimal split:</strong> X Ayush Agency (40% — oils/kashayams) + X Pharmaceuticals (25% — vati/guggulu) +
              SNA Oushadhasala (20% — best value external) + AVN Kottakkal (10% — specialty items) + Others (5%).
              <br/>Nagarjuna quality declining (2.1% reject) — AI suggests shifting 30% volume to SNA.
              Annual savings from optimized vendor allocation: <strong>₹1.8L</strong>.
              Arya Vaidya's 45-day credit useful for cash flow during monsoon (high stock-up period).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
