// Pediatric dose adjustment utilities.
// Parses adult dose strings like "500 mg BD", "1-2 tab TDS", "10 ml twice daily"
// and applies Clark's rule (weight) and Young's rule (age).

export type ParsedDose = {
  min: number;
  max: number;
  unit: string;
  frequency: string;
  rawSuffix: string;
};

const UNIT_RE = /(mg|g|ml|tab(?:lets?)?|cap(?:sules?)?|drops?|tsp|tbsp|gm|grams?|mcg|ug)\b/i;

export function parseDose(dose: string | undefined | null): ParsedDose | null {
  if (!dose) return null;
  const cleaned = dose.trim();
  // Match e.g. "500 mg", "1-2 tab", "10ml"
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:-|to|–)?\s*(\d+(?:\.\d+)?)?\s*([a-zA-Z]+)\b(.*)/);
  if (!m) return null;
  const min = parseFloat(m[1]);
  const max = m[2] ? parseFloat(m[2]) : min;
  const unitMatch = m[3].match(UNIT_RE);
  if (!unitMatch) return null;
  const unit = unitMatch[1].toLowerCase();
  const rest = m[4]?.trim() ?? "";
  return { min, max, unit, frequency: rest, rawSuffix: rest };
}

export function clarkRule(adult: number, weightKg: number): number {
  return (adult * weightKg) / 70;
}

export function youngRule(adult: number, ageYears: number): number {
  if (ageYears <= 0) return 0;
  return (adult * ageYears) / (ageYears + 12);
}

function fmt(n: number, unit: string): string {
  const rounded = n < 1 ? Number(n.toFixed(2)) : Number(n.toFixed(1));
  return `${rounded} ${unit}`;
}

export function adjustPediatric(
  doseStr: string | undefined | null,
  weightKg: number | undefined,
  ageYears: number | undefined,
): { label: string; warning?: string } {
  const parsed = parseDose(doseStr);
  if (!parsed) {
    return { label: "—", warning: "Consult pediatric Vaidya" };
  }
  const lines: string[] = [];
  if (weightKg && weightKg > 0) {
    const lo = clarkRule(parsed.min, weightKg);
    const hi = clarkRule(parsed.max, weightKg);
    lines.push(
      `Clark: ${lo === hi ? fmt(lo, parsed.unit) : `${fmt(lo, parsed.unit)}–${fmt(hi, parsed.unit)}`}`,
    );
  }
  if (ageYears && ageYears > 0) {
    const lo = youngRule(parsed.min, ageYears);
    const hi = youngRule(parsed.max, ageYears);
    lines.push(
      `Young: ${lo === hi ? fmt(lo, parsed.unit) : `${fmt(lo, parsed.unit)}–${fmt(hi, parsed.unit)}`}`,
    );
  }
  if (lines.length === 0) {
    return { label: "Enter weight or age" };
  }
  return { label: `${lines.join(" · ")} ${parsed.frequency}`.trim() };
}

export function medicineKey(
  categoryKey: string,
  diseaseKey: string,
  level: number,
  name: string,
): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${categoryKey}|${diseaseKey}|L${level}|${slug}`;
}
