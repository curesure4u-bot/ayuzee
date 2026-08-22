import { supabase } from "@/integrations/supabase/client";

export function useMisReports() {
  const getDailyRevenue = async (startDate: string, endDate: string, branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_bills")
      .select("bill_date, total_amount, paid_amount, balance_amount, payment_status, department, doctor_name, bill_type")
      .eq("branch", branch)
      .eq("is_cancelled", false)
      .gte("bill_date", startDate)
      .lte("bill_date", endDate)
      .order("bill_date", { ascending: false });

    if (error) throw error;

    // Aggregate by date
    const byDate = new Map<string, { revenue: number; collected: number; outstanding: number; count: number }>();
    (data || []).forEach((b: any) => {
      const d = b.bill_date;
      const existing = byDate.get(d) || { revenue: 0, collected: 0, outstanding: 0, count: 0 };
      existing.revenue += b.total_amount || 0;
      existing.collected += b.paid_amount || 0;
      existing.outstanding += b.balance_amount || 0;
      existing.count++;
      byDate.set(d, existing);
    });

    return { raw: data || [], byDate: Object.fromEntries(byDate) };
  };

  const getOpdSummary = async (startDate: string, endDate: string, branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_op_visits")
      .select("visit_date, mode_visit, status, doctor_name, purpose")
      .eq("branch", branch)
      .gte("visit_date", startDate)
      .lte("visit_date", endDate);

    if (error) throw error;

    const summary = {
      total: 0, walkins: 0, followups: 0, teleconsults: 0,
      completed: 0, noShows: 0, byDoctor: {} as Record<string, number>,
    };

    (data || []).forEach((v: any) => {
      summary.total++;
      if (v.mode_visit === "Direct") summary.walkins++;
      if (v.mode_visit === "Follow-up") summary.followups++;
      if (v.mode_visit === "Teleconsult") summary.teleconsults++;
      if (v.status === "completed") summary.completed++;
      if (v.status === "no_show") summary.noShows++;
      if (v.doctor_name) {
        summary.byDoctor[v.doctor_name] = (summary.byDoctor[v.doctor_name] || 0) + 1;
      }
    });

    return summary;
  };

  const getStockSummary = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_stock_products")
      .select("product_name, current_stock, reorder_level, mrp, purchase_rate, category")
      .eq("branch", branch)
      .eq("is_active", true);

    if (error) throw error;

    const products = data || [];
    const totalValue = products.reduce((s: number, p: any) => s + (p.current_stock || 0) * (p.purchase_rate || 0), 0);
    const lowStock = products.filter((p: any) => (p.current_stock || 0) <= (p.reorder_level || 0));
    const outOfStock = products.filter((p: any) => (p.current_stock || 0) === 0);

    return { totalProducts: products.length, totalValue, lowStock: lowStock.length, outOfStock: outOfStock.length, products };
  };

  const getLabSummary = async (startDate: string, endDate: string, branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_lab_orders")
      .select("status, priority, order_date, total_amount")
      .eq("branch", branch)
      .gte("order_date", startDate)
      .lte("order_date", endDate);

    if (error) throw error;

    const summary = { total: 0, completed: 0, pending: 0, stat: 0, revenue: 0 };
    (data || []).forEach((o: any) => {
      summary.total++;
      if (o.status === "completed") summary.completed++;
      if (["ordered", "sample_collected", "processing"].includes(o.status)) summary.pending++;
      if (o.priority === "stat") summary.stat++;
      summary.revenue += o.total_amount || 0;
    });

    return summary;
  };

  return { getDailyRevenue, getOpdSummary, getStockSummary, getLabSummary };
}
