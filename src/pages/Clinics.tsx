import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Phone, Search, Star } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  partner_type: string;
  city: string;
  state: string | null;
  address: string | null;
  phone: string | null;
  rating: number;
  about: string | null;
  image_url: string | null;
  specialities: string[] | null;
  services: string[] | null;
}

const TYPES = ["All", "clinic", "hospital", "panchakarma_center", "wellness_center"];

const Clinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [city, setCity] = useState("All");

  useEffect(() => {
    document.title = "Find a Clinic — Ayuzee";
    supabase
      .from("network_partners")
      .select("*")
      .eq("is_approved", true)
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setClinics((data as Clinic[]) ?? []);
        setLoading(false);
      });
  }, []);

  const cities = useMemo(() => ["All", ...Array.from(new Set(clinics.map((c) => c.city)))], [clinics]);

  const filtered = useMemo(
    () =>
      clinics.filter((c) => {
        if (type !== "All" && c.partner_type !== type) return false;
        if (city !== "All" && c.city !== city) return false;
        if (query) {
          const q = query.toLowerCase();
          const hay = `${c.name} ${c.city} ${c.state ?? ""} ${(c.specialities ?? []).join(" ")}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [clinics, type, city, query]
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-12 md:py-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Find a Clinic</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Trusted Ayurveda clinics & Panchakarma centers</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Discover verified clinics, hospitals and wellness centers across India offering authentic Ayurveda care.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clinic name, city, speciality…"
                  className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t === "All" ? "All types" : t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <p className="mb-6 text-sm text-muted-foreground">
              {loading ? "Loading clinics…" : `${filtered.length} clinic${filtered.length === 1 ? "" : "s"} found`}
            </p>

            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-display text-xl">No clinics match your filters</h3>
                <p className="mt-2 text-sm text-muted-foreground">Try a different city or type.</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <article key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl gradient-leaf text-primary-foreground">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-tight">{c.name}</h3>
                      <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary capitalize">
                        {c.partner_type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {c.rating} rating
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{c.address ? `${c.address}, ` : ""}{c.city}{c.state ? `, ${c.state}` : ""}</span>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {c.phone}</div>
                    )}
                  </div>
                  {c.specialities && c.specialities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.specialities.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  )}
                  <Button variant="hero" className="mt-6 w-full" asChild>
                    <Link to="/doctors">Book consultation</Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Clinics;
