import { Button } from "@/components/ui/button";

interface StickyBookBarProps {
  priceLabel: string;
  ctaLabel?: string;
  onClick: () => void;
  subtitle?: string;
}

/**
 * Mobile-only sticky booking CTA. Hidden on `lg` and above where the
 * sidebar Book button is already visible.
 */
export const StickyBookBar = ({
  priceLabel,
  ctaLabel = "Book now",
  onClick,
  subtitle = "per session",
}: StickyBookBarProps) => (
  <div
    className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-3 shadow-elegant backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden"
    style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
  >
    <div className="container flex items-center justify-between gap-3 px-0">
      <div className="min-w-0">
        <p className="truncate font-display text-lg leading-tight">{priceLabel}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button variant="hero" size="lg" className="shrink-0" onClick={onClick}>
        {ctaLabel}
      </Button>
    </div>
  </div>
);
