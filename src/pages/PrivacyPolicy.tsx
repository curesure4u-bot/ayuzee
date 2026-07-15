import { Footer } from "@/components/site/Footer";
import { Shield, Mail, Lock, Cookie, ExternalLink, UserCheck, Trash2 } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";

const PrivacyPolicy = () => {
  usePageSEO({
    title: "Privacy Policy — Ayuzee",
    description: "How Ayuzee collects, uses and protects your personal and health information across doctors, medicines, therapies and gamification.",
    canonicalPath: "/privacy-policy",
  });
  const lastUpdated = "June 2026";

  const sections = [
    {
      icon: Shield,
      title: "Introduction",
      content: (
        <>
          <p>
            This Privacy Policy is maintained by Ayuzee to explain how we collect, use, store and protect personal information when you use our platform.
          </p>
          <p className="mt-2">
            By using Ayuzee, you agree to the practices described in this policy. If you do not agree, please do not use the platform.
          </p>
        </>
      ),
    },
    {
      icon: UserCheck,
      title: "Data We Collect",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Account information: name, email address, phone number and profile details.</li>
          <li>Health and wellness information you voluntarily share during consultations, assessments or therapy bookings.</li>
          <li>Payment and billing information processed by our payment partners.</li>
          <li>Usage data such as pages visited, device type, IP address and browser information.</li>
          <li>Communications with our support team and practitioners.</li>
        </ul>
      ),
    },
    {
      icon: Lock,
      title: "How We Use Your Data",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>To provide and manage your account, appointments, orders and therapy bookings.</li>
          <li>To connect you with verified AYUSH doctors, therapists and venues.</li>
          <li>To process payments and issue refunds through authorised partners.</li>
          <li>To improve platform features, safety and user experience.</li>
          <li>To send transactional notifications and optional marketing communications (which you can opt out of).</li>
        </ul>
      ),
    },
    {
      icon: ExternalLink,
      title: "Third-Party Services",
      content: (
        <>
          <p>We rely on trusted service providers to operate Ayuzee:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> — cloud database, authentication and backend infrastructure. Data is stored in Supabase-managed environments with access controls.
            </li>
            <li>
              <strong>Razorpay</strong> — payment gateway for processing orders, consultations and therapy session payments.
            </li>
          </ul>
          <p className="mt-2">
            These providers have their own privacy policies and security measures. We do not sell your personal data to advertisers.
          </p>
        </>
      ),
    },
    {
      icon: Cookie,
      title: "Cookies & Analytics",
      content: (
        <>
          <p>
            Ayuzee uses cookies and similar technologies to keep you signed in, remember your preferences and understand how the platform is used.
          </p>
          <p className="mt-2">
            You can manage or disable cookies through your browser settings. Disabling essential cookies may affect platform functionality.
          </p>
        </>
      ),
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Access, update or correct your personal information through your account settings.</li>
          <li>Request deletion of your account and associated data, subject to legal or operational retention needs.</li>
          <li>Withdraw consent for optional communications at any time.</li>
          <li>Raise concerns or questions about this policy by contacting our support team.</li>
        </ul>
      ),
    },
    {
      icon: Trash2,
      title: "Data Retention & Security",
      content: (
        <>
          <p>
            We retain your information only as long as necessary to provide our services, comply with legal obligations, resolve disputes and enforce our agreements.
          </p>
          <p className="mt-2">
            We use industry-standard safeguards including encrypted connections, access controls and regular security reviews. No system is completely secure, and we encourage you to use strong passwords and report suspicious activity.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            This page is maintained by Ayuzee as app-owned content to answer common privacy questions. It describes the platform&apos;s current practices and enabled capabilities, and is not an independent certification or legal audit.
          </div>

          {sections.map(({ icon: Icon, title, content }) => (
            <section key={title} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl font-semibold">{title}</h2>
              </div>
              <div className="pl-12 text-muted-foreground leading-relaxed">{content}</div>
            </section>
          ))}

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Contact Us</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              If you have questions about this Privacy Policy or how your data is handled, please contact us at{" "}
              <a href="mailto:support@ayuzee.com" className="text-primary hover:underline">support@ayuzee.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
