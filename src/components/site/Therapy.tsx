import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import therapyImg from "@/assets/therapy-room.jpg";

const points = [
  "Panchakarma detox programs",
  "Abhyanga full-body oil massage",
  "Shirodhara stress relief therapy",
  "Resort & in-clinic locations across India",
];

export const Therapy = () => (
  <section className="py-24">
    <div className="container grid items-center gap-12 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-3xl shadow-elegant">
        <img src={therapyImg} alt="Ayurvedic therapy room" loading="lazy" width={1200} height={900} className="h-full w-full object-cover" />
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Therapy & Retreats</span>
        <h2 className="mt-2 text-3xl md:text-4xl">Immersive healing experiences</h2>
        <p className="mt-4 text-muted-foreground">Book authentic Ayurvedic therapies at certified clinics and partner resorts. Curated practitioners, verified spaces, transparent pricing.</p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-foreground">{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="hero" size="lg">Browse therapies</Button>
          <Button variant="outline" size="lg">Become a partner</Button>
        </div>
      </div>
    </div>
  </section>
);
