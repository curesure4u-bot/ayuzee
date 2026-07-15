import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Pill } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ConditionLite {
  slug: string;
  name: string;
}

export const MedicineMenu = () => {
  const [open, setOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [conditions, setConditions] = useState<ConditionLite[]>([]);

  useEffect(() => {
    supabase
      .from("health_conditions")
      .select("slug,name")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setConditions((data as ConditionLite[]) ?? []));
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setHealthOpen(false);
      }}
    >
      <button
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary",
          open && "text-primary"
        )}
      >
        Buy Medicine <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-elegant">
          <button
            onMouseEnter={() => setHealthOpen(true)}
            onClick={() => setHealthOpen((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
              healthOpen && "bg-accent text-primary"
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Pill className="h-4 w-4" /> Health Conditions
            </span>
            <ChevronDown className={cn("h-4 w-4 -rotate-90 transition-transform", healthOpen && "rotate-0")} />
          </button>
          <Link
            to="/shop"
            className="mt-1 block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            All Medicines
          </Link>

          {healthOpen && (
            <div className="absolute left-full top-0 ml-2 w-60 rounded-xl border border-border bg-popover p-2 shadow-elegant">
              <Link
                to="/health-conditions"
                className="block rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-accent"
              >
                View all conditions →
              </Link>
              <div className="my-1 h-px bg-border" />
              {conditions.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">Loading…</p>
              )}
              {conditions.map((c) => (
                <Link
                  key={c.slug}
                  to={`/health-conditions/${c.slug}`}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
