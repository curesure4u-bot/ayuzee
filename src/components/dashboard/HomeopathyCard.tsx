import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Pill, CalendarClock, Sparkles, ArrowRight, Utensils } from "lucide-react";

interface Rx {
  id: string;
  remedy_name: string;
  potency: string;
  dosage: string;
  follow_up_date: string | null;
  prescribed_at: string;
  instructions: string | null;
}

interface DietRecipe {
  id: string;
  slug: string;
  name: string;
  category: string;
  health_benefits: string;
  dose: string | null;
  when_to_take: string | null;
  duration: string | null;
}

export const HomeopathyCard = ({ userEmail }: { userEmail: string | null }) => {
  const [rx, setRx] = useState<Rx | null>(null);
  const [diet, setDiet] = useState<DietRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data: pat } = await supabase
        .from("homeo_patients")
        .select("id")
        .ilike("email", userEmail)
        .maybeSingle();
      if (!pat) { if (!cancelled) setLoading(false); return; }

      const { data } = await supabase
        .from("homeo_prescriptions")
        .select("id, remedy_name, potency, dosage, follow_up_date, prescribed_at, instructions")
        .eq("patient_id", pat.id)
        .order("prescribed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.id) {
        const { data: foods } = await supabase
          .from("prescription_food_recipes" as any)
          .select("dose, when_to_take, duration, food_recipes(id, slug, name, category, health_benefits)")
          .eq("prescription_id", data.id);
        const mapped: DietRecipe[] = (foods ?? []).map((f: any) => ({
          id: f.food_recipes.id,
          slug: f.food_recipes.slug,
          name: f.food_recipes.name,
          category: f.food_recipes.category,
          health_benefits: f.food_recipes.health_benefits,
          dose: f.dose, when_to_take: f.when_to_take, duration: f.duration,
        }));
        if (!cancelled) setDiet(mapped);
      }

      if (!cancelled) {
        setRx(data ?? null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userEmail]);

  if (loading || !rx) return null;

  const followUp = rx.follow_up_date ? new Date(rx.follow_up_date) : null;
  const daysToFollowUp = followUp ? Math.ceil((followUp.getTime() - Date.now()) / 86400000) : null;
  const followUpLabel =
    !followUp ? "Not scheduled" :
    daysToFollowUp! < 0 ? "Overdue" :
    daysToFollowUp === 0 ? "Today" :
    daysToFollowUp === 1 ? "Tomorrow" :
    `In ${daysToFollowUp} days`;

  return (
    <section className="mt-8 space-y-4">
      <article className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 via-card to-amber-50 p-6 shadow-sm dark:from-emerald-950/30 dark:to-amber-950/20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Sparkles className="inline h-3.5 w-3.5 mr-1" /> Homeopathy Treatment
              </p>
              <h3 className="mt-1 font-display text-xl">{rx.remedy_name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{rx.potency}</span> · {rx.dosage}
              </p>
              {rx.instructions && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 max-w-md">{rx.instructions}</p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Prescribed {new Date(rx.prescribed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="rounded-xl bg-card border border-border px-4 py-3 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarClock className="inline h-3 w-3 mr-1" /> Next Follow-up
              </p>
              <p className={`mt-1 font-display text-lg ${
                daysToFollowUp !== null && daysToFollowUp < 0
                  ? "text-destructive"
                  : daysToFollowUp !== null && daysToFollowUp <= 1
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-foreground"
              }`}>
                {followUpLabel}
              </p>
              {followUp && (
                <p className="text-[11px] text-muted-foreground">
                  {followUp.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </p>
              )}
            </div>
            <Link
              to="/homeopathy"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
            >
              Learn about homeopathy <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </article>

      {diet.length > 0 && (
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">My Diet Plan</p>
                <h3 className="mt-0.5 font-display text-lg">AYUSH recipes prescribed for you</h3>
              </div>
            </div>
            <Link to="/food-as-medicine" className="text-xs font-semibold text-primary hover:underline">Browse all recipes →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {diet.map((d) => (
              <Link
                key={d.id}
                to={`/food-as-medicine/${d.slug}`}
                className="rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{d.category}</div>
                <h4 className="mt-1 font-display text-base">{d.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.health_benefits}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {d.dose && <span className="px-2 py-0.5 rounded-full bg-muted">📏 {d.dose}</span>}
                  {d.when_to_take && <span className="px-2 py-0.5 rounded-full bg-muted">⏰ {d.when_to_take}</span>}
                  {d.duration && <span className="px-2 py-0.5 rounded-full bg-muted">📅 {d.duration}</span>}
                </div>
              </Link>
            ))}
          </div>
        </article>
      )}
    </section>
  );
};

