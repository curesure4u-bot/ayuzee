import { ArrowUpRight } from "lucide-react";

const posts = [
  { tag: "Wellness", title: "5 daily Ayurvedic rituals for better sleep", read: "4 min read" },
  { tag: "Therapy", title: "Understanding Panchakarma: a beginner's guide", read: "7 min read" },
  { tag: "Nutrition", title: "Eating by the doshas: balancing your plate", read: "5 min read" },
];

export const Blog = () => (
  <section className="bg-accent/40 py-24" id="blog">
    <div className="container">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">From the Blog</span>
          <h2 className="mt-2 text-3xl md:text-4xl">Wisdom for everyday wellness</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">All articles →</a>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <a key={p.title} href="#" className="group rounded-2xl border border-border bg-card p-6 transition-smooth hover:-translate-y-1 hover:shadow-elegant">
            <div className="mb-6 aspect-[4/3] overflow-hidden rounded-xl gradient-soft">
              <div className="flex h-full items-center justify-center font-display text-7xl text-primary/15">A</div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{p.tag}</span>
            <h3 className="mt-2 text-xl leading-tight">{p.title}</h3>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{p.read}</span>
              <ArrowUpRight className="h-4 w-4 transition-smooth group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);
