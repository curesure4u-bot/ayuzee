import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Star } from "lucide-react";
import heroImg from "@/assets/hero-ayurveda.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-soft">
      <div className="container grid gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-32">
        <div className="flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Shield className="h-3.5 w-3.5" /> Verified Ayurvedic Care
          </span>
          <h1 className="font-display text-4xl leading-[1.05] text-balance text-foreground md:text-6xl lg:text-7xl">
            Heal naturally with <span className="italic text-primary">authentic</span> Ayurveda.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Consult verified Ayurvedic doctors, order classical medicines, and book holistic therapies — all in one trusted place.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by condition, doctor, or medicine…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="hero" size="lg" className="shrink-0">
              Search <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />)}</div>
              <span><strong className="text-foreground">4.9/5</strong> from 12,000+ patients</span>
            </div>
            <div><strong className="text-foreground">2,500+</strong> verified doctors</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full gradient-warm opacity-20 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full gradient-leaf opacity-25 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl shadow-elegant">
            <img src={heroImg} alt="Ayurvedic herbs and oils being prepared" width={1600} height={1200} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-elegant backdrop-blur md:left-auto md:right-6 md:max-w-xs">
            <div className="grid h-12 w-12 place-items-center rounded-full gradient-leaf">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">100% Authentic</p>
              <p className="text-xs text-muted-foreground">Lab-tested classical medicines</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
