import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Reusable Sanskrit-term input for ASTG editors.
 * Stores three separate values for a single named concept:
 *   - devanagari: script form (e.g. संधिगत वात)
 *   - iast: IAST / simple transliteration (e.g. Sandhigata Vāta)
 *   - english: English gloss / modern term (e.g. Osteoarthritis)
 *
 * Designed to be dropped into any ASTG editor — not disease-specific.
 * Maps naturally to astg_diseases columns: name (devanagari), name_transliteration (IAST), name_modern (English).
 */
export type SanskritTerm = {
  devanagari: string;
  iast: string;
  english: string;
};

type Props = {
  label?: string;
  value: SanskritTerm;
  onChange: (next: SanskritTerm) => void;
  required?: boolean;
  compact?: boolean;
  idPrefix?: string;
};

export function SanskritTermInput({ label, value, onChange, required, compact, idPrefix = "st" }: Props) {
  const set = (k: keyof SanskritTerm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}{required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <div className={compact ? "grid grid-cols-1 md:grid-cols-3 gap-2" : "space-y-2"}>
        <div>
          <Label htmlFor={`${idPrefix}-dev`} className="text-xs text-muted-foreground">Devanagari</Label>
          <Input
            id={`${idPrefix}-dev`}
            value={value.devanagari}
            onChange={set("devanagari")}
            placeholder="संधिगत वात"
            lang="sa"
            className="font-serif"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-iast`} className="text-xs text-muted-foreground">IAST / Transliteration</Label>
          <Input
            id={`${idPrefix}-iast`}
            value={value.iast}
            onChange={set("iast")}
            placeholder="Sandhigata Vāta"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-en`} className="text-xs text-muted-foreground">English gloss</Label>
          <Input
            id={`${idPrefix}-en`}
            value={value.english}
            onChange={set("english")}
            placeholder="Osteoarthritis"
          />
        </div>
      </div>
    </div>
  );
}
