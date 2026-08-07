import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching QuickTemplates UI ────────────────────────────────────────

export interface ConsultationTemplate {
  id: string;
  name: string;
  condition: string;
  systemOfMedicine: string;
  chiefComplaints: string;
  examination: string;
  prescription: string;
  diet: string;
  yoga: string;
  lifestyle: string;
  followUpDays: number | null;
  tags: string[];
  usageCount: number;
  isShared: boolean;
  isOwn: boolean;
}

export interface QuickTemplatesData {
  templates: ConsultationTemplate[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_TEMPLATES: ConsultationTemplate[] = [
  {
    id: "1", name: "Gridhrasi (Sciatica)", condition: "Gridhrasi", systemOfMedicine: "Ayurveda",
    chiefComplaints: "Low back pain radiating to lower limb, aggravated by forward bending & prolonged sitting",
    examination: "SLR +ve, Tenderness L4-L5, Restricted lumbar flexion, Vata Prakriti features",
    prescription: "1. Yogaraja Guggulu 2 BD after food\n2. Rasnadi Kashayam 15ml BD before food\n3. Dhanwantaram Taila for Kati Basti\n4. Maharasnadi Kashayam 15ml BD (if chronic)",
    diet: "Warm foods, avoid cold items, include garlic-ginger, sesame oil cooking, avoid curd at night",
    yoga: "Bhujangasana (modified), Shalabhasana, Marjariasana, avoid forward bends",
    lifestyle: "Lumbar support when sitting, avoid lifting heavy, warm oil massage daily",
    followUpDays: 7, tags: ["spine", "vata", "pain"], usageCount: 142, isShared: true, isOwn: true,
  },
  {
    id: "2", name: "Prameha (Diabetes Type 2)", condition: "Prameha", systemOfMedicine: "Ayurveda",
    chiefComplaints: "Polyuria, polydipsia, fatigue, numbness in feet, non-healing wound (if present)",
    examination: "BMI elevated, Kapha Prakriti features, Prameha Pidaka on skin, Madhura Mutra",
    prescription: "1. Nishamalaki Churna 5g BD\n2. Chandraprabha Vati 2 BD\n3. Shilajatu Vati 1 BD\n4. Triphala Kashayam 15ml HS",
    diet: "Millets (Ragi, Jowar), bitter gourd, fenugreek water AM, avoid rice-wheat-sugar, small frequent meals",
    yoga: "Surya Namaskar 5 rounds, Mandukasana, Ardha Matsyendrasana, Kapalabhati 5 min",
    lifestyle: "Walk 45 min daily, avoid daytime sleep, stress management",
    followUpDays: 14, tags: ["metabolic", "kapha"], usageCount: 98, isShared: true, isOwn: true,
  },
  {
    id: "3", name: "Amavata (RA)", condition: "Amavata", systemOfMedicine: "Ayurveda",
    chiefComplaints: "Multiple joint pain & swelling (symmetrical), morning stiffness > 30 min, fatigue",
    examination: "Joint swelling (MCPs, PIPs, wrists), Tenderness, Reduced grip strength, Ama lakshanas on tongue",
    prescription: "1. Simhanada Guggulu 2 TDS\n2. Rasnasaptakam Kashayam 15ml BD\n3. Eranda Taila 10ml HS\n4. Amavatari Rasa 1 BD",
    diet: "Langhana first 3 days (light kanji only), then warm light food, avoid curd-fermented-cold items",
    yoga: "Pawanmuktasana series, gentle joint ROM exercises, Shavasana 15 min",
    lifestyle: "Avoid cold water bathing, wear warm clothing, light exercise only",
    followUpDays: 7, tags: ["joints", "ama", "vata"], usageCount: 76, isShared: true, isOwn: true,
  },
  {
    id: "4", name: "Greeva Stambha (Cervical Spondylosis)", condition: "Greeva Stambha", systemOfMedicine: "Ayurveda",
    chiefComplaints: "Neck pain, stiffness, radiating pain to shoulder/arm, headache, giddiness",
    examination: "Restricted neck ROM, Spurling test +ve, Tenderness C4-C7, Muscle spasm trapezius",
    prescription: "1. Trayodashanga Guggulu 2 BD\n2. Dashamoola Kashayam 15ml BD\n3. Ksheerabala 101 Avarti 10 drops HS (nasal)\n4. Maha Vishagarbha Taila for Greeva Basti",
    diet: "Warm soups, avoid cold drinks-ice cream, include warm milk with turmeric HS",
    yoga: "Gentle neck rotations, Matsyasana (supported), Brahma Mudra, avoid headstand",
    lifestyle: "Ergonomic workstation, pillow height adjustment, screen at eye level",
    followUpDays: 7, tags: ["spine", "neck", "vata"], usageCount: 89, isShared: true, isOwn: true,
  },
  {
    id: "5", name: "Kushtha (Psoriasis)", condition: "Kushtha", systemOfMedicine: "Ayurveda",
    chiefComplaints: "Scaly erythematous plaques, itching, dryness, nail changes, joint pain (if psoriatic arthritis)",
    examination: "Auspitz sign +ve, Candle grease sign, Koebner phenomenon, Nail pitting",
    prescription: "1. Manjishthadi Kashayam 15ml BD\n2. Khadirarishta 20ml BD after food\n3. Gandhaka Rasayana 2 BD\n4. Panchatikta Ghrita externally",
    diet: "Avoid sour-salty excess, no seafood-alcohol, include bitter gourd, neem water AM",
    yoga: "Pranayama (Sheetali, Anuloma Viloma), Meditation 20 min, Shavasana",
    lifestyle: "Cotton clothing, avoid sun 10-4, moisturize with coconut oil, stress management",
    followUpDays: 14, tags: ["skin", "pitta", "kapha"], usageCount: 54, isShared: true, isOwn: true,
  },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useQuickTemplates = (search?: string): QuickTemplatesData & {
  applyTemplate: (id: string) => Promise<void>;
  createTemplate: (template: Omit<ConsultationTemplate, "id" | "usageCount" | "isOwn">) => Promise<boolean>;
  updateTemplate: (id: string, updates: Partial<ConsultationTemplate>) => Promise<boolean>;
  duplicateTemplate: (id: string) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<QuickTemplatesData>({
    templates: MOCK_TEMPLATES,
    loading: true,
    error: null,
  });

  const fetchTemplates = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;

      let query = (supabase as any)
        .from("consultation_templates")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,condition.ilike.%${search}%`);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.warn("Quick templates fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const templates: ConsultationTemplate[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        condition: r.condition,
        systemOfMedicine: r.system_of_medicine || "Ayurveda",
        chiefComplaints: r.chief_complaints || "",
        examination: r.examination || "",
        prescription: r.prescription || "",
        diet: r.diet || "",
        yoga: r.yoga || "",
        lifestyle: r.lifestyle || "",
        followUpDays: r.follow_up_days,
        tags: Array.isArray(r.tags) ? r.tags : [],
        usageCount: r.usage_count || 0,
        isShared: r.is_shared || false,
        isOwn: r.doctor_id === uid,
      }));

      setData({ templates, loading: false, error: null });
    } catch (err: any) {
      console.error("Quick templates unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [search]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Apply template — increment usage count
  const applyTemplate = async (id: string) => {
    // Optimistic local update
    setData((prev) => ({
      ...prev,
      templates: prev.templates.map((t) =>
        t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
      ),
    }));

    // Update in DB
    const template = data.templates.find((t) => t.id === id);
    if (template) {
      await (supabase as any)
        .from("consultation_templates")
        .update({ usage_count: template.usageCount + 1, updated_at: new Date().toISOString() })
        .eq("id", id);
    }
  };

  // Create new template
  const createTemplate = async (template: Omit<ConsultationTemplate, "id" | "usageCount" | "isOwn">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return false;

    const { error } = await (supabase as any)
      .from("consultation_templates")
      .insert({
        doctor_id: sess.session.user.id,
        name: template.name,
        condition: template.condition,
        system_of_medicine: template.systemOfMedicine,
        chief_complaints: template.chiefComplaints,
        examination: template.examination,
        prescription: template.prescription,
        diet: template.diet,
        yoga: template.yoga,
        lifestyle: template.lifestyle,
        follow_up_days: template.followUpDays,
        tags: template.tags,
        is_shared: template.isShared,
        is_active: true,
      });

    if (!error) fetchTemplates();
    return !error;
  };

  // Update template
  const updateTemplate = async (id: string, updates: Partial<ConsultationTemplate>): Promise<boolean> => {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.chiefComplaints !== undefined) dbUpdates.chief_complaints = updates.chiefComplaints;
    if (updates.examination !== undefined) dbUpdates.examination = updates.examination;
    if (updates.prescription !== undefined) dbUpdates.prescription = updates.prescription;
    if (updates.diet !== undefined) dbUpdates.diet = updates.diet;
    if (updates.yoga !== undefined) dbUpdates.yoga = updates.yoga;
    if (updates.lifestyle !== undefined) dbUpdates.lifestyle = updates.lifestyle;
    if (updates.followUpDays !== undefined) dbUpdates.follow_up_days = updates.followUpDays;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isShared !== undefined) dbUpdates.is_shared = updates.isShared;

    const { error } = await (supabase as any)
      .from("consultation_templates")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) fetchTemplates();
    return !error;
  };

  // Duplicate template
  const duplicateTemplate = async (id: string): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return false;

    const template = data.templates.find((t) => t.id === id);
    if (!template) return false;

    const { error } = await (supabase as any)
      .from("consultation_templates")
      .insert({
        doctor_id: sess.session.user.id,
        name: `${template.name} (Copy)`,
        condition: template.condition,
        system_of_medicine: template.systemOfMedicine,
        chief_complaints: template.chiefComplaints,
        examination: template.examination,
        prescription: template.prescription,
        diet: template.diet,
        yoga: template.yoga,
        lifestyle: template.lifestyle,
        follow_up_days: template.followUpDays,
        tags: template.tags,
        is_shared: false,
        is_active: true,
      });

    if (!error) fetchTemplates();
    return !error;
  };

  // Delete (soft delete)
  const deleteTemplate = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("consultation_templates")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchTemplates();
    return !error;
  };

  return {
    ...data,
    applyTemplate,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};
