/**
 * Booking utility with explicitly supplied services. Obtain hook services in
 * a component or custom hook, then pass them here; this function calls no hooks.
 */
import type { useAppointments } from "@/hooks/useAppointments";
import type { useNotifications } from "@/hooks/useNotifications";

type BookingServices = {
  bookAppointment: ReturnType<typeof useAppointments>["bookAppointment"];
  sendAppointmentConfirmation: ReturnType<typeof useNotifications>["sendAppointmentConfirmation"];
};

export async function bookAppointmentWithNotification(params: {
  patient_name: string;
  patient_phone?: string;
  doctor_name: string;
  appointment_date: string;
  start_time: string;
  consultation_type?: "in_person" | "teleconsult" | "follow_up" | "emergency";
  chief_complaint?: string;
  booked_via?: "reception" | "online" | "phone" | "whatsapp" | "app";
  sendWhatsapp?: boolean;
  sendSms?: boolean;
}, services: BookingServices) {
  const { bookAppointment, sendAppointmentConfirmation } = services;

  // Book the appointment
  const result = await bookAppointment({
    patient_name: params.patient_name,
    patient_phone: params.patient_phone,
    doctor_name: params.doctor_name,
    appointment_date: params.appointment_date,
    start_time: params.start_time,
    consultation_type: params.consultation_type || "in_person",
    chief_complaint: params.chief_complaint,
    booked_via: params.booked_via || "reception",
  });

  // Send notification if phone provided and enabled
  if (params.patient_phone && (params.sendWhatsapp || params.sendSms)) {
    try {
      await sendAppointmentConfirmation(
        params.patient_phone,
        params.patient_name,
        params.doctor_name,
        params.appointment_date,
        params.start_time,
        undefined,
        result.appointmentId
      );
    } catch {
      console.warn("Appointment was saved, but its notification could not be sent.");
    }
  }

  return result;
}
