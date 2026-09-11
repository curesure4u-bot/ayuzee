import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, UserPlus, Plus, Save, Share2, Copy, IndianRupee, Trophy, Crown,
  Award, TrendingUp, Wallet, CheckCircle2, Link2, Stethoscope, Megaphone,
  Heart, Gift, Sparkles, ArrowUpRight, Clock, X,
} from "lucide-react";

// ─── Types ───
interface Referrer {
  id: string;
  referrer_type: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  handle?: string | null;
  referral_code: string;
  tier: string;
  status: string;
  ethical_mode?: boolean;
  reward_mode?: string | null;
  total_referrals: number;
  total_conversions: number;
  total_earned: number;
  total_paid: number;
}
interface Referral {
  id: string;
  referrer_id?: string | null;
  referral_code?: string | null;
  referred_name: string;
  referred_phone?: string | null;
  condition?: string | null;
  status: string;
  reward_amount?: number | null;
  reward_status?: string | null;
  created_at: string;
}
interface Rule {
  id: string;
  referrer_type: string;
  tier: string;
  reward_type: string;
  reward_value: number;
  referred_benefit?: string | null;
  min_conversions_to_upgrade?: number | null;
}

const typeMeta: Record<string, { icon: any; color: string; label: string; blurb: string }> = {
  patient: { icon: Heart, color: "green", label: "Patient Advocate", blurb: "Recovered patients referring friends & family" },
  influencer: { icon: Megaphone, color: "pink", label: "Influencer", blurb: "Creators & wellness partners with an audience" },
  medico: { icon: Stethoscope, color: "blue", label: "Medical Referrer", blurb: "Doctors / physios (ethical recognition mode)" },
};
const tierMeta: Record<string, { icon: any; color: string }> = {
  bronze: { icon: Award, color: "text-amber-700" },
  silver: { icon: Award, color: "text-slate-400" },
  gold: { icon: Crown, color: "text-amber-500" },
};

function genCode(name: string, type: string) {
  const base = (name || type).replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "SPINE";
  const rand = Math.floor(100 + Math.random() * 900);
  return `${base}${rand}`;
}

const blankRef = { referrer_type: "patient", name: "", phone: "", email: "", handle: "", notes: "" };
const blankTrack = { referral_code: "", referred_name: "", referred_phone: "", condition: "" };

export default function SpineReferralNetwork() {
  const [tab, setTab] = useState("referrers");
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRefForm, setShowRefForm] = useState(false);
  const [refForm, setRefForm] = useState({ ...blankRef });
  const [track, setTrack] = useState({ ...blankTrack });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: r } = await (supabase.from("spine_referrers") as any).select("*").order("total_conversions", { ascending: false });
      setReferrers((r as Referrer[]) || []);
      const { data: rf } = await (supabase.from("spine_referrals") as any).select("*").order("created_at", { ascending: false });
      setReferrals((rf as Referral[]) || []);
      const { data: ru } = await (supabase.from("spine_referral_rules") as any).select("*");
      setRules((ru as Rule[]) || []);
    } catch { /* keep empty */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const ruleFor = (type: string, tier: string) => rules.find((x) => x.referrer_type === type && x.tier === tier);

  const createReferrer = async () => {
    if (!refForm.name) { toast.error("Enter referrer name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const code = genCode(refForm.name, refForm.referrer_type);
      const ethical = refForm.referrer_type === "medico";
      const { error } = await (supabase.from("spine_referrers") as any).insert({
        owner_id: user?.id || null,
        referrer_type: refForm.referrer_type,
        name: refForm.name, phone: refForm.phone || null, email: refForm.email || null,
        handle: refForm.handle || null, referral_code: code, tier: "bronze", status: "active",
        ethical_mode: ethical, reward_mode: ethical ? "recognition" : (refForm.referrer_type === "influencer" ? "cash" : "wallet"),
        notes: refForm.notes || null,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else { toast.success(`${refForm.name} added · code ${code}`); setRefForm({ ...blankRef }); setShowRefForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  // Attribute a referred lead to a code
  const trackReferral = async () => {
    if (!track.referral_code || !track.referred_name) { toast.error("Enter referral code and referred person's name"); return; }
    const ref = referrers.find((x) => x.referral_code.toUpperCase() === track.referral_code.toUpperCase());
    if (!ref) { toast.error("No referrer found with that code"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_referrals") as any).insert({
        owner_id: user?.id || null, referrer_id: ref.id, referral_code: ref.referral_code,
        referred_name: track.referred_name, referred_phone: track.referred_phone || null,
        condition: track.condition || null, status: "pending", reward_status: "pending",
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else {
        await (supabase.from("spine_referrers") as any).update({ total_referrals: (ref.total_referrals || 0) + 1 }).eq("id", ref.id);
        toast.success(`Referral logged under ${ref.name}`); setTrack({ ...blankTrack }); load();
      }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  // Mark a referral converted → compute reward, credit referrer, maybe upgrade tier
  const convert = async (rf: Referral) => {
    const ref = referrers.find((x) => x.id === rf.referrer_id);
    if (!ref) { toast.error("Referrer not found"); return; }
    const rule = ruleFor(ref.referrer_type, ref.tier);
    let reward = 0;
    if (rule) {
      if (rule.reward_type === "percent") reward = 0; // percent handled at billing; log 0 here
      else if (rule.reward_type === "recognition") reward = 0;
      else reward = Number(rule.reward_value) || 0;
    }
    try {
      await (supabase.from("spine_referrals") as any).update({
        status: "converted", converted_at: new Date().toISOString(),
        reward_amount: reward, reward_status: reward > 0 ? "approved" : "na",
      }).eq("id", rf.id);

      const newConversions = (ref.total_conversions || 0) + 1;
      const newEarned = Number(ref.total_earned || 0) + reward;
      // tier upgrade check
      let newTier = ref.tier;
      const curRule = ruleFor(ref.referrer_type, ref.tier);
      if (curRule?.min_conversions_to_upgrade && newConversions >= curRule.min_conversions_to_upgrade) {
        newTier = ref.tier === "bronze" ? "silver" : ref.tier === "silver" ? "gold" : "gold";
      }
      await (supabase.from("spine_referrers") as any).update({
        total_conversions: newConversions, total_earned: newEarned, tier: newTier,
      }).eq("id", ref.id);

      toast.success(newTier !== ref.tier ? `Converted! ${ref.name} upgraded to ${newTier.toUpperCase()} 🎉` : "Referral converted!");
      load();
    } catch { toast.error("Update failed"); }
  };

  const markPaid = async (rf: Referral) => {
    const ref = referrers.find((x) => x.id === rf.referrer_id);
    try {
      await (supabase.from("spine_referrals") as any).update({ reward_status: "paid" }).eq("id", rf.id);
      if (ref) await (supabase.from("spine_referrers") as any).update({ total_paid: Number(ref.total_paid || 0) + Number(rf.reward_amount || 0) }).eq("id", ref.id);
      toast.success("Marked paid"); load();
    } catch { toast.error("Update failed"); }
  };

  const copyLink = (code: string) => {
    const link = `https://ayuzee.com/spine?ref=${code}`;
    navigator.clipboard?.writeText(link).then(() => toast.success("Referral link copied")).catch(() => toast.info(link));
  };
  const shareLink = (ref: Referrer) => {
    const link = `https://ayuzee.com/spine?ref=${ref.referral_code}`;
    const text = `Get expert spine & back pain care at Ayuzee. Use my code ${ref.referral_code} for a special first-visit offer! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Stats
  const totalEarned = referrers.reduce((a, r) => a + Number(r.total_earned || 0), 0);
  const totalConversions = referrers.reduce((a, r) => a + (r.total_conversions || 0), 0);
  const pendingPayout = referrals.filter((r) => r.reward_status === "approved").reduce((a, r) => a + Number(r.reward_amount || 0), 0);
  const leaderboard = [...referrers].sort((a, b) => (b.total_conversions || 0) - (a.total_conversions || 0)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-violet-600" /> Referral & Influencer Network</h1>
          <p className="text-muted-foreground mt-1">Turn patients, influencers & medicos into your growth engine — track, reward, scale.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-violet-600">{referrers.length}</p><p className="text-xs text-muted-foreground">Referrers</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{totalConversions}</p><p className="text-xs text-muted-foreground">Conversions</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-amber-600 flex items-center justify-center"><IndianRupee className="h-5 w-5" />{Math.round(totalEarned).toLocaleString()}</p><p className="text-xs text-muted-foreground">Rewards Earned</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-rose-600 flex items-center justify-center"><IndianRupee className="h-5 w-5" />{Math.round(pendingPayout).toLocaleString()}</p><p className="text-xs text-muted-foreground">Pending Payout</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="referrers" className="text-[11px] gap-1"><Users className="h-3 w-3" /> Referrers</TabsTrigger>
          <TabsTrigger value="track" className="text-[11px] gap-1"><Link2 className="h-3 w-3" /> Track</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-[11px] gap-1"><Trophy className="h-3 w-3" /> Leaders</TabsTrigger>
          <TabsTrigger value="payouts" className="text-[11px] gap-1"><Wallet className="h-3 w-3" /> Payouts</TabsTrigger>
          <TabsTrigger value="rules" className="text-[11px] gap-1"><Gift className="h-3 w-3" /> Rewards</TabsTrigger>
        </TabsList>

        {/* ── REFERRERS ── */}
        <TabsContent value="referrers" className="space-y-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => setShowRefForm((v) => !v)} className="gap-1"><UserPlus className="h-4 w-4" /> Add Referrer</Button></div>
          {showRefForm && (
            <Card className="border-violet-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">New Referrer</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(typeMeta).map(([k, m]) => {
                    const Icon = m.icon;
                    return (
                      <button key={k} type="button" onClick={() => setRefForm({ ...refForm, referrer_type: k })}
                        className={`rounded-md border p-2 text-center text-xs transition ${refForm.referrer_type === k ? `border-${m.color}-400 bg-${m.color}-50` : "border-border hover:bg-muted/50"}`}>
                        <Icon className={`h-4 w-4 mx-auto text-${m.color}-600`} />
                        <span className="block mt-1 font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">{typeMeta[refForm.referrer_type]?.blurb}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Name</label><Input value={refForm.name} onChange={(e) => setRefForm({ ...refForm, name: e.target.value })} placeholder="Full name / clinic" /></div>
                  <div><label className="text-xs font-medium">Phone</label><Input value={refForm.phone} onChange={(e) => setRefForm({ ...refForm, phone: e.target.value })} placeholder="+91..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Email</label><Input value={refForm.email} onChange={(e) => setRefForm({ ...refForm, email: e.target.value })} placeholder="Optional" /></div>
                  <div><label className="text-xs font-medium">Handle / Clinic</label><Input value={refForm.handle} onChange={(e) => setRefForm({ ...refForm, handle: e.target.value })} placeholder="@handle or clinic name" /></div>
                </div>
                {refForm.referrer_type === "medico" && (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-[11px] text-blue-800">
                    Medical referrers use <b>ethical recognition mode</b> (priority, reciprocal network, outcome reports) — not cash-per-patient, in line with medical ethics guidelines.
                  </div>
                )}
                <Button className="w-full gap-1" onClick={createReferrer} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Creating..." : "Create & Generate Code"}</Button>
              </CardContent>
            </Card>
          )}

          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
            referrers.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No referrers yet. Add your first patient advocate, influencer or medical referrer.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {referrers.map((r) => {
                  const meta = typeMeta[r.referrer_type] || typeMeta.patient;
                  const Icon = meta.icon;
                  const TierIcon = (tierMeta[r.tier] || tierMeta.bronze).icon;
                  return (
                    <Card key={r.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded bg-${meta.color}-100 grid place-items-center`}><Icon className={`h-4 w-4 text-${meta.color}-600`} /></div>
                            <div>
                              <p className="font-semibold text-sm">{r.name}</p>
                              <p className="text-[11px] text-muted-foreground">{meta.label}{r.handle ? ` · ${r.handle}` : ""}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] gap-0.5"><TierIcon className={`h-3 w-3 ${(tierMeta[r.tier] || tierMeta.bronze).color}`} /> {r.tier}</Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 p-2">
                          <code className="text-sm font-bold text-violet-700">{r.referral_code}</code>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto" onClick={() => copyLink(r.referral_code)}><Copy className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => shareLink(r)}><Share2 className="h-3.5 w-3.5" /></Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                          <div><p className="text-sm font-bold">{r.total_referrals}</p><p className="text-[9px] text-muted-foreground">Referred</p></div>
                          <div><p className="text-sm font-bold text-green-600">{r.total_conversions}</p><p className="text-[9px] text-muted-foreground">Converted</p></div>
                          <div><p className="text-sm font-bold text-amber-600">₹{Math.round(Number(r.total_earned || 0))}</p><p className="text-[9px] text-muted-foreground">Earned</p></div>
                        </div>
                        {r.ethical_mode && <p className="text-[10px] text-blue-700 mt-2 flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Ethical recognition mode</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </TabsContent>

        {/* ── TRACK ── */}
        <TabsContent value="track" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Link2 className="h-4 w-4" /> Log a Referred Lead</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Referral Code</label><Input value={track.referral_code} onChange={(e) => setTrack({ ...track, referral_code: e.target.value.toUpperCase() })} placeholder="e.g. RAMESH123" /></div>
                <div><label className="text-xs font-medium">Referred Person</label><Input value={track.referred_name} onChange={(e) => setTrack({ ...track, referred_name: e.target.value })} placeholder="Name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Phone</label><Input value={track.referred_phone} onChange={(e) => setTrack({ ...track, referred_phone: e.target.value })} placeholder="+91..." /></div>
                <div><label className="text-xs font-medium">Condition</label><Input value={track.condition} onChange={(e) => setTrack({ ...track, condition: e.target.value })} placeholder="e.g. Sciatica" /></div>
              </div>
              <Button className="w-full gap-1" onClick={trackReferral} disabled={saving}><Plus className="h-4 w-4" /> {saving ? "Logging..." : "Log Referral"}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">All Referrals</CardTitle></CardHeader>
            <CardContent>
              {referrals.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No referrals logged yet.</p> : (
                <div className="space-y-1.5">
                  {referrals.map((rf) => (
                    <div key={rf.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{rf.referred_name} {rf.condition ? <span className="text-muted-foreground font-normal">· {rf.condition}</span> : null}</p>
                        <p className="text-[11px] text-muted-foreground">code {rf.referral_code} · {new Date(rf.created_at).toLocaleDateString()}{rf.reward_amount ? ` · ₹${rf.reward_amount}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge className={rf.status === "converted" ? "bg-green-100 text-green-700 text-[9px]" : "bg-amber-100 text-amber-700 text-[9px]"}>{rf.status}</Badge>
                        {rf.status !== "converted" && <Button size="sm" variant="ghost" className="h-7 gap-1 text-green-600 text-[11px]" onClick={() => convert(rf)}><CheckCircle2 className="h-3.5 w-3.5" /> Convert</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LEADERBOARD ── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="pt-4 text-xs text-muted-foreground flex gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Referrers auto-upgrade tiers as they convert more: <b>Bronze → Silver → Gold</b>. Higher tiers unlock bigger rewards. A recovered patient can grow into an influencer.</span>
            </CardContent>
          </Card>
          {leaderboard.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No referrers ranked yet.</CardContent></Card> : (
            <div className="space-y-2">
              {leaderboard.map((r, i) => {
                const meta = typeMeta[r.referrer_type] || typeMeta.patient;
                return (
                  <Card key={r.id} className={i === 0 ? "border-amber-300" : ""}>
                    <CardContent className="py-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground">{meta.label} · {r.tier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{r.total_conversions}</p>
                        <p className="text-[9px] text-muted-foreground">conversions</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── PAYOUTS ── */}
        <TabsContent value="payouts" className="space-y-3">
          <Card className="border-rose-200">
            <CardContent className="pt-4 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Approved & pending payout</p><p className="text-xl font-bold text-rose-600 flex items-center"><IndianRupee className="h-5 w-5" />{Math.round(pendingPayout).toLocaleString()}</p></div>
              <Wallet className="h-8 w-8 text-rose-300" />
            </CardContent>
          </Card>
          {referrals.filter((r) => Number(r.reward_amount || 0) > 0).length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No cash rewards yet. Convert referrals from patient/influencer referrers to generate payouts.</CardContent></Card>
          ) : (
            <div className="space-y-1.5">
              {referrals.filter((r) => Number(r.reward_amount || 0) > 0).map((rf) => {
                const ref = referrers.find((x) => x.id === rf.referrer_id);
                return (
                  <div key={rf.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{ref?.name || rf.referral_code} · ₹{rf.reward_amount}</p>
                      <p className="text-[11px] text-muted-foreground">for {rf.referred_name} · {new Date(rf.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge className={rf.reward_status === "paid" ? "bg-green-100 text-green-700 text-[9px]" : "bg-amber-100 text-amber-700 text-[9px]"}>{rf.reward_status}</Badge>
                      {rf.reward_status === "approved" && <Button size="sm" variant="ghost" className="h-7 gap-1 text-green-600 text-[11px]" onClick={() => markPaid(rf)}><CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── RULES ── */}
        <TabsContent value="rules" className="space-y-4">
          {Object.entries(typeMeta).map(([type, meta]) => {
            const Icon = meta.icon;
            const typeRules = rules.filter((r) => r.referrer_type === type).sort((a, b) => a.reward_value - b.reward_value);
            return (
              <Card key={type}>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Icon className={`h-4 w-4 text-${meta.color}-600`} /> {meta.label}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-[11px] text-muted-foreground mb-2">{meta.blurb}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["bronze", "silver", "gold"].map((tier) => {
                      const rule = typeRules.find((r) => r.tier === tier);
                      const TierIcon = (tierMeta[tier] || tierMeta.bronze).icon;
                      return (
                        <div key={tier} className="rounded-md border p-2.5">
                          <p className="text-xs font-semibold flex items-center gap-1 capitalize"><TierIcon className={`h-3.5 w-3.5 ${(tierMeta[tier] || tierMeta.bronze).color}`} /> {tier}</p>
                          {rule ? (
                            <>
                              <p className="text-sm font-bold mt-1">
                                {rule.reward_type === "recognition" ? "Recognition" : rule.reward_type === "percent" ? `${rule.reward_value}%` : `₹${rule.reward_value}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Referred gets: {rule.referred_benefit}</p>
                              {rule.min_conversions_to_upgrade && <p className="text-[9px] text-muted-foreground mt-1">↑ {rule.min_conversions_to_upgrade} conversions to next tier</p>}
                            </>
                          ) : <p className="text-[10px] text-muted-foreground mt-1">—</p>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="border-violet-200 bg-violet-50/30">
            <CardContent className="pt-4 text-xs text-muted-foreground flex gap-2">
              <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
              <span>Share the public sign-up page so patients & creators can apply to join: <b>/spine/refer</b>. Approve applicants here to generate their code.</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
