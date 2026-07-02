import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BadgePercent, Sparkles, Truck, Tag, Calendar, Gift } from "lucide-react";

const FEATURED_OFFERS = [
  {
    title: "Great Discounts — Offers Zone",
    subtitle: "Get up to 60% OFF",
    cta: "Shop Now",
    href: "/shop",
    accent: "from-secondary to-secondary/70",
    icon: BadgePercent,
  },
  {
    title: "Grand Stock-up Sale is Live",
    subtitle: "Up to 60% OFF · Coupon at checkout",
    cta: "Browse deals",
    href: "/shop",
    accent: "from-primary to-primary/70",
    icon: Tag,
  },
  {
    title: "Bonus Wednesday",
    subtitle: "Earn extra margin on every patient order",
    cta: "Learn more",
    href: "/bulk",
    accent: "from-accent to-primary/60",
    icon: Gift,
  },
];

const PERKS = [
  { icon: Truck, title: "Free delivery", body: "On orders above ₹1500 — across 55+ top Ayurveda brands." },
  { icon: BadgePercent, title: "Auto-applied at checkout", body: "Eligible offers appear instantly on the cart page." },
  { icon: Calendar, title: "Limited-period drops", body: "New campaigns every week. Stay tuned with your RM." },
  { icon: Sparkles, title: "Top brands", body: "Dabur, Kairali, Baidyanath, Kerala Ayurveda, Himalaya & more." },
];

const FAQS = [
  {
    q: "How do I redeem the offer?",
    a: "To redeem the offer, select the desired products from our website or app and proceed to the checkout page. The offer will be automatically visible there.",
  },
  {
    q: "Are there any specific conditions or requirements for free delivery?",
    a: "Yes, free delivery is valid for orders above ₹1500 and applies to all products from the 55+ top Ayurveda brands we carry.",
  },
  {
    q: "Is there a time limit for each offer, and how can I stay updated on expiration dates?",
    a: "Yes, each offer has a specified validity period. You can stay updated on the expiration dates by contacting your assigned RM or checking the offers page regularly for updates.",
  },
  {
    q: "How frequently are new offers added or updated on this page?",
    a: "We regularly update our offers page with new promotions and discounts from our 55+ top Ayurveda brands. For the latest schedule, please connect with your RM.",
  },
  {
    q: "Do I get great deals on every product?",
    a: "The top brands include Dabur, Kairali, Baidyanath, Kerala Ayurveda, Himalaya and many more. Most leading SKUs carry an active promotion at any given time.",
  },
];

const Offers = () => {
  usePageSEO({ title: "Offers — Ayuzee" });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <section className="gradient-soft border-b border-border">
          <div className="container py-12 md:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              <BadgePercent className="h-3.5 w-3.5" /> Offers Zone
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">Great discounts on India's top Ayurveda brands</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Save up to 60% across 55+ verified Ayurveda brands. Auto-applied at checkout — no codes to remember.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="hero" asChild><Link to="/shop">Shop offers</Link></Button>
              <Button variant="outline" asChild><Link to="/bulk">Bulk savings</Link></Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl">Featured deals</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {FEATURED_OFFERS.map((o) => (
                <Link
                  key={o.title}
                  to={o.href}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${o.accent} p-6 text-primary-foreground shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant`}
                >
                  <o.icon className="h-10 w-10 opacity-90" />
                  <h3 className="mt-6 font-display text-xl leading-tight">{o.title}</h3>
                  <p className="mt-2 text-sm opacity-90">{o.subtitle}</p>
                  <span className="mt-6 inline-block rounded-full bg-background/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                    {o.cta} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl">Why shop the Offers Zone</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PERKS.map((p) => (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">FAQs</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Offers — frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to know about discounts, validity and free delivery.</p>

            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Offers;
