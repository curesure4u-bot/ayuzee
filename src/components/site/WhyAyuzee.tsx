import { Brain, Building2, GraduationCap, MapPin, Package } from "lucide-react";

const platforms = ["Feature", "Ayuzee", "NirogStreet", "Tata 1mg", "Practo", "PharmEasy"];

const comparisonRows = [
  ["🩺 AYUSH Doctor Search", "yes", "yes", "no", "yes", "no"],
  ["🫙 Panchakarma Booking", "yes", "no", "no", "no", "no"],
  ["🤲 Certified Therapists", "yes", "no", "no", "no", "no"],
  ["🗺️ GPS Therapist Tracking", "yes", "no", "no", "no", "no"],
  ["🏥 Therapy Room Marketplace", "yes", "no", "no", "no", "no"],
  ["🧬 AI Prakriti Diagnosis", "yes", "no", "no", "no", "no"],
  ["💊 Authentic AYUSH Medicines", "yes", "yes", "limited", "no", "limited"],
  ["📦 Bulk Doctor Purchase", "yes", "yes", "no", "no", "no"],
  ["🎓 CME / Learning Hub", "yes", "yes", "no", "no", "no"],
  ["📋 Vaidya HMS (Clinic Tool)", "yes", "no", "no", "yes", "no"],
  ["🌿 Daily AI Wellness Routine", "yes", "no", "no", "no", "no"],
  ["🏫 Student Portal + Jobs", "yes", "no", "no", "no", "no"],
];

const differentiators = [
  {
    icon: MapPin,
    eyebrow: "🗺️ GPS Tracked Therapists",
    title: "Uber-model Panchakarma",
    body: "Doctor prescribes → patient picks therapist + room → live GPS tracking during session. No other AYUSH platform has this.",
    tag: "Not on NirogStreet ✗",
    className: "border-primary/30 bg-primary/5",
  },
  {
    icon: Brain,
    eyebrow: "🧬 AI Prakriti Engine",
    title: "Your Dosha. Your Plan.",
    body: "5-min quiz → AI generates your Ayurvedic body constitution + daily routine + doctor match. Powered by Claude AI.",
    tag: "Not on 1mg ✗",
    className: "border-secondary/30 bg-secondary/5",
  },
  {
    icon: Building2,
    eyebrow: "🏥 Therapy Room Marketplace",
    title: "Panchakarma Theater Booking",
    body: "Hospitals and resorts list their Panchakarma rooms like Airbnb. Doctors book rooms for patients. Revenue shared 4 ways.",
    tag: "Not anywhere else ✗",
    className: "border-accent-foreground/20 bg-accent/40",
  },
  {
    icon: GraduationCap,
    eyebrow: "📚 AYUSH Student Hub",
    title: "For BAMS/BHMS Students",
    body: "Courses, CME webinars, research papers, job board, and certificates — a complete career platform for Ayurveda students.",
    tag: "Not on Practo ✗",
    className: "border-muted-foreground/20 bg-muted/40",
  },
  {
    icon: Package,
    eyebrow: "💊 Doctor-to-Patient Medicine Chain",
    title: "Prescription → Cart → Door",
    body: "Doctor prescribes → medicines auto-add to patient cart → Delhivery delivers. Fully traceable medicine chain.",
    tag: "Not on NirogStreet ✗",
    className: "border-primary/20 bg-card",
  },
];

const StatusMark = ({ value }: { value: string }) => {
  if (value === "yes") {
    return (
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        ✓
      </span>
    );
  }

  if (value === "limited") {
    return (
      <span
        title="Allopathic focus, limited AYUSH"
        className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary"
      >
        ~
      </span>
    );
  }

  return (
    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
      ×
    </span>
  );
};

export const WhyAyuzee = () => {
  return (
    <>
      <section className="border-y border-border bg-card/50 py-20">
        <div className="container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
              🏆 Why Ayuzee
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl">Everything you need. Nothing they have.</h2>
            <p className="mt-3 text-muted-foreground">We compared the top platforms so you don't have to.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  {platforms.map((platform) => (
                    <th key={platform} className="px-4 py-4 text-left font-semibold first:w-[270px] [&:not(:first-child)]:text-center">
                      {platform === "Ayuzee" ? (
                        <span className="block rounded-xl bg-primary-foreground/15 px-3 py-2">
                          🏆 Ayuzee
                          <span className="block text-xs font-medium opacity-90">Your Best Choice</span>
                        </span>
                      ) : (
                        platform
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, rowIndex) => (
                  <tr key={row[0]} className={rowIndex % 2 === 0 ? "bg-background" : "bg-card/50"}>
                    <td className="border-t border-border px-4 py-3 font-medium text-foreground">{row[0]}</td>
                    {row.slice(1).map((value, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={index === 0 ? "border-t border-border bg-primary/5 px-4 py-3" : "border-t border-border px-4 py-3"}
                      >
                        <StatusMark value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ayuzee is the ONLY platform in India combining all of these in one place.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-10 text-center font-display text-2xl">What only Ayuzee offers</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {differentiators.map((item) => (
            <article key={item.title} className={`rounded-2xl border p-5 shadow-soft ${item.className}`}>
              <item.icon className="mb-4 h-9 w-9 text-primary" />
              <p className="text-xs font-semibold text-primary">{item.eyebrow}</p>
              <h3 className="mt-3 text-lg font-semibold leading-tight text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
              <div className="mt-5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {item.tag}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};