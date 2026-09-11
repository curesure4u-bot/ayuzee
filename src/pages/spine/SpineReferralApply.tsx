import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, Megaphone, Stethoscope, Gift, IndianRupee, CheckCircle2,
  Send, Sparkles, TrendingUp, Users,
} from "lucide-react";

interface Rule {
  referrer_type: string;
  tier: string;
  reward_type: string;
  reward_value: number;
  referred_benefit?: string | null;
}

const types = [
  { key: "patient", icon: Heart, color: "green", label: "Patient Advocate", blurb: "Refer friends & family, earn wallet credit on every visit." },
  { key: "influencer", icon: Megaphone, color: "pink", label: "Influencer / Creator", blurb: "Share with your audience, earn cash commission per booking." },
  { key: "medico", icon: Stethoscope, color: "blue", label: "Medical Referrer", blurb: "Refer patients ethically — priority care, reciprocal network, outcome reports." },
];

const blank = { applicant_type: "patient", name: "", phone: "", email: "", handle: "", audience_size: "", message: "" };

export default function SpineReferralApply() {
  const [form, setForm] = useState({ ...blank });
  const [rules, setRules] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.from("spine_referral_rules") as any).select("*");
        setRules((data as Rule[]) || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const submit = async () => {
    if (!form.name || !form.phone) { toast.error("Enter your name and phone"); return; }
    setSaving(true);
    try {
      const { error } = await (supabase.from("spine_referral_applications") as any).insert({
        applicant_type: form.applicant_type, name: form.name, phone: form.phone,
        email: form.email || null, handle: form.handle || null,
        audience_size: form.audience_size || null, message: form.message || null, status: "new",
      });
      if (error) { toast.error("Submission failed: " + error.message); }
      else { setDone(true); toast.success("Application received!"); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const rewardOf = (type: string) => {
    const r = rules.filter((x) => x.referrer_type === type).sort((a, b) => a.reward_value - b.reward_value);
    if (!r.length) return null;
    return r;
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-3">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100"><CheckCircle2 className="h-8 w-8 text-green-600" /></div>
            <h1 className="text-xl font-bold">Application Received!</h1>
            <p className="text-sm text-muted-foreground">Thank you for joining the Ayuzee Spine referral network. Our team will review and contact you with your referral code soon.</p>
            <Button onClick={() => { setForm({ ...blank }); setDone(false); }} variant="outline">Submit Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center">
          <Badge className="bg-violet-100 text-violet-700"><Sparkles className="h-3 w-3 mr-1" /> Ayuzee Spine Partner Program</Badge>
          <h1 className="text-3xl font-bold mt-3">Refer. Earn. Help People Heal.</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Join our network and earn rewards for every person you help get expert spine & back-pain care.</p>
        </div>

        {/* Type cards with rewards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {types.map((t) => {
            const Icon = t.icon;
            const r = rewardOf(t.key);
            const top = r && r[r.length - 1];
            return (
              <Card key={t.key} className={`cursor-pointer transition ${form.applicant_type === t.key ? `border-${t.color}-400 ring-2 ring-${t.color}-200` : "hover:shadow-md"}`} onClick={() => setForm({ ...form, applicant_type: t.key })}>
                <CardContent className="pt-4 text-center">
                  <div className={`w-10 h-10 rounded-full bg-${t.color}-100 grid place-items-center mx-auto`}><Icon className={`h-5 w-5 text-${t.color}-600`} /></div>
                  <p className="font-semibold text-sm mt-2">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t.blurb}</p>
                  {top && (
                    <div className="mt-2 rounded-md bg-muted/50 p-1.5">
                      <p className="text-xs font-bold text-green-700">
                        {top.reward_type === "recognition" ? "Recognition & Network" : top.reward_type === "percent" ? `Up to ${top.reward_value}%` : `Up to ₹${top.reward_value}`}
                      </p>
                    </div>
                  )}
                  {form.applicant_type === t.key && <Badge className={`bg-${t.color}-100 text-${t.color}-700 text-[9px] mt-2`}>✓ Selected</Badge>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><TrendingUp className="h-4 w-4" /> How it works</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              {[
                { n: "1", t: "Apply", d: "Fill this form" },
                { n: "2", t: "Get your code", d: "We send your unique referral code" },
                { n: "3", t: "Share", d: "Share with friends / audience" },
                { n: "4", t: "Earn", d: "Get rewarded on every booking" },
              ].map((s) => (
                <div key={s.n}>
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 grid place-items-center font-bold text-sm mx-auto">{s.n}</div>
                  <p className="text-xs font-medium mt-1">{s.t}</p>
                  <p className="text-[10px] text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application form */}
        <Card className="border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Send className="h-4 w-4" /> Apply to Join</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">I am a...</label>
              <Select value={form.applicant_type} onValueChange={(v) => setForm({ ...form, applicant_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{types.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
              <div><label className="text-xs font-medium">Phone / WhatsApp</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Email</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional" /></div>
              <div><label className="text-xs font-medium">{form.applicant_type === "medico" ? "Clinic / Specialty" : "Social Handle"}</label><Input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder={form.applicant_type === "medico" ? "Clinic name" : "@handle"} /></div>
            </div>
            {form.applicant_type === "influencer" && (
              <div><label className="text-xs font-medium">Audience Size</label><Input value={form.audience_size} onChange={(e) => setForm({ ...form, audience_size: e.target.value })} placeholder="e.g. 25K followers" /></div>
            )}
            <div><label className="text-xs font-medium">Message (optional)</label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-16" placeholder="Tell us why you'd like to join..." /></div>
            <Button className="w-full gap-1" onClick={submit} disabled={saving}><Send className="h-4 w-4" /> {saving ? "Submitting..." : "Submit Application"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
