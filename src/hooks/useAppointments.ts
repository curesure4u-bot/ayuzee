import { supabase } from "@/integrations/supabase/client";

export type BookAppointmentParams = {
  patient_id?: string;
  patient_display_id?: string;
  patient_name: string;
  patient_phone?: string;
  doctor_name: string;
  doctor_id?: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  consultation_type?: "in_person" | "teleconsult" | "follow_up" | "emergency";
  purpose?: string;
  chief_complaint?: string;
  consultation_fee?: number;
  booked_via?: "reception" | "online" | "phone" | "whatsapp" | "app";
  branch?: string;
};

export function useAppointments() {
  const checkAvailability = async (doctorName: string, date: string, startTime: string, branch = "Main Branch") => {
    const { data } = await (supabase as any).rpc("check_slot_available", {
      p_doctor_name: doctorName,
      p_date: date,
      p_start_time: startTime,
      p_branch: branch,
    });
    return data === true;
  };

  const bookAppointment = async (params: BookAppointmentParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const branch = params.branch || "Main Branch";

    // Check availability
    const available = await checkAvailability(params.doctor_name, params.appointment_date, params.start_time, branch);
    if (!available) throw new Error("This slot is already booked. Please choose another time.");

    const { data, error } = await (supabase as any)
      .from("hms_appointment_bookings")
      .insert({
        patient_id: params.patient_id || null,
        patient_display_id: params.patient_display_id || null,
        patient_name: params.patient_name,
        patient_phone: params.patient_phone || null,
        doctor_name: params.doctor_name,
        doctor_id: params.doctor_id || null,
        appointment_date: params.appointment_date,
        start_time: params.start_time,
        consultation_type: params.consultation_type || "in_person",
        purpose: params.purpose || "Consultation",
        chief_complaint: params.chief_complaint || null,
        consultation_fee: params.consultation_fee || 0,
        booked_via: params.booked_via || "reception",
        booked_by: uid,
        branch,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { appointmentId: data.id };
  };

  const getAppointments = async (date: string, branch = "Main Branch", doctorName?: string) => {
    let query = (supabase as any)
      .from("hms_appointment_bookings")
      .select("*")
      .eq("appointment_date", date)
      .eq("branch", branch)
      .not("status", "in", '("cancelled","rescheduled")')
      .order("start_time");

    if (doctorName) query = query.eq("doctor_name", doctorName);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const cancelAppointment = async (appointmentId: string, reason: string) => {
    const { error } = await (supabase as any)
      .from("hms_appointment_bookings")
      .update({ status: "cancelled", cancel_reason: reason, updated_at: new Date().toISOString() })
      .eq("id", appointmentId);
    if (error) throw error;
  };

  const checkInAppointment = async (appointmentId: string) => {
    const { error } = await (supabase as any)
      .from("hms_appointment_bookings")
      .update({ status: "checked_in", updated_at: new Date().toISOString() })
      .eq("id", appointmentId);
    if (error) throw error;
  };

  return { bookAppointment, getAppointments, cancelAppointment, checkInAppointment, checkAvailability };
}
