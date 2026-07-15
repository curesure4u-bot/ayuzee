import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { ArrowLeft, BadgeCheck, MapPin, Star, Award, CalendarCheck } from "lucide-react";

interface Therapist {
  id: string;
  full_name: string;
  gender: string | null;
  photo_url: string | null;
  certificate_number: string | null;
  certifying_body: string | null;
  years_experience: number;
  allowed_therapies: string[] | null;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_sessions: number;
  city: string | null;
  state: string | null;
}

const therapyMap = new Map(AYUSH_THERAPIES.map(t => [t.code, t]));

const TherapistDetail = () => {
  const { id } = useParams();
  const [t, setT] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: t
      ? `${t.full_name} — Certified Panchakarma Therapist | Ayuzee`
      : "Therapist — Ayuzee",
    description: t
      ? `Book ${t.full_name}, certified Panchakarma therapist${t.city ? ` in ${t.city}` : ""}${t.years_experience ? ` with ${t.years_experience}+ years experience` : ""}. GPS-tracked sessions on Ayuzee.`.slice(0, 158)
      : "Book verified, GPS-tracked Panchakarma and Ayurveda therapists on Ayuzee.",
    canonicalPath: id ? `/therapists/${id}` : undefined,
    ogImage: t?.photo_url ?? undefined,
    ogType: "profile",
    jsonLd: t
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: t.full_name,
            jobTitle: "Panchakarma Therapist",
            image: t.photo_url ?? undefined,
            address: t.city
              ? { "@type": "PostalAddress", addressLocality: t.city, addressRegion: t.state ?? undefined, addressCountry: "IN" }
              : undefined,
            aggregateRating: t.total_sessions > 0
              ? { "@type": "AggregateRating", ratingValue: t.rating, reviewCount: t.total_sessions }
              : undefined,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://ayuzee.com/" },
              { "@type": "ListItem", position: 2, name: "Therapists", item: "https://ayuzee.com/therapists" },
              { "@type": "ListItem", position: 3, name: t.full_name, item: `https://ayuzee.com/therapists/${id}` },
            ],
          },
        ]
      : undefined,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("therapists_public" as any)
        .select("id, full_name, gender, photo_url, certificate_number, certifying_body, years_experience, allowed_therapies, is_verified, is_available, rating, total_sessions, city, state")
        .eq("id", id)
        .eq("verification_status", "approved")
        .maybeSingle();
      setT(((data as unknown) as Therapist | null));
      setLoading(false);
      if (data) {}
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-12"><div className="h-64 animate-pulse bg-muted rounded-xl" /></main></div>;
  if (!t) return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Therapist not found</h1>
        <Link to="/therapists" className="text-primary mt-4 inline-block">← Back to therapists</Link>
      </main>
    </div>
  );

  const initials = t.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/therapists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to therapists
        </Link>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                {t.photo_url && <AvatarImage src={t.photo_url} alt={t.full_name} />}
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{t.full_name}</h1>
                  {t.is_verified && (
                    <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
                      <BadgeCheck className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {t.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{t.city}{t.state && `, ${t.state}`}</span>}
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />{t.rating.toFixed(1)}</span>
                  <span>{t.total_sessions} sessions completed</span>
                  <span>{t.years_experience} years experience</span>
                </div>
                <div className={`mt-3 inline-flex items-center gap-2 text-sm ${t.is_available ? "text-green-600" : "text-muted-foreground"}`}>
                  <span className={`h-2 w-2 rounded-full ${t.is_available ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"}`} />
                  {t.is_available ? "Available now for sessions" : "Currently unavailable"}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button className="w-full md:w-auto">
                  <CalendarCheck className="h-4 w-4 mr-2" />Book a session
                </Button>
              </div>

            </div>
          </div>

          <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h2 className="font-semibold text-lg mb-3">Certified therapies</h2>
                {(t.allowed_therapies ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No therapies listed yet.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(t.allowed_therapies ?? []).map(code => {
                      const info = therapyMap.get(code);
                      return (
                        <div key={code} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <Badge variant="secondary" className="mt-0.5">{code}</Badge>
                          <div className="text-sm">
                            <div className="font-medium">{info?.name ?? code}</div>
                            {info && <div className="text-xs text-muted-foreground mt-0.5">{info.group}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border p-4 bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Award className="h-4 w-4 text-primary" />Credentials</h3>
                <dl className="space-y-2 text-sm">
                  {t.certifying_body && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Certified by</dt>
                      <dd className="font-medium">{t.certifying_body}</dd>
                    </div>
                  )}
                  {t.certificate_number && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Certificate no.</dt>
                      <dd className="font-mono text-xs">{t.certificate_number}</dd>
                    </div>
                  )}
                  {t.gender && (
                    <div>
                      <dt className="text-muted-foreground text-xs">Gender</dt>
                      <dd className="capitalize">{t.gender}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          </CardContent>
        </Card>
      </main>
      <Footer />

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-3 shadow-elegant backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="container flex items-center justify-between gap-3 px-0">
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">{t.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t.is_available ? "Available now" : "Currently unavailable"}
            </p>
          </div>
          <Button className="shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <CalendarCheck className="h-4 w-4 mr-2" />Book a session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetail;
