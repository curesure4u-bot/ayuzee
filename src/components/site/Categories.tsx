import { Activity, Brain, Flower2, HeartPulse, Leaf, Sparkles, Stethoscope, Wind } from "lucide-react";

const categories = [
  { icon: Leaf, label: "Ayurveda", desc: "Classical care" },
  { icon: Flower2, label: "Yoga", desc: "Mind & body" },
  { icon: Sparkles, label: "Naturopathy", desc: "Natural healing" },
  { icon: HeartPulse, label: "Homeopathy", desc: "Gentle remedies" },
  { icon: Wind, label: "Siddha", desc: "Ancient wisdom" },
  { icon: Brain, label: "Unani", desc: "Holistic medicine" },
  { icon: Stethoscope, label: "Spine Care", desc: "Pain relief" },
  { icon: Activity, label: "Wellness", desc: "Daily balance" },
];

export const Categories = () => (
  <section className="border-y border-border bg-card/50 py-20" id="therapies">
    <div className="container">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Our Specialties</span>
        <h2 className="mt-2 text-3xl md:text-4xl">Explore healing across traditions</h2>
        <p className="mt-3 text-muted-foreground">Find the right path for your wellness journey — guided by certified practitioners.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <button key={c.label} className="group flex flex-col items-start rounded-2xl border border-border bg-background p-6 text-left transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-smooth group-hover:gradient-leaf group-hover:text-primary-foreground">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">{c.label}</h3>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  </section>
);
