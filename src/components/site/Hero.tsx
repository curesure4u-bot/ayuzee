import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePincode } from "@/hooks/usePincode";

const searchTabs = ["Doctors", "Therapies", "Medicines", "Colleges"] as const;
type SearchTab = (typeof searchTabs)[number];

const placeholders: Record<SearchTab, string> = {
  Doctors: "Search by doctor name, specialization...",
  Therapies: "Search Panchakarma, Shirodhara...",
  Medicines: "Search medicines, brands, conditions...",
  Colleges: "Search AYUSH colleges by state...",
};

const routes: Record<SearchTab, string> = {
  Doctors: "/doctors",
  Therapies: "/therapies",
  Medicines: "/shop",
  Colleges: "/colleges",
};

const doctors = [
  {
    initials: "AS",
    name: "Dr. Anjali Sharma",
    specialty: "Ayurveda · Spine Care",
    rating: "⭐ 4.9 · 12 yrs exp",
    location: "📍 New Delhi · ₹499/consult",
    className: "left-4 top-2 animate-[float_4s_ease-in-out_infinite]",
  },
  {
    initials: "RM",
    name: "Dr. Ravi Menon",
    specialty: "Panchakarma Specialist",
    rating: "⭐ 4.8 · 18 yrs exp",
    location: "📍 Kochi · ₹699/consult",
    className: "right-2 top-28 animate-[float_4s_ease-in-out_infinite_1.3s]",
  },
  {
    initials: "PI",
    name: "Dr. Priya Iyer",
    specialty: "Gynaecology · Ayurveda",
    rating: "⭐ 4.9 · 10 yrs exp",
    location: "📍 Bengaluru · ₹599/consult",
    className: "left-10 top-56 animate-[float_4s_ease-in-out_infinite_2.6s]",
  },
];

const quickLinks = [
  { label: "🩺 Ayurveda Doctors", href: "/doctors?system=Ayurveda" },
  { label: "🫙 Panchakarma", href: "/therapies?category=Panchakarma" },
  { label: "💊 Bulk Medicines", href: "/bulk" },
  { label: "🧬 Prakriti Quiz", href: "/diagnosis/prakriti" },
  { label: "🤲 Find Therapist", href: "/therapist/browse" },
];

const featureChips = [
  {
    label: "🗺️ GPS-Tracked Therapists",
    title: "Unlike NirogStreet — our therapists are GPS-tracked in real time for your safety",
  },
  { label: "🧬 AI Prakriti Diagnosis", title: "Get a guided Prakriti assessment before choosing care" },
  { label: "🩺 10,000+ AYUSH Doctors", title: "Consult verified practitioners across Ayurveda, Yoga, Unani, Siddha, and Homeopathy" },
  { label: "💊 5,000+ Authentic Medicines", title: "Shop trusted classical and patented AYUSH medicines" },
  { label: "🏥 Panchakarma Theater Booking", title: "Book equipped therapy spaces for authentic Panchakarma sessions" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("Doctors");
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const { checkPincode } = usePincode();

  useEffect(() => {
    setLocation(localStorage.getItem("ayuzee_city") || "");
    setPincode(localStorage.getItem("ayuzee_pincode") || "");
  }, []);

  const handleSearch = () => {
    const search = query.trim();
    navigate(`${routes[activeTab]}${search ? `?q=${encodeURIComponent(search)}` : ""}`);
  };

  const handleDeliveryCheck = () => {
    setDeliveryMessage(checkPincode(pincode) ? "✅ Delivery available · Arrives Tomorrow" : "⚠️ Enter a valid 6-digit pincode");
  };

  return (
    <>
      <section className="relative min-h-[580px] overflow-hidden gradient-soft">
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div className="container grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
                🌿 India's #1 AYUSH Aggregator
              </span>
              <span className="rounded-full border border-primary/20 bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
                ⭐ 4.9/5 from 12,000+ patients
              </span>
            </div>

            <h1 className="mt-5 font-display text-5xl leading-tight text-foreground md:text-6xl">
              Heal naturally with
              <br /> authentic Ayurveda.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              India's only platform with verified AYUSH doctors, GPS-tracked Panchakarma therapists, and authentic medicines — all in one place.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-2 shadow-elegant">
              <div className="mb-2 flex flex-wrap gap-2 px-2">
                {searchTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={
                      activeTab === tab
                        ? "rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                        : "px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={() => localStorage.setItem("ayuzee_city", location)}
                  placeholder="City or Pincode"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground sm:w-36 sm:border-0 sm:border-r sm:rounded-none"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={placeholders[activeTab]}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground sm:border-0"
                />
                <Button variant="hero" onClick={handleSearch} className="shrink-0">
                  Search <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border px-2 pt-2 text-sm">
                <span className="text-muted-foreground">📦 Deliver to:</span>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="button" onClick={handleDeliveryCheck} className="text-sm font-medium text-primary">
                  Check
                </button>
                {deliveryMessage && (
                  <span className={deliveryMessage.startsWith("✅") ? "text-primary" : "text-secondary"}>{deliveryMessage}</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => navigate(link.href)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative hidden h-[420px] md:block">
            {doctors.map((doctor) => (
              <div key={doctor.name} className={`absolute w-56 rounded-2xl border border-border bg-card p-4 shadow-elegant ${doctor.className}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {doctor.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{doctor.rating}</p>
                <p className="mt-1 text-xs text-muted-foreground">{doctor.location}</p>
                <Button variant="hero" size="sm" className="mt-2 w-full">
                  Book Now
                </Button>
              </div>
            ))}

            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-elegant">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">100% Verified</p>
                <p className="text-xs text-muted-foreground">By Ayuzee Medical Board</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-primary/5 py-6">
        <div className="container">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What makes Ayuzee different
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {featureChips.map((chip) => (
              <span
                key={chip.label}
                title={chip.title}
                className="rounded-full border border-primary/20 bg-accent px-4 py-2 text-sm font-medium text-primary"
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
