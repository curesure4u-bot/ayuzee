import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Gift, Calendar, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tier { id: string; min_order_value: number; reward_name: string; reward_image_url: string | null; sort_order: number }
interface Scheme {
  id: string; title: string; scheme_type: string; start_date: string; end_date: string;
  terms: string | null; audience: string; is_active: boolean;
  reward_scheme_tiers: Tier[];
}
interface Earned { id: string; reward_name: string; reward_image_url: string | null; status: string; unlocked_at: string }
interface History { id: string; reward_name: string; action: string; amount_value: number | null; created_at: string }

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
const isEnded = (d: string) => new Date(d) < new Date();

const DoctorRewards = () => {
  const navigate = useNavigate();
  const { userId } = useDoctor();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [earned, setEarned] = useState<Earned[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await supabase.from("reward_schemes")
        .select("id,title,scheme_type,start_date,end_date,terms,audience,is_active, reward_scheme_tiers(id,min_order_value,reward_name,reward_image_url,sort_order)")
        .order("end_date", { ascending: false });
      setSchemes((s.data ?? []) as Scheme[]);

      if (userId) {
        const e = await supabase.from("doctor_rewards_earned").select("*").eq("doctor_user_id", userId).order("unlocked_at", { ascending: false });
        setEarned((e.data ?? []) as Earned[]);
        const h = await supabase.from("doctor_reward_history").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false });
        setHistory((h.data ?? []) as History[]);
      }
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="font-display text-2xl">My Rewards</h1>
        </div>

        <Tabs defaultValue="schemes" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="schemes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Schemes</TabsTrigger>
            <TabsTrigger value="earned" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Rewards Earned</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Reward History</TabsTrigger>
          </TabsList>

          {/* SCHEMES */}
          <TabsContent value="schemes" className="space-y-4 p-4">
            {loading ? <p className="text-center text-muted-foreground py-10">Loading…</p> :
              schemes.length === 0 ? <p className="text-center text-muted-foreground py-10">No schemes yet.</p> :
              schemes.map((sc) => {
                const ended = isEnded(sc.end_date);
                return (
                  <Card key={sc.id} className="overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-3 bg-muted/40 p-4">
                      <div>
                        <h3 className="font-semibold">{sc.title}</h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" /> {fmtDate(sc.start_date)} to {fmtDate(sc.end_date)}
                        </p>
                      </div>
                      <Badge variant="secondary">{sc.scheme_type}</Badge>
                    </div>
                    {ended && <p className="border-b bg-destructive/5 px-4 py-2 text-sm text-destructive">This scheme has ended on {fmtDate(sc.end_date)}</p>}
                    <div className="p-4">
                      <div className="overflow-hidden rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr><th className="p-3 text-left font-medium">Eligibility Criteria</th><th className="p-3 text-left font-medium">Reward</th></tr>
                          </thead>
                          <tbody>
                            {[...sc.reward_scheme_tiers].sort((a, b) => a.sort_order - b.sort_order).map((t) => (
                              <tr key={t.id} className="border-t">
                                <td className="p-3">₹{t.min_order_value.toLocaleString("en-IN")} and above</td>
                                <td className="p-3 font-medium">{t.reward_name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {sc.terms && (
                        <div className="mt-4">
                          <p className="font-semibold text-sm">Terms and Conditions</p>
                          <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{sc.terms}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            }
          </TabsContent>

          {/* EARNED */}
          <TabsContent value="earned" className="p-4">
            {earned.length === 0 ? (
              <div className="grid place-items-center gap-3 p-10 text-center">
                <div className="grid h-32 w-32 place-items-center rounded-full bg-accent/40">
                  <Gift className="h-16 w-16 text-primary" />
                </div>
                <p className="text-muted-foreground">Exciting rewards await you! Place your order now to enjoy the benefits.</p>
                <Button onClick={() => navigate("/shop")}><Sparkles className="mr-2 h-4 w-4" /> Order Now</Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {earned.map((e) => (
                  <Card key={e.id} className="flex items-center gap-3 p-4">
                    <div className="grid h-14 w-14 place-items-center rounded-md bg-primary/10">
                      <Trophy className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{e.reward_name}</p>
                      <p className="text-xs text-muted-foreground">Unlocked {fmtDate(e.unlocked_at)}</p>
                    </div>
                    <Badge>{e.status}</Badge>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="p-4">
            {history.length === 0 ? (
              <div className="grid place-items-center gap-3 p-10 text-center">
                <div className="grid h-32 w-32 place-items-center rounded-full bg-accent/40">
                  <Gift className="h-16 w-16 text-primary" />
                </div>
                <p className="text-muted-foreground">Once you place orders and earn rewards, your transaction history will be displayed here.</p>
                <Button onClick={() => navigate("/shop")}><Sparkles className="mr-2 h-4 w-4" /> Order Now</Button>
              </div>
            ) : (
              <Card className="divide-y">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{h.reward_name}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(h.created_at)} • {h.action}</p>
                    </div>
                    {h.amount_value && <span className="font-semibold">₹{h.amount_value}</span>}
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default DoctorRewards;
