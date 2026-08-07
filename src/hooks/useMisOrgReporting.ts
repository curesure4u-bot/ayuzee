import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching MisOrgReporting UI shapes ────────────────────────────────

export interface OrgMember {
  id: string;
  name: string;
  role: string;
  department: string;
  reportsTo: string | null;
  email: string;
  phone: string;
  reportAccess: string[];
  level: number;
}

export interface ScheduledReportRecipient {
  name: string;
  method: "email" | "whatsapp" | "sms";
  contact: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  reports: string[];
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  recipients: ScheduledReportRecipient[];
  includeAISummary: boolean;
  includeCharts: boolean;
  active: boolean;
  lastSent?: string;
  nextSend: string;
}

export interface MisOrgReportingData {
  orgMembers: OrgMember[];
  scheduledReports: ScheduledReport[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_ORG: OrgMember[] = [
  { id: "1", name: "Dr. Mohamad Saleem", role: "Managing Director", department: "Management", reportsTo: null, email: "md@alshifa.com", phone: "98xxx00001", reportAccess: ["all"], level: 0 },
  { id: "2", name: "Dr. Sivarama Krishnan", role: "Chief Medical Officer", department: "Clinical", reportsTo: "1", email: "cmo@alshifa.com", phone: "98xxx00002", reportAccess: ["collection", "visits", "patients", "test-orders", "appointments", "income-consultant"], level: 1 },
  { id: "3", name: "Rajamani", role: "Operations Manager", department: "Operations", reportsTo: "1", email: "ops@alshifa.com", phone: "98xxx00003", reportAccess: ["all-accounts", "stocks", "expense", "attendance", "assets"], level: 1 },
  { id: "4", name: "Kumar", role: "Senior Cashier / Accounts", department: "Finance", reportsTo: "3", email: "accounts@alshifa.com", phone: "98xxx00004", reportAccess: ["collection", "income", "expense", "settlement", "credit-bills"], level: 2 },
  { id: "5", name: "Priya", role: "Pharmacist In-Charge", department: "Pharmacy", reportsTo: "3", email: "pharmacy@alshifa.com", phone: "98xxx00005", reportAccess: ["stocks", "sale", "purchase", "expiry", "current-stock"], level: 2 },
  { id: "6", name: "Anitha", role: "Lab In-Charge", department: "Laboratory", reportsTo: "2", email: "lab@alshifa.com", phone: "98xxx00006", reportAccess: ["test-orders", "lab-consumables", "tat"], level: 2 },
  { id: "7", name: "Lakshmi", role: "Therapy Head", department: "Panchakarma", reportsTo: "2", email: "therapy@alshifa.com", phone: "98xxx00007", reportAccess: ["therapy", "visits-therapy", "income-therapy"], level: 2 },
  { id: "8", name: "Front Desk Staff", role: "Receptionist", department: "Front Office", reportsTo: "3", email: "reception@alshifa.com", phone: "98xxx00008", reportAccess: ["appointments", "registration", "checked-in"], level: 2 },
];

const MOCK_SCHEDULED: ScheduledReport[] = [
  {
    id: "1", name: "Daily Collection Summary", reports: ["Daily Summary", "Net Collection", "Expense"],
    frequency: "daily", time: "09:00 PM", recipients: [
      { name: "Dr. Mohamad Saleem", method: "whatsapp", contact: "98xxx00001" },
      { name: "Rajamani", method: "email", contact: "ops@alshifa.com" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Aug 06, 9:00 PM", nextSend: "Aug 07, 9:00 PM"
  },
  {
    id: "2", name: "Weekly Performance Report", reports: ["Income By Consultant", "Visits per Dr", "Target vs Achieved", "Expense By Type"],
    frequency: "weekly", time: "08:00 AM", dayOfWeek: "Monday", recipients: [
      { name: "Dr. Mohamad Saleem", method: "email", contact: "md@alshifa.com" },
      { name: "Dr. Sivarama Krishnan", method: "whatsapp", contact: "98xxx00002" },
      { name: "Rajamani", method: "whatsapp", contact: "98xxx00003" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Aug 04, 8:00 AM", nextSend: "Aug 11, 8:00 AM"
  },
  {
    id: "3", name: "Monthly P&L + MIS Package", reports: ["Total Income", "Total Expense", "Outstanding Due", "Credit Bills", "Settlement", "Stock Value", "Franchise"],
    frequency: "monthly", time: "10:00 AM", dayOfMonth: 1, recipients: [
      { name: "Dr. Mohamad Saleem", method: "email", contact: "md@alshifa.com" },
      { name: "CA/Accountant", method: "email", contact: "ca@alshifa.com" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Aug 01, 10:00 AM", nextSend: "Sep 01, 10:00 AM"
  },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useMisOrgReporting = (): MisOrgReportingData & {
  createScheduledReport: (report: Omit<ScheduledReport, "id">) => Promise<boolean>;
  updateScheduledReport: (id: string, updates: Partial<ScheduledReport>) => Promise<boolean>;
  deleteScheduledReport: (id: string) => Promise<boolean>;
  createOrgMember: (member: Omit<OrgMember, "id">) => Promise<boolean>;
  updateOrgMember: (id: string, updates: Partial<OrgMember>) => Promise<boolean>;
  deleteOrgMember: (id: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<MisOrgReportingData>({
    orgMembers: MOCK_ORG,
    scheduledReports: MOCK_SCHEDULED,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch org members
      const { data: members, error: membersErr } = await (supabase as any)
        .from("mis_org_members")
        .select("*")
        .eq("is_active", true)
        .order("org_level", { ascending: true });

      // Fetch scheduled reports
      const { data: sess } = await supabase.auth.getSession();
      let reports: any[] | null = null;
      let reportsErr: any = null;

      if (sess.session) {
        const result = await (supabase as any)
          .from("mis_scheduled_reports")
          .select("*")
          .order("created_at", { ascending: false });
        reports = result.data;
        reportsErr = result.error;
      }

      if (membersErr && reportsErr) {
        console.warn("MIS Org Reporting fetch error (using fallback):", membersErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: membersErr?.message || reportsErr?.message }));
        return;
      }

      // Map org members
      const orgMembers: OrgMember[] = members && members.length > 0
        ? members.map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            department: m.department || "General",
            reportsTo: m.reports_to,
            email: m.email || "",
            phone: m.phone || "",
            reportAccess: Array.isArray(m.report_access) ? m.report_access : [],
            level: m.org_level ?? 2,
          }))
        : MOCK_ORG;

      // Map scheduled reports
      const scheduledReports: ScheduledReport[] = reports && reports.length > 0
        ? reports.map((r: any) => ({
            id: r.id,
            name: r.name,
            reports: Array.isArray(r.reports) ? r.reports : [],
            frequency: r.frequency || "daily",
            time: r.send_time || "21:00",
            dayOfWeek: r.day_of_week || undefined,
            dayOfMonth: r.day_of_month || undefined,
            recipients: Array.isArray(r.recipients) ? r.recipients : [],
            includeAISummary: r.include_ai_summary ?? true,
            includeCharts: r.include_charts ?? true,
            active: r.is_active ?? true,
            lastSent: r.last_sent_at ? new Date(r.last_sent_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : undefined,
            nextSend: r.next_send_at ? new Date(r.next_send_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—",
          }))
        : MOCK_SCHEDULED;

      setData({ orgMembers, scheduledReports, loading: false, error: null });
    } catch (err: any) {
      console.error("MIS Org Reporting unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── CRUD: Scheduled Reports ───────────────────────────────────────────────

  const createScheduledReport = async (report: Omit<ScheduledReport, "id">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return false;

    const { error } = await (supabase as any)
      .from("mis_scheduled_reports")
      .insert({
        owner_id: sess.session.user.id,
        name: report.name,
        reports: report.reports,
        frequency: report.frequency,
        send_time: report.time,
        day_of_week: report.dayOfWeek || null,
        day_of_month: report.dayOfMonth || null,
        recipients: report.recipients,
        include_ai_summary: report.includeAISummary,
        include_charts: report.includeCharts,
        is_active: report.active,
        next_send_at: report.nextSend,
      });

    if (!error) fetchData();
    return !error;
  };

  const updateScheduledReport = async (id: string, updates: Partial<ScheduledReport>): Promise<boolean> => {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.reports !== undefined) dbUpdates.reports = updates.reports;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.time !== undefined) dbUpdates.send_time = updates.time;
    if (updates.dayOfWeek !== undefined) dbUpdates.day_of_week = updates.dayOfWeek;
    if (updates.dayOfMonth !== undefined) dbUpdates.day_of_month = updates.dayOfMonth;
    if (updates.recipients !== undefined) dbUpdates.recipients = updates.recipients;
    if (updates.includeAISummary !== undefined) dbUpdates.include_ai_summary = updates.includeAISummary;
    if (updates.includeCharts !== undefined) dbUpdates.include_charts = updates.includeCharts;
    if (updates.active !== undefined) dbUpdates.is_active = updates.active;

    const { error } = await (supabase as any)
      .from("mis_scheduled_reports")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) fetchData();
    return !error;
  };

  const deleteScheduledReport = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("mis_scheduled_reports")
      .delete()
      .eq("id", id);

    if (!error) fetchData();
    return !error;
  };

  // ─── CRUD: Org Members ─────────────────────────────────────────────────────

  const createOrgMember = async (member: Omit<OrgMember, "id">): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("mis_org_members")
      .insert({
        name: member.name,
        role: member.role,
        department: member.department,
        reports_to: member.reportsTo,
        email: member.email,
        phone: member.phone,
        report_access: member.reportAccess,
        org_level: member.level,
        is_active: true,
      });

    if (!error) fetchData();
    return !error;
  };

  const updateOrgMember = async (id: string, updates: Partial<OrgMember>): Promise<boolean> => {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.reportsTo !== undefined) dbUpdates.reports_to = updates.reportsTo;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.reportAccess !== undefined) dbUpdates.report_access = updates.reportAccess;
    if (updates.level !== undefined) dbUpdates.org_level = updates.level;

    const { error } = await (supabase as any)
      .from("mis_org_members")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) fetchData();
    return !error;
  };

  const deleteOrgMember = async (id: string): Promise<boolean> => {
    // Soft delete
    const { error } = await (supabase as any)
      .from("mis_org_members")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchData();
    return !error;
  };

  return {
    ...data,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    createOrgMember,
    updateOrgMember,
    deleteOrgMember,
    refetch: fetchData,
  };
};
