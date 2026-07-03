import { supabase } from "@/integrations/supabase/client";

/** Assemble a portable JSON export of the signed-in user's Ayuzee data. */
export const exportUserData = async (userId: string) => {
  const [profile, members, orders, appointments, consent] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("patient_associated_members").select("*").eq("patient_user_id", userId),
    supabase.from("orders").select("id, order_status, payment_status, total, created_at").eq("user_id", userId),
    supabase
      .from("appointments")
      .select("id, status, appointment_date, time_slot, mode, created_at, doctor_id")
      .eq("user_id", userId),
    (supabase as any)
      .from("user_consent_records")
      .select("purpose, policy_version, granted, granted_at, withdrawn_at")
      .eq("user_id", userId),
  ]);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: profile.data,
    associated_members: members.data ?? [],
    orders: orders.data ?? [],
    appointments: appointments.data ?? [],
    consent_records: consent.data ?? [],
  };
};

export const downloadUserDataExport = async (userId: string) => {
  const payload = await exportUserData(userId);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ayuzee-data-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};
