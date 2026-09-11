import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  HeartHandshake, IndianRupee, Users, Sparkles, ShieldCheck, Accessibility,
  CheckCircle2, TrendingUp, Building2, Mail, Quote, Leaf,
} from "lucide-react";

interface Impact {
  total_grants: number;
  total_allocated: number;
  total_utilized: number;
  donor_count: number;
  patients_sponsored: number;
  allocations_count: number;
  outcomes: { outcome: string; status: string; allocated_date: string }[];
}

const fmt = (n: number) => Math.round(n || 0).toLocaleString("en-IN");

export default function SpineCsrImpact() {
  const [data, setData] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: d } = await (supabase.rpc as any)("spine_csr_public_impact");
        setData(d as Impact);
      } catch { setData(null); }
      setLoading(false);
    })();
  }, []);

  const patients = data?.patients_sponsored || 0;
  const utilized = data?.total_utilized || 0;
  const outcomes = data?.outcomes || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-background">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        <Badge className="bg-rose-100 text-rose-700"><HeartHandshake className="h-3 w-3 mr-1" /> CSR Impact — Spinal Injury Rehabilitation</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mt-3">Helping People Walk, Move & Live Again</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Your CSR support funds rehabilitation for underprivileged spinal injury patients — combining modern rehab with Ayurvedic care. Every rupee is tracked to a patient and an outcome.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
        {/* Impact stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="pt-5 text-center">
            <Accessibility className="h-6 w-6 text-rose-600 mx-auto" />
            <p className="text-2xl font-bold mt-1">{loading ? "…" : patients}</p>
            <p className="text-xs text-muted-foreground">Patients Sponsored</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 text-center">
            <IndianRupee className="h-6 w-6 text-green-600 mx-auto" />
            <p className="text-2xl font-bold mt-1">₹{loading ? "…" : fmt(utilized)}</p>
            <p className="text-xs text-muted-foreground">Funds Deployed</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 text-center">
            <Building2 className="h-6 w-6 text-blue-600 mx-auto" />
            <p className="text-2xl font-bold mt-1">{loading ? "…" : data?.donor_count || 0}</p>
            <p className="text-xs text-muted-foreground">Supporting Partners</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 text-center">
            <TrendingUp className="h-6 w-6 text-amber-600 mx-auto" />
            <p className="text-2xl font-bold mt-1">{loading ? "…" : outcomes.length}</p>
            <p className="text-xs text-muted-foreground">Outcomes Recorded</p>
          </CardContent></Card>
        </div>

        {/* Why it matters */}
        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Accessibility, title: "The Need", text: "Spinal injury patients need months of rehab most families cannot afford." },
                { icon: Leaf, title: "The Care", text: "Integrative rehab — physiotherapy, Panchakarma, yoga & long-term follow-up." },
                { icon: TrendingUp, title: "The Impact", text: "Restored mobility, dignity and independence — measured and reported." },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-white grid place-items-center mx-auto shadow-sm"><Icon className="h-5 w-5 text-rose-600" /></div>
                    <p className="font-semibold text-sm mt-2">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{b.text}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Outcomes (anonymized) */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-rose-600" /> Outcomes We've Funded</h2>
          <p className="text-xs text-muted-foreground mt-1">Anonymized outcomes from sponsored rehabilitation — patient privacy fully protected.</p>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading impact…</p>
          ) : outcomes.length === 0 ? (
            <Card className="mt-3"><CardContent className="py-10 text-center text-sm text-muted-foreground">Outcomes will appear here as sponsored patients progress. Partner with us to create the first stories.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {outcomes.map((o, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <Quote className="h-4 w-4 text-rose-300" />
                    <p className="text-sm mt-1">{o.outcome}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 text-[9px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> {o.status}</Badge>
                      {o.allocated_date && <span className="text-[10px] text-muted-foreground">{new Date(o.allocated_date).toLocaleDateString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Transparency */}
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Full transparency</p>
              <p className="mt-1">Every allocation is tracked to a patient and a measurable outcome. Detailed utilization reports are available to partners for CSR compliance. No patient identity is shown publicly.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-rose-300">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-1"><HeartHandshake className="h-5 w-5 text-rose-600" /> Partner With Us</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Fund rehabilitation for a spinal injury patient and receive full impact reporting for your CSR programme.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button className="gap-1" onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent("We'd like to support the Ayuzee Spine CSR rehabilitation programme."), "_blank")}>
                <HeartHandshake className="h-4 w-4" /> Become a Partner
              </Button>
              <Button variant="outline" className="gap-1" onClick={() => window.open("mailto:?subject=Ayuzee Spine CSR Partnership", "_blank")}>
                <Mail className="h-4 w-4" /> Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground pt-2">
          Ayuzee Spine — integrative spinal injury rehabilitation · Impact figures update as the programme grows.
        </p>
      </div>
    </div>
  );
}
