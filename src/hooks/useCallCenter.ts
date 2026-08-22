import { supabase } from "@/integrations/supabase/client";

export type LogCallParams = {
  caller_name?: string;
  caller_phone: string;
  patient_id?: string;
  direction: "inbound" | "outbound";
  duration_seconds?: number;
  agent_name?: string;
  purpose?: string;
  outcome?: string;
  callback_scheduled_at?: string;
  notes?: string;
  appointment_id?: string;
  branch?: string;
};

export type CreateCrmTaskParams = {
  patient_id?: string;
  patient_name?: string;
  patient_phone?: string;
  task_type: string;
  description: string;
  due_date: string;
  due_time?: string;
  assigned_to?: string;
  priority?: string;
  reference_type?: string;
  reference_id?: string;
  branch?: string;
};

export function useCallCenter() {
  const logCall = async (params: LogCallParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    const { data, error } = await (supabase as any)
      .from("hms_call_log")
      .insert({
        caller_name: params.caller_name || null,
        caller_phone: params.caller_phone,
        patient_id: params.patient_id || null,
        direction: params.direction,
        duration_seconds: params.duration_seconds || 0,
        agent_name: params.agent_name || null,
        agent_id: uid,
        purpose: params.purpose || "inquiry",
        outcome: params.outcome || "answered",
        callback_scheduled_at: params.callback_scheduled_at || null,
        notes: params.notes || null,
        appointment_id: params.appointment_id || null,
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { callId: data.id };
  };

  const getTodayCalls = async (branch = "Main Branch") => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await (supabase as any)
      .from("hms_call_log")
      .select("*")
      .gte("call_time", today + "T00:00:00")
      .eq("branch", branch)
      .order("call_time", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createCrmTask = async (params: CreateCrmTaskParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    const { data, error } = await (supabase as any)
      .from("hms_crm_tasks")
      .insert({
        patient_id: params.patient_id || null,
        patient_name: params.patient_name || null,
        patient_phone: params.patient_phone || null,
        task_type: params.task_type,
        description: params.description,
        due_date: params.due_date,
        due_time: params.due_time || null,
        assigned_to: params.assigned_to || null,
        priority: params.priority || "normal",
        reference_type: params.reference_type || null,
        reference_id: params.reference_id || null,
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { taskId: data.id };
  };

  const getPendingTasks = async (assignedTo?: string, branch = "Main Branch") => {
    let query = (supabase as any)
      .from("hms_crm_tasks")
      .select("*")
      .in("status", ["pending", "in_progress", "overdue"])
      .eq("branch", branch)
      .order("due_date")
      .limit(50);

    if (assignedTo) query = query.eq("assigned_to", assignedTo);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const completeTask = async (taskId: string, result?: string) => {
    const { error } = await (supabase as any)
      .from("hms_crm_tasks")
      .update({ status: "completed", completed_at: new Date().toISOString(), result: result || null })
      .eq("id", taskId);
    if (error) throw error;
  };

  return { logCall, getTodayCalls, createCrmTask, getPendingTasks, completeTask };
}
