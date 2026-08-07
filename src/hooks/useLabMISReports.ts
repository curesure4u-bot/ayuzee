import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching MISReports UI ────────────────────────────────────────────

export interface LabMISMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "flat";
}

export interface RevenueByTest {
  testName: string;
  count: number;
  revenue: number;
  avgPrice: number;
  percentOfTotal: number;
}

export interface RevenueByDoctor {
  doctorName: string;
  referrals: number;
  revenue: number;
  commission: number;
  topTest: string;
}

export interface DepartmentPerformance {
  department: string;
  tests: number;
  revenue: number;
  avgTAT: string;
  tatCompliance: number;
  completedCount: number;
}

export interface LocationPerformance {
  location: string;
  tests: number;
  revenue: number;
  patients: number;
  avgBillValue: number;
}

export interface LabMISReportsData {
  metrics: LabMISMetric[];
  revenueByTest: RevenueByTest[];
  revenueByDoctor: RevenueByDoctor[];
  deptPerformance: DepartmentPerformance[];
  locationPerformance: LocationPerformance[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_METRICS: LabMISMetric[] = [
  { label: "Total Revenue", value: "₹8,45,000", change: 12.5, trend: "up" },
  { label: "Total Tests", value: "2,340", change: 8.2, trend: "up" },
  { label: "Unique Patients", value: "1,125", change: 5.1, trend: "up" },
  { label: "Avg Bill Value", value: "₹752", change: -2.3, trend: "down" },
  { label: "Collection Rate", value: "92.4%", change: 1.8, trend: "up" },
  { label: "TAT Compliance", value: "89.7%", change: 3.5, trend: "up" },
];

const MOCK_BY_TEST: RevenueByTest[] = [
  { testName: "Complete Blood Count", count: 420, revenue: 189000, avgPrice: 450, percentOfTotal: 22.4 },
  { testName: "Thyroid Profile", count: 185, revenue: 148000, avgPrice: 800, percentOfTotal: 17.5 },
  { testName: "Lipid Profile", count: 210, revenue: 126000, avgPrice: 600, percentOfTotal: 14.9 },
  { testName: "Renal Function Test", count: 140, revenue: 119000, avgPrice: 850, percentOfTotal: 14.1 },
  { testName: "Liver Function Test", count: 135, revenue: 101250, avgPrice: 750, percentOfTotal: 12.0 },
  { testName: "HbA1c", count: 165, revenue: 82500, avgPrice: 500, percentOfTotal: 9.8 },
  { testName: "Blood Sugar (F/PP)", count: 310, revenue: 55800, avgPrice: 180, percentOfTotal: 6.6 },
  { testName: "Vitamin D", count: 35, revenue: 42000, avgPrice: 1200, percentOfTotal: 5.0 },
];

const MOCK_BY_DOCTOR: RevenueByDoctor[] = [
  { doctorName: "Dr. Mohamad Saleem", referrals: 156, revenue: 245000, commission: 36750, topTest: "RFT" },
  { doctorName: "Dr. Anitha Kumari", referrals: 89, revenue: 178000, commission: 21360, topTest: "Thyroid" },
  { doctorName: "Dr. Ramesh Babu", referrals: 45, revenue: 112000, commission: 11200, topTest: "Lipid" },
  { doctorName: "Dr. Priya Nair", referrals: 32, revenue: 48000, commission: 3200, topTest: "CBC" },
  { doctorName: "Walk-in (Self)", referrals: 520, revenue: 262000, commission: 0, topTest: "CBC" },
];

const MOCK_DEPT: DepartmentPerformance[] = [
  { department: "BIOCHEMISTRY", tests: 1250, revenue: 520000, avgTAT: "2.1 Hrs", tatCompliance: 91, completedCount: 1180 },
  { department: "HAEMATOLOGY", tests: 620, revenue: 185000, avgTAT: "1.5 Hrs", tatCompliance: 95, completedCount: 610 },
  { department: "MICROBIOLOGY", tests: 85, revenue: 127500, avgTAT: "72 Hrs", tatCompliance: 88, completedCount: 78 },
  { department: "CLINICAL PATHOLOGY", tests: 280, revenue: 42000, avgTAT: "45 Min", tatCompliance: 97, completedCount: 275 },
  { department: "RADIOLOGY", tests: 105, revenue: 168000, avgTAT: "3.2 Hrs", tatCompliance: 85, completedCount: 95 },
];

const MOCK_LOCATION: LocationPerformance[] = [
  { location: "Kadayanallur (Main)", tests: 1450, revenue: 520000, patients: 680, avgBillValue: 765 },
  { location: "Rajapalayam", tests: 520, revenue: 186000, patients: 245, avgBillValue: 759 },
  { location: "Tenkasi", tests: 280, revenue: 98000, patients: 140, avgBillValue: 700 },
  { location: "Sankarankovil (CC)", tests: 90, revenue: 41000, patients: 60, avgBillValue: 683 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useLabMISReports = (dateRange: string = "this-month"): LabMISReportsData & { refetch: () => void } => {
  const [data, setData] = useState<LabMISReportsData>({
    metrics: MOCK_METRICS,
    revenueByTest: MOCK_BY_TEST,
    revenueByDoctor: MOCK_BY_DOCTOR,
    deptPerformance: MOCK_DEPT,
    locationPerformance: MOCK_LOCATION,
    loading: true,
    error: null,
  });

  const fetchReports = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Determine date range
      const today = new Date();
      let fromDate: string;
      const toDate = today.toISOString().split("T")[0];

      switch (dateRange) {
        case "today": fromDate = toDate; break;
        case "this-week": {
          const d = new Date(today);
          d.setDate(d.getDate() - d.getDay());
          fromDate = d.toISOString().split("T")[0]; break;
        }
        case "last-month": {
          const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          fromDate = d.toISOString().split("T")[0]; break;
        }
        case "quarter": {
          const q = Math.floor(today.getMonth() / 3) * 3;
          fromDate = `${today.getFullYear()}-${String(q + 1).padStart(2, "0")}-01`; break;
        }
        case "year": fromDate = `${today.getFullYear()}-01-01`; break;
        default: // this-month
          fromDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
      }

      // Fetch orders for the period
      const { data: orders, error } = await (supabase as any)
        .from("hms_lab_orders")
        .select("id, patient_id, net_amount, paid_amount, status, referred_by_name, location, department, completed_at, created_at")
        .gte("order_date", fromDate)
        .lte("order_date", toDate)
        .neq("status", "Cancelled");

      if (error) {
        console.warn("Lab MIS fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!orders || orders.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Fetch order tests
      const orderIds = orders.map((o: any) => o.id);
      const { data: orderTests } = await (supabase as any)
        .from("hms_lab_order_tests")
        .select("id, order_id, test_name, department, price, status, completed_at")
        .in("order_id", orderIds.slice(0, 200));

      const tests = orderTests || [];

      // ─── Calculate Metrics ─────────────────────────────────────────

      const totalRevenue = orders.reduce((s: number, o: any) => s + (Number(o.paid_amount) || 0), 0);
      const totalTests = tests.length;
      const uniquePatients = new Set(orders.map((o: any) => o.patient_id)).size;
      const avgBillValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
      const paidOrders = orders.filter((o: any) => Number(o.paid_amount) > 0).length;
      const collectionRate = orders.length > 0 ? Math.round((paidOrders / orders.length) * 100 * 10) / 10 : 0;

      // TAT compliance (completed within target — assume 180 min target)
      const completedTests = tests.filter((t: any) => t.completed_at);
      const withinTAT = completedTests.filter((t: any) => {
        const order = orders.find((o: any) => o.id === t.order_id);
        if (!order || !order.created_at) return false;
        const tat = (new Date(t.completed_at).getTime() - new Date(order.created_at).getTime()) / 60000;
        return tat <= 180;
      }).length;
      const tatCompliance = completedTests.length > 0 ? Math.round((withinTAT / completedTests.length) * 100 * 10) / 10 : 0;

      const metrics: LabMISMetric[] = [
        { label: "Total Revenue", value: formatINR(totalRevenue), change: 0, trend: "up" },
        { label: "Total Tests", value: totalTests.toLocaleString("en-IN"), change: 0, trend: "up" },
        { label: "Unique Patients", value: uniquePatients.toLocaleString("en-IN"), change: 0, trend: "up" },
        { label: "Avg Bill Value", value: `₹${avgBillValue}`, change: 0, trend: "flat" },
        { label: "Collection Rate", value: `${collectionRate}%`, change: 0, trend: "up" },
        { label: "TAT Compliance", value: `${tatCompliance}%`, change: 0, trend: "up" },
      ];

      // ─── Revenue by Test ───────────────────────────────────────────

      const testMap = new Map<string, { count: number; revenue: number }>();
      for (const t of tests) {
        const entry = testMap.get(t.test_name) || { count: 0, revenue: 0 };
        entry.count += 1;
        entry.revenue += Number(t.price) || 0;
        testMap.set(t.test_name, entry);
      }
      const testRevTotal = Array.from(testMap.values()).reduce((s, e) => s + e.revenue, 0);
      const revenueByTest: RevenueByTest[] = Array.from(testMap.entries())
        .map(([testName, { count, revenue }]) => ({
          testName,
          count,
          revenue,
          avgPrice: count > 0 ? Math.round(revenue / count) : 0,
          percentOfTotal: testRevTotal > 0 ? Math.round((revenue / testRevTotal) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // ─── Revenue by Doctor ─────────────────────────────────────────

      const drMap = new Map<string, { referrals: number; revenue: number }>();
      for (const o of orders) {
        const name = o.referred_by_name || "Walk-in (Self)";
        const entry = drMap.get(name) || { referrals: 0, revenue: 0 };
        entry.referrals += 1;
        entry.revenue += Number(o.net_amount) || 0;
        drMap.set(name, entry);
      }
      const revenueByDoctor: RevenueByDoctor[] = Array.from(drMap.entries())
        .map(([doctorName, { referrals, revenue }]) => ({
          doctorName,
          referrals,
          revenue,
          commission: Math.round(revenue * 0.15), // 15% default commission
          topTest: "—",
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      // ─── Department Performance ────────────────────────────────────

      const deptMap = new Map<string, { tests: number; revenue: number; completed: number; tatSum: number; tatCount: number }>();
      for (const t of tests) {
        const dept = t.department || "GENERAL";
        const entry = deptMap.get(dept) || { tests: 0, revenue: 0, completed: 0, tatSum: 0, tatCount: 0 };
        entry.tests += 1;
        entry.revenue += Number(t.price) || 0;
        if (t.status === "Completed" || t.status === "Validated") entry.completed += 1;
        if (t.completed_at) {
          const order = orders.find((o: any) => o.id === t.order_id);
          if (order?.created_at) {
            entry.tatSum += (new Date(t.completed_at).getTime() - new Date(order.created_at).getTime()) / 60000;
            entry.tatCount += 1;
          }
        }
        deptMap.set(dept, entry);
      }
      const deptPerformance: DepartmentPerformance[] = Array.from(deptMap.entries())
        .map(([department, { tests: testCount, revenue, completed, tatSum, tatCount }]) => {
          const avgMinutes = tatCount > 0 ? tatSum / tatCount : 0;
          return {
            department,
            tests: testCount,
            revenue,
            avgTAT: avgMinutes >= 60 ? `${(avgMinutes / 60).toFixed(1)} Hrs` : `${Math.round(avgMinutes)} Min`,
            tatCompliance: testCount > 0 ? Math.round((completed / testCount) * 100) : 0,
            completedCount: completed,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      // ─── Location Performance ──────────────────────────────────────

      const locMap = new Map<string, { tests: number; revenue: number; patients: Set<string> }>();
      for (const o of orders) {
        const loc = o.location || "Main";
        const entry = locMap.get(loc) || { tests: 0, revenue: 0, patients: new Set<string>() };
        entry.revenue += Number(o.net_amount) || 0;
        if (o.patient_id) entry.patients.add(o.patient_id);
        locMap.set(loc, entry);
      }
      // Add test counts per location
      for (const t of tests) {
        const order = orders.find((o: any) => o.id === t.order_id);
        if (order) {
          const loc = order.location || "Main";
          const entry = locMap.get(loc);
          if (entry) entry.tests += 1;
        }
      }
      const locationPerformance: LocationPerformance[] = Array.from(locMap.entries())
        .map(([location, { tests: testCount, revenue, patients }]) => ({
          location,
          tests: testCount,
          revenue,
          patients: patients.size,
          avgBillValue: patients.size > 0 ? Math.round(revenue / patients.size) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setData({
        metrics,
        revenueByTest: revenueByTest.length > 0 ? revenueByTest : MOCK_BY_TEST,
        revenueByDoctor: revenueByDoctor.length > 0 ? revenueByDoctor : MOCK_BY_DOCTOR,
        deptPerformance: deptPerformance.length > 0 ? deptPerformance : MOCK_DEPT,
        locationPerformance: locationPerformance.length > 0 ? locationPerformance : MOCK_LOCATION,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Lab MIS unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { ...data, refetch: fetchReports };
};
