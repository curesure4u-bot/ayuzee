import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auto-Link Appointments Hook
 * When a doctor's appointment is booked, automatically creates a
 * "Prepare for [Patient Name]" task in the Task Tracker.
 *
 * Usage: Call this hook inside the Doctor Layout or Appointment page.
 * It subscribes to Supabase realtime and creates tasks on INSERT.
 *
 * Note: Requires Supabase Realtime to be enabled on the appointments table.
 * Falls back gracefully if tables don't exist.
 */
export function useAutoLinkAppointments() {
  useEffect(() => {
    let subscription: any = null;

    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;

        // Subscribe to new appointments for this doctor
        subscription = (supabase as any)
          .channel("auto-link-appointments")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "appointments",
              filter: `doctor_user_id=eq.${userId}`,
            },
            async (payload: any) => {
              const appointment = payload.new;
              if (!appointment) return;

              const patientName = appointment.patient_name || "Patient";
              const appointmentDate = appointment.appointment_date || "";
              const taskName = `Prepare for ${patientName} — ${appointmentDate}`;

              // Create a task in task_tracker_tasks
              try {
                await (supabase as any)
                  .from("task_tracker_tasks")
                  .insert({
                    user_id: userId,
                    role_context: "doctor",
                    task_name: taskName,
                    description: `Auto-created: Appointment booked for ${patientName}. Review history, prepare notes.`,
                    status: "To do",
                    priority: "High",
                    person_in_charge: "Self",
                    start_date: new Date().toISOString().split("T")[0],
                    due_date: appointmentDate || null,
                    kanban_category: "To-Do",
                    importance: "Important",
                    urgency: "Urgent",
                    progress: 0,
                    notes: `Linked appointment ID: ${appointment.id}`,
                  });
              } catch {
                // Task tracker table may not exist yet — silent fail
              }

              // Also create a notification
              try {
                await (supabase as any)
                  .from("unified_notifications")
                  .insert({
                    user_id: userId,
                    title: "New Appointment Booked",
                    message: `${patientName} booked for ${appointmentDate}. Prep task created.`,
                    type: "appointment_upcoming",
                    source_module: "appointments",
                    source_url: "/doctor/appointments",
                    priority: "normal",
                  });
              } catch {
                // Notification table may not exist yet — silent fail
              }
            }
          )
          .subscribe();
      } catch {
        // Silent fail if realtime not available
      }
    })();

    return () => {
      if (subscription) {
        (supabase as any).removeChannel(subscription);
      }
    };
  }, []);
}
