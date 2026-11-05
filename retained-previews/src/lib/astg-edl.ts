import { supabase } from "@/integrations/supabase/client";

export type EDLMatch = {
  system: "Ayurveda" | "Unani" | "Siddha" | "Homeopathy";
  id: string;
  name: string;
  category?: string | null;
  dose?: string | null;
  indications?: string[] | null;
  precautions?: string | null;
  reference?: string | null;
};

const CACHE = new Map<string, EDLMatch[]>();

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim();
}

export async function findEDLMatches(medicineName: string): Promise<EDLMatch[]> {
  const key = norm(medicineName);
  if (!key) return [];
  if (CACHE.has(key)) return CACHE.get(key)!;

  const like = `%${key.split(" ")[0]}%`;
  const [a, u, s, h] = await Promise.all([
    supabase.from("essential_drugs").select("id,name,category,dose,indications,precautions,reference_text").ilike("name", like).limit(5),
    supabase.from("essential_unani_drugs").select("id,name,category,dose,indications,precautions,reference_text").ilike("name", like).limit(5),
    supabase.from("essential_siddha_drugs").select("id,name,category,dose,indications,precautions,reference_text").ilike("name", like).limit(5),
    supabase.from("essential_homeopathy_drugs").select("id,name,latin_name,common_name,dose,indications,precautions,reference_text").ilike("name", like).limit(5),
  ]);

  const matches: EDLMatch[] = [];
  const score = (n: string) => {
    const nn = norm(n);
    if (nn === key) return 3;
    if (nn.includes(key) || key.includes(nn)) return 2;
    if (nn.split(" ").some((w) => key.includes(w))) return 1;
    return 0;
  };
  const collect = (rows: any[], system: EDLMatch["system"]) => {
    for (const r of rows ?? []) {
      if (score(r.name) > 0) {
        matches.push({
          system,
          id: r.id,
          name: r.name,
          category: r.category ?? null,
          dose: r.dose ?? null,
          indications: r.indications ?? null,
          precautions: r.precautions ?? null,
          reference: r.reference_text ?? null,
        });
      }
    }
  };
  collect(a.data ?? [], "Ayurveda");
  collect(u.data ?? [], "Unani");
  collect(s.data ?? [], "Siddha");
  collect(h.data ?? [], "Homeopathy");

  CACHE.set(key, matches);
  return matches;
}
