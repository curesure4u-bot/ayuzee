import { useState, useEffect } from "react";
import {
  Award,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface BadgeCatalogItem {
  id: string;
  name: string;
  description: string;
  category: "starter" | "growth" | "mastery" | "hidden";
  icon_name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  coin_reward: number;
}

interface EarnedBadge {
  badge_id: string;
  earned_at: string;
}

const RARITY_CONFIG = {
  common: { label: "Common", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", border: "border-slate-300", glow: "" },
  rare: { label: "Rare", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", border: "border-blue-400", glow: "" },
  epic: { label: "Epic", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", border: "border-purple-400", glow: "shadow-purple-200 dark:shadow-purple-900/30 shadow-md" },
  legendary: { label: "Legendary", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", border: "border-amber-400", glow: "shadow-amber-200 dark:shadow-amber-900/30 shadow-lg" },
};

const CATEGORY_CONFIG = {
  starter: { label: "Starter", desc: "Easy to earn — get started!", icon: Star },
  growth: { label: "Growth", desc: "Sustained effort required", icon: Flame },
  mastery: { label: "Mastery", desc: "Exceptional achievement", icon: Trophy },
  hidden: { label: "Hidden", desc: "Surprise discoveries", icon: Sparkles },
};

// Map icon_name string to a visual representation
const getBadgeEmoji = (iconName: string): string => {
  const map: Record<string, string> = {
    footprints: "👣", target: "🎯", clock: "⏰", "book-open": "📖",
    wind: "🌬️", coins: "💰", "pen-tool": "✍️", "circle-dot": "⭕",
    brain: "🧠", "trending-up": "📈", shield: "🛡️", "heart-pulse": "💓",
    users: "👥", rocket: "🚀", flame: "🔥", library: "📚",
    "refresh-cw": "🔄", sparkles: "✨", moon: "🌙", sunrise: "🌅",
    lightbulb: "💡", trophy: "🏆", award: "🏅",
  };
  return map[iconName] || "🏅";
};

const MyBadges = () => {
  const [catalog, setCatalog] = useState<BadgeCatalogItem[]>([]);
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [catRes, earnedRes] = await Promise.all([
      (supabase as any).from("beyond_badges_catalog").select("*").order("category").order("rarity"),
      session.session
        ? (supabase as any).from("beyond_user_badges").select("badge_id, earned_at").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setCatalog(catRes.data || []);
    setEarned(earnedRes.data || []);
    setLoading(false);
  };

  const isEarned = (badgeId: string) => earned.some((e) => e.badge_id === badgeId);
  const getEarnedDate = (badgeId: string) => earned.find((e) => e.badge_id === badgeId)?.earned_at;

  const earnedCount = earned.length;
  const totalCount = catalog.length;
  const rareCounts = {
    common: catalog.filter((b) => b.rarity === "common").length,
    rare: catalog.filter((b) => b.rarity === "rare").length,
    epic: catalog.filter((b) => b.rarity === "epic").length,
    legendary: catalog.filter((b) => b.rarity === "legendary").length,
  };
  const earnedRareCounts = {
    common: catalog.filter((b) => b.rarity === "common" && isEarned(b.id)).length,
    rare: catalog.filter((b) => b.rarity === "rare" && isEarned(b.id)).length,
    epic: catalog.filter((b) => b.rarity === "epic" && isEarned(b.id)).length,
    legendary: catalog.filter((b) => b.rarity === "legendary" && isEarned(b.id)).length,
  };

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading badges...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Award className="h-7 w-7 text-amber-500" />
            My Badges
          </h1>
          <p className="text-muted-foreground">Collect them all — each badge marks a real achievement</p>
        </div>
        <Badge variant="secondary" className="gap-1 text-sm">
          <Trophy className="h-3.5 w-3.5" /> {earnedCount}/{totalCount} earned
        </Badge>
      </div>

      {/* Rarity Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {(["common", "rare", "epic", "legendary"] as const).map((rarity) => {
          const config = RARITY_CONFIG[rarity];
          return (
            <Card key={rarity}>
              <CardContent className="p-3 text-center">
                <Badge className={`${config.color} text-[10px] mb-1`}>{config.label}</Badge>
                <p className="text-lg font-bold">{earnedRareCounts[rarity]}/{rareCounts[rarity]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badge Tabs by Category */}
      <Tabs defaultValue="starter">
        <TabsList className="grid w-full grid-cols-4">
          {(["starter", "growth", "mastery", "hidden"] as const).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1 text-xs">
                <config.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(["starter", "growth", "mastery", "hidden"] as const).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const badgesInCat = catalog.filter((b) => b.category === cat);
          return (
            <TabsContent key={cat} value={cat} className="space-y-4">
              <p className="text-xs text-muted-foreground">{config.desc}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {badgesInCat.map((badge) => {
                  const owned = isEarned(badge.id);
                  const earnedAt = getEarnedDate(badge.id);
                  const rarityConf = RARITY_CONFIG[badge.rarity];
                  return (
                    <Card key={badge.id} className={`transition-all ${owned ? rarityConf.glow : "opacity-60"} ${owned ? `border ${rarityConf.border}` : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${owned ? "bg-muted/80" : "bg-muted/40"}`}>
                            {owned ? getBadgeEmoji(badge.icon_name) : <Lock className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-sm font-medium truncate ${!owned ? "text-muted-foreground" : ""}`}>{badge.name}</p>
                              {owned && <Crown className="h-3 w-3 text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge className={`text-[9px] ${rarityConf.color}`}>{rarityConf.label}</Badge>
                              {badge.xp_reward > 0 && <span className="text-[10px] text-muted-foreground">+{badge.xp_reward} XP</span>}
                              {badge.coin_reward > 0 && <span className="text-[10px] text-muted-foreground">+{badge.coin_reward} 🪙</span>}
                            </div>
                            {owned && earnedAt && (
                              <p className="text-[10px] text-green-600 mt-1">
                                ✓ Earned {new Date(earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {badgesInCat.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No badges in this category yet.</p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default MyBadges;
