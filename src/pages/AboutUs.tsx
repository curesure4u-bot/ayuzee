import { Footer } from "@/components/site/Footer";
import { Leaf, ShieldCheck, Users, Sparkles } from "lucide-react";

const pillars = [
  { icon: Leaf, title: "Authentic AYUSH", body: "Verified Ayurveda, Yoga, Unani, Siddha and Homeopathy practitioners across India." },
  { icon: ShieldCheck, title: "Trust & Safety", body: "Ministry-of-AYUSH aligned, GMP-checked medicines and licensed clinics." },
  { icon: Users, title: "One Ecosystem", body: "Doctors, patients, therapists, venues, students and pharmacies — all in one place." },
  { icon: Sparkles, title: "AI-Powered Care", body: "Prakriti analysis, smart triage and personalised therapy plans." },
];

export default function AboutUs() {
  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">About Ayuzee</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ayuzee is India's #1 AYUSH aggregator platform — connecting people to authentic
            traditional medicine through technology, transparency and care.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-3xl space-y-4 text-muted-foreground">
          <h2 className="font-display text-2xl font-semibold text-foreground">Our mission</h2>
          <p>To make authentic AYUSH care accessible, affordable and trustworthy for every Indian household — and to empower practitioners with modern tools to grow sustainable practices.</p>
          <h2 className="font-display text-2xl font-semibold text-foreground">Our story</h2>
          <p>Founded by clinicians and technologists, Ayuzee began as a simple directory and grew into a full ecosystem: consultations, panchakarma bookings, a verified medicine marketplace, doctor education, and bulk purchase rails for clinics and pharmacies.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
