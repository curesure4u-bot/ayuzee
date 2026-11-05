import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BadgePercent, Tag, Truck, Megaphone, Headphones, Smartphone, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocCat { current_tier: string; monthly_spend: number; diamond_progress: number; platinum_progress: number; platinum_plus_progress: number }

const tiers = [
  { key: "diamond", label: "Diamond", icon: Star, range: "8k - 25k", min: 8000, max: 25000, discount: "0%" },
  { key: "platinum", label: "Platinum", icon: Crown, range: "25k - 60k", min: 25000, max: 60000, discount: "2%" },
  { key: "platinum_plus", label: "Platinum_plus", icon: Crown, range: "60k+", min: 60000, max: 200000, discount: "5%" },
];

const benefits = [
  { icon: BadgePercent, label: "Receive great discounts" },
  { icon: Tag, label: "Exclusive offer every month" },
  { icon: Smartphone, label: "Free Ayush HMS Tool" },
  { icon: Headphones, label: "Dedicated account manager" },
];

const categoryBenefits = [
  { icon: BadgePercent, label: "Great discounts & offers" },
  { icon: Smartphone, label: "Priority profile listing" },
  { icon: Truck, label: "Priority dispatch & delivery" },
  { icon: Megaphone, label: "Marketing support" },
];

const DoctorCategory = () => {
  const navigate = useNavigate();
  const { userId } = useDoctor();
  const [cat, setCat] = useState<DocCat | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from("doctor_categories").select("*").eq("doctor_user_id", userId).maybeSingle();
      if (!data) {
        await supabase.from("doctor_categories").insert({ doctor_user_id: userId });
        setCat({ current_tier: "diamond", monthly_spend: 0, diamond_progress: 0, platinum_progress: 0, platinum_plus_progress: 0 });
      } else setCat(data as DocCat);
    })();
  }, [userId]);

  const progressFor = (key: string) => {
    if (!cat) return 0;
    if (key === "diamond") return cat.diamond_progress;
    if (key === "platinum") return cat.platinum_progress;
    return cat.platinum_plus_progress;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="font-display text-2xl">Ayuzee Category</h1>
        </div>

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 text-primary-foreground">
          <div className="absolute right-4 top-4 rounded-md bg-background/10 px-3 py-1 text-xs backdrop-blur">CURRENT LEVEL</div>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {tiers.map((t, i) => {
              const isCurrent = cat?.current_tier === t.key;
              const Icon = t.icon;
              return (
                <div key={t.key} className="flex flex-col items-center text-center">
                  <span className="text-xs">{progressFor(t.key)}%</span>
                  <div className={`mt-1 grid h-12 w-12 place-items-center rounded-full border-2 ${isCurrent ? "border-background bg-background text-primary" : "border-background/30 bg-background/10"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className={`mt-2 text-sm ${isCurrent ? "font-semibold" : "opacity-80"}`}>{t.label}</p>
                  {i < tiers.length - 1 && <div className="absolute" />}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl">Ayuzee brings you</h2>
        <p className="mt-1 text-sm text-muted-foreground">Category-level margins based on your purchase amount</p>
        <p className="mt-4 font-semibold text-primary">Benefits:</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.label} className="grid place-items-center gap-2 rounded-md border p-4 text-center">
              <b.icon className="h-7 w-7 text-primary" />
              <p className="text-sm font-medium">{b.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        <h2 className="font-display text-xl">Category list</h2>
        <p className="text-sm text-muted-foreground">Based on your monthly spend, Ayuzee offers the following categories with additional discounts and coupons</p>
      </div>

      {tiers.map((t) => (
        <Card key={t.key} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ayuzee {t.label} Category</h3>
              <p className="text-sm text-muted-foreground">{t.label} category subscription plan</p>
            </div>
            {cat?.current_tier === t.key && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Current</span>}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border p-3">
              <BadgePercent className="h-5 w-5 text-primary" />
              <div className="text-sm"><span className="font-medium">Monthly spend</span> <span className="text-muted-foreground">{t.range}</span></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Tag className="h-5 w-5 text-primary" />
              <div className="text-sm"><span className="font-medium">Discount</span> <span className="text-muted-foreground">{t.discount} additional discount</span></div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progressFor(t.key)} />
            <p className="mt-1 text-xs text-muted-foreground">{progressFor(t.key)}% to next tier</p>
          </div>
          <p className="mt-4 font-semibold">Benefits:</p>
          <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categoryBenefits.map((b) => (
              <div key={b.label} className="grid place-items-center gap-2 rounded-md border p-4 text-center">
                <b.icon className="h-6 w-6 text-primary" />
                <p className="text-xs font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DoctorCategory;
