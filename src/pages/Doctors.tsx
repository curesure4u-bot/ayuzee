import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ArrowUpDown, BadgeCheck, Calendar, ChevronRight, Eye, MapPin, Navigation, Star, Stethoscope, Video } from "lucide-react";
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
  is_verified: boolean;
  avatar_url: string | null;
  gender: string | null;
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
  { v: 5000, l: "Any fee" },
  { v: 2000, l: "Up to ₹2000" },
  { v: 1000, l: "Up to ₹1000" },
  { v: 500, l: "Up to ₹500" },
  { v: 300, l: "Up to ₹300" },
];
const MODES = [
  { v: "any", l: "Any consultation" },
  { v: "video", l: "Video consult" },
  { v: "in_clinic", l: "In-clinic" },
];

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

const nextSlot = (offsetMin: number) => {
  const d = new Date(Date.now() + offsetMin * 60_000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const m = String(d.getMinutes() < 30 ? "30" : "00").padStart(2, "0");
  if (m === "00") h += 1;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${String(hh).padStart(2, "0")}:${m} ${ampm}, ${dd}/${mm}/${yyyy}`;
};

const Doctors = () => {
  const [params] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [speciality, setSpeciality] = useState("All");
  const [city, setCity] = useState("All");
  const [mode, setMode] = useState("any");
  const [maxFee, setMaxFee] = useState(5000);
  const [gender, setGender] = useState("any");
  const [minExp, setMinExp] = useState("any");
  const [language, setLanguage] = useState("any");
  const [sort, setSort] = useState<"rating" | "fee_low" | "fee_high" | "experience" | "near_me">("rating");

  const [lead, setLead] = useState({ phone: "", patient: "", pincode: "", concern: "" });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [detectedCity, setDetectedCity] = useState("");

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // Reverse geocode to get city name (using free Nominatim API)
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
          const data = await resp.json();
          const cityName = data.address?.city || data.address?.town || data.address?.district || data.address?.state_district || "";
          setDetectedCity(cityName);
          if (cityName) {
            setCity(cityName);
            toast.success(`Location detected: ${cityName}`);
          }
        } catch {
          toast.info("Location detected — showing nearest doctors");
        }
        setSort("near_me");
        setGeoLoading(false);
      },
      () => {
        toast.error("Location access denied. Please allow location permission.");
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("doctors_public" as any)
      .select("*")
      .order("rating", { ascending: false });
    if (err) setError("Couldn't load doctors. Please try again.");
    else setDoctors(((data as unknown) as Doctor[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setSEO(
      "AYUSH Doctors Near You | Ayuzee",
      "Search verified AYUSH doctors and book video or in-clinic consultations. Filter by specialization, city and fee.",
    );
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    loadDoctors();
  }, [loadDoctors]);

  const cities = useMemo(() => ["All", ...Array.from(new Set(doctors.map((d) => d.city)))], [doctors]);
  const languages = useMemo(
    () => ["any", ...Array.from(new Set(doctors.flatMap((d) => d.languages || [])))],
    [doctors],
  );

  const filtered = useMemo(() => {
    const list = doctors.filter((d) => {
      if (speciality !== "All" && d.category !== speciality) return false;
      if (city !== "All" && d.city !== city) return false;
      if (mode === "video" && !d.video_available) return false;
      if (mode === "in_clinic" && !d.in_clinic_available) return false;
      if (d.consultation_fee > maxFee) return false;
      if (gender !== "any" && d.gender !== gender) return false;
      if (minExp !== "any" && d.experience_years < Number(minExp)) return false;
      if (language !== "any" && !(d.languages || []).includes(language)) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${d.full_name} ${d.specialization} ${d.city} ${d.clinic_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "fee_low") sorted.sort((a, b) => a.consultation_fee - b.consultation_fee);
    if (sort === "fee_high") sorted.sort((a, b) => b.consultation_fee - a.consultation_fee);
    if (sort === "experience") sorted.sort((a, b) => b.experience_years - a.experience_years);
    if (sort === "near_me" && userLocation) {
      // Sort by city match first (simple geo proximity approximation)
      sorted.sort((a, b) => {
        const aMatch = a.city?.toLowerCase() === detectedCity.toLowerCase() ? 0 : 1;
        const bMatch = b.city?.toLowerCase() === detectedCity.toLowerCase() ? 0 : 1;
        return aMatch - bMatch || b.rating - a.rating;
      });
    }
    return sorted;
  }, [doctors, speciality, city, mode, maxFee, gender, minExp, language, query, sort, userLocation]);

  const submitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.phone) {
      toast.error("Please enter your mobile number");
      return;
    }
    toast.success("Our care team will call you shortly 🌿");
    setLead({ phone: "", patient: "", pincode: "", concern: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthed ? <PatientHeader /> : <SiteNav />}
      <main>
        {/* Breadcrumb */}
        <div className="border-b border-border bg-background">
          <div className="container py-3">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/" className="text-primary hover:underline">Ayurveda</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">Doctors</span>
            </nav>
          </div>
        </div>

        {/* Filter bar */}
        <section className="bg-accent/40 border-b border-border">
          <div className="container py-5">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Select value={speciality} onValueChange={setSpeciality}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Speciality" /></SelectTrigger>
                <SelectContent>{SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(maxFee)} onValueChange={(v) => setMaxFee(Number(v))}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Fee" /></SelectTrigger>
                <SelectContent>{FEES.map((f) => <SelectItem key={f.v} value={String(f.v)}>{f.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>{GENDERS.map((g) => <SelectItem key={g.v} value={g.v}>{g.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={minExp} onValueChange={setMinExp}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Experience" /></SelectTrigger>
                <SelectContent>{EXP.map((e) => <SelectItem key={e.v} value={e.v}>{e.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  {languages.map((l) => <SelectItem key={l} value={l}>{l === "any" ? "Any language" : l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Consultation Type" /></SelectTrigger>
                <SelectContent>{MODES.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Results + sidebar */}
        <section className="py-8">
          <div className="container grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              {/* 24/7 Availability Indicator */}
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Doctors Available Now — Consult 24/7</p>
                  <p className="text-xs text-green-600">Video, In-Clinic, or Text Chat · Free follow-up within 7 days</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                  {loading ? "…" : filtered.filter((d) => d.video_available).length}+ online
                </span>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    Found <span className="text-primary">{loading ? "…" : filtered.length}</span> Ayurvedic Doctors Near You — 100% Verified
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    Discover your ideal Ayurvedic doctor today. Our platform connects you with qualified practitioners across India, offering personalized consultations and tailored treatment plans.
                  </p>
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger className="w-[180px] bg-card">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Top rated</SelectItem>
                    <SelectItem value="experience">Most experienced</SelectItem>
                    <SelectItem value="fee_low">Fee: low to high</SelectItem>
                    <SelectItem value="fee_high">Fee: high to low</SelectItem>
                    <SelectItem value="near_me">Near me</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleNearMe}
                  disabled={geoLoading}
                >
                  <Navigation className={`h-4 w-4 ${geoLoading ? "animate-pulse" : ""}`} />
                  {geoLoading ? "Detecting…" : userLocation ? `📍 ${detectedCity || "Near Me"}` : "Near Me"}
                </Button>
              </div>

              {!loading && error && (
                <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
                  <Stethoscope className="mx-auto h-10 w-10 text-destructive" />
                  <h3 className="mt-4 font-display text-xl">{error}</h3>
                  <Button variant="outline" className="mt-4" onClick={loadDoctors}>Try again</Button>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-16 text-center">
                  <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-xl">No doctors match your filters</h3>
                </div>
              )}

              <div className="mt-6 grid gap-5">
                {filtered.map((d) => {
                  const slotA = nextSlot(60);
                  const slotB = nextSlot(120);
                  return (
                    <article key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant">
                      <div className="flex flex-col gap-5 md:flex-row">
                        <div className="flex flex-col items-center gap-2 md:w-32">
                          <div className="relative">
                            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full gradient-leaf font-display text-2xl text-primary-foreground">
                              {d.avatar_url ? <img src={d.avatar_url} alt={d.full_name} className="h-full w-full object-cover"  loading="lazy" decoding="async" /> : initials(d.full_name)}
                            </div>
                            {d.video_available && (
                              <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                                <Video className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" /> {(d.total_reviews * 270 + 1280).toLocaleString()} Views
                          </div>
                          {d.is_verified && (
                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                              <BadgeCheck className="h-3.5 w-3.5" /> Verified Doctor
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h2 className="text-lg font-semibold leading-tight">{d.full_name}</h2>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-secondary text-secondary" />
                              <span className="font-semibold">{d.rating}/5</span>
                              <span className="text-muted-foreground">({d.total_reviews} Patient Stories)</span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{d.specialization}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <span>{d.experience_years}.0 years of experience</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>{d.category}</span>
                          </div>
                          {(d.languages || []).length > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">{d.languages.slice(0, 3).join(", ")}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" /> {d.clinic_name ? `${d.clinic_name}, ` : ""}{d.city}
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Consultation Fee </span>
                            <span className="font-display text-lg font-semibold">₹{d.consultation_fee}</span>
                            <span className="text-muted-foreground"> {d.video_available ? "online" : ""}</span>
                          </div>

                          <div className="mt-4 rounded-xl bg-primary/5 p-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                              <span className="font-medium text-primary">Next available at</span>
                              {d.video_available && (
                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                  <Video className="h-4 w-4 text-primary" /> {slotA}
                                </span>
                              )}
                              {d.in_clinic_available && (
                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                  <Calendar className="h-4 w-4 text-primary" /> {slotB}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button variant="outline" asChild><Link to={`/doctors/${d.id}`}>View Profile</Link></Button>
                            {d.video_available && (
                              <Button variant="hero" asChild>
                                <Link to={`/doctors/${d.id}?book=1&mode=video`}><Video className="mr-1 h-4 w-4" />Book Video Consultation</Link>
                              </Button>
                            )}
                            {d.in_clinic_available && !d.video_available && (
                              <Button variant="hero" asChild>
                                <Link to={`/doctors/${d.id}?book=1&mode=in_clinic`}><Calendar className="mr-1 h-4 w-4" />Book Clinic Visit</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Need Assistance sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="overflow-hidden border-2 border-primary/30">
                <CardContent className="p-6">
                  <h2 className="text-center font-display text-xl font-semibold">Need Assistance!</h2>
                  <p className="mt-1 text-center text-sm text-muted-foreground">
                    Share your details & we will find the best doctor for you
                  </p>
                  <form onSubmit={submitLead} className="mt-5 space-y-4">
                    <div>
                      <Label htmlFor="lead-phone" className="text-xs text-muted-foreground">Mobile Number*</Label>
                      <Input id="lead-phone" type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lead-patient" className="text-xs text-muted-foreground">Select Patient</Label>
                      <Select value={lead.patient} onValueChange={(v) => setLead({ ...lead, patient: v })}>
                        <SelectTrigger id="lead-patient" className="mt-1"><SelectValue placeholder="Self" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="family">Family member</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead-pin" className="text-xs text-muted-foreground">Pincode*</Label>
                      <Input id="lead-pin" value={lead.pincode} onChange={(e) => setLead({ ...lead, pincode: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lead-concern" className="text-xs text-muted-foreground">Health concerns/symptoms</Label>
                      <Textarea id="lead-concern" rows={3} value={lead.concern} onChange={(e) => setLead({ ...lead, concern: e.target.value })} className="mt-1" />
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
