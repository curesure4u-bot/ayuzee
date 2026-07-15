import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Truck,
  TrendingUp,
  Monitor,
  Headphones,
  Pill,
  Megaphone,
  FileText,
  Video,
  Gift,
  Stethoscope,
  UserCheck,
  ClipboardCheck,
  HandCoins,
  Upload,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Truck, title: "Free delivery of medicines to your patients across India" },
  { icon: TrendingUp, title: "Earn margins on every patient order" },
  { icon: Monitor, title: "Create personalized virtual clinic in 10 mins" },
  { icon: ClipboardCheck, title: "Free Patient Management Software" },
  { icon: Headphones, title: "Dedicated Relationship Manager" },
  { icon: Pill, title: "Access to 10,000+ medicines & 50+ brands" },
  { icon: Megaphone, title: "Personalized content for digital marketing" },
  { icon: FileText, title: "Create & share digital prescription" },
  { icon: Video, title: "Easy booking for Video & In-Clinic consultation" },
  { icon: Gift, title: "Gifts with exclusive monthly offers" },
];

const steps = [
  { n: 1, icon: UserCheck, title: "Register your account" },
  { n: 2, icon: ClipboardCheck, title: "Complete profile and verify account" },
  { n: 3, icon: Stethoscope, title: "Consult and place orders for your patients" },
  { n: 4, icon: Upload, title: "Upload your Bank Details" },
  { n: 5, icon: Wallet, title: "Receive your earnings" },
];

const faqs = [
  {
    q: "How will I get paid for consultations?",
    a: "The consultation fee paid by patients is transferred directly to your account after a successful consultation. You'll also earn margins on any medicine orders placed during the consultation.",
  },
  {
    q: "When will I receive my earnings?",
    a: "Your earnings, including consultation fees and medicine margins, are paid out according to Ayuzee's billing cycle — every Monday for orders delivered 7+ days ago.",
  },
  {
    q: "What happens if I miss a consultation?",
    a: "If you don't join a consultation, the appointment will be marked as cancelled or rescheduled. In case of cancellation, you won't receive any fee for that appointment.",
  },
  {
    q: "How do I manage appointments and prescriptions?",
    a: "After a consultation, create a prescription for your patient, place any medicine orders if needed, and mark the appointment as 'Consulted' inside the Ayuzee dashboard.",
  },
  {
    q: "How do I offer discounts on medicines to my patients?",
    a: "While creating an order for your patient, you can choose the discount that you want to offer on medicines.",
  },
  {
    q: "Where can I find more information about the cancellation policy?",
    a: "For details on appointment cancellations and fees, please refer to the Ayuzee Cancellation Policy inside the program guide after registering.",
  },
  {
    q: "Can I adjust my consultation settings later?",
    a: "Absolutely! You can change your consultation fees and other settings anytime under 'My Profile' inside the Ayuzee platform.",
  },
];

const AboutAyuzeePartner = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-border">
        <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">
              From Consultation to Delivery —{" "}
              <span className="text-primary">we've got you covered.</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Join the Ayuzee Partner Program to boost your Ayurvedic practice.
              Easily deliver medicines to your patients without stocking them
              yourself and earn on every order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/doctor">Go to Ayuzee Partner</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/partner">Public landing page</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl gradient-soft p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: "10K+", l: "Medicines" },
                { v: "50+", l: "Brands" },
                { v: "₹0", l: "Joining fee" },
                { v: "24/7", l: "Support" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl bg-background p-4 text-center"
                >
                  <p className="font-display text-2xl text-primary">{s.v}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6 md:p-8">
        <h2 className="font-display text-2xl">Ayuzee Partner Program</h2>
        <p className="mt-3 text-muted-foreground">
          The Ayuzee Partner Program is a first-of-its-kind initiative that
          empowers you with free digital tools, marketing support, and content
          utilities to expand your reach and streamline clinic operations. You
          can directly ship medicines to your patients without managing any
          inventory, and earn attractive margins on medicine orders. By joining,
          you get access to special resources that make your work easier, help
          you connect better with patients, and help your practice grow.
        </p>
      </Card>

      {/* Benefits */}
      <div>
        <h2 className="font-display text-2xl">Key Benefits</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((b) => (
            <Card
              key={b.title}
              className="bg-secondary/40 p-5 text-center transition-smooth hover:shadow-elegant"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl gradient-leaf">
                <b.icon className="h-6 w-6 text-primary-foreground" />
              </span>
              <p className="mt-3 text-sm font-medium">{b.title}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How to join */}
      <div>
        <h2 className="font-display text-2xl">
          How to Join the Ayuzee Partner Program
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <Card key={s.n} className="p-5 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                Step {s.n}
              </p>
              <p className="mt-1 text-sm font-medium">{s.title}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <Card className="p-6 md:p-8">
        <h2 className="text-center font-display text-2xl">FAQs</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* CTA */}
      <Card className="overflow-hidden p-0">
        <div className="gradient-leaf p-8 text-center text-primary-foreground md:p-10">
          <HandCoins className="mx-auto h-10 w-10" />
          <h3 className="mt-3 font-display text-2xl">
            Grow Your Ayurvedic Practice
          </h3>
          <p className="mt-2 text-primary-foreground/90">
            Ship medicines. Earn margins. Grow faster.
          </p>
          <Button variant="secondary" className="mt-5" asChild>
            <Link to="/doctor">Go to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AboutAyuzeePartner;
