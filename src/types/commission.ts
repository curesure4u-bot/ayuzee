export type CommissionRuleType = "fixed" | "percentage" | "tiered";

export type ApplicabilityType = "all" | "category" | "manufacturer" | "product";

export interface Applicability {
  type: ApplicabilityType;
  values: string[]; // ids or names
}

export interface FixedBreakdown {
  doctor: number;
  platform: number;
  logistics: number;
}

export interface PercentageBreakdown {
  doctor: number;
  platform: number;
  manufacturer: number;
}

export interface TieredBreakdownTier {
  min: number;
  max: number | null; // null = unlimited
  percent: number;
}

export type CommissionBreakdown =
  | { kind: "fixed"; fixed: FixedBreakdown }
  | { kind: "percentage"; percentage: PercentageBreakdown }
  | { kind: "tiered"; tiers: TieredBreakdownTier[] };

export interface CommissionConditions {
  min_order_value?: number | null;
  max_commission_cap?: number | null;
  first_purchase_only?: boolean;
  doctor_experience?: "any" | "beginner" | "intermediate" | "expert";
}

export interface CommissionRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: CommissionRuleType;
  applicable_to: Applicability;
  commission_breakdown: CommissionBreakdown;
  conditions: CommissionConditions;
  priority: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
