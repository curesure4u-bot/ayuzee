import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, PlayCircle, Users } from "lucide-react";

const items = [
  { icon: PlayCircle, title: "Free video courses", desc: "Pre-recorded lessons from leading Ayurvedic physicians." },
  { icon: Users, title: "Live webinars", desc: "Weekly sessions on clinical topics & case studies." },
  { icon: BookOpen, title: "Case study library", desc: "Real-world insights from practitioners worldwide." },
  { icon: GraduationCap, title: "Certifications", desc: "Build credentials with structured learning paths." },
];

export const Learning = () => (
  <section className="bg-card/50 py-24" id="learning">
    <div className="container">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Learning Hub</span>
          <h2 className="mt-2 text-3xl md:text-4xl">For doctors who keep growing</h2>
          <p className="mt-3 text-muted-foreground">Continuing education, peer discussion, and a vibrant clinical community.</p>
        </div>
        <Button variant="outline">Join community</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border border-border bg-background p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-warm text-secondary-foreground shadow-warm">
              <i.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">{i.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
