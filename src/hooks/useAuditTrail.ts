import { supabase } from "@/integrations/supabase/client";

/**
 * Audit Trail Logger
 * Records who did what, when, on which entity. Immutable log.
 *
 * Usage:
 *   const { logAction } = useAuditTrail();
 *   await logAction("bill_cancelled", "hms_bills", billId, { reason, amount });
 */

export type AuditAction =
  | "created" | "updated" | "deleted" | "cancelled"
  | "signed" | "dispensed" | "refunded" | "approved" | "rejected"
  | "bill_cancelled" | "bill_refunded" | "bill_edited"
  | "prescription_signed" | "prescription_cancelled"
  | "admission_created" | "discharge_processed"
  | "appointment_cancelled" | "appointment_rescheduled"
  | "lab_result_entered" | "lab_result_verified"
  | "stock_adjusted" | "grn_cancelled"
  | "role_granted" | "role_revoked"
  | "login" | "logout" | "password_changed"
  | "insurance_claim_submitted" | "insurance_claim_settled";

export interface AuditLogEntry {
  action: AuditAction;
  entity_table: string;
  entity_id?: string;
  entity_display?: string; // e.g., "INV-2608-0001" or "Patient: Ramesh Kumar"
  details?: Record<string, any>;
  ip_address?: string;
}

export function useAuditTrail() {
  const logAction = async (
    action: AuditAction,
    entityTable: string,
    entityId?: string,
    details?: Record<string, any>,
    entityDisplay?: string
  ) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const email = session.session?.user?.email;

    try {
      await (supabase as any)
        .from("hms_audit_trail")
        .insert({
          user_id: uid || null,
          user_email: email || null,
          action,
          entity_table: entityTable,
          entity_id: entityId || null,
          entity_display: entityDisplay || null,
          details: details || null,
          performed_at: new Date().toISOString(),
        });
    } catch (e) {
      // Audit logging should never break the main flow
      console.warn("Audit log failed (non-blocking):", e);
    }
  };

  const getRecentLogs = async (limit = 50, entityTable?: string) => {
    let query = (supabase as any)
      .from("hms_audit_trail")
      .select("*")
      .order("performed_at", { ascending: false })
      .limit(limit);

    if (entityTable) query = query.eq("entity_table", entityTable);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const getLogsForEntity = async (entityTable: string, entityId: string) => {
    const { data, error } = await (supabase as any)
      .from("hms_audit_trail")
      .select("*")
      .eq("entity_table", entityTable)
      .eq("entity_id", entityId)
      .order("performed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return { logAction, getRecentLogs, getLogsForEntity };
}
