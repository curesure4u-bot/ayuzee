import { Quote } from "lucide-react";

const stories = [
  { name: "Meera R.", role: "Mumbai", text: "After years of chronic back pain, my Ayuzee doctor's Panchakarma plan changed everything. I feel lighter, calmer, free." },
  { name: "Aman K.", role: "Delhi", text: "Booking a video consultation took two minutes. Authentic medicines delivered next day. Highly recommend." },
  { name: "Dr. Sunita B.", role: "Practitioner", text: "Ayuzee gives me everything — patient management, prescriptions, learning, community. It's a complete platform." },
];

export const Testimonials = () => (
  <section className="py-24">
    <div className="container">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Healing Stories</span>
        <h2 className="mt-2 text-3xl md:text-4xl">Trusted by patients & practitioners</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {stories.map((s) => (
          <figure key={s.name} className="relative rounded-2xl border border-border bg-card p-8 shadow-soft">
            <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/15" />
            <blockquote className="text-foreground">"{s.text}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">{s.name[0]}</div>
              <div>
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
