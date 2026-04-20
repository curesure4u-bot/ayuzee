import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Star, Stethoscope, Video } from "lucide-react";

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
}

const CATEGORIES = ["All", "Ayurveda", "Yoga", "Naturopathy", "Homeopathy", "Siddha", "Unani"];
const MODES = [
  { value: "any", label: "Any mode" },
  { value: "video", label: "Video consult" },
  { value: "in_clinic", label: "In-clinic" },
];

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [mode, setMode] = useState("any");
  const [maxFee, setMaxFee] = useState(1000);

  useEffect(() => {
    document.title = "Find a Doctor — Ayuzee";
    supabase
      .from("doctors")
      .select("*")
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setDoctors((data as Doctor[]) ?? []);
        setLoading(false);
      });
  }, []);

  const cities = useMemo(() => ["All", ...Array.from(new Set(doctors.map((d) => d.city)))], [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (category !== "All" && d.category !== category) return false;
      if (city !== "All" && d.city !== city) return false;
      if (mode === "video" && !d.video_available) return false;
      if (mode === "in_clinic" && !d.in_clinic_available) return false;
      if (d.consultation_fee > maxFee) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${d.full_name} ${d.specialization} ${d.city} ${d.clinic_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [doctors, category, city, mode, maxFee, query]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-12 md:py-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Find a Doctor</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Verified Ayurvedic practitioners, near you</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Search by specialization, city, or condition. Book video or in-clinic consultations.</p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor name, specialization, clinic…"
                  className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max fee: ₹{maxFee}</label>
                  <input type="range" min={200} max={1000} step={50} value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} className="h-10 w-full accent-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <p className="mb-6 text-sm text-muted-foreground">
              {loading ? "Loading doctors…" : `${filtered.length} doctor${filtered.length === 1 ? "" : "s"} found`}
            </p>

            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-display text-xl">No doctors match your filters</h3>
                <p className="mt-2 text-sm text-muted-foreground">Try broadening your search criteria.</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <article key={d.id} className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-leaf font-display text-xl text-primary-foreground">
                      {initials(d.full_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-tight">{d.full_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{d.specialization}</p>
                      <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{d.category}</span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {d.rating} · {d.total_reviews} reviews · {d.experience_years} yrs exp
                    </div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {d.clinic_name}, {d.city}</div>
                    <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video consult ₹{d.consultation_fee}</div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" asChild className="flex-1"><Link to={`/doctors/${d.id}`}>View profile</Link></Button>
                    <Button variant="hero" asChild className="flex-1"><Link to={`/doctors/${d.id}?book=1`}>Book</Link></Button>
                  </div>
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

export default Doctors;
