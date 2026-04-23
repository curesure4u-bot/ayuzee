import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SystemLite {
  id: string;
  slug: string;
  name: string;
}
interface ConditionLite {
  slug: string;
  name: string;
  system_id: string | null;
}

export const TreatmentsMenu = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [systems, setSystems] = useState<SystemLite[]>([]);
  const [conditions, setConditions] = useState<ConditionLite[]>([]);

  useEffect(() => {
    supabase
      .from("treatment_systems")
      .select("id,slug,name")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setSystems((data as SystemLite[]) ?? []));
    supabase
      .from("health_conditions")
      .select("slug,name,system_id")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setConditions((data as ConditionLite[]) ?? []));
  }, []);

  const condsBySystem = (sysId: string) => conditions.filter((c) => c.system_id === sysId);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setHovered(null);
      }}
    >
      <button
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary",
          open && "text-primary"
        )}
      >
        Treatments <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-elegant">
          {systems.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No treatment systems yet.</p>
          )}
          {systems.map((s) => {
            const items = condsBySystem(s.id);
            return (
              <div
                key={s.id}
                className="relative"
                onMouseEnter={() => setHovered(s.id)}
              >
                <Link
                  to={`/treatments/${s.slug}`}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                    hovered === s.id && "bg-accent text-primary"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> {s.name}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>

                {hovered === s.id && items.length > 0 && (
                  <div className="absolute left-full top-0 ml-2 w-60 rounded-xl border border-border bg-popover p-2 shadow-elegant">
                    <Link
                      to={`/treatments/${s.slug}`}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-accent"
                    >
                      View all in {s.name} →
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    {items.map((c) => (
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
                {hovered === s.id && items.length === 0 && (
                  <div className="absolute left-full top-0 ml-2 w-60 rounded-xl border border-border bg-popover p-3 text-xs text-muted-foreground shadow-elegant">
                    No conditions added yet for {s.name}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
