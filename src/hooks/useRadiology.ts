import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RadiologyStatus = "ordered" | "scheduled" | "in-progress" | "completed" | "reported";
export type RadiologyPriority = "routine" | "urgent" | "emergency";

export interface RadiologyOrder {
  id: string;
  patientName: string;
  uhid: string;
  investigation: string;
  modality: string;
  orderedBy: string;
  orderedDate: string;
  scheduledTime: string;
  priority: RadiologyPriority;
  status: RadiologyStatus;
  report: string;
  reportedBy: string;
  clinicalIndication: string;
}

export interface RadiologyStats {
  ordered: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  reported: number;
}

const MOCK_ORDERS: RadiologyOrder[] = [
  { id: "RO-001", patientName: "Ramesh Kumar", uhid: "UH-4521", investigation: "X-Ray Knee (AP/Lateral)", modality: "X-Ray", orderedBy: "Dr. Sharma", orderedDate: "2026-08-07", scheduledTime: "10:30 AM", priority: "routine", status: "completed", report: "Mild joint space narrowing with osteophytes bilateral knee. Features of Grade 2 OA.", reportedBy: "Dr. Rao", clinicalIndication: "Bilateral knee pain, suspected OA" },
  { id: "RO-002", patientName: "Lakshmi Devi", uhid: "UH-3892", investigation: "MRI Lumbar Spine", modality: "MRI", orderedBy: "Dr. Nair", orderedDate: "2026-08-07", scheduledTime: "11:00 AM", priority: "urgent", status: "scheduled", report: "", reportedBy: "", clinicalIndication: "Low back pain with radiculopathy" },
  { id: "RO-003", patientName: "Sunil Menon", uhid: "UH-5120", investigation: "Ultrasound Abdomen", modality: "USG", orderedBy: "Dr. Sharma", orderedDate: "2026-08-06", scheduledTime: "09:45 AM", priority: "routine", status: "reported", report: "Mild hepatomegaly. No focal lesion. Mildly dilated CBD.", reportedBy: "Dr. Gupta", clinicalIndication: "Epigastric discomfort" },
  { id: "RO-004", patientName: "Meera Nair", uhid: "UH-2987", investigation: "X-Ray Cervical Spine", modality: "X-Ray", orderedBy: "Dr. Nair", orderedDate: "2026-08-07", scheduledTime: "11:15 AM", priority: "routine", status: "ordered", report: "", reportedBy: "", clinicalIndication: "Neck pain and stiffness" },
  { id: "RO-005", patientName: "Anil Krishnan", uhid: "UH-6034", investigation: "DEXA Scan", modality: "DEXA", orderedBy: "Dr. Nair", orderedDate: "2026-08-07", scheduledTime: "11:30 AM", priority: "routine", status: "ordered", report: "", reportedBy: "", clinicalIndication: "Post-menopausal bone health screening" },
  { id: "RO-006", patientName: "Priya Mohan", uhid: "UH-4456", investigation: "CT Abdomen", modality: "CT", orderedBy: "Dr. Sharma", orderedDate: "2026-08-07", scheduledTime: "11:45 AM", priority: "emergency", status: "in-progress", report: "", reportedBy: "", clinicalIndication: "Acute abdomen, r/o obstruction" },
  { id: "RO-007", patientName: "Vijay Nambiar", uhid: "UH-7891", investigation: "2D Echocardiography", modality: "Echo", orderedBy: "Dr. Patel", orderedDate: "2026-08-06", scheduledTime: "02:00 PM", priority: "urgent", status: "completed", report: "", reportedBy: "", clinicalIndication: "Dyspnea on exertion, murmur detected" },
];

const computeStats = (orders: RadiologyOrder[]): RadiologyStats => ({
  ordered: orders.filter((o) => o.status === "ordered").length,
  scheduled: orders.filter((o) => o.status === "scheduled").length,
  inProgress: orders.filter((o) => o.status === "in-progress").length,
  completed: orders.filter((o) => o.status === "completed").length,
  reported: orders.filter((o) => o.status === "reported").length,
});

export const useRadiology = () => {
  const [orders, setOrders] = useState<RadiologyOrder[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_radiology_orders")
        .select("*")
        .order("ordered_date", { ascending: false })
        .limit(100);

      if (fetchErr) {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mapped: RadiologyOrder[] = data.map((r: any) => ({
          id: r.id,
          patientName: r.patient_name || "",
          uhid: r.uhid || "",
          investigation: r.investigation || "",
          modality: r.modality || "",
          orderedBy: r.ordered_by || "",
          orderedDate: r.ordered_date || "",
          scheduledTime: r.scheduled_time || "",
          priority: r.priority || "routine",
          status: r.status || "ordered",
          report: r.report || "",
          reportedBy: r.reported_by || "",
          clinicalIndication: r.clinical_indication || "",
        }));
        setOrders(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: RadiologyStatus): Promise<boolean> => {
    const updates: Record<string, any> = { status };
    if (status === "in-progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error: updateErr } = await (supabase as any)
      .from("hms_radiology_orders")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      // Fallback: update locally
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      return true;
    }
    await fetchOrders();
    return true;
  };

  const saveReport = async (id: string, report: string, reportedBy: string): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any)
      .from("hms_radiology_orders")
      .update({ report, reported_by: reportedBy, status: "reported", reported_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) {
      // Fallback: update locally
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, report, reportedBy, status: "reported" as RadiologyStatus } : o));
      return true;
    }
    await fetchOrders();
    return true;
  };

  const createOrder = async (order: Omit<RadiologyOrder, "id" | "report" | "reportedBy" | "status">): Promise<boolean> => {
    const payload = {
      patient_name: order.patientName,
      uhid: order.uhid,
      investigation: order.investigation,
      modality: order.modality,
      ordered_by: order.orderedBy,
      ordered_date: order.orderedDate,
      scheduled_time: order.scheduledTime,
      priority: order.priority,
      clinical_indication: order.clinicalIndication,
      status: "ordered",
    };

    const { error: insertErr } = await (supabase as any)
      .from("hms_radiology_orders")
      .insert(payload);

    if (insertErr) {
      // Fallback: add locally with temp id
      const newOrder: RadiologyOrder = {
        ...order,
        id: `RO-${Date.now()}`,
        status: "ordered",
        report: "",
        reportedBy: "",
      };
      setOrders((prev) => [newOrder, ...prev]);
      return true;
    }
    await fetchOrders();
    return true;
  };

  const stats = computeStats(orders);

  return {
    orders,
    stats,
    loading,
    error,
    updateStatus,
    saveReport,
    createOrder,
    refetch: fetchOrders,
  };
};
