import { supabase } from "@/integrations/supabase/client";

export type SendNotificationParams = {
  recipient_phone: string;
  recipient_name?: string;
  patient_id?: string;
  channel?: "whatsapp" | "sms" | "email" | "push" | "in_app";
  template_name?: string;
  message_type?: "transactional" | "reminder" | "marketing" | "alert" | "report";
  subject?: string;
  body: string;
  trigger_event?: string; // appointment_booked, prescription_ready, report_ready, etc.
  reference_id?: string;
  reference_type?: string; // appointment, prescription, bill, lab_report
  branch?: string;
};

export function useNotifications() {
  const sendNotification = async (params: SendNotificationParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    const { data, error } = await (supabase as any)
      .from("hms_notification_log")
      .insert({
        recipient_phone: params.recipient_phone,
        recipient_name: params.recipient_name || null,
        patient_id: params.patient_id || null,
        channel: params.channel || "whatsapp",
        template_name: params.template_name || null,
        message_type: params.message_type || "transactional",
        subject: params.subject || null,
        body: params.body,
        trigger_event: params.trigger_event || null,
        reference_id: params.reference_id || null,
        reference_type: params.reference_type || null,
        status: "queued",
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Mark as sent (in real integration, this would be after WhatsApp API response)
    await (supabase as any)
      .from("hms_notification_log")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", data.id);

    return { notificationId: data.id };
  };

  const getRecentNotifications = async (patientId?: string, limit = 20) => {
    let query = (supabase as any)
      .from("hms_notification_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (patientId) query = query.eq("patient_id", patientId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const getDeliveryStats = async (branch = "Main Branch", days = 7) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await (supabase as any)
      .from("hms_notification_log")
      .select("status, channel")
      .eq("branch", branch)
      .gte("created_at", since.toISOString());

    if (error) throw error;

    const stats = { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 };
    (data || []).forEach((n: any) => {
      stats.total++;
      if (n.status === "sent") stats.sent++;
      if (n.status === "delivered") stats.delivered++;
      if (n.status === "read") stats.read++;
      if (n.status === "failed") stats.failed++;
    });
    return stats;
  };

  // Convenience: send appointment confirmation
  const sendAppointmentConfirmation = async (phone: string, patientName: string, doctorName: string, date: string, time: string, patientId?: string, appointmentId?: string) => {
    return sendNotification({
      recipient_phone: phone,
      recipient_name: patientName,
      patient_id: patientId,
      template_name: "appointment_confirmation",
      message_type: "transactional",
      trigger_event: "appointment_booked",
      reference_id: appointmentId,
      reference_type: "appointment",
      body: `Dear ${patientName}, your appointment with ${doctorName} is confirmed for ${date} at ${time}. Please arrive 10 min early. — Ayuzee`,
    });
  };

  // Convenience: send prescription
  const sendPrescriptionNotification = async (phone: string, patientName: string, doctorName: string, patientId?: string, prescriptionId?: string) => {
    return sendNotification({
      recipient_phone: phone,
      recipient_name: patientName,
      patient_id: patientId,
      template_name: "prescription_ready",
      message_type: "transactional",
      trigger_event: "prescription_ready",
      reference_id: prescriptionId,
      reference_type: "prescription",
      body: `Dear ${patientName}, your prescription from ${doctorName} is ready. You can view it in your Ayuzee dashboard or collect medicines from our pharmacy. — Ayuzee`,
    });
  };

  return { sendNotification, getRecentNotifications, getDeliveryStats, sendAppointmentConfirmation, sendPrescriptionNotification };
}
