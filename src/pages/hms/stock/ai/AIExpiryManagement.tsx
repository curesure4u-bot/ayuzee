import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, Sparkles, AlertTriangle, Clock, TrendingDown, IndianRupee, RotateCcw, Tag } from "lucide-react";
import { analyzeExpiryRisk, type ExpiryRiskItem } from "@/services/aiStockIntelligence";

const mockBatches = [
  { productId: "P001", productName: "Ayuzee Amruthotharam Kashayam", batch: "AYZ-2026-034", expiryDate: "2026-09-19", stock: 5, avgDailySales: 0.2, mrp: 250 },
  { productId: "P002", productName: "Yogaraja Guggulu", batch: "B2026-110", expiryDate: "2026-10-30", stock: 3, avgDailySales: 0.8, mrp: 120 },
  { productId: "P003", productName: "Ksheerabala 101 Avarti", batch: "B2026-055", expiryDate: "2026-08-14", stock: 18, avgDailySales: 0.4, mrp: 450 },
  { productId: "P004", productName: "Rasnasaptakam Kashayam", batch: "B2026-088", expiryDate: "2027-01-04", stock: 62, avgDailySales: 2.5, mrp: 175 },
  { productId: "P005", productName: "Simhanada Guggulu (Old batch)", batch: "B2025-102", expiryDate: "2026-08-09", stock: 8, avgDailySales: 2.0, mrp: 145 },
  { productId: "P006", productName: "Chyawanprash Ayuzee", batch: "AYZ-2025-012", expiryDate: "2026-12-31", stock: 12, avgDailySales: 1.1, mrp: 380 },
  { productId: "P007", productName: "Dasamoolarishtam 450ml", batch: "B2025-045", expiryDate: "2027-06-14", stock: 48, avgDailySales: 1.5, mrp: 185 },
];

const AIExpiryManagement = () => {
  const [risks, setRisks] = useState<ExpiryRiskItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const results = analyzeExpiryRisk(mockBatches);
    setRisks(results);
    setAnalyzing(false);
  };

  const critical = risks.filter((r) => r.riskLevel === "critical");
  const high = risks.filter((r) => r.riskLevel === "high");
  const totalPotentialLoss = risks.reduce((sum, r) => sum + r.estimatedLoss, 0);

  const riskColors = { critical: "bg-red-600", high: "bg-orange-500", medium: "bg-amber-500", low: "bg-green-500" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" /> AI Expiry Management
          </h2>
          <p className="text-xs text-muted-foreground">AI predicts sell-through rates, suggests FEFO actions & discount strategies to minimize wastage</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} className="bg-amber-600 hover:bg-amber-700">
          {analyzing ? <><Sparkles className="mr-1 h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="mr-1 h-4 w-4" /> Analyze Expiry Risk</>}
        </Button>
      </div>

      {risks.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
                <p className="text-2xl font-bold text-red-600 mt-1">{critical.length}</p>
                <p className="text-xs text-muted-foreground">Critical (30d)</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/30">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-orange-600" />
                <p className="text-2xl font-bold text-orange-600 mt-1">{high.length}</p>
                <p className="text-xs text-muted-foreground">High Risk (90d)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold mt-1">{risks.length}</p>
                <p className="text-xs text-muted-foreground">Total Monitored</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-3 text-center">
                <IndianRupee className="h-5 w-5 mx-auto text-red-600" />
                <p className="text-lg font-bold text-red-600 mt-1">₹{Math.round(totalPotentialLoss / 1000)}K</p>
                <p className="text-xs text-muted-foreground">Potential Loss</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-2 py-2 text-left">Product</th>
                      <th className="px-2 py-2 text-center">Batch</th>
                      <th className="px-2 py-2 text-center">Expiry</th>
                      <th className="px-2 py-2 text-center">Days Left</th>
                      <th className="px-2 py-2 text-center">Stock</th>
                      <th className="px-2 py-2 text-center">Avg/Day</th>
                      <th className="px-2 py-2 text-center">AI Sell-Through</th>
                      <th className="px-2 py-2 text-center">Risk</th>
                      <th className="px-2 py-2 text-center">Disc %</th>
                      <th className="px-2 py-2 text-left">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((r, idx) => (
                      <tr key={idx} className={`border-b hover:bg-muted/30 ${r.riskLevel === "critical" ? "bg-red-50/50" : ""}`}>
                        <td className="px-2 py-2 font-medium">{r.productName}</td>
                        <td className="px-2 py-2 text-center font-mono">{r.batch}</td>
                        <td className="px-2 py-2 text-center">{r.expiryDate}</td>
                        <td className="px-2 py-2 text-center font-bold">
                          <span className={r.daysToExpiry <= 30 ? "text-red-600" : r.daysToExpiry <= 90 ? "text-orange-600" : ""}>{r.daysToExpiry}d</span>
                        </td>
                        <td className="px-2 py-2 text-center">{r.currentStock}</td>
                        <td className="px-2 py-2 text-center">{r.avgDailySales}</td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Progress value={r.predictedSellThrough} className="h-2 w-12" />
                            <span className={r.predictedSellThrough < 50 ? "text-red-600" : "text-green-600"}>{r.predictedSellThrough}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center"><Badge className={`${riskColors[r.riskLevel]} text-white text-[10px]`}>{r.riskLevel}</Badge></td>
                        <td className="px-2 py-2 text-center">{r.suggestedDiscount ? <Badge variant="outline" className="text-orange-600"><Tag className="h-2.5 w-2.5 mr-0.5" />{r.suggestedDiscount}%</Badge> : "—"}</td>
                        <td className="px-2 py-2 text-muted-foreground max-w-[200px]">{r.suggestedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => toast.success("Discount applied to critical items")}>
              <Tag className="mr-1 h-3 w-3" /> Apply AI Discounts to Critical Items
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Return request sent to suppliers")}>
              <RotateCcw className="mr-1 h-3 w-3" /> Request Supplier Returns
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("FEFO labels generated")}>
              Generate FEFO Labels
            </Button>
          </div>
        </>
      )}

      {risks.length === 0 && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Click "Analyze Expiry Risk" to let AI evaluate all batch expiry dates and predict sell-through rates.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIExpiryManagement;
