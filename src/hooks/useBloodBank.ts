import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type RequestStatus = "pending" | "approved" | "issued" | "rejected";

export interface BloodStock {
  id: string;
  group: BloodGroup;
  component: string;
  units: number;
  expiryDate: string;
  status: "available" | "low" | "critical";
}

export interface BloodRequest {
  id: string;
  patient: string;
  group: BloodGroup;
  component: string;
  units: number;
  requestedBy: string;
  date: string;
  urgency: string;
  status: RequestStatus;
}

export interface BloodDonor {
  id: string;
  name: string;
  group: BloodGroup;
  phone: string;
  lastDonation: string;
  eligible: boolean;
}

const MOCK_STOCK: BloodStock[] = [
  { id: "1", group: "A+", component: "Whole Blood", units: 8, expiryDate: "2026-08-20", status: "available" },
  { id: "2", group: "B+", component: "Whole Blood", units: 12, expiryDate: "2026-08-18", status: "available" },
  { id: "3", group: "O+", component: "Whole Blood", units: 6, expiryDate: "2026-08-15", status: "available" },
  { id: "4", group: "O-", component: "Packed RBC", units: 2, expiryDate: "2026-08-12", status: "low" },
  { id: "5", group: "AB+", component: "Whole Blood", units: 3, expiryDate: "2026-08-22", status: "low" },
  { id: "6", group: "A-", component: "FFP", units: 4, expiryDate: "2026-09-10", status: "available" },
  { id: "7", group: "B-", component: "Platelets", units: 1, expiryDate: "2026-08-09", status: "critical" },
  { id: "8", group: "AB-", component: "Whole Blood", units: 0, expiryDate: "", status: "critical" },
];

const MOCK_REQUESTS: BloodRequest[] = [
  { id: "1", patient: "Ramesh Kumar (IP-14)", group: "B+", component: "Whole Blood", units: 2, requestedBy: "Dr. Sharma", date: "2026-08-07", urgency: "Routine", status: "approved" },
  { id: "2", patient: "Emergency (ER-22)", group: "O-", component: "Packed RBC", units: 3, requestedBy: "Dr. Nair", date: "2026-08-07", urgency: "Emergency", status: "pending" },
  { id: "3", patient: "Lakshmi Devi (IP-18)", group: "A+", component: "FFP", units: 2, requestedBy: "Dr. Patel", date: "2026-08-06", urgency: "Urgent", status: "issued" },
];

const MOCK_DONORS: BloodDonor[] = [
  { id: "1", name: "Rajesh Nair", group: "O+", phone: "9876543210", lastDonation: "2026-05-15", eligible: true },
  { id: "2", name: "Suresh Kumar", group: "B+", phone: "9876543211", lastDonation: "2026-07-01", eligible: false },
  { id: "3", name: "Priya Menon", group: "A+", phone: "9876543212", lastDonation: "2026-04-20", eligible: true },
  { id: "4", name: "Mohan Das", group: "O-", phone: "9876543213", lastDonation: "2026-03-10", eligible: true },
  { id: "5", name: "Anita S.", group: "AB+", phone: "9876543214", lastDonation: "2026-06-25", eligible: true },
];

export const useBloodBank = () => {
  const [stock, setStock] = useState<BloodStock[]>(MOCK_STOCK);
  const [requests, setRequests] = useState<BloodRequest[]>(MOCK_REQUESTS);
  const [donors, setDonors] = useState<BloodDonor[]>(MOCK_DONORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: sData, error: sErr }, { data: rData, error: rErr }] = await Promise.all([
        (supabase as any).from("hms_blood_stock").select("*").order("blood_group"),
        (supabase as any).from("hms_blood_requests").select("*").order("date", { ascending: false }).limit(20),
      ]);

      if (sErr && rErr) { setError(sErr?.message); setLoading(false); return; }

      if (sData && sData.length > 0) {
        setStock(sData.map((s: any) => ({
          id: s.id, group: s.blood_group, component: s.component || "Whole Blood",
          units: s.units || 0, expiryDate: s.expiry_date || "",
          status: s.units <= 0 ? "critical" : s.units <= 2 ? "low" : "available",
        })));
      }
      if (rData && rData.length > 0) {
        setRequests(rData.map((r: any) => ({
          id: r.id, patient: r.patient_name || "", group: r.blood_group,
          component: r.component || "Whole Blood", units: r.units || 1,
          requestedBy: r.requested_by || "", date: r.date || "",
          urgency: r.urgency || "Routine", status: r.status || "pending",
        })));
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const approveRequest = async (id: string): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any).from("hms_blood_requests").update({ status: "approved" }).eq("id", id);
    if (updateErr) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as RequestStatus } : r));
      return true;
    }
    await fetchData();
    return true;
  };

  const totalUnits = stock.reduce((s, b) => s + b.units, 0);
  const criticalCount = stock.filter(s => s.status === "critical").length;
  const lowCount = stock.filter(s => s.status === "low").length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;

  return { stock, requests, donors, loading, error, totalUnits, criticalCount, lowCount, pendingRequests, approveRequest, refetch: fetchData };
};
