import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Leaf, Copy, Share2, Users, ShoppingBag, Wallet, ArrowLeft } from "lucide-react";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Referral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>("");
  const [stats, setStats] = useState({ invites: 0, purchases: 0, earnings: 0 });

  useEffect(() => {
    document.title = "Refer & Earn — Ayuzee";
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/auth", { replace: true });
        return;
      }
      const userId = sessionData.session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", userId)
        .maybeSingle();
      setCode(profile?.referral_code ?? "");

      // Stats
      const { data: referredProfiles, count: invites } = await supabase
        .from("profiles")
        .select("user_id", { count: "exact" })
        .eq("referred_by", userId);

      const referredIds = (referredProfiles ?? []).map((p: { user_id: string }) => p.user_id);
      let purchases = 0;
      if (referredIds.length) {
        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .in("user_id", referredIds)
          .eq("payment_status", "paid");
        purchases = count ?? 0;
      }

      const { data: txns } = await supabase
        .from("ayuzee_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "referral_credit");
      const earnings = (txns ?? []).reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);

      setStats({ invites: invites ?? 0, purchases, earnings });
      setLoading(false);
    })();
  }, [navigate]);

  const link = code ? `${window.location.origin}/auth?ref=${code}` : "";
  const message = `🌿 Join me on Ayuzee — authentic Ayurveda, verified doctors, classical medicines. Sign up with my link to begin: ${link}`;

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied");
  };

  const shareWhatsApp = () => {
    if (!link) return;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  };

  const tiles = [
    { icon: Users, label: "Total invites", value: stats.invites },
    { icon: ShoppingBag, label: "Successful purchases", value: stats.purchases },
    { icon: Wallet, label: "Commission earned", value: formatINR(stats.earnings) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-xl font-semibold">Ayuzee</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl py-12">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Refer & Earn</span>
          <h1 className="mt-2 font-display text-4xl">Share Ayurveda, earn rewards</h1>
          <p className="mt-2 text-muted-foreground">
            Earn <strong>5%</strong> of every medicine purchase your friends make — credited as Ayuzee Money instantly.
          </p>
        </div>

        <Card className="p-6">
          <p className="text-sm font-semibold">Your unique referral link</p>
          {loading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={link} className="font-mono text-sm" />
                <Button onClick={copyLink} variant="outline">
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button onClick={shareWhatsApp} variant="hero">
                  <Share2 className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Your code: <span className="font-mono font-semibold text-foreground">{code}</span>
              </p>
            </>
          )}
        </Card>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {tiles.map((t) => (
            <Card key={t.label} className="p-6">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">{t.label}</p>
              <p className="mt-1 font-display text-3xl">{t.value}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 gradient-soft p-6">
          <h2 className="font-display text-xl">How it works</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Share your referral link with friends and family.</li>
            <li>2. They sign up using your link and become an Ayuzee member.</li>
            <li>3. When they make a medicine purchase, you earn 5% as Ayuzee Money.</li>
            <li>4. Use your Ayuzee Money to pay for your own consultations and orders.</li>
          </ol>
        </Card>
      </main>
    </div>
  );
};

export default Referral;
