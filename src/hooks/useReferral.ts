import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReferralStatus = "pending" | "consulted" | "converted" | "lost";
export type ReferrerType = "External Doctor" | "Patient Referral" | "Internal Doctor" | "Corporate/Partner" | "Digital";

export interface Referral {
  id: string;
  patient: string;
  referredBy: string;
  referrerType: ReferrerType;
  referredTo: string;
  department: string;
  date: string;
  status: ReferralStatus;
  commission: number;
  notes: string;
}

const MOCK_REFERRALS: Referral[] = [
  { id: "1", patient: "Priya Menon", referredBy: "Dr. Ravi (Apollo Hospital)", referrerType: "External Doctor", referredTo: "Dr. Arun Sharma", department: "Panchakarma", date: "2026-08-07", status: "consulted", commission: 500, notes: "Referred for Janu Basti - OA Knee" },
  { id: "2", patient: "Rahul Kumar", referredBy: "Patient: Ramesh Kumar", referrerType: "Patient Referral", referredTo: "Dr. Meena Patel", department: "Panchakarma", date: "2026-08-06", status: "converted", commission: 300, notes: "Friend referral. Booked 14-day package." },
  { id: "3", patient: "Ananya S.", referredBy: "Dr. Priya Das", referrerType: "Internal Doctor", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-05", status: "consulted", commission: 0, notes: "Homeopathy to Ayurveda referral" },
  { id: "4", patient: "Mohammed F.", referredBy: "Google Search", referrerType: "Digital", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-04", status: "converted", commission: 0, notes: "Organic Google search lead" },
  { id: "5", patient: "Lakshmi Nair", referredBy: "Partner: Kerala Tourism", referrerType: "Corporate/Partner", referredTo: "Dr. Meena Patel", department: "Panchakarma", date: "2026-08-03", status: "converted", commission: 2000, notes: "Wellness tourism package referral" },
  { id: "6", patient: "Suresh T.", referredBy: "Dr. Mohan (PHC Attingal)", referrerType: "External Doctor", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-02", status: "pending", commission: 500, notes: "Chronic back pain referral" },
  { id: "7", patient: "David Thomas", referredBy: "Website: ayuzee.com", referrerType: "Digital", referredTo: "Dr. Arun Sharma", department: "Teleconsult", date: "2026-08-01", status: "lost", commission: 0, notes: "International lead. No-show." },
];

export const useReferral = () => {
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_referrals")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: Referral[] = data.map((r: any) => ({
          id: r.id,
          patient: r.patient_name || "",
          referredBy: r.referred_by || "",
          referrerType: r.referrer_type || "Digital",
          referredTo: r.referred_to || "",
          department: r.department || "",
          date: r.date || "",
          status: r.status || "pending",
          commission: r.commission || 0,
          notes: r.notes || "",
        }));
        setReferrals(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const addReferral = async (ref: Omit<Referral, "id" | "status">): Promise<boolean> => {
    const payload = {
      patient_name: ref.patient,
      referred_by: ref.referredBy,
      referrer_type: ref.referrerType,
      referred_to: ref.referredTo,
      department: ref.department,
      commission: ref.commission,
      notes: ref.notes,
      status: "pending",
    };
    const { error: insertErr } = await (supabase as any).from("hms_referrals").insert(payload);
    if (insertErr) {
      setReferrals(prev => [{ ...ref, id: `RF-${Date.now()}`, status: "pending" }, ...prev]);
      return true;
    }
    await fetchReferrals();
    return true;
  };

  const converted = referrals.filter(r => r.status === "converted").length;
  const totalCommission = referrals.filter(r => r.status === "converted" || r.status === "consulted").reduce((s, r) => s + r.commission, 0);
  const conversionRate = referrals.length > 0 ? Math.round((converted / referrals.length) * 100) : 0;

  return { referrals, loading, error, converted, totalCommission, conversionRate, addReferral, refetch: fetchReferrals };
};
