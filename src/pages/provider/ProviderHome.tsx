import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2, Hotel, Sparkles, HeartHandshake, Hospital,
  CalendarDays, Users, Star, ShieldCheck, Clock, LogOut,
} from "lucide-react";

type Provider = Tables<"service_providers">;

const TYPE_ICON = {
  hospital: Hospital, therapist: HeartHandshake, panchakarma: Sparkles, resort: Hotel,
} as const;

const ProviderHome = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        navigate("/provider/auth", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      setProvider(data);
      setLoading(false);
    })();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-soft">
        <div className="container py-20 text-center text-muted-foreground">Loading your dashboard…</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen gradient-soft">
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">No provider profile found for this account.</p>
          <Button className="mt-4" onClick={() => navigate("/provider/auth")}>Complete signup</Button>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICON[provider.provider_type as keyof typeof TYPE_ICON] ?? Building2;
  const verified = provider.is_approved && provider.is_verified;

  return (
    <div className="min-h-screen gradient-soft">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Ayuzee Partners</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container py-10">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <TypeIcon className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-2xl">{provider.business_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {provider.contact_person} • {provider.city}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{provider.provider_type}</Badge>
                  {verified ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-400 text-amber-700">
                      <Clock className="mr-1 h-3 w-3" /> Pending review
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="hero">Edit facility profile</Button>
          </div>
        </div>

        {!verified && (
          <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">Verification in progress</p>
            <p className="mt-1 text-sm">
              Our team is reviewing your documents. You'll be notified by email and WhatsApp within 24–48 hours. Bookings open as soon as you're approved.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: CalendarDays, label: "Bookings (this month)", value: 0 },
            { icon: Users, label: "Patients served", value: 0 },
            { icon: Star, label: "Average rating", value: provider.rating.toFixed(1) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <p className="mt-3 text-2xl font-display">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Add photos and a description of your facility</li>
              <li>• List your services & packages</li>
              <li>• Set your availability and pricing</li>
              <li>• Invite therapists / staff to your team</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Need help?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our partner success team will reach out within 24 hours of approval to onboard your facility and configure your packages.
            </p>
            <Button variant="outline" className="mt-4">Contact support</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderHome;
