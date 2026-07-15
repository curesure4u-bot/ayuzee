import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { BULK_BRANDS, CLASSICAL_TYPES, PATENTED_TYPES } from "@/data/bulkCatalog";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "brands" | "classical" | "patented" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "brands", label: "Brands" },
  { key: "classical", label: "Classical Medicines" },
  { key: "patented", label: "Patented Medicine" },
  { key: "all", label: "All Medicines" },
];

const buildHref = (tab: Tab, value?: string) => {
  if (tab === "all") return "/bulk";
  const param = tab === "brands" ? "brand" : tab === "classical" ? "classical" : "patented";
  return value ? `/bulk?${param}=${encodeURIComponent(value)}` : "/bulk";
};

export const BulkPurchaseMenu = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Tab>("brands");

  const items =
    active === "brands" ? BULK_BRANDS :
    active === "classical" ? CLASSICAL_TYPES :
    active === "patented" ? PATENTED_TYPES : [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium transition-smooth hover:text-primary",
          variant === "dark" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Bulk Purchase <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div className="flex w-[min(92vw,1100px)] overflow-hidden rounded-2xl border border-border bg-popover shadow-elegant">
            <ul className="w-56 shrink-0 border-r border-border bg-muted/30 py-2">
              {TABS.map((t) => (
                <li key={t.key}>
                  {t.key === "all" ? (
                    <Link
                      to="/bulk"
                      className="block px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      {t.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onMouseEnter={() => setActive(t.key)}
                      className={cn(
                        "flex w-full items-center justify-between px-5 py-2.5 text-left text-sm font-medium transition-colors",
                        active === t.key
                          ? "bg-background text-primary"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      {t.label} <span className="text-xs opacity-50">›</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="max-h-[70vh] flex-1 overflow-y-auto p-6">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {items.map((label) => (
                  <Link
                    key={label}
                    to={buildHref(active, label)}
                    className="truncate text-sm text-foreground/85 transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
