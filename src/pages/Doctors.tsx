import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Headphones, MapPin, Search, Star, Stethoscope, Video, Building2 } from "lucide-react";
import { toast } from "sonner";

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

const SPECIALITIES = ["All", "Ayurveda", "Yoga", "Naturopathy", "Homeopathy", "Siddha", "Unani"];
const GENDERS = [
  { v: "any", l: "Any gender" },
  { v: "male", l: "Male" },
  { v: "female", l: "Female" },
];
const EXP = [
  { v: "any", l: "Any experience" },
  { v: "0", l: "0+ years" },
  { v: "5", l: "5+ years" },
  { v: "10", l: "10+ years" },
  { v: "15", l: "15+ years" },
];
const FEES = [
  { v: 2000, l: "Up to ₹2000" },
  { v: 1000, l: "Up to ₹1000" },
  { v: 500, l: "Up to ₹500" },
  { v: 300, l: "Up to ₹300" },
];

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

const Doctors = () => {
  const [params] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [speciality, setSpeciality] = useState("All");
  const [city, setCity] = useState("All");
  const [mode, setMode] = useState("any");
  const [maxFee, setMaxFee] = useState(2000);
  const [gender, setGender] = useState("any");
  const [minExp, setMinExp] = useState("any");
  const [language, setLanguage] = useState("any");

  const [lead, setLead] = useState({ name: "", phone: "", concern: "" });

  useEffect(() => {
    document.title = "Find a Doctor — Ayuzee";
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
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
  const languages = useMemo(
    () => ["any", ...Array.from(new Set(doctors.flatMap((d) => d.languages || [])))],
    [doctors],
  );

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (speciality !== "All" && d.category !== speciality) return false;
      if (city !== "All" && d.city !== city) return false;
      if (mode === "video" && !d.video_available) return false;
      if (mode === "in_clinic" && !d.in_clinic_available) return false;
      if (d.consultation_fee > maxFee) return false;
      if (minExp !== "any" && d.experience_years < Number(minExp)) return false;
      if (language !== "any" && !(d.languages || []).includes(language)) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${d.full_name} ${d.specialization} ${d.city} ${d.clinic_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [doctors, speciality, city, mode, maxFee, minExp, language, query]);

  const submitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) {
      toast.error("Please fill name and phone");
      return;
    }
    toast.success("Our care team will call you shortly 🌿");
    setLead({ name: "", phone: "", concern: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthed ? <PatientHeader /> : <SiteNav />}
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Find a Doctor</span>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Verified Ayurvedic practitioners, near you</h1>

            <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor name, disease, symptoms…"
                  className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <Select value={speciality} onValueChange={setSpeciality}>
                  <SelectTrigger><SelectValue placeholder="Speciality" /></SelectTrigger>
                  <SelectContent>{SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any mode</SelectItem>
                    <SelectItem value="video">Video consult</SelectItem>
                    <SelectItem value="in_clinic">In-clinic</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(maxFee)} onValueChange={(v) => setMaxFee(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FEES.map((f) => <SelectItem key={f.v} value={String(f.v)}>{f.l}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GENDERS.map((g) => <SelectItem key={g.v} value={g.v}>{g.l}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={minExp} onValueChange={setMinExp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXP.map((e) => <SelectItem key={e.v} value={e.v}>{e.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="mt-3">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="md:max-w-xs"><SelectValue placeholder="Language" /></SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => <SelectItem key={l} value={l}>{l === "any" ? "Any language" : l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                {loading ? "Loading doctors…" : `${filtered.length} doctor${filtered.length === 1 ? "" : "s"} found`}
              </p>

              {!loading && filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                  <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-xl">No doctors match your filters</h3>
                </div>
              )}

              <div className="grid gap-5">
                {filtered.map((d) => (
                  <article key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant">
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl gradient-leaf font-display text-2xl text-primary-foreground">
                        {initials(d.full_name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold leading-tight">{d.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{d.specialization}</p>
                            <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{d.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-xl">₹{d.consultation_fee}</div>
                            <div className="text-xs text-muted-foreground">Consult fee</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-secondary text-secondary" />{d.rating} · {d.total_reviews} reviews</div>
                          <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" />{d.experience_years} yrs experience</div>
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{d.clinic_name ?? d.city}, {d.city}</div>
                          <div className="flex items-center gap-2 text-xs">{(d.languages || []).slice(0, 3).join(", ")}</div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {d.video_available && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              <Video className="h-3 w-3" />Video consult available
                            </span>
                          )}
                          {d.in_clinic_available && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary">
                              <Building2 className="h-3 w-3" />In-clinic available
                            </span>
                          )}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button variant="outline" asChild><Link to={`/doctors/${d.id}`}>View Profile</Link></Button>
                          {d.video_available && (
                            <Button variant="hero" asChild>
                              <Link to={`/doctors/${d.id}?book=1&mode=video`}><Video className="mr-1 h-4 w-4" />Book Video Consultation</Link>
                            </Button>
                          )}
                          {d.in_clinic_available && (
                            <Button variant="outline" asChild>
                              <Link to={`/doctors/${d.id}?book=1&mode=in_clinic`}><Calendar className="mr-1 h-4 w-4" />Book Clinic Visit</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Need Assistance sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="overflow-hidden border-primary/20">
                <div className="gradient-soft p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf text-primary-foreground">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg">Need Assistance?</h3>
                      <p className="text-xs text-muted-foreground">Our care team will help you find the right doctor</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <form onSubmit={submitLead} className="space-y-3">
                    <div>
                      <Label htmlFor="lead-name">Your name</Label>
                      <Input id="lead-name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="lead-phone">Phone</Label>
                      <Input id="lead-phone" type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="lead-concern">Health concern</Label>
                      <Textarea id="lead-concern" rows={3} value={lead.concern} onChange={(e) => setLead({ ...lead, concern: e.target.value })} placeholder="Briefly describe your concern" />
                    </div>
                    <Button type="submit" variant="hero" className="w-full">Request callback</Button>
                  </form>
                  <p className="mt-3 text-center text-xs text-muted-foreground">Free service · No spam</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Doctors;
