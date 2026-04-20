import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Stethoscope,
  Pill,
  Monitor,
  FileText,
  Wallet,
  Users,
  Truck,
  ShieldCheck,
  TrendingUp,
  Clock,
} from "lucide-react";

const benefits = [
  {
    icon: Stethoscope,
    title: "Virtual Clinic",
    desc: "Set up your own digital clinic in minutes and consult patients across India.",
  },
  {
    icon: Pill,
    title: "10,000+ Authentic Medicines",
    desc: "Prescribe and deliver genuine Ayurvedic medicines sourced directly from manufacturers.",
  },
  {
    icon: TrendingUp,
    title: "Earn Healthy Margins",
    desc: "Get attractive margins on every medicine order placed through your prescription.",
  },
  {
    icon: Monitor,
    title: "Free Patient Management",
    desc: "Free PMS software to manage appointments, prescriptions and patient history.",
  },
  {
    icon: FileText,
    title: "Digital Prescription",
    desc: "Generate professional digital prescriptions with one click and share instantly.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    desc: "Patients receive their medicines at their doorstep — you focus on healing.",
  },
  {
    icon: Wallet,
    title: "Ayuzee Money Rewards",
    desc: "Earn cashback up to 3% on every transaction, redeemable on medicine purchases.",
  },
  {
    icon: Users,
    title: "Doctor Community",
    desc: "Join 50,000+ Ayurveda practitioners. Share cases, learn and grow together.",
  },
];

const steps = [
  {
    n: "01",
    title: "Register",
    desc: "Sign up as a doctor in less than 2 minutes with your basic details.",
  },
  {
    n: "02",
    title: "Verify",
    desc: "Submit your BAMS registration. Our team verifies within 24-48 hours.",
  },
  {
    n: "03",
    title: "Consult & Prescribe",
    desc: "Start consulting patients online or in-clinic and prescribe medicines.",
  },
  {
    n: "04",
    title: "Add Bank Details",
    desc: "Securely add your bank account or UPI to receive payouts directly.",
  },
  {
    n: "05",
    title: "Earn & Grow",
    desc: "Track earnings, unlock rewards and grow your practice with Ayuzee.",
  },
];

const faqs = [
  {
    q: "What is the Ayuzee Partner Program?",
    a: "Ayuzee Partner is a complete digital ecosystem for Ayurveda doctors — covering virtual consultations, e-prescriptions, doorstep medicine delivery, patient management and earnings — all in one platform.",
  },
  {
    q: "Who can become an Ayuzee Partner?",
    a: "Any registered Ayurveda practitioner (BAMS, MD-Ayurveda, etc.) with a valid council registration number can join after a quick verification by our team.",
  },
  {
    q: "Is there any joining or subscription fee?",
    a: "No. Joining the Ayuzee Partner Program is completely free. The Patient Management Software (PMS) is also free for life.",
  },
  {
    q: "How and when do I get paid?",
    a: "Consultation fees and medicine margins are credited to your Ayuzee account. Payouts are processed to your registered bank account on a weekly cycle.",
  },
  {
    q: "How much margin do I earn on medicines?",
    a: "You earn attractive margins on every authentic Ayurvedic medicine ordered by your patients via your prescription. Specific slabs are visible inside your dashboard.",
  },
  {
    q: "Can I set my own consultation fee?",
    a: "Yes. You have full control over your consultation fee, available time slots and modes (video / in-clinic).",
  },
  {
    q: "How do I manage appointments and patients?",
    a: "Our free PMS lets you manage your calendar, view patient history, send digital prescriptions and follow up — all from your Ayuzee doctor dashboard.",
  },
];

const Partner = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="gradient-soft border-b border-border">
        <div className="container py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Ayuzee Partner Program
              </span>
              <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
                From Consultation to Delivery —{" "}
                <span className="text-primary">we've got you covered.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Join India's fastest-growing Ayurveda ecosystem. Run your virtual
                clinic, prescribe authentic medicines, manage patients and earn
                more — all from one dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/doctor/auth?mode=signup">Become an Ayuzee Partner</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/doctor/auth">Doctor Sign in</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Free for life
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verified in 24-48 hrs
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> 50,000+ doctors
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { v: "50K+", l: "Doctors" },
                    { v: "10K+", l: "Medicines" },
                    { v: "3%", l: "Cashback" },
                    { v: "24/7", l: "Support" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl bg-background p-5 text-center"
                    >
                      <div className="font-display text-3xl font-semibold text-primary">
                        {s.v}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-4xl">
            Everything an Ayurveda doctor needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform. End-to-end tools to run, grow and scale your practice.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Card key={b.title} className="p-6 transition-smooth hover:shadow-elegant">
              <span className="grid h-11 w-11 place-items-center rounded-xl gradient-leaf">
                <b.icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card">
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl md:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              Get started in 5 simple steps and begin earning within days.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="font-display text-3xl font-semibold text-primary/60">
                  {s.n}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know before joining the Ayuzee Partner Program.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="overflow-hidden rounded-3xl gradient-leaf p-10 text-center shadow-elegant md:p-16">
          <h2 className="font-display text-3xl text-primary-foreground md:text-4xl">
            Ready to grow your Ayurveda practice?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
            Join thousands of doctors already partnering with Ayuzee. Sign up free
            in under 2 minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/doctor/auth?mode=signup">Become an Ayuzee Partner</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/doctor/auth">Already a partner? Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partner;
