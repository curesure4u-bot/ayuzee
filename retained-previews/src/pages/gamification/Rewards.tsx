import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, Gift, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Reward = {
  id: string; title: string; description: string | null; reward_type: string;
  point_cost: number; wallet_credit_amount: number | null; emoji: string | null;
  audience_role: string; stock: number | null; is_active: boolean;
};
type Redemption = {
  id: string; reward_title: string; points_spent: number; reward_type: string;
  status: string; created_at: string; fulfilled_at: string | null;
};
type Settings = { points_to_rupee_ratio: number; min_redeem_points: number };

const Rewards = () => {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [settings, setSettings] = useState<Settings>({ points_to_rupee_ratio: 10, min_redeem_points: 100 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [redeemPts, setRedeemPts] = useState(100);

  const load = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    const [{ data: stats }, { data: rw }, { data: hist }, { data: setg }] = await Promise.all([
      supabase.from("gam_user_stats").select("total_points").eq("user_id", uid).maybeSingle(),
      supabase.from("gam_rewards_catalog").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("gam_reward_redemptions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("gam_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setPoints(stats?.total_points ?? 0);
    setRewards((rw ?? []) as Reward[]);
    setHistory((hist ?? []) as Redemption[]);
    if (setg) setSettings(setg as Settings);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const redeemWallet = async () => {
    if (redeemPts < settings.min_redeem_points) {
      toast({ title: "Too few points", description: `Minimum ${settings.min_redeem_points} points required.`, variant: "destructive" });
      return;
    }
    setBusy("wallet");
    const { data, error } = await supabase.rpc("gam_redeem_to_wallet", { _points: redeemPts });
    if (error) toast({ title: "Redemption failed", description: error.message, variant: "destructive" });
    else {
      const result = data as any;
      toast({ title: "Redeemed!", description: `₹${result?.rupees ?? ""} credited to your Ayuzee wallet.` });
      await load();
    }
    setBusy(null);
  };

  const redeemReward = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.rpc("gam_redeem_catalog", { _reward_id: id });
    if (error) toast({ title: "Redemption failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Redeemed!", description: "Check 'Redemption history' for status." }); await load(); }
    setBusy(null);
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const expectedRupees = Math.floor(redeemPts / settings.points_to_rupee_ratio);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Rewards</h2>
          <p className="text-sm text-muted-foreground">Convert your points to wallet credit or redeem from the catalog.</p>
        </div>
        <Card className="px-4 py-3">
          <p className="text-xs text-muted-foreground">Available points</p>
          <p className="font-display text-2xl text-primary">{points.toLocaleString("en-IN")}</p>
        </Card>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">🎁 Catalog</TabsTrigger>
          <TabsTrigger value="convert">💰 Convert to Wallet</TabsTrigger>
          <TabsTrigger value="history">📜 History</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          {rewards.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No rewards available right now.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rewards.map((r) => {
                const canAfford = points >= r.point_cost;
                const outOfStock = r.stock !== null && r.stock <= 0;
                return (
                  <Card key={r.id} className="overflow-hidden">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-primary/10 to-transparent p-5">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-card text-3xl shadow-soft">{r.emoji || "🎁"}</div>
                      <div className="flex-1">
                        <Badge variant="secondary" className="capitalize">{r.audience_role}</Badge>
                        <h3 className="mt-1 font-semibold">{r.title}</h3>
                      </div>
                    </div>
                    <CardContent className="space-y-3 p-5">
                      {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg text-primary">{r.point_cost} pts</span>
                        {r.stock !== null && <span className="text-xs text-muted-foreground">{r.stock} left</span>}
                      </div>
                      <Button
                        className="w-full"
                        disabled={!canAfford || outOfStock || busy === r.id}
                        onClick={() => redeemReward(r.id)}
                      >
                        {busy === r.id ? "Redeeming…" :
                          outOfStock ? "Out of stock" :
                          !canAfford ? `Need ${r.point_cost - points} more pts` :
                          <><Sparkles className="h-4 w-4" /> Redeem</>}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="convert" className="mt-6">
          <Card className="mx-auto max-w-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Wallet className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-semibold">Convert points to wallet credit</h3>
                  <p className="text-xs text-muted-foreground">{settings.points_to_rupee_ratio} points = ₹1 • Min {settings.min_redeem_points} points</p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Points to redeem</label>
                <Input type="number" min={settings.min_redeem_points} step={settings.min_redeem_points} value={redeemPts}
                  onChange={(e) => setRedeemPts(Number(e.target.value || 0))} />
                <p className="mt-2 text-sm">You'll get <span className="font-semibold text-primary">₹{expectedRupees}</span> in wallet credit.</p>
              </div>
              <Button className="w-full" disabled={busy === "wallet" || redeemPts > points} onClick={redeemWallet}>
                {busy === "wallet" ? "Processing…" : redeemPts > points ? "Not enough points" : "Redeem to Wallet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
              <Gift className="mx-auto h-10 w-10 text-primary/40" />
              <p className="mt-3 text-muted-foreground">No redemptions yet.</p>
            </div>
          ) : (
            <Card><div className="divide-y">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{h.reward_title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} • {h.points_spent} pts</p>
                  </div>
                  <Badge variant={h.status === "fulfilled" ? "default" : h.status === "cancelled" ? "destructive" : "secondary"}>{h.status}</Badge>
                </div>
              ))}
            </div></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
