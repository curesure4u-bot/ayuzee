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
  showLabels?: boolean;
}

/**
 * Stylised front/back human body silhouette with clickable therapy points.
 * - Larger, numbered markers
 * - Always-visible labels for each point (name + code)
 * - Wide invisible hit area for easier tapping on mobile
 */
export const BodyMap = ({
  side,
  points,
  selectedIds,
  onTogglePoint,
  onHoverPoint,
  showLabels = true,
}: BodyMapProps) => {
  const visible = useMemo(
    () =>
      points
        .filter((p) => p.side === side && p.x_pct != null && p.y_pct != null)
        .map((p, i) => ({ ...p, _idx: i + 1 })),
    [points, side],
  );

  return (
    <div className="relative w-full max-w-[340px] mx-auto aspect-[1/2.4] select-none">
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
          const cx = p.x_pct ?? 50;
          const cy = ((p.y_pct ?? 50) / 100) * 240;
          const selected = selectedIds.includes(p.id);
          // Place label to the right or left depending on x to avoid edge clipping
          const labelLeft = cx > 60;
          const labelX = labelLeft ? cx - 4 : cx + 4;
          const labelAnchor = labelLeft ? "end" : "start";
          const shortLabel = (p.point_code || p.name || "").slice(0, 18);

          return (
            <g
              key={p.id}
              className="cursor-pointer"
              onClick={() => onTogglePoint(p)}
              onMouseEnter={() => onHoverPoint?.(p)}
              onMouseLeave={() => onHoverPoint?.(null)}
            >
              {/* Large invisible hit target */}
              <circle cx={cx} cy={cy} r={6} fill="transparent" />

              {/* Marker */}
              <circle
                cx={cx}
                cy={cy}
                r={selected ? 3.4 : 2.8}
                fill={selected ? "hsl(var(--primary))" : "hsl(var(--background))"}
                stroke={selected ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                strokeWidth="0.7"
              />
              {/* Marker number */}
              <text
                x={cx}
                y={cy + 1.1}
                textAnchor="middle"
                fontSize="2.4"
                fontWeight="700"
                fill={selected ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))"}
                style={{ pointerEvents: "none" }}
              >
                {p._idx}
              </text>

              {/* Always-visible label */}
              {showLabels && (
                <>
                  <rect
                    x={labelLeft ? labelX - shortLabel.length * 1.25 : labelX - 0.4}
                    y={cy - 2.2}
                    width={Math.max(shortLabel.length * 1.25 + 0.8, 6)}
                    height={3.2}
                    rx={0.8}
                    fill="hsl(var(--background))"
                    fillOpacity={0.85}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.2"
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={labelX}
                    y={cy + 0.1}
                    textAnchor={labelAnchor}
                    fontSize="2.1"
                    fontWeight={selected ? "700" : "500"}
                    fill={selected ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
                    style={{ pointerEvents: "none" }}
                  >
                    {shortLabel}
                  </text>
                </>
              )}

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
