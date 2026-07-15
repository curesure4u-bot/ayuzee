import { Badge } from "@/components/ui/badge";

export interface DualNameHeaderProps {
  nameDevanagari?: string | null;
  nameTransliteration?: string | null;
  nameModern?: string | null;
  namcCode?: string | null;
  icd11Tm2Code?: string | null;
  icd11BiomedicalCode?: string | null;
  chapter?: number | null;
  categoryLabel?: string | null;
}

/**
 * Reusable dual-naming header for ASTG / NAMASTE / ICD-11 dual coding displays.
 * Shows Ayurvedic term (Devanagari + IAST transliteration) alongside modern term,
 * with NAMC and ICD-11 TM2 / biomedical codes as small badges.
 */
export function DualNameHeader({
  nameDevanagari,
  nameTransliteration,
  nameModern,
  namcCode,
  icd11Tm2Code,
  icd11BiomedicalCode,
  chapter,
  categoryLabel,
}: DualNameHeaderProps) {
  return (
    <header className="mb-6 rounded-xl border bg-card p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {chapter != null && <Badge variant="outline">Chapter {chapter}</Badge>}
        {categoryLabel && <Badge variant="secondary">{categoryLabel}</Badge>}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {nameDevanagari && (
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {nameDevanagari}
          </h1>
        )}
        {nameTransliteration && (
          <span className="text-lg italic text-muted-foreground">
            {nameTransliteration}
          </span>
        )}
      </div>
      {nameModern && (
        <p className="mt-1 text-base text-foreground/80">{nameModern}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {namcCode && (
          <CodeBadge label="NAMC" value={namcCode} tone="emerald" />
        )}
        {icd11Tm2Code && (
          <CodeBadge label="ICD-11 TM2" value={icd11Tm2Code} tone="indigo" />
        )}
        {icd11BiomedicalCode && (
          <CodeBadge label="ICD-11" value={icd11BiomedicalCode} tone="slate" />
        )}
      </div>
    </header>
  );
}

const TONES: Record<string, string> = {
  emerald:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  indigo:
    "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  slate:
    "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export function CodeBadge({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "emerald" | "indigo" | "slate";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono ${TONES[tone]}`}
      title={`${label} · ${value}`}
    >
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export default DualNameHeader;
