import { Leaf } from "lucide-react";

const cols = [
  { title: "Patients", links: ["Find a Doctor", "Book Consultation", "Buy Medicines", "Track Order", "Therapy Booking"] },
  { title: "Doctors", links: ["Join as Doctor", "Doctor Dashboard", "Learning Hub", "Forum", "Earnings"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { title: "Support", links: ["Help Center", "FAQ", "Privacy", "Terms", "Refund Policy"] },
];

export const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-16">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
        <div>
          <a href="#" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-semibold">Ayuzee</span>
          </a>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Bridging ancient Ayurvedic wisdom with modern care. Verified doctors, authentic medicines, holistic therapies.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-muted-foreground transition-smooth hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Ayuzee. All rights reserved.</p>
        <p>Made with care in India 🌿</p>
      </div>
    </div>
  </footer>
);
