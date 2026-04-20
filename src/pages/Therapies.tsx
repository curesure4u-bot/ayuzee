import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Leaf } from "lucide-react";

type Therapy = {
  id: string; name: string; slug: string; category: string;
  short_description: string | null; price: number; duration_minutes: number;
  benefits: string[]; image_url: string | null;
};

const Therapies = () => {
  const [items, setItems] = useState<Therapy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Ayurvedic Therapies — Ayuzee";
    supabase.from("therapies").select("*").eq("is_published", true).eq("is_active", true).order("price")
      .then(({ data }) => { setItems((data ?? []) as Therapy[]); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-accent/30 py-16">
          <div className="container text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Therapy & Wellness</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Authentic Ayurvedic therapies</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Time-tested wellness rituals delivered by certified practitioners. Specialised therapies are available only on doctor recommendation.
            </p>
          </div>
        </section>

        <section className="container py-12">
          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading therapies…</div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">No therapies published yet</p>
              <p className="text-sm text-muted-foreground">Our wellness team is curating the catalog. Please check back shortly.</p>
              <Button asChild variant="hero" className="mt-5"><Link to="/doctors">Talk to a doctor</Link></Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <article key={t.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant">
                  <div className="relative aspect-[4/3] overflow-hidden bg-accent">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-primary"><Leaf className="h-12 w-12" /></div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur">{t.category}</Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                    {t.short_description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.short_description}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(t.benefits ?? []).slice(0, 3).map((b) => (
                        <span key={b} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">{b}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="font-display text-xl text-primary">₹{t.price.toLocaleString("en-IN")}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {t.duration_minutes} min</p>
                      </div>
                      <Button variant="outline" size="sm" asChild><Link to="/doctors">Book now</Link></Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Card className="mt-10 p-6 bg-accent/40 border-dashed">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg">Need a specialised therapy or Panchakarma program?</h3>
                <p className="text-sm text-muted-foreground">Specialised treatments are prescribed by your Ayurvedic doctor based on your condition.</p>
              </div>
              <Button asChild variant="hero"><Link to="/doctors">Consult a doctor</Link></Button>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Therapies;
