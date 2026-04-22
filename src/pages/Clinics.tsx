import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { Building2, ChevronRight, MapPin, Stethoscope, Wallet } from "lucide-react";
import { toast } from "sonner";

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

const FEES = [
  { v: 5000, l: "Any fee" },
  { v: 1000, l: "Up to ₹1000" },
  { v: 500, l: "Up to ₹500" },
  { v: 300, l: "Up to ₹300" },
];
const GENDERS = [
  { v: "any", l: "Any gender" },
  { v: "male", l: "Male doctor" },
  { v: "female", l: "Female doctor" },
];
const EXP = [
  { v: "any", l: "Any experience" },
  { v: "5", l: "5+ years" },
  { v: "10", l: "10+ years" },
  { v: "15", l: "15+ years" },
];

const Clinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [city, setCity] = useState("All");
  const [service, setService] = useState("All");
  const [fee, setFee] = useState(5000);
  const [gender, setGender] = useState("any");
  const [exp, setExp] = useState("any");

  const [lead, setLead] = useState({ phone: "", patient: "", pincode: "", concern: "" });

  useEffect(() => {
    document.title = "Find a Clinic — Ayuzee";
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
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
  const services = useMemo(
    () => ["All", ...Array.from(new Set(clinics.flatMap((c) => c.services ?? [])))],
    [clinics],
  );

  const filtered = useMemo(
    () =>
      clinics.filter((c) => {
        if (city !== "All" && c.city !== city) return false;
        if (service !== "All" && !(c.services ?? []).includes(service)) return false;
        return true;
      }),
    [clinics, city, service],
  );

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
              <span className="text-foreground">Clinics</span>
            </nav>
          </div>
        </div>

        {/* Filter bar */}
        <section className="bg-accent/40 border-b border-border">
          <div className="container py-5">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Services" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All services" : s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={String(fee)} onValueChange={(v) => setFee(Number(v))}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Fee" /></SelectTrigger>
                <SelectContent>{FEES.map((f) => <SelectItem key={f.v} value={String(f.v)}>{f.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>{GENDERS.map((g) => <SelectItem key={g.v} value={g.v}>{g.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={exp} onValueChange={setExp}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Experience" /></SelectTrigger>
                <SelectContent>{EXP.map((e) => <SelectItem key={e.v} value={e.v}>{e.l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="City" /></SelectTrigger>
                <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Results + sidebar */}
        <section className="py-8">
          <div className="container grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Found <span className="text-primary">{loading ? "…" : filtered.length}</span> Ayurvedic Clinics Near You — 100% Verified
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Discover your ideal Ayurvedic Clinics today. Our platform connects you with qualified practitioners across India, offering personalized consultations and tailored treatment plans.
              </p>

              {!loading && filtered.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-16 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-xl">No clinics match your filters</h3>
                </div>
              )}

              <div className="mt-6 grid gap-5">
                {filtered.map((c) => (
                  <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant">
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-12 w-12 text-primary" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold uppercase leading-tight">{c.name}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                            ⭐ New
                          </span>
                        </div>

                        <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{c.address ? `${c.address}, ` : ""}{c.city}{c.state ? `, ${c.state}` : ""}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Consultation fee</span>
                          <span className="font-semibold">₹{200 + Math.floor((c.rating || 4) * 50)}</span>
                        </div>

                        {(c.services ?? []).length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-semibold">Services</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(c.services ?? []).slice(0, 6).map((s) => (
                                <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Doctor mini-card */}
                        <div className="mt-5 rounded-xl border border-border bg-background p-3">
                          <div className="flex items-start gap-3">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-primary">
                              <Stethoscope className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                Dr. {c.name.split(" ")[0]} Lead
                                <span className="text-xs font-medium text-secondary-foreground">⭐ New</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {(c.specialities ?? []).slice(0, 3).join(", ") || "Ayurveda Consultation"}
                              </p>
                              <p className="text-xs text-muted-foreground">8.0 years of experience</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" asChild>
                            <Link to="/doctors">View Doctors</Link>
                          </Button>
                          <Button variant="hero" asChild>
                            <Link to="/doctors">Book Appointment</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Need Assistance sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="overflow-hidden border-2 border-primary/30">
                <CardContent className="p-6">
                  <h3 className="text-center font-display text-xl font-semibold">Need Assistance!</h3>
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

export default Clinics;
