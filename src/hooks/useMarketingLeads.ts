import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketingLead {
  id: string;
  name: string;
  contact: string;
  category: string;
  dueDate: string;
  purpose: string;
  status: "New" | "Contacted" | "Interested" | "Converted" | "Lost";
  assignedTo: string;
  source: string;
  notes: string;
  createdAt: string;
}

export interface MarketingFollowUp {
  id: string;
  leadName: string;
  contact: string;
  scheduledDate: string;
  type: "Call" | "Visit" | "WhatsApp" | "Email" | "SMS";
  notes: string;
  status: "Pending" | "Done" | "Rescheduled" | "Missed";
}

export interface MarketingData {
  leads: MarketingLead[];
  followUps: MarketingFollowUp[];
  loading: boolean;
  error: string | null;
}

const MOCK_LEADS: MarketingLead[] = [
  { id: "1", name: "Anitha Krishnan", contact: "+91-9876543210", category: "Panchakarma Inquiry", dueDate: "2026-08-10", purpose: "14-day Panchakarma for knee pain", status: "Contacted", assignedTo: "Vignesh", source: "Walk-in", notes: "Wants pricing details", createdAt: "2026-08-05" },
  { id: "2", name: "Suresh Babu", contact: "+91-8765432109", category: "Corporate Wellness", dueDate: "2026-08-12", purpose: "Corporate tie-up for 50 employees", status: "Interested", assignedTo: "Marketing Agent", source: "Website", notes: "Follow-up scheduled", createdAt: "2026-08-03" },
  { id: "3", name: "Meera Nair", contact: "+91-7654321098", category: "Teleconsult Lead", dueDate: "2026-08-15", purpose: "International patient - Dubai", status: "New", assignedTo: "Vignesh", source: "Google Ads", notes: "Wants video consult with Dr. Arun", createdAt: "2026-08-06" },
  { id: "4", name: "Rajesh Pillai", contact: "+91-9988776655", category: "Treatment Package", dueDate: "2026-08-08", purpose: "Weight loss program", status: "Contacted", assignedTo: "Bhavani", source: "Referral", notes: "Referred by existing patient", createdAt: "2026-08-04" },
  { id: "5", name: "Kavitha Devi", contact: "+91-8877665544", category: "Insurance Inquiry", dueDate: "2026-08-09", purpose: "Ayush insurance coverage", status: "New", assignedTo: "Cashier", source: "Phone Call", notes: "", createdAt: "2026-08-06" },
];

const MOCK_FOLLOWUPS: MarketingFollowUp[] = [
  { id: "1", leadName: "Anitha Krishnan", contact: "+91-9876543210", scheduledDate: "2026-08-07", type: "Call", notes: "Share Panchakarma pricing", status: "Pending" },
  { id: "2", leadName: "Suresh Babu", contact: "+91-8765432109", scheduledDate: "2026-08-08", type: "Visit", notes: "Company visit for wellness proposal", status: "Pending" },
  { id: "3", leadName: "Rajesh Pillai", contact: "+91-9988776655", scheduledDate: "2026-08-07", type: "WhatsApp", notes: "Send weight loss program brochure", status: "Pending" },
];

export const useMarketingLeads = (search?: string): MarketingData & {
  createLead: (lead: Omit<MarketingLead, "id" | "createdAt">) => Promise<boolean>;
  updateLeadStatus: (id: string, status: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<MarketingData>({
    leads: MOCK_LEADS,
    followUps: MOCK_FOLLOWUPS,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: leads, error: leadErr } = await (supabase as any)
        .from("hms_marketing_leads")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: followups, error: fuErr } = await (supabase as any)
        .from("hms_marketing_followups")
        .select("*")
        .eq("status", "Pending")
        .order("scheduled_date", { ascending: true });

      if (leadErr && fuErr) {
        setData((prev) => ({ ...prev, loading: false, error: leadErr?.message }));
        return;
      }

      if ((!leads || leads.length === 0) && (!followups || followups.length === 0)) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      let mappedLeads: MarketingLead[] = (leads || []).map((r: any) => ({
        id: r.id, name: r.name, contact: r.contact, category: r.category || "",
        dueDate: r.due_date || "", purpose: r.purpose || "", status: r.status,
        assignedTo: r.assigned_to || "", source: r.source || "", notes: r.notes || "",
        createdAt: r.created_at?.split("T")[0] || "",
      }));

      if (search) {
        const s = search.toLowerCase();
        mappedLeads = mappedLeads.filter((l) => l.name.toLowerCase().includes(s) || l.contact.includes(s));
      }

      const mappedFollowups: MarketingFollowUp[] = (followups || []).map((r: any) => ({
        id: r.id, leadName: r.lead_name, contact: r.contact || "",
        scheduledDate: r.scheduled_date, type: r.followup_type, notes: r.notes || "", status: r.status,
      }));

      setData({
        leads: mappedLeads.length > 0 ? mappedLeads : MOCK_LEADS,
        followUps: mappedFollowups.length > 0 ? mappedFollowups : MOCK_FOLLOWUPS,
        loading: false, error: null,
      });
    } catch (err: any) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createLead = async (lead: Omit<MarketingLead, "id" | "createdAt">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any).from("hms_marketing_leads").insert({
      name: lead.name, contact: lead.contact, category: lead.category,
      purpose: lead.purpose, due_date: lead.dueDate, status: lead.status,
      assigned_to: lead.assignedTo, source: lead.source, notes: lead.notes,
      created_by: sess.session?.user?.id,
    });
    if (!error) fetchData();
    return !error;
  };

  const updateLeadStatus = async (id: string, status: string): Promise<boolean> => {
    const { error } = await (supabase as any).from("hms_marketing_leads")
      .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) fetchData();
    return !error;
  };

  return { ...data, createLead, updateLeadStatus, refetch: fetchData };
};
