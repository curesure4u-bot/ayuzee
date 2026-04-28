import { useMemo } from "react";

export type BodyPoint = {
  id: string;
  name: string;
  point_code?: string | null;
  therapy: string;
  body_region: string;
  side: string;
  x_pct: number | null;
  y_pct: number | null;
  anatomical_location?: string | null;
};

interface BodyMapProps {
  side: "front" | "back";
  points: BodyPoint[];
  selectedIds: string[];
  onTogglePoint: (p: BodyPoint) => void;
  onHoverPoint?: (p: BodyPoint | null) => void;
}

/**
 * Stylised front/back human body silhouette with clickable therapy points.
 * Uses normalised x_pct/y_pct (0-100) coordinates from the points library.
 */
export const BodyMap = ({
  side,
  points,
  selectedIds,
  onTogglePoint,
  onHoverPoint,
}: BodyMapProps) => {
  const visible = useMemo(
    () => points.filter((p) => p.side === side && p.x_pct != null && p.y_pct != null),
    [points, side],
  );

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-[1/2.4] select-none">
      <svg
        viewBox="0 0 100 240"
        className="absolute inset-0 w-full h-full"
        aria-label={`${side} body map`}
      >
        {/* Body silhouette */}
        <g fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5">
          <ellipse cx="50" cy="14" rx="10" ry="12" />
          <rect x="46" y="24" width="8" height="6" rx="2" />
          <path d="M28 32 Q50 28 72 32 L70 78 Q50 82 30 78 Z" />
          <path d="M28 34 L18 36 L14 78 L20 80 L26 50 Z" />
          <path d="M72 34 L82 36 L86 78 L80 80 L74 50 Z" />
          <path d="M14 78 L10 96 L14 100 L20 96 Z" />
          <path d="M86 78 L90 96 L86 100 L80 96 Z" />
          <path d="M34 80 L32 150 L40 152 L44 80 Z" />
          <path d="M66 80 L68 150 L60 152 L56 80 Z" />
          <path d="M32 150 L30 215 L42 215 L42 152 Z" />
          <path d="M68 150 L70 215 L58 215 L58 152 Z" />
          <ellipse cx="36" cy="222" rx="9" ry="6" />
          <ellipse cx="64" cy="222" rx="9" ry="6" />
        </g>

        {/* Points */}
        {visible.map((p) => {
          const cx = (p.x_pct ?? 50);
          const cy = ((p.y_pct ?? 50) / 100) * 240;
          const selected = selectedIds.includes(p.id);
          return (
            <g
              key={p.id}
              className="cursor-pointer"
              onClick={() => onTogglePoint(p)}
              onMouseEnter={() => onHoverPoint?.(p)}
              onMouseLeave={() => onHoverPoint?.(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={selected ? 3 : 2}
                fill={selected ? "hsl(var(--primary))" : "hsl(var(--accent-foreground))"}
                stroke="hsl(var(--background))"
                strokeWidth="0.5"
                opacity={selected ? 1 : 0.85}
              />
              {selected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.6"
                  opacity="0.6"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BodyMap;
