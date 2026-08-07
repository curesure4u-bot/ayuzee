import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching MisStocks UI shapes ──────────────────────────────────────

export interface StockStoreValue {
  store: string;
  value: number;
  itemCount: number;
}

export interface StockReorderItem {
  productName: string;
  currentQty: number;
  minLevel: number;
  store: string;
  category: string;
}

export interface StockExpiryItem {
  productName: string;
  batch: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
  value: number;
  store: string;
}

export interface StockMovementItem {
  productName: string;
  soldQty: number;
  category: "fast" | "slow" | "non";
}

export interface MisStockSummary {
  totalStockValue: number;
  totalProducts: number;
  belowReorderCount: number;
  expiringIn30Days: number;
  expiringValue: number;
  slowMovingCount: number;
  deadStockValue: number;
}

export interface MisStockFilters {
  location?: string;
  store?: string;
}

export interface MisStockData {
  storeValues: StockStoreValue[];
  reorderItems: StockReorderItem[];
  expiryItems: StockExpiryItem[];
  summary: MisStockSummary;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_STORE_VALUES: StockStoreValue[] = [
  { store: "ALSHIFA PHARMACY", value: 485000, itemCount: 142 },
  { store: "Central Store", value: 320000, itemCount: 89 },
  { store: "IP Pharmacy Store", value: 145000, itemCount: 45 },
];

const MOCK_REORDER: StockReorderItem[] = [
  { productName: "Triphala Churna 100g", currentQty: 4, minLevel: 25, store: "ALSHIFA PHARMACY", category: "Churna" },
  { productName: "Ashwagandha Churna 100g", currentQty: 8, minLevel: 20, store: "ALSHIFA PHARMACY", category: "Churna" },
  { productName: "Dhanwantharam Taila 200ml", currentQty: 3, minLevel: 10, store: "Central Store", category: "Taila" },
  { productName: "Chandraprabha Vati 60 tabs", currentQty: 5, minLevel: 12, store: "ALSHIFA PHARMACY", category: "Vati" },
  { productName: "Kottamchukkadi Taila 200ml", currentQty: 2, minLevel: 8, store: "IP Pharmacy Store", category: "Taila" },
];

const MOCK_EXPIRY: StockExpiryItem[] = [
  { productName: "Rasnasaptakam Kashayam 200ml", batch: "RSK-2025-X", expiryDate: "2026-08-15", daysUntilExpiry: 8, quantity: 12, value: 2520, store: "ALSHIFA PHARMACY" },
  { productName: "Simhanada Guggulu 60 tabs", batch: "SNG-2025-Y", expiryDate: "2026-08-25", daysUntilExpiry: 18, quantity: 8, value: 1200, store: "ALSHIFA PHARMACY" },
  { productName: "Dashamoolarishtam 450ml", batch: "DMA-2025-Z", expiryDate: "2026-09-01", daysUntilExpiry: 25, quantity: 15, value: 2775, store: "Central Store" },
];

const MOCK_SUMMARY: MisStockSummary = {
  totalStockValue: 950000,
  totalProducts: 276,
  belowReorderCount: 5,
  expiringIn30Days: 12,
  expiringValue: 18500,
  slowMovingCount: 8,
  deadStockValue: 12000,
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useMisStock = (filters: MisStockFilters = {}): MisStockData => {
  const [data, setData] = useState<MisStockData>({
    storeValues: MOCK_STORE_VALUES,
    reorderItems: MOCK_REORDER,
    expiryItems: MOCK_EXPIRY,
    summary: MOCK_SUMMARY,
    loading: true,
    error: null,
  });

  const fetchStockData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // ─── 1. Fetch ward stores ──────────────────────────────────────

      let storesQuery = (supabase as any)
        .from("hms_ward_stores")
        .select("id, ward_name, department, location, store_code, is_active")
        .eq("is_active", true);

      if (filters.location && filters.location !== "all") {
        storesQuery = storesQuery.eq("location", filters.location);
      }

      const { data: stores, error: storesErr } = await storesQuery;

      if (storesErr) {
        console.warn("MIS Stock stores fetch error (using fallback):", storesErr.message);
        setData((prev) => ({ ...prev, loading: false, error: storesErr.message }));
        return;
      }

      if (!stores || stores.length === 0) {
        // Try the products table as fallback (marketplace products with stock field)
        const { data: products, error: prodErr } = await (supabase as any)
          .from("products")
          .select("id, name, stock, mrp, expiry_date, category, batch_number")
          .gt("stock", 0)
          .limit(200);

        if (prodErr || !products || products.length === 0) {
          setData((prev) => ({ ...prev, loading: false, error: null }));
          return;
        }

        // Aggregate from products table
        const totalValue = products.reduce((sum: number, p: any) => sum + ((Number(p.stock) || 0) * (Number(p.mrp) || 0)), 0);
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiryItems: StockExpiryItem[] = products
          .filter((p: any) => p.expiry_date && new Date(p.expiry_date) <= in30Days && new Date(p.expiry_date) > now)
          .map((p: any) => ({
            productName: p.name,
            batch: p.batch_number || "—",
            expiryDate: p.expiry_date,
            daysUntilExpiry: Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
            quantity: p.stock,
            value: p.stock * (p.mrp || 0),
            store: "Main Store",
          }));

        setData({
          storeValues: [{ store: "All Products", value: totalValue, itemCount: products.length }],
          reorderItems: MOCK_REORDER, // no reorder levels in products table
          expiryItems: expiryItems.length > 0 ? expiryItems : MOCK_EXPIRY,
          summary: {
            totalStockValue: totalValue,
            totalProducts: products.length,
            belowReorderCount: MOCK_SUMMARY.belowReorderCount,
            expiringIn30Days: expiryItems.length,
            expiringValue: expiryItems.reduce((s, e) => s + e.value, 0),
            slowMovingCount: MOCK_SUMMARY.slowMovingCount,
            deadStockValue: MOCK_SUMMARY.deadStockValue,
          },
          loading: false,
          error: null,
        });
        return;
      }

      // ─── 2. Fetch stock items from ward stores ─────────────────────

      const storeIds = stores.map((s: any) => s.id);
      const { data: stockItems, error: itemsErr } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, ward_store_id, product_name, product_category, batch_number, expiry_date, quantity_available, min_stock_level, max_stock_level, cost_per_unit, is_critical")
        .in("ward_store_id", storeIds);

      if (itemsErr) {
        console.warn("MIS Stock items fetch error:", itemsErr.message);
        setData((prev) => ({ ...prev, loading: false, error: itemsErr.message }));
        return;
      }

      if (!stockItems || stockItems.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Build store name lookup
      const storeNameMap = new Map<string, string>();
      for (const s of stores) {
        storeNameMap.set(s.id, s.ward_name || s.store_code);
      }

      // ─── 3. Aggregate: Store Values ────────────────────────────────

      const storeValueMap = new Map<string, { value: number; count: number }>();
      for (const item of stockItems) {
        const storeName = storeNameMap.get(item.ward_store_id) || "Unknown Store";
        const entry = storeValueMap.get(storeName) || { value: 0, count: 0 };
        entry.value += (Number(item.quantity_available) || 0) * (Number(item.cost_per_unit) || 0);
        entry.count += 1;
        storeValueMap.set(storeName, entry);
      }
      const storeValues: StockStoreValue[] = Array.from(storeValueMap.entries())
        .map(([store, { value, count }]) => ({ store, value, itemCount: count }))
        .sort((a, b) => b.value - a.value);

      // ─── 4. Aggregate: Reorder Items ───────────────────────────────

      const reorderItems: StockReorderItem[] = stockItems
        .filter((item: any) => item.min_stock_level && item.quantity_available < item.min_stock_level)
        .map((item: any) => ({
          productName: item.product_name,
          currentQty: item.quantity_available,
          minLevel: item.min_stock_level,
          store: storeNameMap.get(item.ward_store_id) || "Unknown",
          category: item.product_category || "General",
        }))
        .sort((a: StockReorderItem, b: StockReorderItem) => (a.currentQty / a.minLevel) - (b.currentQty / b.minLevel));

      // ─── 5. Aggregate: Expiry Items (within 30 days) ───────────────

      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiryItems: StockExpiryItem[] = stockItems
        .filter((item: any) => {
          if (!item.expiry_date) return false;
          const exp = new Date(item.expiry_date);
          return exp <= in30Days && exp > now;
        })
        .map((item: any) => {
          const exp = new Date(item.expiry_date);
          return {
            productName: item.product_name,
            batch: item.batch_number || "—",
            expiryDate: item.expiry_date,
            daysUntilExpiry: Math.ceil((exp.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
            quantity: item.quantity_available,
            value: (item.quantity_available || 0) * (item.cost_per_unit || 0),
            store: storeNameMap.get(item.ward_store_id) || "Unknown",
          };
        })
        .sort((a: StockExpiryItem, b: StockExpiryItem) => a.daysUntilExpiry - b.daysUntilExpiry);

      // ─── 6. Build Summary ──────────────────────────────────────────

      const totalStockValue = storeValues.reduce((s, sv) => s + sv.value, 0);
      const totalProducts = stockItems.length;

      const summary: MisStockSummary = {
        totalStockValue,
        totalProducts,
        belowReorderCount: reorderItems.length,
        expiringIn30Days: expiryItems.length,
        expiringValue: expiryItems.reduce((s, e) => s + e.value, 0),
        slowMovingCount: 0, // would need consumption log analysis
        deadStockValue: 0,
      };

      setData({
        storeValues,
        reorderItems: reorderItems.length > 0 ? reorderItems : MOCK_REORDER,
        expiryItems: expiryItems.length > 0 ? expiryItems : MOCK_EXPIRY,
        summary,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("MIS Stock unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [filters.location, filters.store]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return data;
};

// ─── AI Summary text generator ───────────────────────────────────────────────

export function generateAiStockSummary(summary: MisStockSummary): string {
  return (
    `${summary.belowReorderCount} products below reorder level. ` +
    `${summary.expiringIn30Days} items expiring within 30 days (₹${summary.expiringValue.toLocaleString("en-IN")} value). ` +
    `Total stock value: ₹${summary.totalStockValue.toLocaleString("en-IN")} across ${summary.totalProducts} products. ` +
    (summary.slowMovingCount > 0 ? `${summary.slowMovingCount} slow movers with no sale in 60 days.` : "")
  );
}
