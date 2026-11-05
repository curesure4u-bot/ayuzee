import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  Stethoscope,
  Leaf,
  Sun,
  AlertCircle,
  ShoppingBag,
  UserRound,
  Star,
  Share2,
} from "lucide-react";
import { getGuidance, type Dosha } from "@/data/prakritiQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export interface PrakritiResultData {
  id?: string;
  dominant: string;          // e.g. "vata", "vata-pitta"
  vata: number;
  pitta: number;
  kapha: number;
  vataPct: number;
  pittaPct: number;
  kaphaPct: number;
  total: number;
}

interface DoctorRow {
  id: string;
  full_name: string;
  specialization: string;
  category: string;
  city: string;
  consultation_fee: number;
  rating: number;
  avatar_url: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  unit: string | null;
}

// Map dosha → keyword hints for filtering doctors & products
const DOSHA_KEYWORDS: Record<Dosha, string[]> = {
  vata: ["vata", "panchakarma", "neuro", "joint", "rasayana", "abhyanga"],
  pitta: ["pitta", "panchakarma", "skin", "liver", "digestive", "virechana"],
  kapha: ["kapha", "panchakarma", "weight", "respiratory", "udvartana", "detox"],
};

function dominantDoshas(d: string): Dosha[] {
  return d.split("-").filter(Boolean) as Dosha[];
}

function matchesKeywords(haystack: string, keywords: string[]) {
  const h = haystack.toLowerCase();
  return keywords.some((k) => h.includes(k));
}

export const PrakritiResultView = ({ result }: { result: PrakritiResultData }) => {
  const guidance = getGuidance(result.dominant);
  const { addItem } = useCart();
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    const doshas = dominantDoshas(result.dominant);
    const keywords = Array.from(new Set(doshas.flatMap((d) => DOSHA_KEYWORDS[d] || [])));

    // Fetch doctors — pull a wider set then filter client-side by specialization/category match
    supabase
      .from("doctors")
      .select("id, full_name, specialization, category, city, consultation_fee, rating, avatar_url, is_approved, public_profile")
      .eq("is_approved", true)
      .eq("public_profile", true)
      .limit(50)
      .then(({ data }) => {
        const all = (data as any[]) || [];
        const matched = all
          .filter((d) =>
            matchesKeywords(`${d.specialization} ${d.category}`, keywords),
          )
          .slice(0, 4);
        // Fallback to top-rated if not enough matches
        const fallback = all
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setDoctors(matched.length >= 2 ? matched : fallback);
      });

    // Fetch products
    supabase
      .from("products")
      .select("id, name, brand, category, price, discount_price, image_url, unit, description")
      .eq("is_bulk", false)
      .limit(50)
      .then(({ data }) => {
        const all = (data as any[]) || [];
        const matched = all
          .filter((p) =>
            matchesKeywords(`${p.name} ${p.category} ${p.description ?? ""}`, keywords),
          )
          .slice(0, 4);
        const fallback = all.slice(0, 4);
        setProducts(matched.length >= 2 ? matched : fallback);
      });
  }, [result.dominant]);

  const sharePath = result.id ? `/diagnosis/prakriti/result/${result.id}` : null;

  const handleShare = async () => {
    if (!sharePath) return;
    const url = `${window.location.origin}${sharePath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Prakriti Result", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <>
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-background p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Your Prakriti</p>
        <h1 className="mt-2 font-display text-4xl font-semibold capitalize">
          {result.dominant.replace("-", " – ")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Based on the CCRAS / Ministry of AYUSH SOP (35 traits)
        </p>
        {sharePath && (
          <Button onClick={handleShare} variant="outline" size="sm" className="mt-4">
            <Share2 className="mr-2 h-4 w-4" /> Share result
          </Button>
        )}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Dosha breakdown</h2>
        <div className="mt-4 space-y-3">
          {[
            { k: "Vata", v: result.vataPct, c: "bg-blue-500" },
            { k: "Pitta", v: result.pittaPct, c: "bg-red-500" },
            { k: "Kapha", v: result.kaphaPct, c: "bg-emerald-500" },
          ].map((d) => (
            <div key={d.k}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{d.k}</span>
                <span className="text-muted-foreground">{d.v}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${d.c}`} style={{ width: `${d.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {guidance.map((g) => (
        <Card key={g.title} className="mt-6 p-6">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> {g.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Element: {g.element}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {g.qualities.map((q) => (
              <span key={q} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{q}</span>
            ))}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5" /> Traits
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.traits.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Favour in diet</p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.diet.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Avoid</p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.avoid.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Lifestyle (Dinacharya)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.lifestyle.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Recommended exercise
              </p>
              <p className="mt-1 text-sm">{g.exercise}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5" /> Seasonal care (Ritucharya)
              </p>
              <p className="mt-1 text-sm">{g.ritucharya}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border-l-4 border-destructive bg-destructive/5 p-4">
            <p className="text-xs font-semibold uppercase text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Common imbalances to watch
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {g.commonImbalances.map((t) => <li key={t}>• {t}</li>)}
            </ul>
          </div>
        </Card>
      ))}

      {/* RECOMMENDED DOCTORS */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" /> Recommended Doctors
            </h2>
            <p className="text-sm text-muted-foreground">
              Verified Ayurveda Vaidyas matched to your constitution
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/doctors">See all →</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">Loading recommendations…</p>
          ) : (
            doctors.map((d) => (
              <Card key={d.id} className="p-4 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted shrink-0">
                    {d.avatar_url ? (
                      <img src={d.avatar_url} alt={d.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                        {d.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.specialization}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {Number(d.rating || 0).toFixed(1)}
                  </span>
                  <span>{d.city}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">₹{d.consultation_fee}</p>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link to={`/doctors/${d.id}`}>Book Consultation</Link>
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* RECOMMENDED PRODUCTS */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Recommended Products
            </h2>
            <p className="text-sm text-muted-foreground">
              Classical herbs & formulations balancing your dosha
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/shop">Shop all →</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">Loading products…</p>
          ) : (
            products.map((p) => {
              const effective = p.discount_price ?? p.price;
              return (
                <Card key={p.id} className="p-4 flex flex-col">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                  <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-semibold">₹{effective}</span>
                    {p.discount_price && (
                      <span className="text-xs text-muted-foreground line-through">₹{p.price}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => {
                      addItem({
                        id: p.id,
                        name: p.name,
                        brand: p.brand,
                        unit: p.unit,
                        price: effective,
                      });
                      toast.success(`${p.name} added to cart`);
                    }}
                  >
                    Add to Cart
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> This assessment provides a directional Prakriti
        analysis based on the CCRAS SOP. For a clinically confirmed evaluation and personalised treatment plan,
        consult a qualified Ayurveda Vaidya. Some traits (especially Nadi & subtle observations) require in-person
        examination.
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="hero">
          <Link to="/doctors">Consult an Ayurveda doctor</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">Go to my dashboard</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to={`/diagnosis/prakriti/run?mode=self`}>
            <BookOpen className="mr-2 h-4 w-4" /> Retake assessment
          </Link>
        </Button>
      </div>
      {result.id && (
        <p className="mt-4 text-xs text-muted-foreground">Saved · #{result.id.slice(0, 8)}</p>
      )}
    </>
  );
};
