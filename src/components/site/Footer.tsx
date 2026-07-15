import { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Apple, Leaf, Play } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

async function subscribeEmail(email: string, source: "footer" | "app_waitlist") {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    toast.error(parsed.error.issues[0].message);
    return false;
  }
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.toLowerCase(), source });
  if (error) {
    if (error.code === "23505") {
      toast.success("You're already subscribed 🌿");
      return true;
    }
    toast.error(error.message || "Could not subscribe. Please try again.");
    return false;
  }
  toast.success(source === "app_waitlist" ? "We'll notify you when the app launches!" : "Subscribed! 🌿");
  return true;
}

const patientLinks = [["Find AYUSH Doctor", "/doctors"], ["Book Panchakarma", "/therapist/browse"], ["Buy Medicines", "/shop"], ["Upload Prescription", "/shop/prescription"], ["Track Order", "/shop/track"], ["Prakriti Quiz", "/diagnosis/prakriti"]];
const doctorLinks = [["Join as Doctor", "/doctor/auth"], ["Doctor Dashboard", "/doctor"], ["Bulk Purchase", "/bulk"], ["Vaidya HMS Tool", "/vaidya"], ["Learning Hub", "/learning/courses"], ["Payouts & Earnings", "/doctor/payouts"]];
const therapistLinks = [["Join as Therapist", "/therapist/auth"], ["Therapist Dashboard", "/therapist"], ["Register Your Venue", "/venue/auth"], ["Venue Dashboard", "/venue"], ["Browse Therapists", "/therapist/browse"], ["Browse Venues", "/venue/browse"]];
const learnLinks = [["Courses & CME", "/learning/courses"], ["Webinars", "/learning/webinars"], ["Health Blogs", "/learning/blogs"], ["Doctor Feed", "/feed"], ["Student Portal", "/student"], ["Jobs Board", "/jobs"]];
const companyLinks = [["About Ayuzee", "/about-us"], ["Careers", "/jobs"], ["Partner With Us", "/partner"], ["Press & Media", "/press"], ["Contact Us", "/contact"]];
const legalLinks = [["Privacy Policy", "/privacy-policy"], ["Terms of Use", "/terms-of-use"], ["Refund Policy", "/refund-policy"], ["Medical Disclaimer", "/medical-disclaimer"]];

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/ayuzee", Icon: FacebookIcon },
  { label: "Twitter/X", href: "https://x.com/ayuzee", Icon: XIcon },
  { label: "Instagram", href: "https://instagram.com/ayuzee", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com/@ayuzee", Icon: YouTubeIcon },
  { label: "LinkedIn", href: "https://linkedin.com/company/ayuzee", Icon: LinkedInIcon },
];

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

const makeSubmitHandler = (source: "footer" | "app_waitlist") => async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const email = String(data.get("email") ?? "");
  const ok = await subscribeEmail(email, source);
  if (ok) form.reset();
};

const handleNewsletterSubmit = makeSubmitHandler("footer");
const handleAppWaitlistSubmit = makeSubmitHandler("app_waitlist");

export const Footer = () => {
  const { role, loading } = useUserRole();
  const isDoctor = role === "doctor";

  const adjustedDoctorLinks = doctorLinks.map(([label, href]) =>
    label === "Payouts & Earnings" ? [label, !loading && isDoctor ? href : "/doctor/auth"] : [label, href]
  ) as string[][];

  return (
    <footer className="bg-footer text-footer-foreground">
      <section className="bg-primary py-10 text-primary-foreground">
        <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-2xl text-lg font-semibold">🌿 Stay updated on Ayurvedic health tips, new doctors, and exclusive offers</p>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <input name="email" type="email" required maxLength={255} placeholder="Enter your email" className="w-full rounded-full border border-primary-foreground/30 bg-primary-foreground/20 px-4 py-2 text-primary-foreground placeholder:text-primary-foreground/60 outline-none ring-offset-primary focus:ring-2 focus:ring-primary-foreground sm:w-64" />
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
            {socialLinks.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="grid h-9 w-9 place-items-center rounded-full bg-footer-pill text-footer-foreground transition-smooth hover:bg-primary hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FooterLinks title="For Patients" links={patientLinks} />
        <FooterLinks title="For Doctors" links={adjustedDoctorLinks} />
        <FooterLinks title="Therapists & Venues" links={therapistLinks} />
        <FooterLinks title="Learn & Grow" links={learnLinks} />
        <FooterLinks title="Company" links={companyLinks} />
        <FooterLinks title="Legal" links={legalLinks} />
      </section>

      <section className="bg-footer-panel py-6">
        <div className="container flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <form onSubmit={handleAppWaitlistSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="font-medium text-primary-foreground">📱 Ayuzee App coming soon — Get notified:</span>
            <input name="email" type="email" required maxLength={255} placeholder="Email" className="w-full rounded-full border border-footer-border bg-footer/70 px-4 py-2 text-sm text-primary-foreground placeholder:text-footer-muted outline-none focus:ring-2 focus:ring-primary sm:w-48" />
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
        <p>© 2026 Ayuzee — Part of AL SHIFA AYUSH HEALTH CARE PVT LTD. All rights reserved. | CIN: U52310TN2015PTC100787 | GST: 33AANCA5650J1ZJ</p>
        <p>🌿 Made with care in Tamil Nadu, India</p>
      </section>
    </footer>
  );
};
