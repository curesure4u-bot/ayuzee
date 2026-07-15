import { CheckCircle2, XCircle } from "lucide-react";

export interface PathyaApathyaRow {
  category?: string | null;
  item_text: string;
  is_recommended: boolean;
}

/**
 * Two-column Do's / Don'ts table for Pathya (wholesome) and Apathya (unwholesome)
 * with green / red column headers.
 */
export function PathyaApathyaTable({
  rows,
  fallbackPathya,
  fallbackApathya,
}: {
  rows: PathyaApathyaRow[];
  fallbackPathya?: string | null;
  fallbackApathya?: string | null;
}) {
  const pathya = rows.filter((r) => r.is_recommended);
  const apathya = rows.filter((r) => !r.is_recommended);

  if (rows.length === 0 && (fallbackPathya || fallbackApathya)) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <FallbackCard tone="pathya" title="Pathya (Do's)" text={fallbackPathya} />
        <FallbackCard tone="apathya" title="Apathya (Don'ts)" text={fallbackApathya} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-2">
        <div className="border-b border-r bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Pathya (Do's) · Wholesome
          </div>
        </div>
        <div className="border-b bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Apathya (Don'ts) · Unwholesome
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <ul className="border-r bg-emerald-500/5 p-4 text-sm">
          {pathya.length === 0 && (
            <li className="text-muted-foreground">Not captured.</li>
          )}
          {pathya.map((r, i) => (
            <li key={i} className="mb-2 flex items-start gap-2 last:mb-0">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
              <span>
                {r.category && (
                  <span className="mr-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                    {r.category}:
                  </span>
                )}
                {r.item_text}
              </span>
            </li>
          ))}
        </ul>
        <ul className="bg-destructive/5 p-4 text-sm">
          {apathya.length === 0 && (
            <li className="text-muted-foreground">Not captured.</li>
          )}
          {apathya.map((r, i) => (
            <li key={i} className="mb-2 flex items-start gap-2 last:mb-0">
              <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" />
              <span>
                {r.category && (
                  <span className="mr-1 text-xs font-semibold uppercase text-destructive">
                    {r.category}:
                  </span>
                )}
                {r.item_text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FallbackCard({
  tone,
  title,
  text,
}: {
  tone: "pathya" | "apathya";
  title: string;
  text?: string | null;
}) {
  const isPathya = tone === "pathya";
  return (
    <div
      className={`rounded-lg border p-4 ${
        isPathya ? "bg-emerald-500/5" : "bg-destructive/5"
      }`}
    >
      <div
        className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
          isPathya ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"
        }`}
      >
        {isPathya ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        {title}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed">
        {text ?? (
          <span className="text-muted-foreground">Not yet captured.</span>
        )}
      </p>
    </div>
  );
}

export default PathyaApathyaTable;
