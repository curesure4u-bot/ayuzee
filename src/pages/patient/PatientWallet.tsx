import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowDown, ArrowUp, Sparkles } from "lucide-react";

interface Wallet {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

interface Txn {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  created_at: string;
}

const CREDIT_TYPES = new Set(["credit", "cashback", "refund_reversal"]);

const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const PatientWallet = () => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
  const [txns, setTxns] = useState<Txn[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return setLoading(false);

      const [{ data: w }, { data: t }] = await Promise.all([
        supabase.from("ayuzee_wallets").select("balance, lifetime_earned, lifetime_spent").eq("user_id", uid).maybeSingle(),
        supabase.from("ayuzee_transactions").select("id, amount, type, reason, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      ]);

      if (w) setWallet(w as Wallet);
      setTxns((t as Txn[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">💰 Ayuzee Money</h1>
        <p className="text-sm text-muted-foreground">Your rewards wallet, cashback, and credit history.</p>
      </header>

      <div className="overflow-hidden rounded-3xl gradient-leaf p-6 text-primary-foreground shadow-soft">
        <p className="text-xs uppercase tracking-wider opacity-80">Available Balance</p>
        <p className="mt-2 font-display text-4xl font-semibold">{formatINR(wallet.balance)}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-background/20 px-3 py-1.5 font-semibold">Earned: {formatINR(wallet.lifetime_earned)}</span>
          <span className="rounded-full bg-background/20 px-3 py-1.5 font-semibold">Redeemed: {formatINR(wallet.lifetime_spent)}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {txns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions yet. Earn rewards by completing consultations and orders.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {txns.map((t) => {
                const isCredit = CREDIT_TYPES.has(t.type);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          isCredit ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {isCredit ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{t.reason || t.type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${isCredit ? "text-primary" : "text-destructive"}`}>
                      {isCredit ? "+" : "-"}{formatINR(t.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> How to earn Ayuzee Money</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>✓ Complete a consultation — earn commission credits</li>
            <li>✓ Refer a friend — earn referral bonus</li>
            <li>✓ Loyalty rewards on orders</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientWallet;
