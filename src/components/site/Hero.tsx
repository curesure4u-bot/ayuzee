import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, Search, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePincode } from "@/hooks/usePincode";

const searchTabs = ["Doctors", "Therapies", "Medicines", "Courses"] as const;
type SearchTab = (typeof searchTabs)[number];

const placeholders: Record<SearchTab, string> = {
  Doctors: "Search doctor, specialty, city...",
  Therapies: "Search Panchakarma, Shirodhara...",
  Medicines: "Search medicines, brands, conditions...",
  Courses: "Search Ayurveda courses, webinars...",
};

const routes: Record<SearchTab, string> = {
  Doctors: "/doctors",
  Therapies: "/therapies",
  Medicines: "/shop",
  Courses: "/learning/courses",
};

const doctors = [
  {
    initials: "AS",
    name: "Dr. Anjali Sharma",
    specialty: "Ayurveda · Spine Care",
    rating: "4.9",
    reviews: "1,240 reviews",
    location: "New Delhi · ₹499",
    className: "left-0 top-4 animate-[hero-float_4.5s_ease-in-out_infinite]",
  },
  {
    initials: "RM",
    name: "Dr. Ravi Menon",
    specialty: "Panchakarma Specialist",
    rating: "4.8",
    reviews: "980 reviews",
    location: "Kochi · ₹699",
    className: "right-0 top-32 animate-[hero-float_4.5s_ease-in-out_infinite_1.2s]",
  },
  {
    initials: "PI",
    name: "Dr. Priya Iyer",
    specialty: "Gynaecology · Ayurveda",
    rating: "4.9",
    reviews: "860 reviews",
    location: "Bengaluru · ₹599",
    className: "left-10 top-64 animate-[hero-float_4.5s_ease-in-out_infinite_2.4s]",
  },
];

const testimonials = [
  { tag: "Patient", tone: "bg-primary/10 text-primary", quote: "Booked an Ayurveda doctor and got medicines delivered the next day.", name: "Meera K." },
  { tag: "Therapy", tone: "bg-secondary/10 text-secondary", quote: "The Panchakarma therapist was verified, punctual, and professional.", name: "Arvind S." },
  { tag: "Medicine", tone: "bg-accent text-accent-foreground", quote: "Authentic classical medicines with clear delivery updates.", name: "Nisha R." },
  { tag: "Student", tone: "bg-muted text-foreground", quote: "Courses and certificates helped me plan my Ayurveda career.", name: "Karthik M." },
  { tag: "Prakriti", tone: "bg-primary/10 text-primary", quote: "The Prakriti quiz made recommendations feel personal.", name: "Sonal P." },
];

const conditionLinks = [
  { label: "Arthritis", slug: "arthritis" },
  { label: "Back Pain", slug: "back-pain" },
  { label: "Diabetes", slug: "diabetes" },
  { label: "PCOD", slug: "pcod" },
  { label: "Digestive Care", slug: "digestive-health" },
  { label: "Skin & Hair", slug: "skin-hair" },
  { label: "Stress", slug: "mental-wellness" },
  { label: "Weight Loss", slug: "weight-management" },
  { label: "Immunity", slug: "immunity" },
  { label: "Heart & BP", slug: "heart-bp" },
  { label: "Sleep", slug: "sleep" },
  { label: "Wellness", slug: "general-wellness" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("Doctors");
  const [query, setQuery] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { pincode, city, deliveryAvailable, checkPincode } = usePincode();

  useEffect(() => {
    setPinInput(pincode);
  }, [pincode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((index) => (index + 1) % testimonials.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  const activeTestimonial = testimonials[testimonialIndex];
  const deliveryStatus = useMemo(() => {
    if (!pinInput.trim()) return "";
    return /^[1-9][0-9]{5}$/.test(pinInput.trim()) ? "valid" : "invalid";
  }, [pinInput]);

  const handleSearch = () => {
    const search = query.trim();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    navigate(`${routes[activeTab]}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleDeliveryCheck = () => {
    const valid = checkPincode(pinInput);
    setPinMessage(valid ? "Delivery available · Arrives Tomorrow" : "Enter a valid 6-digit pincode");
  };

  return (
    <section className="relative overflow-hidden gradient-soft">
      <style>{`
        @keyframes hero-float { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes testimonial-in { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="container grid min-h-[640px] gap-10 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
              🌿 India's #1 AYUSH Aggregator
            </span>
            <span className="rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
              ⭐ 4.9/5 from 12,000+ patients
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-foreground md:text-6xl">
            Find trusted AYUSH care for every health goal.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Book verified doctors, discover therapies, shop authentic medicines, and learn Ayurveda from one connected platform.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-3 shadow-elegant">
            <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "rounded-lg bg-background px-2 py-2 text-sm font-semibold text-foreground shadow-sm"
                      : "rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder={placeholders[activeTab]}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="hero" onClick={handleSearch} className="shrink-0">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> Deliver to:
              </span>
              <input
                value={pinInput}
                onChange={(event) => {
                  setPinInput(event.target.value);
                  setPinMessage("");
                }}
                onKeyDown={(event) => event.key === "Enter" && handleDeliveryCheck()}
                placeholder="Pincode"
                inputMode="numeric"
                maxLength={6}
                className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={handleDeliveryCheck} className="font-medium text-primary">
                Check
              </button>
              {pinMessage && (
                <span className={pinMessage.startsWith("Delivery") ? "text-primary" : "text-secondary"}>
                  {pinMessage.startsWith("Delivery") ? "✅" : "⚠️"} {pinMessage}
                </span>
              )}
              {!pinMessage && deliveryStatus === "valid" && deliveryAvailable !== false && (
                <span className="text-primary">✅ Valid pincode{city ? ` · ${city}` : ""}</span>
              )}
              {!pinMessage && deliveryStatus === "invalid" && <span className="text-secondary">⚠️ Enter 6 digits</span>}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Shop by health condition</p>
            <div className="flex flex-wrap gap-2">
              {conditionLinks.map((condition) => (
                <Link
                  key={condition.slug}
                  to={`/shop/conditions/${condition.slug}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {condition.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-[500px] md:block">
          {doctors.map((doctor) => (
            <div key={doctor.name} className={`absolute w-64 rounded-2xl border border-border bg-card p-4 shadow-elegant ${doctor.className}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {doctor.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                <span className="font-semibold text-foreground">{doctor.rating}</span>
                <span>{doctor.reviews}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">📍 {doctor.location}</p>
              <Button variant="hero" size="sm" className="mt-3 w-full" onClick={() => navigate("/doctors")}>
                Book Now
              </Button>
            </div>
          ))}

          <div className="absolute bottom-2 right-4 w-72 rounded-2xl border border-border bg-card p-4 shadow-elegant">
            <div key={testimonialIndex} className="animate-[testimonial-in_0.35s_ease-out]">
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeTestimonial.tone}`}>{activeTestimonial.tag}</span>
                <div className="flex gap-1">
                  {testimonials.map((item, index) => (
                    <span key={item.name} className={`h-1.5 w-1.5 rounded-full ${index === testimonialIndex ? "bg-primary" : "bg-border"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground">“{activeTestimonial.quote}”</p>
              <p className="mt-3 text-xs text-muted-foreground">— {activeTestimonial.name}</p>
            </div>
          </div>

          <div className="absolute bottom-24 left-0 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-elegant">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="flex items-center gap-1 font-semibold text-foreground">
                100% Verified <CheckCircle2 className="h-4 w-4 text-primary" />
              </p>
              <p className="text-xs text-muted-foreground">Doctors, therapists, medicines</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
