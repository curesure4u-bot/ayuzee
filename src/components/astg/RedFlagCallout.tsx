import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Visually distinct red-flag warning callout — matches the pattern used in the
 * spine module screener (destructive border + tint, alert icon, itemised signs).
 */
export function RedFlagCallout({
  signs,
  title = "Red Flag Signs",
  description = "If any of these are present, escalate to in-person evaluation and consider urgent referral before starting classical management.",
}: {
  signs: string[];
  title?: string;
  description?: string;
}) {
  if (!signs || signs.length === 0) return null;
  return (
    <Card className="border-destructive/40 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-destructive">{title}</p>
          <p className="mt-1 text-muted-foreground">{description}</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {signs.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                <span className="text-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default RedFlagCallout;
