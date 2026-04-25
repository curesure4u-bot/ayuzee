import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, FileText, Users, Building2, Stethoscope, Sparkles, Trophy, BarChart3, Megaphone, HandHeart } from "lucide-react";

type TabKey = "patients" | "doctors" | "donors" | "hospitals";
type Item = { icon: React.ReactNode; title: string; sub: string; to: string };

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "patients", label: "For Patients", icon: <Heart className="h-4 w-4" /> },
  { key: "doctors", label: "For Doctors", icon: <Stethoscope className="h-4 w-4" /> },
  { key: "donors", label: "For Donors", icon: <HandHeart className="h-4 w-4" /> },
  { key: "hospitals", label: "For Hospitals", icon: <Building2 className="h-4 w-4" /> },
];

const itemsByTab: Record<TabKey, Item[]> = {
  patients: [
    { icon: <FileText className="h-4 w-4 text-primary" />, title: "Apply for Free Treatment", sub: "ATMRI Trust pays the hospital directly", to: "/atmri-help/apply" },
    { icon: <Users className="h-4 w-4 text-primary" />, title: "Live Sponsored Cases", sub: "Browse patients receiving treatment now", to: "/atmri-help/cases" },
    { icon: <Megaphone className="h-4 w-4 text-primary" />, title: "Active Campaigns", sub: "Trust-led healing campaigns this month", to: "/atmri-help/campaigns" },
    { icon: <BarChart3 className="h-4 w-4 text-primary" />, title: "Impact Dashboard", sub: "How donations are spent — full transparency", to: "/atmri-help/impact" },
  ],
  doctors: [
    { icon: <Trophy className="h-4 w-4 text-amber-600" />, title: "Take the Healing Pledge", sub: "Donate consults · earn the gold badge", to: "/atmri-help/pledge" },
    { icon: <Stethoscope className="h-4 w-4 text-primary" />, title: "Sign Patient Cases", sub: "Countersign assigned ATMRI cases", to: "/atmri-help/cases" },
    { icon: <Trophy className="h-4 w-4 text-primary" />, title: "Doctor Leaderboard", sub: "Top contributing AYUSH doctors", to: "/atmri-help/leaderboard" },
  ],
  donors: [
    { icon: <Heart className="h-4 w-4 text-primary" />, title: "Donate to Trust Corpus", sub: "80G receipt · FCRA compliant", to: "/atmri-help" },
    { icon: <Sparkles className="h-4 w-4 text-primary" />, title: "CSR Partnership", sub: "Corporate sponsorship & MOU options", to: "/atmri-help/csr" },
    { icon: <BarChart3 className="h-4 w-4 text-primary" />, title: "Impact Reports", sub: "See exactly where your money went", to: "/atmri-help/impact" },
  ],
  hospitals: [
    { icon: <Building2 className="h-4 w-4 text-primary" />, title: "Partner Hospitals", sub: "AYUSH hospitals hosting Trust patients", to: "/atmri-help/hospitals" },
    { icon: <FileText className="h-4 w-4 text-primary" />, title: "Become a Partner Hospital", sub: "Sign MOU · CSR recognition · Ayuzee listing", to: "/partner/apply?type=hospital_mou" },
  ],
};

export const AyushHelpMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("patients");
  const activeItems = itemsByTab[activeTab];

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition-all hover:bg-amber-100"
      >
        <Heart className="h-3.5 w-3.5 fill-amber-600 text-amber-600" />
        Ayush Help
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-[80] mt-1 w-[860px] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 slide-in-from-top-2">
          <div className="grid grid-cols-[180px_1fr_240px]">
            {/* Left tabs */}
            <div className="border-r border-border bg-muted/40 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onMouseEnter={() => setActiveTab(tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-r-2 border-primary bg-background font-medium text-foreground"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Center content */}
            <div className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {tabs.find((t) => t.key === activeTab)?.icon}
                {tabs.find((t) => t.key === activeTab)?.label}
              </h3>
              <div className="grid gap-1">
                {activeItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right promo */}
            <div className="flex flex-col gap-3 border-l border-border bg-gradient-to-b from-amber-50 to-green-50 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">🏛️ ATMRI Trust</div>
              <div className="space-y-1 text-xs text-foreground/80">
                <div className="font-semibold">Registered Trust</div>
                <div>80G · 12A · 12AA</div>
                <div>FCRA Compliant</div>
              </div>
              <AyushHelpLiveStats />
              <div className="mt-auto space-y-2">
                <Link
                  to="/atmri-help/apply"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  Apply Free →
                </Link>
                <Link
                  to="/atmri-help"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-lg border border-primary/30 px-3 py-2 text-center text-xs font-medium text-primary transition-all hover:bg-primary/10"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom doctor pledge strip */}
          <div className="flex items-center gap-3 border-t border-border bg-amber-50/60 px-5 py-3">
            <p className="flex-1 text-xs text-foreground/80">
              🩺 Are you an AYUSH doctor? Pledge free consultations and earn the{" "}
              <span className="font-semibold text-amber-800">AYUSH Healing Doctor 🏅</span> gold badge on your profile.
            </p>
            <Link
              to="/atmri-help/pledge"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Take the Pledge →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const AyushHelpLiveStats = () => {
  const [stats, setStats] = useState({ inTreatment: 0, doctorsPledged: 0 });
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const [{ count: inTreatment }, { count: doctorsPledged }] = await Promise.all([
          supabase.from("atmri_sponsored_cases").select("*", { count: "exact", head: true }).eq("status", "in_treatment"),
          supabase.from("doctor_charity_pledges").select("*", { count: "exact", head: true }).eq("is_active", true),
        ]);
        setStats({ inTreatment: inTreatment || 0, doctorsPledged: doctorsPledged || 0 });
      } catch {
        /* silent */
      }
    })();
  }, []);
  return (
    <div className="rounded-lg border border-amber-200 bg-background/70 p-2.5 text-xs">
      <div className="font-semibold text-foreground">{stats.inTreatment} patients in free treatment</div>
      <div className="text-muted-foreground">{stats.doctorsPledged} doctors pledged</div>
    </div>
  );
};
