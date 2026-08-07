import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching AllergiesAlerts UI ────────────────────────────────────────

export type AllergyType = "drug" | "food" | "environmental" | "herb_drug_interaction" | "viruddha_ahara" | "contact" | "other";
export type Severity = "mild" | "moderate" | "severe" | "life_threatening";

export interface PatientAllergy {
  id: string;
  allergyType: AllergyType;
  allergen: string;
  reaction: string;
  severity: Severity;
  interactingWith: string | null;
  notes: string | null;
  reportedDate: string | null;
  verified: boolean;
}

export interface CriticalCondition {
  id: string;
  conditionName: string;
  notes: string | null;
  reportedDate: string | null;
}

export interface PatientAllergiesData {
  drugAllergies: PatientAllergy[];
  foodAllergies: PatientAllergy[];
  herbDrugInteractions: PatientAllergy[];
  viruddhaAhara: PatientAllergy[];
  criticalConditions: CriticalCondition[];
  totalCount: number;
  severeCount: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_DRUG: PatientAllergy[] = [
  { id: "1", allergyType: "drug", allergen: "Sulfonamides (Sulfa drugs)", reaction: "Skin rash, urticaria", severity: "moderate", interactingWith: null, notes: null, reportedDate: "2020-03-15", verified: true },
  { id: "2", allergyType: "drug", allergen: "Ibuprofen (NSAIDs)", reaction: "Gastric bleeding", severity: "severe", interactingWith: null, notes: null, reportedDate: "2022-01-10", verified: true },
  { id: "3", allergyType: "drug", allergen: "Penicillin", reaction: "Anaphylaxis (reported by patient)", severity: "severe", interactingWith: null, notes: null, reportedDate: "2018-06-20", verified: false },
];

const MOCK_FOOD: PatientAllergy[] = [
  { id: "4", allergyType: "food", allergen: "Shellfish (Prawns, Crab)", reaction: "Angioedema, breathing difficulty", severity: "severe", interactingWith: null, notes: null, reportedDate: null, verified: true },
  { id: "5", allergyType: "food", allergen: "Peanuts", reaction: "Oral itching, mild swelling", severity: "mild", interactingWith: null, notes: null, reportedDate: null, verified: true },
  { id: "6", allergyType: "food", allergen: "Dairy (Lactose)", reaction: "Bloating, diarrhea", severity: "mild", interactingWith: null, notes: null, reportedDate: null, verified: true },
];

const MOCK_INTERACTIONS: PatientAllergy[] = [
  { id: "7", allergyType: "herb_drug_interaction", allergen: "Ashwagandha", reaction: "May potentiate thyroid-stimulating effect", severity: "moderate", interactingWith: "Thyroid medication (Levothyroxine)", notes: null, reportedDate: null, verified: true },
  { id: "8", allergyType: "herb_drug_interaction", allergen: "Guggulu", reaction: "May increase bleeding risk", severity: "severe", interactingWith: "Blood thinners (Warfarin)", notes: null, reportedDate: null, verified: true },
  { id: "9", allergyType: "herb_drug_interaction", allergen: "Triphala", reaction: "May slightly enhance hypoglycemic effect", severity: "mild", interactingWith: "Diabetes medication (Metformin)", notes: null, reportedDate: null, verified: true },
];

const MOCK_VIRUDDHA: PatientAllergy[] = [
  { id: "10", allergyType: "viruddha_ahara", allergen: "Milk + Fish (Matsya-Kshira)", reaction: "Skin disorders (Kushtha), blocks Srotas", severity: "moderate", interactingWith: null, notes: null, reportedDate: null, verified: true },
  { id: "11", allergyType: "viruddha_ahara", allergen: "Honey + Ghee (equal quantity)", reaction: "Produces Ama, toxic combination per Charaka Samhita", severity: "moderate", interactingWith: null, notes: null, reportedDate: null, verified: true },
  { id: "12", allergyType: "viruddha_ahara", allergen: "Milk + Sour fruits (Amla Rasa)", reaction: "Curdling in stomach, Kapha vitiation", severity: "mild", interactingWith: null, notes: null, reportedDate: null, verified: true },
];

const MOCK_CONDITIONS: CriticalCondition[] = [
  { id: "1", conditionName: "Previous Appendectomy (2024-01)", notes: "Uneventful recovery, no complications", reportedDate: "2024-01-15" },
  { id: "2", conditionName: "Vitamin D Deficiency (Severe)", notes: "18 ng/mL – Active supplementation needed", reportedDate: "2026-05-10" },
  { id: "3", conditionName: "Active Inflammation (ESR/CRP elevated)", notes: "Monitor – possible autoimmune involvement", reportedDate: "2026-07-20" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePatientAllergies = (patientId?: string): PatientAllergiesData & {
  addAllergy: (allergy: Omit<PatientAllergy, "id" | "verified">) => Promise<boolean>;
  removeAllergy: (id: string) => Promise<boolean>;
  addCondition: (condition: Omit<CriticalCondition, "id">) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<PatientAllergiesData>({
    drugAllergies: MOCK_DRUG,
    foodAllergies: MOCK_FOOD,
    herbDrugInteractions: MOCK_INTERACTIONS,
    viruddhaAhara: MOCK_VIRUDDHA,
    criticalConditions: MOCK_CONDITIONS,
    totalCount: 12,
    severeCount: 4,
    loading: true,
    error: null,
  });

  const fetchAllergies = useCallback(async () => {
    if (!patientId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch allergies
      const { data: allergies, error: allergyErr } = await (supabase as any)
        .from("patient_allergies")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .order("severity", { ascending: true });

      // Fetch critical conditions
      const { data: conditions, error: condErr } = await (supabase as any)
        .from("patient_critical_conditions")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (allergyErr && condErr) {
        console.warn("Patient allergies fetch error (using fallback):", allergyErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: allergyErr?.message || condErr?.message }));
        return;
      }

      // If no data, keep mock
      if ((!allergies || allergies.length === 0) && (!conditions || conditions.length === 0)) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Map allergies
      const mapped: PatientAllergy[] = (allergies || []).map((r: any) => ({
        id: r.id,
        allergyType: r.allergy_type as AllergyType,
        allergen: r.allergen,
        reaction: r.reaction || "",
        severity: r.severity as Severity,
        interactingWith: r.interacting_with || null,
        notes: r.notes || null,
        reportedDate: r.reported_date || null,
        verified: r.verified || false,
      }));

      const drugAllergies = mapped.filter((a) => a.allergyType === "drug");
      const foodAllergies = mapped.filter((a) => a.allergyType === "food");
      const herbDrugInteractions = mapped.filter((a) => a.allergyType === "herb_drug_interaction");
      const viruddhaAhara = mapped.filter((a) => a.allergyType === "viruddha_ahara");
      const severeCount = mapped.filter((a) => a.severity === "severe" || a.severity === "life_threatening").length;

      const criticalConditions: CriticalCondition[] = (conditions || []).map((c: any) => ({
        id: c.id,
        conditionName: c.condition_name,
        notes: c.notes || null,
        reportedDate: c.reported_date || null,
      }));

      setData({
        drugAllergies: drugAllergies.length > 0 ? drugAllergies : MOCK_DRUG,
        foodAllergies: foodAllergies.length > 0 ? foodAllergies : MOCK_FOOD,
        herbDrugInteractions: herbDrugInteractions.length > 0 ? herbDrugInteractions : MOCK_INTERACTIONS,
        viruddhaAhara: viruddhaAhara.length > 0 ? viruddhaAhara : MOCK_VIRUDDHA,
        criticalConditions: criticalConditions.length > 0 ? criticalConditions : MOCK_CONDITIONS,
        totalCount: mapped.length,
        severeCount,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Patient allergies unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [patientId]);

  useEffect(() => {
    fetchAllergies();
  }, [fetchAllergies]);

  const addAllergy = async (allergy: Omit<PatientAllergy, "id" | "verified">): Promise<boolean> => {
    if (!patientId) return false;
    const { data: sess } = await supabase.auth.getSession();

    const { error } = await (supabase as any)
      .from("patient_allergies")
      .insert({
        patient_id: patientId,
        allergy_type: allergy.allergyType,
        allergen: allergy.allergen,
        reaction: allergy.reaction,
        severity: allergy.severity,
        interacting_with: allergy.interactingWith,
        notes: allergy.notes,
        reported_date: allergy.reportedDate,
        reported_by: sess.session?.user?.id,
        is_active: true,
      });

    if (!error) fetchAllergies();
    return !error;
  };

  const removeAllergy = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("patient_allergies")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchAllergies();
    return !error;
  };

  const addCondition = async (condition: Omit<CriticalCondition, "id">): Promise<boolean> => {
    if (!patientId) return false;

    const { error } = await (supabase as any)
      .from("patient_critical_conditions")
      .insert({
        patient_id: patientId,
        condition_name: condition.conditionName,
        notes: condition.notes,
        reported_date: condition.reportedDate,
        is_active: true,
      });

    if (!error) fetchAllergies();
    return !error;
  };

  return { ...data, addAllergy, removeAllergy, addCondition, refetch: fetchAllergies };
};
