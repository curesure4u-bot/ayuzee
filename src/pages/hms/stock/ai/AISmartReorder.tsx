import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, Sparkles, ShoppingCart, AlertTriangle, TrendingUp, Zap, Truck } from "lucide-react";
import { generateSmartReorder, type SmartReorderSuggestion } from "@/services/aiStockIntelligence";

const mockProducts = [
  { id: "P001", name: "Dasamoolarishtam 450ml", currentStock: 5, reorderLevel: 10, purchasePrice: 142, avgMonthlySales: 45, leadTimeDays: 5, lastSupplier: "KOTTAKKAL ARYA VAIDYA SALA" },
  { id: "P002", name: "Simhanada Guggulu", currentStock: 3, reorderLevel: 30, purchasePrice: 98, avgMonthlySales: 60, leadTimeDays: 5, lastSupplier: "KOTTAKKAL ARYA VAIDYA SALA" },
  { id: "P003", name: "Ksheerabala 101 Avarti", currentStock: 2, reorderLevel: 5, purchasePrice: 365, avgMonthlySales: 12, leadTimeDays: 7, lastSupplier: "KOTTAKKAL ARYA VAIDYA SALA" },
  { id: "P004", name: "Yogaraja Guggulu", currentStock: 0, reorderLevel: 10, purchasePrice: 88, avgMonthlySales: 25, leadTimeDays: 5, lastSupplier: "BAIDYANATH" },
  { id: "P005", name: "Chyawanprash Ayuzee Special", currentStock: 8, reorderLevel: 10, purchasePrice: 280, avgMonthlySales: 20, leadTimeDays: 3, lastSupplier: "IN-HOUSE MANUFACTURING" },
  { id: "P006", name: "Aavarai Kudineer 50GM", currentStock: 12, reorderLevel: 15, purchasePrice: 45, avgMonthlySales: 35, leadTimeDays: 4, lastSupplier: "ALSHIFA" },
  { id: "P007", name: "777 Soap", currentStock: 18, reorderLevel: 20, purchasePrice: 64, avgMonthlySales: 30, leadTimeDays: 3, lastSupplier: "SANJEEVI" },
];

const AISmartReorder = () => {
  const [suggestions, setSuggestions] = useState<SmartReorderSuggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const results = generateSmartReorder(mockProducts);
    setSuggestions(results);
    setAnalyzing(false);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedItems(next);
  };

  const handleCreatePO = () => {
    if (selectedItems.size === 0) { toast.error("Select items to create PO"); return; }
    toast.success(`Purchase Order created for ${selectedItems.size} items!`);
  };

  const urgencyColors = { critical: "bg-red-600", high: "bg-orange-600", medium: "bg-amber-500", low: "bg-green-600" };
  const totalEstCost = suggestions.filter((s) => selectedItems.has(s.productId)).reduce((sum, s) => sum + s.estimatedCost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" /> AI Smart Reorder
          </h2>
          <p className="text-xs text-muted-foreground">AI analyzes consumption patterns, lead times & EOQ to suggest optimal reorder quantities</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700">
          {analyzing ? <><Sparkles className="mr-1 h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="mr-1 h-4 w-4" /> Analyze & Suggest</>}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{suggestions.filter(s => s.urgency === "critical").length}</p><p className="text-xs text-muted-foreground">Critical</p></CardContent></Card>
            <Card className="border-orange-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">{suggestions.filter(s => s.urgency === "high").length}</p><p className="text-xs text-muted-foreground">High Priority</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{suggestions.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{Math.round(suggestions.reduce((s, i) => s + i.estimatedCost, 0) / 1000)}K</p><p className="text-xs text-muted-foreground">Est. Total Cost</p></CardContent></Card>
          </div>

          {/* Suggestions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-2 py-2 w-8"><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedItems(new Set(suggestions.map(s => s.productId))); else setSelectedItems(new Set()); }} /></th>
                      <th className="px-2 py-2 text-left">Product</th>
                      <th className="px-2 py-2 text-center">Urgency</th>
                      <th className="px-2 py-2 text-center">Current</th>
                      <th className="px-2 py-2 text-center">Reorder Lvl</th>
                      <th className="px-2 py-2 text-center">Avg Monthly</th>
                      <th className="px-2 py-2 text-center text-purple-600">AI Suggested Qty</th>
                      <th className="px-2 py-2 text-center">EOQ</th>
                      <th className="px-2 py-2 text-center">Lead Time</th>
                      <th className="px-2 py-2 text-left">Supplier</th>
                      <th className="px-2 py-2 text-center">Est. Cost</th>
                      <th className="px-2 py-2 text-left">AI Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((s) => (
                      <tr key={s.productId} className={`border-b hover:bg-muted/30 ${selectedItems.has(s.productId) ? "bg-blue-50" : ""}`}>
                        <td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedItems.has(s.productId)} onChange={() => toggleSelect(s.productId)} /></td>
                        <td className="px-2 py-2 font-medium">{s.productName}</td>
                        <td className="px-2 py-2 text-center"><Badge className={`${urgencyColors[s.urgency]} text-white text-[10px]`}>{s.urgency}</Badge></td>
                        <td className="px-2 py-2 text-center font-bold text-red-600">{s.currentStock}</td>
                        <td className="px-2 py-2 text-center">{s.reorderLevel}</td>
                        <td className="px-2 py-2 text-center">{s.avgMonthlyConsumption}</td>
                        <td className="px-2 py-2 text-center font-bold text-purple-700 bg-purple-50">{s.suggestedOrderQty}</td>
                        <td className="px-2 py-2 text-center text-muted-foreground">{s.economicOrderQty}</td>
                        <td className="px-2 py-2 text-center">{s.leadTimeDays}d</td>
                        <td className="px-2 py-2 max-w-[120px] truncate">{s.suggestedSupplier}</td>
                        <td className="px-2 py-2 text-center">₹{s.estimatedCost.toLocaleString()}</td>
                        <td className="px-2 py-2 text-muted-foreground max-w-[150px] truncate">{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm">{selectedItems.size} items selected | Est. Cost: <strong>₹{totalEstCost.toLocaleString()}</strong></span>
              <Button onClick={handleCreatePO} className="bg-green-600 hover:bg-green-700">
                <Truck className="mr-1 h-4 w-4" /> Auto-Create Purchase Order
              </Button>
            </div>
          )}
        </>
      )}

      {suggestions.length === 0 && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Click "Analyze & Suggest" to let AI analyze your stock levels, consumption patterns, and generate smart reorder suggestions.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISmartReorder;
