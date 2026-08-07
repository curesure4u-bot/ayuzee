import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DietOrderStatus = "pending" | "preparing" | "ready" | "delivered";

export interface DietOrder {
  id: string;
  patient: string;
  ward: string;
  bed: string;
  dietType: string;
  meal: string;
  time: string;
  specialInstructions: string;
  status: DietOrderStatus;
}

const MOCK_ORDERS: DietOrder[] = [
  { id: "1", patient: "Ramesh Kumar", ward: "General", bed: "Bed 3", dietType: "Samsarjana Krama (Day 2)", meal: "Breakfast", time: "07:30", specialInstructions: "Only Peya (rice gruel). No salt, no oil.", status: "delivered" },
  { id: "2", patient: "Ramesh Kumar", ward: "General", bed: "Bed 3", dietType: "Samsarjana Krama (Day 2)", meal: "Lunch", time: "12:30", specialInstructions: "Vilepi (thick gruel). Minimal salt.", status: "preparing" },
  { id: "3", patient: "Meera Nair", ward: "PK Suite", bed: "Suite 2", dietType: "Snehapana Diet", meal: "Lunch", time: "After digestion", specialInstructions: "NO food until hunger returns. Warm water only.", status: "pending" },
  { id: "4", patient: "Sunil Menon", ward: "General", bed: "Bed 5", dietType: "Normal Pathya", meal: "Breakfast", time: "08:00", specialInstructions: "Warm food. Avoid curd. Include ginger.", status: "delivered" },
  { id: "5", patient: "Sunil Menon", ward: "General", bed: "Bed 5", dietType: "Normal Pathya", meal: "Lunch", time: "12:30", specialInstructions: "Rice + dal + warm vegetables. No cold items.", status: "ready" },
  { id: "6", patient: "Lakshmi Devi", ward: "Private", bed: "Room 2", dietType: "Kapha-reducing", meal: "Breakfast", time: "08:00", specialInstructions: "Light, warm, dry food. Honey water. No dairy.", status: "delivered" },
  { id: "7", patient: "Anand Sharma", ward: "PK Suite", bed: "Suite 4", dietType: "Pre-Virechana", meal: "Lunch", time: "12:00", specialInstructions: "Light khichdi only. Evening: Virechana medicine.", status: "preparing" },
];

export const useDietKitchen = () => {
  const [orders, setOrders] = useState<DietOrder[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_diet_orders")
        .select("*")
        .eq("order_date", today)
        .order("meal_time");

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: DietOrder[] = data.map((r: any) => ({
          id: r.id,
          patient: r.patient_name || "",
          ward: r.ward || "",
          bed: r.bed || "",
          dietType: r.diet_type || "",
          meal: r.meal || "",
          time: r.meal_time || "",
          specialInstructions: r.special_instructions || "",
          status: r.status || "pending",
        }));
        setOrders(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: DietOrderStatus): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any)
      .from("hms_diet_orders")
      .update({ status })
      .eq("id", id);

    if (updateErr) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      return true;
    }
    await fetchOrders();
    return true;
  };

  const pending = orders.filter(o => o.status === "pending").length;
  const preparing = orders.filter(o => o.status === "preparing").length;
  const ready = orders.filter(o => o.status === "ready").length;
  const delivered = orders.filter(o => o.status === "delivered").length;

  return { orders, loading, error, pending, preparing, ready, delivered, updateStatus, refetch: fetchOrders };
};
