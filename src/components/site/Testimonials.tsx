import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  { name: "Ravi Kumar", role: "Patient · Chennai", condition: "Knee Arthritis", text: "Dr. Menon prescribed 14-day Janu Basti. I booked a therapist on Ayuzee, tracked them live to my home. Knee pain reduced 80% in 2 weeks. Revolutionary!", rating: 5, tag: "Panchakarma" },
  { name: "Dr. Priya Iyer", role: "Ayurveda Doctor · Bengaluru", condition: "", text: "Ayuzee gives me everything — Vaidya HMS for my clinic, bulk medicines at 30% off, and now I earn commission every time my patient books therapy. Income increased 40%.", rating: 5, tag: "Doctor" },
  { name: "Meera Nair", role: "Patient · Kochi", condition: "PCOD", text: "Took the Prakriti quiz, got matched to a Pitta doctor, and the medicines she prescribed arrived next day. My PCOD improved in 3 months naturally.", rating: 5, tag: "Prakriti AI" },
  { name: "Certified Therapist · Ananya S.", role: "Therapist · Hyderabad", condition: "", text: "I registered as a therapist, uploaded my Kerala Ayurveda certificate, and got approved in 24 hours. I now earn ₹25,000/week doing Panchakarma sessions.", rating: 5, tag: "Therapist" },
  { name: "Rajesh Verma", role: "Patient · Delhi", condition: "Spine Pain", text: "Ordered bulk Ashwagandha and Shallaki from Ayuzee. 35% cheaper than local market. Authentic certificate attached. Trust fully built.", rating: 5, tag: "Medicines" },
  { name: "Dr. Karan Joshi", role: "BAMS Student · Pune", condition: "", text: "The student portal has CME webinars, research papers, and a job board. I got my first hospital job through Ayuzee's jobs section. Incredible platform.", rating: 5, tag: "Student" },
  { name: "Sunita Reddy", role: "Patient · Hyderabad", condition: "Diabetes", text: "My doctor prescribed Ayurvedic medicines through Ayuzee. They auto-added to my cart. Delivered in 1 day. Set auto-refill for 30 days. So convenient.", rating: 5, tag: "Medicines" },
  { name: "Grand Resort Kovalam", role: "Venue Partner · Kerala", condition: "", text: "We listed our 3 Panchakarma therapy rooms on Ayuzee. Fully booked every weekend now. Revenue from room rentals increased 60%.", rating: 5, tag: "Venue" },
];

const tagStyles: Record<string, string> = {
  Panchakarma: "border-t-primary",
  Doctor: "border-t-info",
  "Prakriti AI": "border-t-mystic",
  Therapist: "border-t-secondary",
  Medicines: "border-t-earth",
  Student: "border-t-indigo",
  Venue: "border-t-warning",
};

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const maxIndex = testimonials.length - 1;

  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % testimonials.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const visibleTestimonials = useMemo(
    () => [0, 1, 2].map((offset) => testimonials[(currentIndex + offset) % testimonials.length]),
    [currentIndex],
  );

  const move = (direction: "prev" | "next") => {
    setCurrentIndex((index) => {
      if (direction === "next") return (index + 1) % testimonials.length;
      return (index - 1 + testimonials.length) % testimonials.length;
    });
  };

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Healing Stories</span>
            <h2 className="mt-2 text-3xl md:text-4xl">Trusted by patients, doctors & partners</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => move("prev")} aria-label="Previous testimonial">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => move("next")} aria-label="Next testimonial">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-3">
            {visibleTestimonials.map((story) => (
              <figure key={`${story.name}-${story.tag}`} className={cn("relative rounded-2xl border border-t-4 border-border bg-card p-6 shadow-soft", tagStyles[story.tag])}>
                <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" />
                <span className="absolute right-5 top-16 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {story.tag}
                </span>
                <blockquote className="min-h-[168px] pr-12 text-sm leading-7 text-foreground">“{story.text}”</blockquote>
                {story.condition && (
                  <span className="mt-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
                    {story.condition}
                  </span>
                )}
                <div className="mt-5 flex text-secondary" aria-label={`${story.rating} star rating`}>
                  {Array.from({ length: story.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">
                    {story.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{story.name}</p>
                    <p className="text-xs text-muted-foreground">{story.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((story, index) => (
            <button
              key={story.name}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn("h-2.5 rounded-full transition-all", index === currentIndex ? "w-8 bg-primary" : "w-2.5 bg-muted")}
              aria-label={`Show testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
