import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KpiTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  applicableRoles: string[];
  metricType: string;
  unit: string | null;
  targetValue: number;
  weightage: number;
  dataSource: string;
  frequency: string;
}

export interface EmployeeKpi {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  kpiTemplateId: string;
  kpiName: string;
  kpiCode: string;
  category: string;
  month: number;
  year: number;
  actualValue: number;
  targetValue: number;
  achievementPct: number;
  weightedScore: number;
  rating: number | null;
  remarks: string | null;
}

export interface EmployeeScorecard {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  role: string;
  overallScore: number;
  kpiCount: number;
  kpis: EmployeeKpi[];
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  reviewType: string;
  periodFrom: string;
  periodTo: string;
  kpiScore: number;
  managerRating: number | null;
  selfRating: number | null;
  finalRating: number | null;
  grade: string | null;
  recommendation: string | null;
  status: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TEMPLATES: KpiTemplate[] = [
  { id: "kt1", name: "Daily Consultations", code: "DOC-CONS", category: "clinical", applicableRoles: ["doctor"], metricType: "number", unit: "patients/day", targetValue: 15, weightage: 20, dataSource: "hms_auto", frequency: "monthly" },
  { id: "kt2", name: "Documentation Completeness", code: "DOC-DOCS", category: "compliance", applicableRoles: ["doctor"], metricType: "percentage", unit: "%", targetValue: 95, weightage: 15, dataSource: "hms_auto", frequency: "monthly" },
  { id: "kt3", name: "Patient Feedback Score", code: "DOC-FB", category: "patient_care", applicableRoles: ["doctor"], metricType: "rating", unit: "/5", targetValue: 4.2, weightage: 15, dataSource: "hms_auto", frequency: "monthly" },
  { id: "kt4", name: "Revenue Target", code: "DOC-REV", category: "financial", applicableRoles: ["doctor"], metricType: "currency", unit: "₹", targetValue: 200000, weightage: 20, dataSource: "hms_auto", frequency: "monthly" },
  { id: "kt5", name: "Therapies Completed", code: "TH-COMP", category: "clinical", applicableRoles: ["therapist"], metricType: "number", unit: "procedures", targetValue: 50, weightage: 25, dataSource: "hms_auto", frequency: "monthly" },
  { id: "kt6", name: "Patient Feedback (Therapy)", code: "TH-FB", category: "patient_care", applicableRoles: ["therapist"], metricType: "rating", unit: "/5", targetValue: 4.0, weightage: 20, dataSource: "hms_auto", frequency: "monthly" },
];

const MOCK_EMPLOYEE_KPIS: EmployeeKpi[] = [
  { id: "ek1", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", kpiTemplateId: "kt1", kpiName: "Daily Consultations", kpiCode: "DOC-CONS", category: "clinical", month: 8, year: 2026, actualValue: 18, targetValue: 15, achievementPct: 120, weightedScore: 24, rating: 5, remarks: null },
  { id: "ek2", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", kpiTemplateId: "kt2", kpiName: "Documentation Completeness", kpiCode: "DOC-DOCS", category: "compliance", month: 8, year: 2026, actualValue: 92, targetValue: 95, achievementPct: 97, weightedScore: 14.5, rating: 4, remarks: null },
  { id: "ek3", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", kpiTemplateId: "kt3", kpiName: "Patient Feedback Score", kpiCode: "DOC-FB", category: "patient_care", month: 8, year: 2026, actualValue: 4.5, targetValue: 4.2, achievementPct: 107, weightedScore: 16, rating: 5, remarks: null },
  { id: "ek4", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", kpiTemplateId: "kt4", kpiName: "Revenue Target", kpiCode: "DOC-REV", category: "financial", month: 8, year: 2026, actualValue: 320000, targetValue: 200000, achievementPct: 160, weightedScore: 20, rating: 5, remarks: "Exceeded target significantly" },
  { id: "ek5", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", kpiTemplateId: "kt5", kpiName: "Therapies Completed", kpiCode: "TH-COMP", category: "clinical", month: 8, year: 2026, actualValue: 62, targetValue: 50, achievementPct: 124, weightedScore: 31, rating: 5, remarks: null },
  { id: "ek6", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", kpiTemplateId: "kt6", kpiName: "Patient Feedback (Therapy)", kpiCode: "TH-FB", category: "patient_care", month: 8, year: 2026, actualValue: 4.3, targetValue: 4.0, achievementPct: 108, weightedScore: 21.5, rating: 4, remarks: null },
  { id: "ek7", employeeId: "2", employeeName: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", kpiTemplateId: "kt1", kpiName: "Daily Consultations", kpiCode: "DOC-CONS", category: "clinical", month: 8, year: 2026, actualValue: 12, targetValue: 15, achievementPct: 80, weightedScore: 16, rating: 3, remarks: null },
  { id: "ek8", employeeId: "2", employeeName: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", kpiTemplateId: "kt4", kpiName: "Revenue Target", kpiCode: "DOC-REV", category: "financial", month: 8, year: 2026, actualValue: 180000, targetValue: 200000, achievementPct: 90, weightedScore: 18, rating: 4, remarks: null },
];

const MOCK_REVIEWS: PerformanceReview[] = [
  { id: "pr1", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", reviewType: "annual", periodFrom: "2025-04-01", periodTo: "2026-03-31", kpiScore: 88, managerRating: 5, selfRating: 4, finalRating: 5, grade: "A+", recommendation: "increment", status: "completed" },
  { id: "pr2", employeeId: "6", employeeName: "Anita D", employeeCode: "EMP-0006", department: "Laboratory", reviewType: "probation", periodFrom: "2024-08-01", periodTo: "2025-01-31", kpiScore: 72, managerRating: 3, selfRating: 4, finalRating: 3, grade: "B", recommendation: "confirmation", status: "completed" },
  { id: "pr3", employeeId: "9", employeeName: "Mohan P", employeeCode: "EMP-0009", department: "Panchakarma", reviewType: "probation", periodFrom: "2024-02-01", periodTo: "2024-07-31", kpiScore: 65, managerRating: 3, selfRating: 3, finalRating: 3, grade: "B", recommendation: "training", status: "manager_review" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsPerformance = (month?: number, year?: number) => {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const [templates, setTemplates] = useState<KpiTemplate[]>(MOCK_TEMPLATES);
  const [employeeKpis, setEmployeeKpis] = useState<EmployeeKpi[]>(MOCK_EMPLOYEE_KPIS);
  const [reviews, setReviews] = useState<PerformanceReview[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. KPI Templates
      const { data: tpls, error: tplErr } = await (supabase as any)
        .from("hrms_kpi_templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (tplErr) { setError(tplErr.message); setLoading(false); return; }

      if (tpls && tpls.length > 0) {
        setTemplates(tpls.map((t: any) => ({
          id: t.id, name: t.name, code: t.code, category: t.category,
          applicableRoles: t.applicable_roles || [], metricType: t.metric_type,
          unit: t.unit, targetValue: Number(t.target_value), weightage: Number(t.weightage),
          dataSource: t.data_source, frequency: t.frequency,
        })));
      }

      // 2. Employee KPIs for period
      const { data: kpis } = await (supabase as any)
        .from("hrms_employee_kpis")
        .select("*, hms_staff(name, employee_code, department), hrms_kpi_templates(name, code, category)")
        .eq("month", m).eq("year", y)
        .order("employee_id");

      if (kpis && kpis.length > 0) {
        setEmployeeKpis(kpis.map((k: any) => ({
          id: k.id, employeeId: k.employee_id,
          employeeName: k.hms_staff?.name || "Unknown",
          employeeCode: k.hms_staff?.employee_code || "",
          department: k.hms_staff?.department || "",
          kpiTemplateId: k.kpi_template_id,
          kpiName: k.hrms_kpi_templates?.name || "",
          kpiCode: k.hrms_kpi_templates?.code || "",
          category: k.hrms_kpi_templates?.category || "general",
          month: k.month, year: k.year,
          actualValue: Number(k.actual_value), targetValue: Number(k.target_value),
          achievementPct: Number(k.achievement_pct), weightedScore: Number(k.weighted_score),
          rating: k.rating, remarks: k.remarks,
        })));
      }

      // 3. Performance reviews
      const { data: revs } = await (supabase as any)
        .from("hrms_performance_reviews")
        .select("*, hms_staff(name, employee_code, department)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (revs && revs.length > 0) {
        setReviews(revs.map((r: any) => ({
          id: r.id, employeeId: r.employee_id,
          employeeName: r.hms_staff?.name || "Unknown",
          employeeCode: r.hms_staff?.employee_code || "",
          department: r.hms_staff?.department || "",
          reviewType: r.review_type, periodFrom: r.period_from, periodTo: r.period_to,
          kpiScore: Number(r.kpi_score), managerRating: r.manager_rating,
          selfRating: r.self_rating, finalRating: r.final_rating,
          grade: r.grade, recommendation: r.recommendation, status: r.status,
        })));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [m, y]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build scorecards
  const scorecards: EmployeeScorecard[] = (() => {
    const map = new Map<string, EmployeeKpi[]>();
    employeeKpis.forEach((k) => {
      const arr = map.get(k.employeeId) || [];
      arr.push(k);
      map.set(k.employeeId, arr);
    });
    return Array.from(map.entries()).map(([empId, kpis]) => {
      const first = kpis[0];
      const overallScore = kpis.reduce((s, k) => s + k.weightedScore, 0) / (kpis.length || 1);
      return {
        employeeId: empId,
        employeeName: first.employeeName,
        employeeCode: first.employeeCode,
        department: first.department,
        role: "",
        overallScore: Math.round(overallScore * 10) / 10,
        kpiCount: kpis.length,
        kpis,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  })();

  return {
    templates,
    employeeKpis,
    scorecards,
    reviews,
    loading,
    error,
    refetch: fetchAll,
  };
};
