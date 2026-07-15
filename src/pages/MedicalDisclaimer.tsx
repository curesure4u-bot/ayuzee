import { Footer } from "@/components/site/Footer";
import { AlertTriangle, Stethoscope, Leaf, HeartPulse, Baby, Pill, Phone, Mail } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";

const MedicalDisclaimer = () => {
  usePageSEO({
    title: "Medical Disclaimer — Ayuzee",
    description: "Important medical disclaimer for information, consultations, medicines and therapies offered on the Ayuzee AYUSH platform.",
    canonicalPath: "/medical-disclaimer",
  });
  const lastUpdated = "June 2026";

  const sections = [
    {
      icon: AlertTriangle,
      title: "General Disclaimer",
      content: (
        <>
          <p>
            The information, services, products and consultations available on Ayuzee are provided for general wellness and educational purposes only. They are not intended to be a substitute for professional medical advice, diagnosis or treatment from a qualified healthcare provider.
          </p>
          <p className="mt-2">
            Always seek the advice of your physician or a qualified AYUSH practitioner with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information you read or receive through Ayuzee.
          </p>
        </>
      ),
    },
    {
      icon: Stethoscope,
      title: "Not a Substitute for Emergency Care",
      content: (
        <p>
          Ayuzee is not designed for medical emergencies. If you think you are experiencing a medical emergency — including chest pain, severe bleeding, difficulty breathing, stroke symptoms, suicidal thoughts or any life-threatening situation — call your local emergency number or visit the nearest hospital immediately. Do not use Ayuzee to seek help in such situations.
        </p>
      ),
    },
    {
      icon: Leaf,
      title: "AYUSH & Traditional Medicine",
      content: (
        <>
          <p>
            Ayuzee promotes Ayurveda, Yoga, Unani, Siddha and Homeopathy (AYUSH) as traditional systems of medicine. These systems have their own principles, benefits and limitations, and are recognised in India as complementary systems of healthcare.
          </p>
          <p className="mt-2">
            AYUSH products, therapies and recommendations available through the platform are not FDA-approved (or equivalent regulator-approved) treatments for specific diseases unless expressly stated by the manufacturer or provider. Individual results vary, and outcomes cannot be guaranteed.
          </p>
        </>
      ),
    },
    {
      icon: Pill,
      title: "Medicines & Prescriptions",
      content: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Do not start, stop or change any medication — modern or AYUSH — without consulting a qualified practitioner.</li>
          <li>Herbal and traditional medicines can interact with prescription drugs. Always disclose all medicines you take to your treating doctor.</li>
          <li>Prescription-only products listed on Ayuzee require a valid prescription; do not attempt to bypass this requirement.</li>
          <li>Store all medicines out of the reach of children and follow the dosage instructions provided by your practitioner.</li>
        </ul>
      ),
    },
    {
      icon: HeartPulse,
      title: "Chronic Conditions & High-Risk Groups",
      content: (
        <p>
          If you have a chronic condition (such as diabetes, hypertension, heart, kidney or liver disease, cancer, or an autoimmune disorder), or if you are elderly or immunocompromised, please consult your treating physician before starting any new therapy, medicine or lifestyle programme through Ayuzee.
        </p>
      ),
    },
    {
      icon: Baby,
      title: "Pregnancy, Nursing & Children",
      content: (
        <p>
          Special care is required for pregnant women, nursing mothers, infants and children. Certain herbs, therapies and formulations are not suitable during pregnancy or for young children. Always consult a qualified AYUSH doctor or paediatrician before using any product or therapy in these situations.
        </p>
      ),
    },
    {
      icon: Stethoscope,
      title: "Practitioner Independence",
      content: (
        <p>
          Doctors, therapists and wellness providers on Ayuzee are independent professionals responsible for their own advice, prescriptions and treatments. Ayuzee facilitates discovery, booking and payments but does not itself provide medical services and is not liable for clinical decisions made by providers.
        </p>
      ),
    },
    {
      icon: AlertTriangle,
      title: "No Guarantee of Results",
      content: (
        <p>
          Wellness outcomes depend on many factors including individual health, adherence to treatment, lifestyle and other conditions. Ayuzee does not guarantee any specific health outcome, cure or improvement from the use of its platform, content, products or services.
        </p>
      ),
    },
  ];

  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Medical Disclaimer</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            This page is maintained by Ayuzee as app-owned content to clarify the nature of information and services provided on the platform. It is not a substitute for professional medical advice or an independent medical certification.
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
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">In an Emergency</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Dial your local emergency number immediately (in India: 112) or go to the nearest hospital. Do not use Ayuzee for emergency assistance.
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Questions?</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              For questions about this disclaimer, contact us at{" "}
              <a href="mailto:support@ayuzee.com" className="text-primary hover:underline">support@ayuzee.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MedicalDisclaimer;
