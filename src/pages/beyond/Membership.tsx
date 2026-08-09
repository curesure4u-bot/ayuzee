import { useState, useEffect } from "react";
import {
  Award,
  Check,
  Crown,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface Feature { text: string; included: boolean; }
interface Plan {
  id: string; name: string; slug: string; description: string; tier_level: number;
  price_monthly_inr: number; price_yearly_inr: number; is_free: boolean;
  features: Feature[]; highlighted_feature: string | null;
  badge_color: string; is_popular: boolean; sort_order: number;
}
interface Subscription {
  plan_id: string; plan_slug: string; status: string;
  billing_cycle: string; started_at: string; expires_at: string | null;
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function getPlanIcon(slug: string) {
  switch (slug) {
    case "free": return <Zap className="h-6 w-6" />;
    case "pro": return <Star className="h-6 w-6" />;
    case "elite": return <Crown className="h-6 w-6" />;
    default: return <Sparkles className="h-6 w-6" />;
  }
}

function getPlanGradient(slug: string) {
  switch (slug) {
    case "free": return "from-gray-100 to-gray-50 dark:from-gray-900/40 dark:to-gray-950/20 border-gray-200 dark:border-gray-700";
    case "pro": return "from-violet-100 to-indigo-50 dark:from-violet-900/40 dark:to-indigo-950/20 border-violet-300 dark:border-violet-700";
    case "elite": return "from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-950/20 border-amber-300 dark:border-amber-700";
    default: return "from-gray-100 to-gray-50 dark:from-gray-900/40 dark:to-gray-950/20";
  }
}

function getPlanTextColor(slug: string) {
  switch (slug) {
    case "free": return "text-gray-600 dark:text-gray-400";
    case "pro": return "text-violet-600 dark:text-violet-400";
    case "elite": return "text-amber-600 dark:text-amber-400";
    default: return "text-gray-600";
  }
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const Membership = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const sb = supabase as any;

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [plansRes, subRes] = await Promise.all([
      sb.from("beyond_membership_plans").select("*").eq("is_active", true).order("sort_order"),
      session.session
        ? sb.from("beyond_membership_subscriptions").select("plan_id, plan_slug, status, billing_cycle, started_at, expires_at").eq("user_id", session.session.user.id).eq("status", "active").maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setPlans(plansRes.data || []);
    setSubscription(subRes.data || null);
    setLoading(false);
  };

  const selectPlan = async (plan: Plan) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in first"); return; }
    const userId = session.session.user.id;

    if (plan.slug === subscription?.plan_slug) {
      toast.info("You're already on this plan!");
      return;
    }

    // For free plan or community-only (no real payment integration yet)
    await sb.from("beyond_membership_subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      plan_slug: plan.slug,
      status: "active",
      billing_cycle: plan.is_free ? "free" : billingCycle,
      started_at: new Date().toISOString(),
      expires_at: plan.is_free ? null : getExpiryDate(billingCycle),
    }, { onConflict: "user_id" });

    setSubscription({
      plan_id: plan.id,
      plan_slug: plan.slug,
      status: "active",
      billing_cycle: plan.is_free ? "free" : billingCycle,
      started_at: new Date().toISOString(),
      expires_at: plan.is_free ? null : getExpiryDate(billingCycle),
    });

    if (plan.is_free) {
      toast.success("Free plan activated! Explore Beyond.Praxis.");
    } else {
      toast.success(`${plan.name} plan activated! Welcome to the ${plan.name} tier.`, {
        description: "Payment integration coming soon — for now, Jasir will confirm your membership.",
      });
    }
  };

  const getExpiryDate = (cycle: string) => {
    const d = new Date();
    if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center justify-center gap-2">
          <Award className="h-7 w-7 text-violet-500" />
          Membership Plans
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that matches your growth goals. Upgrade anytime.
        </p>

        {/* Current Plan Badge */}
        {subscription && (
          <Badge variant="outline" className="gap-1 mt-2">
            Currently on: <span className="font-semibold capitalize">{subscription.plan_slug}</span>
          </Badge>
        )}
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border p-1 bg-muted/50">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billingCycle === "monthly" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billingCycle === "yearly" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly <span className="text-[10px] text-green-600 ml-1">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan_slug === plan.slug;
          const price = billingCycle === "yearly" ? plan.price_yearly_inr : plan.price_monthly_inr;
          const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.price_yearly_inr / 12) : plan.price_monthly_inr;

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-shadow hover:shadow-lg ${
                plan.is_popular ? "ring-2 ring-violet-500 dark:ring-violet-400" : ""
              } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] px-3 py-1 rounded-bl-lg font-medium">
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-3 py-1 rounded-br-lg font-medium">
                  Current Plan
                </div>
              )}

              <CardContent className="p-0">
                {/* Plan Header */}
                <div className={`p-6 bg-gradient-to-br ${getPlanGradient(plan.slug)} border-b`}>
                  <div className={`inline-flex items-center gap-2 ${getPlanTextColor(plan.slug)}`}>
                    {getPlanIcon(plan.slug)}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-4">
                    {plan.is_free ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">Free</span>
                        <span className="text-sm text-muted-foreground">forever</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">₹{monthlyEquivalent}</span>
                          <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                        {billingCycle === "yearly" && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Billed ₹{price}/year
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {plan.highlighted_feature && (
                    <p className="text-[11px] font-medium mt-2 text-muted-foreground">{plan.highlighted_feature}</p>
                  )}
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? "" : "text-muted-foreground/50"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.is_popular ? "default" : "outline"}
                      onClick={() => selectPlan(plan)}
                    >
                      {plan.is_free ? "Get Started" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Note */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-sm font-medium">Questions about membership?</p>
          <p className="text-xs text-muted-foreground">
            All plans include a 7-day free trial of Pro features. Payment is handled offline for now —
            contact Jasir Sajidh to confirm your Pro or Elite membership after selecting your plan.
            You can cancel or change plans anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Membership;
