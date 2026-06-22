import { Footer } from "@/components/site/Footer";
import { FileText, Stethoscope, Leaf, CreditCard, Scale, Gavel, AlertCircle, Mail } from "lucide-react";

const TermsOfUse = () => {
  const lastUpdated = "June 2026";

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using Ayuzee, you agree to be bound by these Terms of Use. If you do not agree, please do not use the platform. We may update these terms from time to time, and continued use after changes means you accept the revised terms.
        </p>
      ),
    },
    {
      icon: Scale,
      title: "Platform Use & Account Responsibility",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>You must provide accurate, current and complete information when creating an account.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You agree not to misuse the platform, harass users, upload harmful content, or attempt to bypass security controls.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
        </ul>
      ),
    },
    {
      icon: Stethoscope,
      title: "Doctor-Patient Relationship Disclaimer",
      content: (
        <>
          <p>
            Ayuzee is a technology platform that connects users with independent AYUSH practitioners and wellness providers. We do not provide medical advice, diagnosis or treatment.
          </p>
          <p className="mt-2">
            The doctor-patient or practitioner-client relationship is formed directly between you and the provider. Ayuzee is not a party to that relationship and is not liable for the advice, care or outcomes of any consultation, therapy or treatment.
          </p>
          <p className="mt-2">
            Always consult a qualified healthcare professional before starting, stopping or changing any treatment, especially if you have a chronic condition, are pregnant, or are taking other medications.
          </p>
        </>
      ),
    },
    {
      icon: Leaf,
      title: "AYUSH & Traditional Medicine Disclaimer",
      content: (
        <>
          <p>
            Ayuzee promotes Ayurveda, Yoga, Unani, Siddha and Homeopathy (AYUSH) as traditional wellness systems. Information and services on the platform are not intended to replace modern medical care.
          </p>
          <p className="mt-2">
            AYUSH products, therapies and recommendations available through Ayuzee are not FDA-approved (or equivalent regulator-approved) medical treatments unless explicitly stated by the product manufacturer or provider. Individual results may vary.
          </p>
          <p className="mt-2">
            In case of a medical emergency, please contact your nearest hospital or emergency services immediately.
          </p>
        </>
      ),
    },
    {
      icon: CreditCard,
      title: "Payments, Orders & Refunds",
      content: (
        <p>
          Payments are processed through Razorpay or other authorised payment partners. By placing an order or booking a service, you agree to pay the listed amount and any applicable taxes. Refunds and cancellations are governed by our{" "}
          <a href="/refund-policy" className="text-primary hover:underline">Refund Policy</a>.
        </p>
      ),
    },
    {
      icon: Gavel,
      title: "Intellectual Property",
      content: (
        <p>
          All content, branding, software and materials on Ayuzee are owned by Ayuzee or its licensors and are protected by copyright, trademark and other laws. You may not copy, modify, distribute or create derivative works without written permission.
        </p>
      ),
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: (
        <p>
          To the fullest extent permitted by law, Ayuzee and its affiliates shall not be liable for indirect, incidental, special or consequential damages arising from your use of the platform, any provider interaction, or any product purchased through the platform.
        </p>
      ),
    },
    {
      icon: Scale,
      title: "Governing Law & Disputes",
      content: (
        <p>
          These Terms of Use are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India.
        </p>
      ),
    },
  ];

  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Terms of Use</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            This page is maintained by Ayuzee as app-owned content. It describes the rules and disclaimers that apply to using the platform and is not an independent legal certification.
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
              <h2 className="font-display text-xl font-semibold">Questions?</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              If you have any questions about these Terms of Use, please contact us at{" "}
              <a href="mailto:support@ayuzee.com" className="text-primary hover:underline">support@ayuzee.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfUse;
