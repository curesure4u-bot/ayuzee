import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BookingStatus = "confirmed" | "pending_payment" | "cancelled" | "completed";

export interface OnlineBooking {
  id: string;
  patient: string;
  phone: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: string;
  payment: string;
  status: BookingStatus;
}

const MOCK_BOOKINGS: OnlineBooking[] = [
  { id: "1", patient: "Priya Menon", phone: "+91-9876500010", doctor: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-07", time: "10:00 AM", type: "New Visit", payment: "Paid ₹500 (UPI)", status: "confirmed" },
  { id: "2", patient: "Rahul Kumar", phone: "+91-9876500011", doctor: "Dr. Meena Patel", department: "Panchakarma", date: "2026-08-07", time: "11:30 AM", type: "Follow-up", payment: "Paid ₹300 (UPI)", status: "confirmed" },
  { id: "3", patient: "Ananya S.", phone: "+91-9876500012", doctor: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-07", time: "02:00 PM", type: "Teleconsult", payment: "Pending", status: "pending_payment" },
  { id: "4", patient: "Mohammed F.", phone: "+91-9876500013", doctor: "Dr. Priya Das", department: "Homeopathy", date: "2026-08-08", time: "09:30 AM", type: "New Visit", payment: "Paid ₹400 (Card)", status: "confirmed" },
  { id: "5", patient: "Lakshmi Nair", phone: "+91-9876500014", doctor: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-08-06", time: "04:00 PM", type: "Follow-up", payment: "Paid ₹300 (UPI)", status: "completed" },
];

export const useOnlineBooking = () => {
  const [bookings, setBookings] = useState<OnlineBooking[]>(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_online_bookings")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: OnlineBooking[] = data.map((r: any) => ({
          id: r.id,
          patient: r.patient_name || "",
          phone: r.phone || "",
          doctor: r.doctor_name || "",
          department: r.department || "",
          date: r.date || "",
          time: r.time_slot || "",
          type: r.booking_type || "New Visit",
          payment: r.payment_status || "",
          status: r.status || "pending_payment",
        }));
        setBookings(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: BookingStatus): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any)
      .from("hms_online_bookings")
      .update({ status })
      .eq("id", id);

    if (updateErr) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      return true;
    }
    await fetchBookings();
    return true;
  };

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pendingPayment = bookings.filter((b) => b.status === "pending_payment").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return {
    bookings,
    loading,
    error,
    confirmed,
    pendingPayment,
    completed: completedCount,
    totalToday: bookings.length,
    updateStatus,
    refetch: fetchBookings,
  };
};
