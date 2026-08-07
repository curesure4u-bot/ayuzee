import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CampaignStatus = "active" | "scheduled" | "completed" | "paused";

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: string;
  audience: string;
  sentCount: number;
  openRate: number;
  conversionRate: number;
  startDate: string;
  status: CampaignStatus;
  revenue: number;
}

const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  { id: "1", name: "Monsoon PK Offer", channel: "WhatsApp", audience: "Previous PK patients", sentCount: 450, openRate: 72, conversionRate: 12, startDate: "2026-08-01", status: "active", revenue: 180000 },
  { id: "2", name: "Spine Care Awareness", channel: "SMS + WhatsApp", audience: "Back pain patients", sentCount: 320, openRate: 65, conversionRate: 8, startDate: "2026-07-25", status: "completed", revenue: 95000 },
  { id: "3", name: "Follow-up Reminder (30-day)", channel: "WhatsApp Auto", audience: "All OP 30 days ago", sentCount: 180, openRate: 85, conversionRate: 22, startDate: "2026-08-05", status: "active", revenue: 42000 },
  { id: "4", name: "Google Ads - Panchakarma", channel: "Google Ads", audience: "Search intent", sentCount: 0, openRate: 0, conversionRate: 4, startDate: "2026-07-15", status: "active", revenue: 65000 },
  { id: "5", name: "Diwali Wellness Package", channel: "Email + WhatsApp", audience: "All registered", sentCount: 0, openRate: 0, conversionRate: 0, startDate: "2026-10-15", status: "scheduled", revenue: 0 },
];

export const useMarketing = () => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(MOCK_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_marketing_campaigns")
        .select("*")
        .order("start_date", { ascending: false });

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: MarketingCampaign[] = data.map((r: any) => ({
          id: r.id, name: r.name || "", channel: r.channel || "",
          audience: r.audience || "", sentCount: r.sent_count || 0,
          openRate: r.open_rate || 0, conversionRate: r.conversion_rate || 0,
          startDate: r.start_date || "", status: r.status || "scheduled",
          revenue: r.revenue || 0,
        }));
        setCampaigns(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const avgConversion = campaigns.filter(c => c.conversionRate > 0).length > 0
    ? Math.round(campaigns.filter(c => c.conversionRate > 0).reduce((s, c) => s + c.conversionRate, 0) / campaigns.filter(c => c.conversionRate > 0).length)
    : 0;

  return { campaigns, loading, error, activeCampaigns, totalRevenue, avgConversion, refetch: fetchCampaigns };
};
