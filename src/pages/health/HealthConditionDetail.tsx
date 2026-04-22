import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { RequestCallDialog } from "@/components/health/RequestCallDialog";
import { toast } from "sonner";
import { Check, ChevronRight, Phone, MessageCircle, Calendar, ShieldCheck, Truck, Headphones, Award, Pill, Stethoscope, HeartPulse, Users, ClipboardList, Sparkles, ArrowRight, PlayCircle, Truck as TruckIcon, Leaf } from "lucide-react";

interface PackageOpt { label: string; units?: string; price: number; discount_price?: number; in_stock?: boolean }
interface FeedbackItem { doctor_name?: string; patient_name?: string; location?: string; quote?: string; thumbnail_url?: string; video_url?: string }
interface PlanGroup { month: string; items: { title: string; description: string }[] }
interface IngredientItem { name: string; image_url?: string }
interface FaqItem { q: string; a: string }
interface HowStep { title: string; description?: string; image_url?: string }
interface BenefitItem { title: string; subtitle?: string; image_url?: string }
interface QnaItem { question: string; answer: string; highlight?: boolean }
interface VideoItem { title?: string; thumbnail_url?: string; video_url?: string }
interface HowToUse {
  image_url?: string;
  recovery_title?: string;
  recovery_text?: string;
  after_recovery_title?: string;
  after_recovery_text?: string;
  note?: string;
}

interface Condition {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  product_name: string | null;
  product_image_url: string | null;
  price: number;
  discount_price: number | null;
  highlights: string[];
  how_it_works: HowStep[];
  packages: PackageOpt[];
  doctor_feedback: FeedbackItem[];
  patient_feedback: FeedbackItem[];
  approach_title: string | null;
  approach_body: string | null;
  approach_image_url: string | null;
  plan_steps: PlanGroup[];
  ingredients: IngredientItem[];
  faqs: FaqItem[];
  gallery_images: string[];
  benefits: BenefitItem[];
  ayurveda_qna: QnaItem[];
  videos: VideoItem[];
  how_to_use: HowToUse;
  estimated_delivery_days: number;
  consult_banner_text: string | null;
}

interface RelatedCondition { slug: string; name: string; tagline: string | null; product_name: string | null; product_image_url: string | null; hero_image_url: string | null; price: number; discount_price: number | null }

const PLAN_INCLUSIONS = [
  { icon: Stethoscope, label: "Free Doctor Consultation", value: "Unlimited" },
  { icon: Pill, label: "Premium-quality Ayurvedic medicine", value: "On a Prescribed Basis" },
  { icon: Headphones, label: "Dedicated health coach support", value: "12x7" },
  { icon: ClipboardList, label: "Personalized diet & lifestyle plan", value: "Unlimited" },
  { icon: Users, label: "Access to our exclusive health community", value: "Unlimited" },
];

const HealthConditionDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [c, setC] = useState<Condition | null>(null);
  const [related, setRelated] = useState<RelatedCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [callOpen, setCallOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string | undefined>();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from("health_conditions").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => {
        setC(data as unknown as Condition | null);
        setLoading(false);
        if (data) document.title = `${(data as { name: string }).name} — Ayuzee`;
      });
    supabase.from("health_conditions")
      .select("slug,name,tagline,product_name,product_image_url,hero_image_url,price,discount_price")
      .eq("is_published", true)
      .neq("slug", slug)
      .order("sort_order", { ascending: true })
      .limit(6)
      .then(({ data }) => setRelated((data as RelatedCondition[]) ?? []));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-muted/30"><SiteNav /><div className="container py-24 text-center text-muted-foreground">Loading…</div></div>;
  }
  if (!c) {
    return (
      <div className="min-h-screen bg-muted/30">
        <SiteNav />
        <div className="container py-24 text-center">
          <h1 className="font-display text-2xl">Condition not found</h1>
          <Button asChild variant="hero" className="mt-6"><Link to="/health-conditions">Back</Link></Button>
        </div>
      </div>
    );
  }

  const off = c.discount_price ? Math.round(((c.price - c.discount_price) / c.price) * 100) : 0;
  const buyNow = (pkg?: PackageOpt) => {
    const price = pkg?.discount_price ?? pkg?.price ?? c.discount_price ?? c.price;
    addItem({
      id: `${c.slug}-${pkg?.label ?? "default"}`,
      name: `${c.product_name ?? c.name} — ${pkg?.label ?? "Standard"}`,
      brand: "Ayuzee",
      unit: pkg?.units ?? null,
      price,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <main>
        {/* Breadcrumb */}
        <div className="container pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/health-conditions" className="text-primary hover:underline">Health Conditions</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{c.name}</span>
          </div>
        </div>

        {/* Hero banner */}
        <section className="container mt-4">
          <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/15 via-background to-accent p-8 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{c.name}</span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl">{c.hero_title ?? c.product_name ?? c.name}</h1>
              {c.hero_subtitle && <p className="mt-3 text-lg text-muted-foreground">{c.hero_subtitle}</p>}
              {c.tagline && <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>}

              {c.highlights.length > 0 && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {c.highlights.slice(0, 6).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl">₹{c.discount_price ?? c.price}</span>
                {c.discount_price && (
                  <>
                    <span className="text-muted-foreground line-through">₹{c.price}</span>
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">{off}% off</span>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="hero" size="lg" onClick={() => buyNow()}>Buy Now</Button>
                <Button variant="outline" size="lg" onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }}>
                  <Phone className="mr-2 h-4 w-4" /> Talk to Doctor
                </Button>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid place-items-center rounded-2xl bg-background/70 p-4 shadow-soft">
                {c.hero_image_url || c.product_image_url ? (
                  <img src={c.hero_image_url ?? c.product_image_url ?? ""} alt={c.name} className="max-h-72 w-auto object-contain drop-shadow-xl" />
                ) : (
                  <div className="grid aspect-square w-64 place-items-center"><Pill className="h-24 w-24 text-primary/40" /></div>
                )}
              </div>
              {c.gallery_images.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {c.gallery_images.slice(0, 6).map((src, i) => (
                    <img key={i} src={src} alt={`${c.name} ${i + 1}`} className="h-14 w-14 cursor-pointer rounded-md border border-border bg-background object-contain p-1 transition-smooth hover:border-primary" />
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 rounded-lg bg-background/80 px-3 py-2 text-xs">
                <TruckIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Estimated delivery by</span>
                <strong>
                  {new Date(Date.now() + (c.estimated_delivery_days || 5) * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Action strip */}
        <section className="container mt-6 grid gap-3 md:grid-cols-3">
          <button onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }} className="rounded-xl border border-border bg-primary/10 p-4 text-left font-semibold text-primary transition-smooth hover:bg-primary/15">
            <Calendar className="mb-1 h-5 w-5" /> Ayurveda Health Calculator
          </button>
          <button onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }} className="rounded-xl border border-border bg-background p-4 text-left font-semibold transition-smooth hover:bg-accent">
            <Phone className="mb-1 h-5 w-5 text-primary" /> Schedule a Call
          </button>
          <button onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }} className="rounded-xl border border-border bg-background p-4 text-left font-semibold transition-smooth hover:bg-accent">
            <MessageCircle className="mb-1 h-5 w-5 text-secondary" /> Connect with us
          </button>
        </section>

        {/* Packages */}
        {c.packages.length > 0 && (
          <section className="container mt-10">
            <h2 className="font-display text-2xl">Choose Your Pack</h2>
            <p className="text-sm text-muted-foreground">Recommended plans curated by our doctors.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {c.packages.map((p) => {
                const pkgOff = p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;
                return (
                  <div key={p.label} className="flex flex-col rounded-2xl border-2 border-secondary/30 bg-background p-5">
                    <h3 className="font-display text-xl">{p.label}</h3>
                    {p.units && <p className="text-sm text-muted-foreground">{p.units}</p>}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-2xl">₹{p.discount_price ?? p.price}</span>
                      {p.discount_price && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">₹{p.price}</span>
                          <span className="text-xs font-semibold text-secondary">{pkgOff}% off</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 grid gap-2">
                      {p.in_stock !== false ? (
                        <>
                          <Button variant="hero" onClick={() => buyNow(p)}>Add to Cart</Button>
                          <Button variant="outline" onClick={() => { setSelectedPkg(p.label); setCallOpen(true); }}>
                            Talk to Doctor
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => { setSelectedPkg(p.label); setCallOpen(true); }}>
                          Notify Me
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Benefits */}
        {c.benefits.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">Benefits of {c.product_name ?? c.name}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {c.benefits.map((b, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background text-center">
                  {b.image_url && <img src={b.image_url} alt={b.title} className="h-40 w-full object-cover" />}
                  <div className="p-4">
                    <h3 className="font-display text-lg">{b.title}</h3>
                    {b.subtitle && <p className="mt-1 text-xs text-muted-foreground">{b.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="hero" size="lg" onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }}>
                <Phone className="mr-2 h-4 w-4" /> {c.consult_banner_text ?? "Consult a Doctor"}
              </Button>
            </div>
          </section>
        )}

        {/* How it works */}
        {c.how_it_works.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">How it Works</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {c.how_it_works.map((s, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background p-5 text-center">
                  {s.image_url && <img src={s.image_url} alt={s.title} className="mx-auto mb-3 h-28 object-contain" />}
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Doctor Feedback */}
        {c.doctor_feedback.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">Doctor Feedback</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.doctor_feedback.map((d, i) => (
                <a key={i} href={d.video_url ?? "#"} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-border bg-background">
                  <div className="aspect-[3/4] bg-muted">
                    {d.thumbnail_url && <img src={d.thumbnail_url} alt={d.doctor_name ?? "Doctor"} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="p-3 text-sm font-semibold">{d.doctor_name}</div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Patient Feedback */}
        {c.patient_feedback.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">Patient Feedback</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.patient_feedback.map((p, i) => (
                <a key={i} href={p.video_url ?? "#"} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-border bg-background">
                  <div className="aspect-[3/4] bg-muted">
                    {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.patient_name ?? "Patient"} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{p.patient_name}</p>
                    {p.location && <p className="text-xs text-muted-foreground">{p.location}</p>}
                    {p.quote && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{p.quote}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Holistic Approach */}
        {(c.approach_title || c.approach_body) && (
          <section className="container mt-12">
            <div className="grid items-center gap-6 rounded-3xl bg-background p-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl">{c.approach_title ?? "Holistic Wellness Approach"}</h2>
                {c.approach_body && <p className="mt-3 leading-relaxed text-muted-foreground">{c.approach_body}</p>}
              </div>
              {c.approach_image_url && <img src={c.approach_image_url} alt="Approach" className="rounded-2xl" />}
            </div>
          </section>
        )}

        {/* Plan steps */}
        {c.plan_steps.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">How Does the Plan Work?</h2>
            <div className="mt-6 space-y-8">
              {c.plan_steps.map((g, i) => (
                <div key={i}>
                  <div className="mx-auto mb-4 inline-block rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">{g.month}</div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {g.items.map((it, j) => (
                      <div key={j} className="rounded-2xl border-2 border-primary/20 bg-background p-5">
                        <h3 className="font-semibold">{it.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ingredients */}
        {c.ingredients.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">Key Ingredients</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {c.ingredients.map((ing, i) => (
                <div key={i} className="grid place-items-center rounded-2xl border border-border bg-background p-4 text-center">
                  {ing.image_url && <img src={ing.image_url} alt={ing.name} className="mb-2 h-20 w-20 object-contain" />}
                  <p className="text-sm font-semibold">{ing.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trust */}
        <section className="container mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "100% Authentic", d: "Lab-tested quality" },
            { icon: Truck, t: "Free Delivery", d: "Across India" },
            { icon: Headphones, t: "12x7 Support", d: "Our experts assist you" },
            { icon: Award, t: "Doctor Recommended", d: "Curated by Ayurvedic Vaidyas" },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary"><p.icon className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold">{p.t}</p>
                <p className="text-xs text-muted-foreground">{p.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* What's Included in the Plan */}
        <section className="container mt-12">
          <h2 className="text-center font-display text-3xl">What's Included in the Plan?</h2>
          <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-3xl border border-secondary/30 bg-secondary/10">
            <div className="grid divide-y divide-secondary/20 md:grid-cols-[1fr_auto] md:divide-x md:divide-y-0">
              <div className="divide-y divide-secondary/20">
                {PLAN_INCLUSIONS.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background text-primary"><p.icon className="h-5 w-5" /></div>
                    <p className="font-semibold">{p.label}</p>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-primary/20 bg-primary text-primary-foreground">
                {PLAN_INCLUSIONS.map((p, i) => (
                  <div key={i} className="flex items-center justify-center px-8 py-5 text-center font-semibold">{p.value}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        {c.faqs.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">FAQs</h2>
            <div className="mx-auto mt-6 max-w-4xl space-y-3">
              {c.faqs.map((f, i) => (
                <details key={i} className="group rounded-xl border-t-2 border-primary/40 bg-background p-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                    <span>{f.q}</span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Other Lifestyle Conditions */}
        {related.length > 0 && (
          <section className="container mt-12">
            <h2 className="text-center font-display text-3xl">Lifestyle Diseases</h2>
            <p className="text-center text-sm text-muted-foreground">Explore our other doctor-curated care plans.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((r) => {
                const rOff = r.discount_price ? Math.round(((r.price - r.discount_price) / r.price) * 100) : 0;
                return (
                  <Link key={r.slug} to={`/health-conditions/${r.slug}`} className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/40 to-background p-5 transition-smooth hover:shadow-elegant">
                    <div className="flex-1">
                      <h3 className="font-display text-xl">{r.name}</h3>
                      {r.tagline && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.tagline}</p>}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-bold text-primary">₹{r.discount_price ?? r.price}</span>
                        {r.discount_price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">₹{r.price}</span>
                            <span className="text-xs font-semibold text-secondary">{rOff}% off</span>
                          </>
                        )}
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground group-hover:gap-2 transition-all">
                        Buy Now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-background/70">
                      {r.hero_image_url || r.product_image_url ? (
                        <img src={r.hero_image_url ?? r.product_image_url ?? ""} alt={r.name} className="h-full w-full object-contain p-2" loading="lazy" />
                      ) : (
                        <Sparkles className="h-10 w-10 text-primary/40" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            {related.length > 3 && (
              <div className="mt-5 text-center">
                <Link to="/health-conditions" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Sticky CTA */}
        <section className="container my-12">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-primary-foreground">
            <h2 className="font-display text-3xl">Ready to start your {c.name} journey?</h2>
            <p className="mt-2 opacity-90">Get a free consultation with our Ayurvedic doctor.</p>
            <Button variant="secondary" size="lg" className="mt-5" onClick={() => { setSelectedPkg(undefined); setCallOpen(true); }}>
              <Phone className="mr-2 h-4 w-4" /> Request a Call
            </Button>
          </div>
        </section>
      </main>

      <RequestCallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        conditionId={c.id}
        conditionSlug={c.slug}
        conditionName={c.name}
        packageLabel={selectedPkg}
      />

      <Footer />
    </div>
  );
};

export default HealthConditionDetail;
