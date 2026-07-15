import { ShieldCheck, BadgeCheck, Truck, Lock, HeartHandshake, Stethoscope } from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Verified AYUSH doctors",
    desc: "Every practitioner is credential-checked before joining.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic AYUSH medicines",
    desc: "Sourced from licensed manufacturers with batch traceability.",
  },
  {
    icon: Stethoscope,
    title: "Ayurveda • Homeo • Siddha • Unani",
    desc: "One platform for all recognised AYUSH systems.",
  },
  {
    icon: Truck,
    title: "Pan-India delivery",
    desc: "Prescription medicines and wellness products shipped nationwide.",
  },
  {
    icon: Lock,
    title: "Secure payments",
    desc: "PCI-compliant checkout powered by Razorpay.",
  },
  {
    icon: HeartHandshake,
    title: "Human support",
    desc: "Real people help with bookings, orders and refunds.",
  },
];

export const TrustStrip = () => (
  <section aria-labelledby="trust-strip-heading" className="border-y bg-accent/30">
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="trust-strip-heading" className="font-display text-2xl md:text-3xl">
          Why patients trust Ayuzee
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Built for authentic Ayurveda and AYUSH care — with the safety and convenience of a modern healthcare platform.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
