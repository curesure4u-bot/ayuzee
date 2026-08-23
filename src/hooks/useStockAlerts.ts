import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StockAlert {
  id: string;
  product_name: string;
  category: string | null;
  current_stock: number;
  reorder_level: number;
  alert_type: "out_of_stock" | "low_stock" | "near_expiry";
  severity: "critical" | "warning";
}

export interface StockAlertSummary {
  outOfStock: number;
  lowStock: number;
  nearExpiry: number;
  totalAlerts: number;
  alerts: StockAlert[];
  loading: boolean;
}

export function useStockAlerts(branch = "Main Branch") {
  const [data, setData] = useState<StockAlertSummary>({
    outOfStock: 0, lowStock: 0, nearExpiry: 0, totalAlerts: 0,
    alerts: [], loading: true,
  });

  useEffect(() => {
    const load = async () => {
      const { data: products, error } = await (supabase as any)
        .from("hms_stock_products")
        .select("id, product_name, category, current_stock, reorder_level")
        .eq("branch", branch)
        .eq("is_active", true);

      if (error) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      const alerts: StockAlert[] = [];

      (products || []).forEach((p: any) => {
        const stock = p.current_stock || 0;
        const reorder = p.reorder_level || 0;

        if (stock === 0) {
          alerts.push({
            id: p.id, product_name: p.product_name, category: p.category,
            current_stock: stock, reorder_level: reorder,
            alert_type: "out_of_stock", severity: "critical",
          });
        } else if (stock <= reorder) {
          alerts.push({
            id: p.id, product_name: p.product_name, category: p.category,
            current_stock: stock, reorder_level: reorder,
            alert_type: "low_stock", severity: "warning",
          });
        }
      });

      // Sort: critical first
      alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1));

      setData({
        outOfStock: alerts.filter((a) => a.alert_type === "out_of_stock").length,
        lowStock: alerts.filter((a) => a.alert_type === "low_stock").length,
        nearExpiry: 0, // Would need batch-level expiry data
        totalAlerts: alerts.length,
        alerts,
        loading: false,
      });
    };

    load();
  }, [branch]);

  return data;
}
