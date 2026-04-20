import { Button } from "@/components/ui/button";
import { MapPin, Star, Video } from "lucide-react";

const doctors = [
  { name: "Dr. Anjali Sharma", spec: "Ayurveda • Spine Care", exp: "12 yrs", loc: "New Delhi", fee: 499, rating: 4.9 },
  { name: "Dr. Ravi Menon", spec: "Panchakarma Specialist", exp: "18 yrs", loc: "Kochi", fee: 699, rating: 4.8 },
  { name: "Dr. Priya Iyer", spec: "Gynaecology • Ayurveda", exp: "10 yrs", loc: "Bengaluru", fee: 599, rating: 4.9 },
  { name: "Dr. Karan Joshi", spec: "Naturopathy & Yoga", exp: "8 yrs", loc: "Pune", fee: 399, rating: 4.7 },
];

const initials = (n: string) => n.split(" ").slice(-2).map((p) => p[0]).join("");

export const Doctors = () => (
  <section className="py-24" id="doctors">
    <div className="container">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Meet our Doctors</span>
          <h2 className="mt-2 text-3xl md:text-4xl">Verified, experienced, trusted</h2>
          <p className="mt-3 text-muted-foreground">Connect via video or visit a nearby clinic. Every doctor is verified by our medical board.</p>
        </div>
        <Button variant="outline">View all doctors</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {doctors.map((d) => (
          <article key={d.name} className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-leaf font-display text-xl text-primary-foreground">
                {initials(d.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold leading-tight">{d.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.spec}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-secondary text-secondary" /> {d.rating} rating · {d.exp} exp.</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {d.loc}</div>
              <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video consult ₹{d.fee}</div>
            </div>
            <Button variant="hero" className="mt-6 w-full">Book appointment</Button>
          </article>
        ))}
      </div>
    </div>
  </section>
);
