import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/site/BookingDialog";
import { StickyBookBar } from "@/components/site/StickyBookBar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, Video, Building2, Languages, Stethoscope, BadgeCheck, FileText, TrendingUp, GraduationCap, Activity, UserPlus, UserCheck, Share2 } from "lucide-react";
import { toast } from "sonner";
import { setSEO } from "@/lib/seo";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  category: string;
  city: string;
  clinic_name: string | null;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  total_reviews: number;
  video_available: boolean;
  in_clinic_available: boolean;
  languages: string[];
  bio: string | null;
}

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [healingPledge, setHealingPledge] = useState<{ total_consultations_donated: number; total_fee_value_donated: number } | null>(null);
  const [trustMetrics, setTrustMetrics] = useState<{
    isVerified: boolean;
    badgeLevel: string;
    articlesCount: number;
    outcomesResolved: number;
    outcomesTotal: number;
    successRate: number;
    cmeCredits: number;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<{ is_online: boolean; last_active_at: string | null; status_text: string } | null>(null);

  const shouldOpenOnLoad = useMemo(() => params.get("book") === "1", [params]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("doctors_public" as any)
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        const d = (data as unknown) as Doctor | null;
        setDoctor(d);
        setLoading(false);
        if (d) {
          const desc = (d.bio || `Book ${d.full_name}, ${d.specialization} in ${d.city}. ${d.experience_years}+ years experience on Ayuzee.`).slice(0, 158);
          setSEO(
            `${d.full_name} — ${d.specialization} | Ayuzee`,
            desc,
            `/doctors/${d.id}`,
            {
              ogType: "profile",
              jsonLd: [
                {
                  "@context": "https://schema.org",
                  "@type": "Physician",
                  name: d.full_name,
                  medicalSpecialty: d.specialization,
                  address: { "@type": "PostalAddress", addressLocality: d.city, addressCountry: "IN" },
                  ...(d.clinic_name ? { worksFor: { "@type": "MedicalBusiness", name: d.clinic_name } } : {}),
                  knowsLanguage: d.languages,
                  aggregateRating: d.total_reviews > 0 ? {
                    "@type": "AggregateRating",
                    ratingValue: d.rating,
                    reviewCount: d.total_reviews,
                  } : undefined,
                },
                {
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://ayuzee.com/" },
                    { "@type": "ListItem", position: 2, name: "Doctors", item: "https://ayuzee.com/doctors" },
                    { "@type": "ListItem", position: 3, name: d.full_name, item: `https://ayuzee.com/doctors/${d.id}` },
                  ],
                },
              ],
            },
          );
        }
      });
    supabase
      .from("doctor_charity_pledges")
      .select("total_consultations_donated, total_fee_value_donated")
      .eq("doctor_id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && (data.total_consultations_donated ?? 0) > 0) {
          setHealingPledge(data as { total_consultations_donated: number; total_fee_value_donated: number });
        }
      });

    // Load trust metrics from new tables
    (async () => {
      const [verRes, artRes, outcomeRes, cmeRes] = await Promise.all([
        supabase.from("doctor_verifications").select("status, badge_level").eq("doctor_id", id).eq("status", "verified").limit(1).maybeSingle(),
        supabase.from("doctor_articles").select("id", { count: "exact", head: true }).eq("author_id", id).eq("status", "published"),
        supabase.from("treatment_outcomes").select("outcome_status").eq("doctor_id", id).eq("is_published", true),
        supabase.from("cme_credits").select("credits_earned").eq("doctor_id", id).eq("status", "active"),
      ]);

      const outcomes = (outcomeRes.data ?? []) as { outcome_status: string }[];
      const resolved = outcomes.filter((o) => o.outcome_status === "resolved" || o.outcome_status === "improved").length;
      const cmeTotal = ((cmeRes.data ?? []) as { credits_earned: number }[]).reduce((s, c) => s + c.credits_earned, 0);

      setTrustMetrics({
        isVerified: !!verRes.data,
        badgeLevel: verRes.data?.badge_level ?? "none",
        articlesCount: artRes.count ?? 0,
        outcomesResolved: resolved,
        outcomesTotal: outcomes.length,
        successRate: outcomes.length > 0 ? Math.round((resolved / outcomes.length) * 100) : 0,
        cmeCredits: cmeTotal,
      });
    })();

    // Load follow state
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      setCurrentUserId(uid);

      const { count } = await supabase.from("doctor_follows").select("id", { count: "exact", head: true }).eq("following_id", id);
      setFollowCount(count ?? 0);

      if (uid) {
        const { data: followRow } = await supabase.from("doctor_follows").select("id").eq("follower_id", uid).eq("following_id", id).maybeSingle();
        setIsFollowing(!!followRow);
      }

      // Load online status
      const { data: statusRow } = await supabase.from("doctor_online_status").select("is_online, last_active_at, status_text").eq("doctor_id", id).maybeSingle();
      if (statusRow) setOnlineStatus(statusRow as any);
    })();
  }, [id]);

  const handleBookClick = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.info("Please sign in to book an appointment");
      navigate(`/auth?mode=signup`);
      return;
    }
    setBookingOpen(true);
  };

  useEffect(() => {
    if (shouldOpenOnLoad && doctor) {
      handleBookClick();
      const next = new URLSearchParams(params);
      next.delete("book");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldOpenOnLoad, doctor]);

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.info("Please sign in to follow doctors");
      navigate("/auth");
      return;
    }
    if (currentUserId === id) return;
    if (isFollowing) {
      await supabase.from("doctor_follows").delete().eq("follower_id", currentUserId).eq("following_id", id);
      setIsFollowing(false);
      setFollowCount((c) => Math.max(0, c - 1));
      toast.success("Unfollowed");
    } else {
      await supabase.from("doctor_follows").insert({ follower_id: currentUserId, following_id: id });
      setIsFollowing(true);
      setFollowCount((c) => c + 1);
      toast.success("Following! You'll see their posts in your feed.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/doctors/${id}`;
    const text = `Consult ${doctor?.full_name} — ${doctor?.specialization} on Ayuzee`;
    if (navigator.share) {
      try {
        await navigator.share({ title: doctor?.full_name, text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard?.writeText(url);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Doctor not found</h1>
          <Button asChild variant="hero" className="mt-6"><Link to="/doctors">Back to doctors</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteNav />
      <main>
        <div className="container py-8">
          <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All doctors
          </Link>
        </div>

        <section className="container pb-12">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl gradient-leaf font-display text-3xl text-primary-foreground shadow-elegant">
                  {initials(doctor.full_name)}
                </div>
                <div className="flex-1">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">{doctor.category}</span>
                  {onlineStatus && (
                    <span className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${onlineStatus.is_online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      <span className={`h-2 w-2 rounded-full ${onlineStatus.is_online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                      {onlineStatus.is_online ? (onlineStatus.status_text || "Online") : "Offline"}
                    </span>
                  )}
                  <h1 className="mt-3 font-display text-4xl">
                    {doctor.full_name}
                    {trustMetrics?.isVerified && (
                      <BadgeCheck className="ml-2 inline h-6 w-6 text-green-600" aria-label="Verified Doctor" />
                    )}
                  </h1>
                  <p className="mt-1 text-lg text-muted-foreground">{doctor.specialization}</p>
                  {healingPledge && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                      <span>🏅</span>
                      <span>
                        ATMRI Healing Doctor · {healingPledge.total_consultations_donated} free consultations donated
                      </span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-secondary text-secondary" /> {doctor.rating} ({doctor.total_reviews} reviews)</span>
                    <span>{doctor.experience_years} years of experience</span>
                    <span>{followCount} followers</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isFollowing ? "secondary" : "outline"}
                      className="gap-1.5 rounded-full"
                      onClick={handleFollow}
                    >
                      {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={handleShare}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Building2} label="Clinic" value={doctor.clinic_name ?? "—"} />
                <InfoRow icon={MapPin} label="City" value={doctor.city} />
                <InfoRow icon={Video} label="Video consult" value={doctor.video_available ? "Available" : "Not available"} />
                <InfoRow icon={Languages} label="Languages" value={doctor.languages.join(", ")} />
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  🌿 100% Synthetic-Free Treatment
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  🎯 Root Cause Approach
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  🔒 Private & Secured
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  🔄 Free Follow-Up within 7 days
                </span>
              </div>

              {doctor.bio && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl">About</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{doctor.bio}</p>
                </div>
              )}

              {/* Trust Metrics & Credentials */}
              {trustMetrics && (trustMetrics.isVerified || trustMetrics.articlesCount > 0 || trustMetrics.outcomesTotal > 0 || trustMetrics.cmeCredits > 0) && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl">Credentials & Track Record</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {trustMetrics.isVerified && (
                      <Card className="flex items-center gap-3 p-4 border-green-200 bg-green-50/50">
                        <BadgeCheck className="h-8 w-8 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-700">Verified Doctor</p>
                          <p className="text-xs text-muted-foreground capitalize">{trustMetrics.badgeLevel} badge</p>
                        </div>
                      </Card>
                    )}
                    {trustMetrics.articlesCount > 0 && (
                      <Card className="flex items-center gap-3 p-4">
                        <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{trustMetrics.articlesCount} Publications</p>
                          <p className="text-xs text-muted-foreground">Published articles</p>
                        </div>
                      </Card>
                    )}
                    {trustMetrics.outcomesTotal > 0 && (
                      <Card className="flex items-center gap-3 p-4">
                        <TrendingUp className="h-8 w-8 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{trustMetrics.successRate}% Success Rate</p>
                          <p className="text-xs text-muted-foreground">{trustMetrics.outcomesResolved}/{trustMetrics.outcomesTotal} cases improved</p>
                        </div>
                      </Card>
                    )}
                    {trustMetrics.cmeCredits > 0 && (
                      <Card className="flex items-center gap-3 p-4">
                        <GraduationCap className="h-8 w-8 text-violet-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{trustMetrics.cmeCredits} CME Credits</p>
                          <p className="text-xs text-muted-foreground">Continuing education</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consultation fee</p>
              <p className="mt-1 font-display text-4xl">₹{doctor.consultation_fee}</p>
              <p className="mt-1 text-sm text-muted-foreground">per session</p>
              <Button variant="hero" size="lg" className="mt-6 w-full" onClick={handleBookClick}>
                Book appointment
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>✓ Secure payment via Razorpay</li>
                <li>✓ Instant confirmation</li>
                <li>✓ Free rescheduling up to 24h before</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      <StickyBookBar
        priceLabel={`₹${doctor.consultation_fee}`}
        ctaLabel="Book appointment"
        onClick={handleBookClick}
      />

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} doctor={doctor} />
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default DoctorDetail;
