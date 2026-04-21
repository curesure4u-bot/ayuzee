import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { DoctorGrowth } from "@/components/doctor/DoctorGrowth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquareHeart,
  GraduationCap,
  Newspaper,
  Stethoscope,
  Building2,
  Lightbulb,
  Video,
  Sparkles,
  ShoppingBag,
  Handshake,
  Quote,
  Star,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
};

const stats = [
  { value: "1L+", label: "Doctors" },
  { value: "2L+", label: "Practitioners" },
  { value: "5L+", label: "Medicines" },
  { value: "100+", label: "Ayurveda Clinics" },
];

const exploreTiles = [
  { to: "/feed", label: "Clinical Discussions", icon: MessageSquareHeart, tone: "from-rose-100 to-rose-50 text-rose-600" },
  { to: "/learning/webinars", label: "Webinars by Vaidyas", icon: Video, tone: "from-sky-100 to-sky-50 text-sky-600" },
  { to: "/learning/courses", label: "Free Ayurveda Courses", icon: GraduationCap, tone: "from-emerald-100 to-emerald-50 text-emerald-600" },
  { to: "/learning/blogs", label: "News & Blogs", icon: Newspaper, tone: "from-amber-100 to-amber-50 text-amber-600" },
  { to: "/learning/quiz", label: "Quiz for Students", icon: Lightbulb, tone: "from-violet-100 to-violet-50 text-violet-600" },
  { to: "/doctors", label: "Find Doctors", icon: Stethoscope, tone: "from-teal-100 to-teal-50 text-teal-600" },
  { to: "/clinics", label: "Find Clinics", icon: Building2, tone: "from-fuchsia-100 to-fuchsia-50 text-fuchsia-600" },
];

const testimonials = [
  { name: "Dr. Ranjeet Singh", credentials: "BAMS, DMR (Diabetes)", quote: "Ayuzee's Learning is an extremely great platform for young Ayurveda enthusiasts to start learning in depth and enhance their knowledge." },
  { name: "Dr. Tanuja Naik", credentials: "BAMS, MA (Sanskrit) · 13+ yrs", quote: "Ayuzee Partner is a very useful feature as it has become very easy for me to place orders for patients without having to manage medicines." },
  { name: "Dr. Prayag Sethia", credentials: "BAMS, MD (Panchakarma) · 10+ yrs", quote: "Medicine delivery experienced has improved drastically. The overall experience of placing orders has also improved." },
  { name: "Dr. Ninad Nayak", credentials: "MD (Ayu), PGDCR · Cardio-Diabetologist", quote: "I am a regular user of the Ayuzee app and I buy medicines regularly. Placing orders for patients has become super easy." },
  { name: "Dr. Sharad Kulkarni", credentials: "MD (Shalya), Ph.D. · 7+ yrs", quote: "Really impressed by the Webinar Guest Series and the Quizzes that are posted regularly." },
];

const faqs = [
  { q: "How to navigate around Ayuzee Partner?", a: "Navigate to Ayuzee Partner from the sidebar under My Patients. You'll have access to appointment requests, patient orders, and partner rewards. Monitor new appointments and follow their progress in My Appointments." },
  { q: "Please elaborate on the patient consultation process.", a: "1. You'll see all new patient leads under Appointment Requests. 2. You can edit/view and update the information per your consultation. 3. View the appointment status under My Appointments." },
  { q: "My profile is not visible in Find Doctors. What are the prerequisites?", a: "1. Confirm that the Profile toggle is set to Public. 2. Ensure Education, Specialization, Services, and Experience are filled out — otherwise your profile will not be visible." },
  { q: "How will I charge for follow-up appointments from the patient?", a: "Ayuzee does not guarantee any financial gains on the website. Charging for follow-up appointments is contingent upon the interactions between doctor and patient during private and confidential video sessions." },
  { q: "What if the medicine I wish to recommend is not on the Ayuzee Platform?", a: "Ayuzee encourages doctors to utilize Ayuzee Partner for placing orders on behalf of patients to earn margins. If a specific medicine is unavailable, you can recommend an alternative or include it in the prescription for external acquisition." },
  { q: "How will I get the patient's address to place Ayuzee Partner orders?", a: "When initially placing the order, obtain the address during the video session or via call/text. This is a one-time requirement — no need to repeat unless the address changes." },
  { q: "What if the medicine value is lower than the minimum order value?", a: "If the medicine value is lower than the minimum order value, the patient will pay the standard delivery charges for the medicines." },
  { q: "In case of order cancellation, will I get my margins?", a: "If the partnership order is cancelled fully, you won't qualify for margins. However, if only a portion is cancelled, you'll still be eligible for partial margins." },
];

const promoBanners = [
  { title: "EARN EXTRA MARGIN ON EVERY PATIENT ORDER", subtitle: "Bigger orders = better margins", cta: "Place Order", to: "/bulk", gradient: "from-emerald-600 via-emerald-700 to-teal-800" },
  { title: "FREE AYURVEDA COURSES FOR DOCTORS", subtitle: "Learn from expert Vaidyas, certified curriculum", cta: "Browse Courses", to: "/learning/courses", gradient: "from-amber-500 via-orange-600 to-rose-600" },
  { title: "JOIN THE WEBINAR SERIES", subtitle: "Live sessions every week with leading practitioners", cta: "View Webinars", to: "/learning/webinars", gradient: "from-sky-600 via-indigo-700 to-violet-800" },
];

const DoctorHome = () => {
  const { doctor } = useDoctor();
  const [stats2, setStats2] = useState({ scheduled: 0, consulted: 0, completedSteps: 3 });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!doctor) return;
    (async () => {
      const [{ count: scheduled }, { count: consulted }, { data: prods }] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", doctor.id).in("status", ["scheduled", "confirmed", "pending"]),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", doctor.id).eq("status", "completed"),
        supabase.from("products").select("id, name, brand, price, discount_price, image_url").limit(12),
      ]);
      const flags = [
        true,
        !!doctor.is_approved,
        !!doctor.video_available,
        (doctor.bio?.length ?? 0) > 50,
        (consulted ?? 0) >= 1,
        !!doctor.in_clinic_available,
        (doctor.profile_completion ?? 0) >= 80,
      ];
      setStats2({
        scheduled: scheduled ?? 0,
        consulted: consulted ?? 0,
        completedSteps: flags.filter(Boolean).length,
      });
      setProducts((prods as Product[]) ?? []);
    })();
  }, [doctor]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-10">
      {/* 1. Partner Progress */}
      <DoctorGrowth scheduled={stats2.scheduled} consulted={stats2.consulted} completedSteps={stats2.completedSteps} />

      {/* 2. Promo banner carousel */}
      <Carousel opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {promoBanners.map((b, i) => (
            <CarouselItem key={i}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} p-8 text-primary-foreground md:p-12`}>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl">{b.title}</h2>
                  <p className="mt-3 text-base opacity-90 md:text-lg">{b.subtitle}</p>
                  <Button asChild size="lg" variant="secondary" className="mt-6">
                    <Link to={b.to}>{b.cta}</Link>
                  </Button>
                </div>
                <Sparkles className="absolute right-8 top-8 h-32 w-32 opacity-10" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      {/* 3. 1Veda Selection — curated products */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Ayuzee Selection</h2>
            <p className="text-sm text-muted-foreground">Curated medicines with the best partner margins</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/shop">View all</Link>
          </Button>
        </div>
        <Carousel opts={{ align: "start" }}>
          <CarouselContent className="-ml-4">
            {products.map((p) => (
              <CarouselItem key={p.id} className="basis-1/2 pl-4 sm:basis-1/3 lg:basis-1/4 xl:basis-1/6">
                <Link to={`/shop/${p.id}`}>
                  <Card className="overflow-hidden transition hover:shadow-elegant">
                    <div className="aspect-square bg-muted/40 p-4">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-contain" loading="lazy" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground"><ShoppingBag className="h-10 w-10" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                      <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Starts From</p>
                      <p className="font-semibold text-primary">₹{p.discount_price ?? p.price}</p>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-2" />
          <CarouselNext className="-right-2" />
        </Carousel>
      </section>

      {/* 4. Stats strip */}
      <section className="rounded-2xl border bg-card py-8">
        <h3 className="text-center font-display text-lg font-semibold">Learn and Engage with Ayurveda Experts</h3>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Largest selection / 6. Partnership program — feature blocks */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 p-8">
          <ShoppingBag className="h-10 w-10 text-sky-600" />
          <h3 className="mt-4 font-display text-xl font-semibold">Largest Selection of Medicines</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Shop confidently — your Ayurvedic dedication matched by our commitment to accessible, top-notch medicines. Together, let's nurture health and harmony.
          </p>
          <Button asChild className="mt-5"><Link to="/bulk">Bulk Purchase</Link></Button>
        </Card>
        <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 p-8">
          <Handshake className="h-10 w-10 text-emerald-600" />
          <h3 className="mt-4 font-display text-xl font-semibold">Increase Earning by Partnership Program</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Elevate patient care, streamline operations and boost efficiency. Join healthcare professionals dedicated to transforming wellness with Ayuzee Partner today.
          </p>
          <Button asChild className="mt-5"><Link to="/doctor/about-partner">Learn More</Link></Button>
        </Card>
      </section>

      {/* 7. Engage in Clinical Discussions */}
      <Card className="overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8 md:p-12">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <MessageSquareHeart className="h-10 w-10 text-violet-600" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Engage in Clinical Discussions</h3>
            <p className="mt-2 text-muted-foreground">
              Learn about Ayurveda with Vaidya Sambhasha conversations. Unlock ancient wisdom as experts guide your transformative journey. Join today to delve into the art with us!
            </p>
            <Button asChild className="mt-5"><Link to="/feed">Visit Feed</Link></Button>
          </div>
          <div className="hidden md:block">
            <div className="grid h-48 place-items-center rounded-2xl bg-card/60 backdrop-blur">
              <Quote className="h-24 w-24 text-violet-300" />
            </div>
          </div>
        </div>
      </Card>

      {/* 8. Online Courses & Webinars dual block */}
      <section>
        <h3 className="mb-4 text-center font-display text-2xl font-semibold">Explore our Online Courses & Join Latest Webinars</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100 p-8">
            <GraduationCap className="h-10 w-10 text-sky-700" />
            <h4 className="mt-4 font-display text-xl font-semibold">Shaping Tomorrow's Ayurvedic Leaders, Today!</h4>
            <p className="mt-2 text-sm text-muted-foreground">Crafting your business in every lesson. Ignite your Ayurvedic journey — Learn, Grow & Succeed with Ayuzee.</p>
            <Button asChild className="mt-5"><Link to="/learning/courses">View Courses</Link></Button>
          </Card>
          <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 p-8">
            <Video className="h-10 w-10 text-orange-600" />
            <h4 className="mt-4 font-display text-xl font-semibold">Beyond Medicine — Unveiling Ayurveda's Secrets!</h4>
            <p className="mt-2 text-sm text-muted-foreground">Join our groundbreaking webinars where doctors redefine prescriptions through expert knowledge sharing.</p>
            <Button asChild className="mt-5"><Link to="/learning/webinars">View Webinars</Link></Button>
          </Card>
        </div>
      </section>

      {/* 9. Trusted by Experienced Doctors */}
      <section>
        <h3 className="mb-6 text-center font-display text-2xl font-semibold">Trusted by Experienced Doctors</h3>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-4">
            {testimonials.map((t, i) => (
              <CarouselItem key={i} className="basis-full pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full p-6">
                  <Quote className="h-6 w-6 text-primary/40" />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t pt-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">
                      {t.name.split(" ").map((n) => n[0]).slice(1, 3).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.credentials}</p>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* 10. Explore More tiles */}
      <section>
        <h3 className="mb-4 font-display text-xl font-semibold">Explore More</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {exploreTiles.map((t) => (
            <Link key={t.to} to={t.to}>
              <Card className={`group h-full bg-gradient-to-br ${t.tone} p-4 text-center transition hover:shadow-elegant`}>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card/80 backdrop-blur transition group-hover:scale-110">
                  <t.icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-xs font-medium leading-tight">{t.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 11. FAQs */}
      <section>
        <h3 className="mb-4 text-center font-display text-2xl font-semibold">FAQs</h3>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border bg-card px-4">
              <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};

export default DoctorHome;
