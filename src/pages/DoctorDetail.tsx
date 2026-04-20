import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/site/BookingDialog";
import { ArrowLeft, MapPin, Star, Video, Building2, Languages, Stethoscope } from "lucide-react";
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
  bio: string | null;
}

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  const shouldOpenOnLoad = useMemo(() => params.get("book") === "1", [params]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("doctors")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setDoctor(data as Doctor | null);
        setLoading(false);
        if (data) document.title = `${(data as Doctor).full_name} — Ayuzee`;
      });
  }, [id]);

  const handleBookClick = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.info("Please sign in to book an appointment");
      navigate(`/auth?mode=signup`);
      return;
    }
    setBookingOpen(true);
  };

  useEffect(() => {
    if (shouldOpenOnLoad && doctor) {
      handleBookClick();
      const next = new URLSearchParams(params);
      next.delete("book");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldOpenOnLoad, doctor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-24 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Doctor not found</h1>
          <Button asChild variant="hero" className="mt-6"><Link to="/doctors">Back to doctors</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <div className="container py-8">
          <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All doctors
          </Link>
        </div>

        <section className="container pb-12">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl gradient-leaf font-display text-3xl text-primary-foreground shadow-elegant">
                  {initials(doctor.full_name)}
                </div>
                <div className="flex-1">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">{doctor.category}</span>
                  <h1 className="mt-3 font-display text-4xl">{doctor.full_name}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{doctor.specialization}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-secondary text-secondary" /> {doctor.rating} ({doctor.total_reviews} reviews)</span>
                    <span>{doctor.experience_years} years of experience</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Building2} label="Clinic" value={doctor.clinic_name ?? "—"} />
                <InfoRow icon={MapPin} label="City" value={doctor.city} />
                <InfoRow icon={Video} label="Video consult" value={doctor.video_available ? "Available" : "Not available"} />
                <InfoRow icon={Languages} label="Languages" value={doctor.languages.join(", ")} />
              </div>

              {doctor.bio && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl">About</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{doctor.bio}</p>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consultation fee</p>
              <p className="mt-1 font-display text-4xl">₹{doctor.consultation_fee}</p>
              <p className="mt-1 text-sm text-muted-foreground">per session</p>
              <Button variant="hero" size="lg" className="mt-6 w-full" onClick={handleBookClick}>
                Book appointment
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>✓ Secure payment via Razorpay</li>
                <li>✓ Instant confirmation</li>
                <li>✓ Free rescheduling up to 24h before</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} doctor={doctor} />
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default DoctorDetail;
