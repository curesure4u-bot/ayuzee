import { Footer } from "@/components/site/Footer";
import { Shield, Mail, Lock, Cookie, ExternalLink, UserCheck, Trash2, Scale } from "lucide-react";
import { useCompanyLegal } from "@/lib/legal";

const FALLBACK_SECTIONS = [
  {
    icon: Shield,
    title: "Introduction",
    content: (
      <>
        <p>
          This Privacy Policy explains how Ayuzee collects, uses, stores and protects personal information when you use our platform.
        </p>
        <p className="mt-2">
          By using Ayuzee, you agree to the practices described here. If you do not agree, please do not use the platform.
        </p>
      </>
    ),
  },
  {
    icon: UserCheck,
    title: "Data We Collect",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Account information: name, email, phone and profile details.</li>
        <li>Health and wellness information you share during consultations, assessments or therapy bookings.</li>
        <li>Payment information processed by authorised partners.</li>
        <li>Usage data such as pages visited, device type and browser information.</li>
      </ul>
    ),
  },
  {
    icon: Lock,
    title: "How We Use Your Data",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>To provide appointments, orders, therapy bookings and account management.</li>
        <li>To connect you with verified AYUSH doctors, therapists and venues.</li>
        <li>To process payments and improve platform safety and features.</li>
        <li>To send transactional notifications and optional marketing (opt-out available).</li>
      </ul>
    ),
  },
  {
    icon: ExternalLink,
    title: "Third-Party Services",
    content: (
      <>
        <p>We use trusted providers including Supabase (infrastructure) and Razorpay (payments). We do not sell your personal data.</p>
      </>
    ),
  },
  {
    icon: Cookie,
    title: "Cookies & Analytics",
    content: (
      <p>
        Essential cookies keep you signed in. Optional analytics (e.g. error monitoring) run only with your consent via the cookie banner.
      </p>
    ),
  },
  {
    icon: UserCheck,
    title: "Your Rights (DPDP Act 2023)",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Access and correct your personal data via account settings.</li>
        <li>Download a copy of your data from your patient profile.</li>
        <li>Request account deletion — we respond within 30 days.</li>
        <li>Withdraw consent for optional processing (marketing, analytics).</li>
        <li>Nominate another person to exercise your rights in case of death or incapacity.</li>
        <li>File a grievance with our Grievance Officer (contact below).</li>
      </ul>
    ),
  },
  {
    icon: Trash2,
    title: "Data Retention & Security",
    content: (
      <p>
        We retain data only as long as necessary and apply encryption, access controls and row-level security. Health data receives enhanced safeguards.
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const { content, info, loading } = useCompanyLegal("privacy");
  const grievanceEmail = info?.grievance_email ?? "complaints@ayuzee.com";
  const supportEmail = info?.support_email ?? "support@ayuzee.com";

  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: July 2026</p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            This page describes Ayuzee&apos;s data practices under India&apos;s Digital Personal Data Protection Act, 2023 (DPDP) and applicable IT rules. It is maintained by Ayuzee and is not an independent legal audit.
          </div>

          {content?.body && !loading ? (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Scale className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl font-semibold">{content.title}</h2>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap pl-12 text-muted-foreground leading-relaxed">
                {content.body}
              </div>
            </section>
          ) : (
            FALLBACK_SECTIONS.map(({ icon: Icon, title, content: body }) => (
              <section key={title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold">{title}</h2>
                </div>
                <div className="pl-12 text-muted-foreground leading-relaxed">{body}</div>
              </section>
            ))
          )}

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Grievance Officer &amp; Contact</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Under the DPDP Act, you may contact our Grievance Officer for complaints about personal data processing:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>
                Grievance:{" "}
                <a href={`mailto:${grievanceEmail}`} className="text-primary hover:underline">
                  {grievanceEmail}
                </a>
              </li>
              <li>
                Support:{" "}
                <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                  {supportEmail}
                </a>
              </li>
              {info?.legal_name && <li>Data Fiduciary: {info.legal_name}</li>}
              {info?.address && <li>{info.address}</li>}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
