import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Info, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface Wallet { id: string; balance: number; lifetime_earned: number; lifetime_spent: number }
interface Txn { id: string; amount: number; type: string; reason: string | null; created_at: string; expires_at: string | null }

const AyuzeeMoney = () => {
  const { userId } = useDoctor();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const w = await supabase.from("ayuzee_wallets").select("id, balance, lifetime_earned, lifetime_spent").eq("user_id", userId).maybeSingle();
      setWallet(w.data as Wallet | null);
      const t = await supabase.from("ayuzee_transactions").select("id, amount, type, reason, created_at, expires_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      setTxns((t.data ?? []) as Txn[]);
    })();
  }, [userId]);

  const balance = wallet?.balance ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="overflow-hidden">
        <div className="gradient-leaf p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm opacity-90"><Wallet className="h-4 w-4" /> Ayuzee Money Balance</p>
              <p className="mt-2 font-display text-5xl">₹{balance.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm opacity-90">You can use up to <strong>3.00%</strong> of total order value as Ayuzee Money</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs opacity-80">Lifetime earned</div>
              <div className="text-2xl font-semibold">₹{wallet?.lifetime_earned ?? 0}</div>
              <div className="mt-2 text-xs opacity-80">Lifetime spent</div>
              <div className="text-2xl font-semibold">₹{wallet?.lifetime_spent ?? 0}</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="history">Transactions</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4">
          <Card className="p-6">
            <h2 className="font-display text-xl">What is Ayuzee Money?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ayuzee Money is a loyalty scheme valid only on the Ayuzee platform (Website &amp; App). You can redeem
              part or your entire wallet balance to avail discounts on purchases, or earn cashback on certain
              orders. Read the terms carefully.
            </p>
            <p className="mt-3 rounded-md bg-accent p-3 text-sm">
              <strong>Please note:</strong> <em>Ayuzee Money cannot be used in the form of real money and is not a substitute for the same.</em>
            </p>
            <h3 className="mt-6 font-semibold">FAQ</h3>
            <div className="mt-2 space-y-3 text-sm">
              <div>
                <p className="font-medium">What can Ayuzee Money be redeemed for?</p>
                <p className="text-muted-foreground">Only towards medicines available on Ayuzee. Eligible medicines may change at our discretion.</p>
              </div>
              <div>
                <p className="font-medium">When does Ayuzee Money expire?</p>
                <p className="text-muted-foreground">Usually 3 months from the date of credit. Check your wallet regularly.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="p-4">
            {txns.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">No transactions yet. Earn Ayuzee Money on your next purchase.</p>
            ) : (
              <div className="divide-y">
                {txns.map((t) => {
                  const isCredit = ["credit", "cashback", "refund_reversal"].includes(t.type);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${isCredit ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                          {isCredit ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium capitalize">{t.type}</p>
                          <p className="text-xs text-muted-foreground">{t.reason ?? "—"} • {new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${isCredit ? "text-primary" : "text-foreground"}`}>
                        {isCredit ? "+" : "-"}₹{t.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="mt-4">
          <Card className="p-6 text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-3 font-display text-lg text-foreground">Terms &amp; Conditions for Ayuzee Money</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Ayuzee Money cannot be transferred from one account to another.</li>
              <li>Ayuzee Money can only be added and used on the Ayuzee website &amp; App.</li>
              <li>A user can use Ayuzee Money up to <strong>3% of the total sales order value</strong> (subject to wallet availability and limit).</li>
              <li>A user can use a maximum of <strong>₹25,000 on a single order</strong>.</li>
              <li>Eligibility is per the prescribed user category, subject to discretion of the company.</li>
              <li>Valid on online or COD orders placed via App/Website. Not eligible for offline orders.</li>
              <li>Applicable on all brands except select exclusions.</li>
              <li>Cannot be combined with any other offer or coupon code.</li>
              <li>Ayuzee Money is usually valid for <strong>3 months</strong>. After that, it expires.</li>
              <li>Automatically applied at checkout.</li>
              <li>Cashback is granted on eligible orders and credited within 48–72 hours of successful transaction.</li>
              <li>No cashback for cancelled orders. Refunds adjust cashback proportionally.</li>
              <li>Cashback is wallet credit only — not redeemable as cash or to a bank account.</li>
              <li>Promotional credits may expire at the company's discretion (minimum 60 days from last order).</li>
            </ol>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AyuzeeMoney;
