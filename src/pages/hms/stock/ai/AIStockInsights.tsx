import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, IndianRupee, Clock, Zap, BarChart3,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "prediction" | "anomaly" | "optimization" | "alert";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric?: string;
  trend?: "up" | "down" | "stable";
  actionable: boolean;
  action?: string;
}

const mockInsights: AIInsight[] = [
  {
    id: "1", type: "prediction", title: "Stock-out Predicted: Dasamoolarishtam",
    description: "Based on current consumption rate (1.5/day), stock will deplete in 3 days. Seasonal demand rise expected next week.",
    impact: "high", metric: "3 days to stockout", trend: "down", actionable: true, action: "Auto-create PO",
  },
  {
    id: "2", type: "anomaly", title: "Unusual Consumption: Simhanada Guggulu",
    description: "230% above normal daily average yesterday. Verify if bulk prescription or data entry error.",
    impact: "high", metric: "+230% vs avg", trend: "up", actionable: true, action: "Review transactions",
  },
  {
    id: "3", type: "optimization", title: "Bulk Order Savings Available",
    description: "Ordering 5 products from KOTTAKKAL in bulk (3-month supply) could save ₹12,400 with their volume discount.",
    impact: "medium", metric: "₹12,400 saving", actionable: true, action: "Generate bulk PO",
  },
  {
    id: "4", type: "alert", title: "3 Products Approaching Expiry",
    description: "Ksheerabala 101 (18 units, exp 14-Aug), Simhanada Guggulu (8 units, exp 09-Aug) need immediate attention.",
    impact: "high", metric: "₹8,550 at risk", trend: "down", actionable: true, action: "Apply discounts",
  },
  {
    id: "5", type: "prediction", title: "Monsoon Season Demand Surge",
    description: "AI predicts 25% increase in respiratory & immunity products in next 2 weeks based on weather + historical data.",
    impact: "medium", metric: "+25% predicted", trend: "up", actionable: true, action: "Pre-order stock",
  },
  {
    id: "6", type: "optimization", title: "Dead Stock: 12 Products Zero Movement",
    description: "12 products have had no sales in 60+ days. ₹34,000 capital locked. Consider return or clearance sale.",
    impact: "medium", metric: "₹34K locked", actionable: true, action: "Clear dead stock",
  },
];

const AIStockInsights = () => {
  const [insights] = useState<AIInsight[]>(mockInsights);

  const typeColors = {
    prediction: "bg-blue-100 text-blue-700 border-blue-200",
    anomaly: "bg-red-100 text-red-700 border-red-200",
    optimization: "bg-green-100 text-green-700 border-green-200",
    alert: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const typeIcons = {
    prediction: TrendingUp,
    anomaly: AlertTriangle,
    optimization: Lightbulb,
    alert: Clock,
  };

  const impactColors = { high: "bg-red-600", medium: "bg-amber-500", low: "bg-green-500" };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/20 to-blue-50/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Stock Intelligence
          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> Live Analysis
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground font-normal">Updated 2 min ago</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = typeIcons[insight.type];
          return (
            <div key={insight.id} className={`rounded-lg border p-3 ${typeColors[insight.type]}`}>
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{insight.title}</span>
                    <Badge className={`${impactColors[insight.impact]} text-white text-[10px] h-4`}>{insight.impact}</Badge>
                    {insight.metric && (
                      <span className="text-xs font-mono">{insight.metric}</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 opacity-80">{insight.description}</p>
                  {insight.actionable && insight.action && (
                    <Button size="sm" variant="outline" className="mt-2 h-6 text-xs border-current">
                      <Zap className="mr-1 h-3 w-3" /> {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AIStockInsights;
