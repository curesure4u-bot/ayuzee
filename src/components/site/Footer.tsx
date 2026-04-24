import { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Apple, ExternalLink, Leaf, Play } from "lucide-react";
import { toast } from "sonner";

const patientLinks = [["Find AYUSH Doctor", "/doctors"], ["Book Panchakarma", "/therapist/browse"], ["Buy Medicines", "/shop"], ["Upload Prescription", "/shop/prescription"], ["Track Order", "/shop/track"], ["Prakriti Quiz", "/diagnosis/prakriti"]];
const doctorLinks = [["Join as Doctor", "/doctor/auth"], ["Doctor Dashboard", "/doctor"], ["Bulk Purchase", "/bulk"], ["Vaidya HMS Tool", "/vaidya"], ["Learning Hub", "/learning/courses"], ["Payouts & Earnings", "/doctor/payouts"]];
const therapistLinks = [["Join as Therapist", "/therapist/auth"], ["Therapist Dashboard", "/therapist"], ["Register Your Venue", "/venue/auth"], ["Venue Dashboard", "/venue"], ["Browse Therapists", "/therapist/browse"], ["Browse Venues", "/venue/browse"]];
const learnLinks = [["Courses & CME", "/learning/courses"], ["Webinars", "/learning/webinars"], ["Health Blogs", "/learning/blogs"], ["Doctor Feed", "/feed"], ["Student Portal", "/student"], ["Jobs Board", "/jobs"]];
const companyLinks = [["About Ayuzee", "#"], ["Careers", "/jobs"], ["Partner With Us", "/partner"], ["Press & Media", "#"], ["Contact Us", "#"], ["Refund Policy", "#"], ["Privacy Policy", "#"], ["Terms of Use", "#"]];
const socialLinks = ["Facebook", "Twitter/X", "Instagram", "YouTube", "LinkedIn"];

const FooterLinks = ({ title, links }: { title: string; links: string[][] }) => (
  <div>
    <h4 className="mb-3 font-semibold text-primary-foreground">{title}</h4>
    <ul className="space-y-2">
      {links.map(([label, href]) => (
        <li key={label}>
          <Link to={href} className="text-sm text-footer-muted transition-smooth hover:text-primary-foreground">{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  toast.success("Subscribed! 🌿");
  event.currentTarget.reset();
};

export const Footer = () => (
  <footer className="bg-footer text-footer-foreground">
    <section className="bg-primary py-10 text-primary-foreground">
      <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <p className="max-w-2xl text-lg font-semibold">🌿 Stay updated on Ayurvedic health tips, new doctors, and exclusive offers</p>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <input type="email" required placeholder="Enter your email" className="w-full rounded-full border border-primary-foreground/30 bg-primary-foreground/20 px-4 py-2 text-primary-foreground placeholder:text-primary-foreground/60 outline-none ring-offset-primary focus:ring-2 focus:ring-primary-foreground sm:w-64" />
          <button type="submit" className="rounded-full bg-primary-foreground px-6 py-2 font-semibold text-primary transition-smooth hover:opacity-90">Subscribe</button>
        </form>
      </div>
    </section>

    <section className="container grid grid-cols-2 gap-8 py-16 md:grid-cols-6">
      <div className="col-span-2">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10"><Leaf className="h-5 w-5 text-primary-foreground" /></span>
          <span className="font-display text-2xl font-semibold text-primary-foreground">Ayuzee</span>
        </Link>
        <p className="mt-4 max-w-sm text-sm leading-6 text-footer-muted">India's #1 AYUSH Aggregator Platform — connecting doctors, patients, therapists, and venues in one ecosystem.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {["🛡️ Verified by Ministry of AYUSH", "🔒 SSL Secured", "🇮🇳 Made in India"].map((badge) => <span key={badge} className="rounded-full bg-footer-pill px-3 py-1 text-xs text-footer-foreground">{badge}</span>)}
        </div>
        <div className="mt-4 flex gap-3">
          {socialLinks.map((label) => (
            <a key={label} href="#" aria-label={label} title={label} className="grid h-9 w-9 place-items-center rounded-full bg-footer-pill text-footer-foreground transition-smooth hover:bg-primary hover:text-primary-foreground"><ExternalLink className="h-4 w-4" /></a>
          ))}
        </div>
      </div>
      <FooterLinks title="For Patients" links={patientLinks} />
      <FooterLinks title="For Doctors" links={doctorLinks} />
      <FooterLinks title="Therapists & Venues" links={therapistLinks} />
      <FooterLinks title="Learn & Grow" links={learnLinks} />
      <FooterLinks title="Company" links={companyLinks} />
    </section>

    <section className="bg-footer-panel py-6">
      <div className="container flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="font-medium text-primary-foreground">📱 Ayuzee App coming soon — Get notified:</span>
          <input type="email" required placeholder="Email" className="w-full rounded-full border border-footer-border bg-footer/70 px-4 py-2 text-sm text-primary-foreground placeholder:text-footer-muted outline-none focus:ring-2 focus:ring-primary sm:w-48" />
          <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90">Notify Me</button>
        </form>
        <div className="flex flex-wrap items-center gap-3 text-sm text-footer-muted">
          <span>Available on</span>
          <span className="flex items-center gap-2 rounded-md bg-footer-pill px-4 py-2 text-footer-foreground"><Apple className="h-4 w-4" /> App Store</span>
          <span className="flex items-center gap-2 rounded-md bg-footer-pill px-4 py-2 text-footer-foreground"><Play className="h-4 w-4" /> Play Store</span>
        </div>
      </div>
    </section>

    <section className="container flex flex-wrap items-center justify-between gap-3 border-t border-footer-border py-4 text-xs text-footer-muted">
      <p>© 2025 Ayuzee Health Pvt. Ltd. All rights reserved. | CIN: U85100DL2024PTC000000</p>
      <p>🌿 Made with care in Tamil Nadu, India</p>
      <p>AYUSH Reg. No: XXXX | GST: XXXXXXXXX</p>
    </section>
  </footer>
);
