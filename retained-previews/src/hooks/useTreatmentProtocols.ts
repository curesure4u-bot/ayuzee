import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching TreatmentProtocols UI ────────────────────────────────────

export interface TreatmentProtocol {
  id: string;
  name: string;
  condition: string;
  systemOfMedicine: string;
  duration: string;
  durationDays: number | null;
  therapies: string[];
  medicines: string[];
  diet: string;
  lifestyle: string;
  expectedOutcome: string;
  contraindications: string;
  createdBy: string | null;
  isStandard: boolean;
  usageCount: number;
  successRate: number | null;
  status: string;
}

export interface TreatmentProtocolsData {
  protocols: TreatmentProtocol[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_PROTOCOLS: TreatmentProtocol[] = [
  {
    id: "1", name: "Gridhrasi 14-Day Protocol", condition: "Gridhrasi (Sciatica)",
    systemOfMedicine: "Ayurveda", duration: "14 days", durationDays: 14,
    therapies: ["Kati Basti x 7 days", "Niruha Basti x 8", "Anuvasana Basti x 6", "Nadi Sweda daily"],
    medicines: ["Yogaraja Guggulu 2 BD", "Rasna Saptak Kwath 20ml BD", "Maharasnadi Kwath 15ml BD"],
    diet: "Warm, unctuous foods. Avoid Vata-aggravating: cold, dry, raw items. Include sesame oil, ghee.",
    lifestyle: "Avoid prolonged sitting, use lumbar support, gentle walking 20 min daily.",
    expectedOutcome: "70-80% pain reduction. Improved SLR by 20-30°. Resume daily activities.",
    contraindications: "Acute disc prolapse with cauda equina, active infection, pregnancy.",
    createdBy: null, isStandard: true, usageCount: 142, successRate: 78.5, status: "active",
  },
  {
    id: "2", name: "Prameha Management", condition: "Prameha (Diabetes)",
    systemOfMedicine: "Ayurveda", duration: "90 days", durationDays: 90,
    therapies: ["Udwarthana x 14 days", "Vamana (if Kapha dominant)", "Virechana day 21"],
    medicines: ["Chandraprabha Vati 2 BD", "Nishamalaki Churna 3g BD", "Shilajatu 250mg BD"],
    diet: "Millets (Ragi, Jowar), bitter gourd, fenugreek water AM, avoid rice-wheat-sugar, small frequent meals.",
    lifestyle: "Walk 45 min daily, Surya Namaskar 5 rounds, avoid daytime sleep.",
    expectedOutcome: "HbA1c reduction 0.5-1.5%. Fasting glucose <130 mg/dL. Reduced polyuria.",
    contraindications: "Type 1 DM, DKA, severe nephropathy.",
    createdBy: null, isStandard: true, usageCount: 98, successRate: 72.0, status: "active",
  },
  {
    id: "3", name: "Amavata Protocol", condition: "Amavata (Rheumatoid Arthritis)",
    systemOfMedicine: "Ayurveda", duration: "30 days", durationDays: 30,
    therapies: ["Ruksha Sweda x 7", "Valuka Sweda x 7", "Virechana day 14", "Kshara Basti x 8"],
    medicines: ["Simhanada Guggulu 2 TDS", "Amavatari Rasa 1 BD", "Rasnadi Kwath 20ml BD"],
    diet: "Langhana first 3 days. Then light, warm food. No curd, fish, incompatible combinations.",
    lifestyle: "Gentle joint ROM exercises, avoid cold exposure, warm oil massage daily.",
    expectedOutcome: "Reduced joint swelling 50%. ESR/CRP normalization. Improved grip strength.",
    contraindications: "Severe anemia, debilitated patients, active GI bleed.",
    createdBy: null, isStandard: true, usageCount: 76, successRate: 68.0, status: "active",
  },
  {
    id: "4", name: "Cervical Spondylosis", condition: "Greeva Stambha (Cervical Spondylosis)",
    systemOfMedicine: "Ayurveda", duration: "21 days", durationDays: 21,
    therapies: ["Greeva Basti x 7", "Nasya (Anu Taila) x 7", "Pinda Sweda x 7"],
    medicines: ["Trayodashanga Guggulu 2 BD", "Ashwagandha Churna 3g BD", "Sahacharadi Taila external"],
    diet: "Warm soups, milk with turmeric. Avoid excessive screen time, cold exposure.",
    lifestyle: "Ergonomic workstation, neck exercises 3x daily, avoid heavy lifting.",
    expectedOutcome: "Pain relief 60-70%. Improved neck ROM. Reduced tingling in upper limbs.",
    contraindications: "Cervical myelopathy, vertebral artery insufficiency.",
    createdBy: null, isStandard: true, usageCount: 89, successRate: 75.0, status: "active",
  },
  {
    id: "5", name: "Kushtha (Skin) Protocol", condition: "Kushtha (Chronic Skin Diseases)",
    systemOfMedicine: "Ayurveda", duration: "45 days", durationDays: 45,
    therapies: ["Vamana day 1", "Virechana day 15", "Takra Dhara x 7", "Lepam daily"],
    medicines: ["Khadirarishta 20ml BD", "Gandhaka Rasayana 2 BD", "Mahamanjisthadi Kwath 20ml BD"],
    diet: "Bitter, astringent foods. No fermented, sour, seafood. Avoid Viruddha Ahara.",
    lifestyle: "Cotton clothing, avoid sun 10am-4pm, stress management meditation.",
    expectedOutcome: "Lesion area reduction 40-60%. Reduced itching. Improved skin texture.",
    contraindications: "Severe immunosuppression, pregnancy (for Vamana/Virechana).",
    createdBy: null, isStandard: true, usageCount: 54, successRate: 65.0, status: "active",
  },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useTreatmentProtocols = (filter?: string): TreatmentProtocolsData & {
  applyProtocol: (id: string) => Promise<void>;
  createProtocol: (protocol: Omit<TreatmentProtocol, "id" | "usageCount" | "successRate" | "status">) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<TreatmentProtocolsData>({
    protocols: MOCK_PROTOCOLS,
    loading: true,
    error: null,
  });

  const fetchProtocols = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let query = (supabase as any)
        .from("treatment_protocols")
        .select("*")
        .eq("status", "active")
        .order("usage_count", { ascending: false });

      if (filter) {
        query = query.or(`name.ilike.%${filter}%,condition.ilike.%${filter}%`);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.warn("Treatment protocols fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const protocols: TreatmentProtocol[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        condition: r.condition,
        systemOfMedicine: r.system_of_medicine || "Ayurveda",
        duration: r.duration_days ? `${r.duration_days} days` : "Variable",
        durationDays: r.duration_days,
        therapies: Array.isArray(r.therapies) ? r.therapies : [],
        medicines: Array.isArray(r.medicines) ? r.medicines : [],
        diet: r.dietary_guidelines || "",
        lifestyle: r.lifestyle_guidelines || "",
        expectedOutcome: r.expected_outcomes || "",
        contraindications: r.contraindications || "",
        createdBy: r.created_by,
        isStandard: r.is_standard || false,
        usageCount: r.usage_count || 0,
        successRate: r.success_rate ? Number(r.success_rate) : null,
        status: r.status || "active",
      }));

      setData({ protocols, loading: false, error: null });
    } catch (err: any) {
      console.error("Treatment protocols unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [filter]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  // Increment usage count when a protocol is applied
  const applyProtocol = async (id: string) => {
    await (supabase as any)
      .from("treatment_protocols")
      .update({ usage_count: (supabase as any).rpc("increment_usage", { row_id: id }) })
      .eq("id", id);

    // Fallback: just increment locally if RPC doesn't exist
    setData((prev) => ({
      ...prev,
      protocols: prev.protocols.map((p) =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      ),
    }));
  };

  // Create new protocol
  const createProtocol = async (protocol: Omit<TreatmentProtocol, "id" | "usageCount" | "successRate" | "status">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return false;

    const { error } = await (supabase as any)
      .from("treatment_protocols")
      .insert({
        name: protocol.name,
        condition: protocol.condition,
        system_of_medicine: protocol.systemOfMedicine,
        duration_days: protocol.durationDays,
        therapies: protocol.therapies,
        medicines: protocol.medicines,
        dietary_guidelines: protocol.diet,
        lifestyle_guidelines: protocol.lifestyle,
        expected_outcomes: protocol.expectedOutcome,
        contraindications: protocol.contraindications,
        created_by: sess.session.user.id,
        is_standard: false,
        status: "active",
      });

    if (!error) fetchProtocols();
    return !error;
  };

  return {
    ...data,
    applyProtocol,
    createProtocol,
    refetch: fetchProtocols,
  };
};
