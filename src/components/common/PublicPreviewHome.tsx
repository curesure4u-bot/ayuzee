import { Link } from "react-router-dom";
import { Leaf, BookOpen, HeartHandshake } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { usePageSEO } from "@/hooks/usePageSEO";
import herbsImage from "@/assets/herbs-flatlay.jpg";

export function PublicPreviewHome() {
  usePageSEO({
    title: "Ayuzee — Platform Preview",
    description: "Learn about Ayuzee. Online accounts, bookings, shopping and clinical services are not available in this preview.",
    canonicalPath: "/",
  });

  return (
    <>
      <main>
        <section className="gradient-soft">
          <div className="container grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
            <div>
              <span className="inline-flex rounded-full border border-primary/30 bg-background px-4 py-2 text-base font-semibold text-primary">Platform preview</span>
              <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">Welcome to Ayuzee</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">We’re building a place to learn about AYUSH care and connect with its community.</p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed">Online accounts, appointments, shopping and clinical tools are being prepared. These services are not available yet.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/about-us" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">About Ayuzee</Link>
                <Link to="/guides" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Explore the guides</Link>
              </div>
            </div>
            <img src={herbsImage} alt="A collection of herbs and spices" width={1200} height={900} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-elegant" />
          </div>
        </section>
        <section className="container py-14" aria-labelledby="preview-information">
          <h2 id="preview-information" className="font-display text-3xl">What you can explore</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { icon: Leaf, title: "Our purpose", text: "Read about Ayuzee and the platform we’re preparing.", href: "/about-us", label: "Read about Ayuzee" },
              { icon: BookOpen, title: "Platform guides", text: "Explore guides describing the planned workflows. Features described there may still be unavailable.", href: "/guides", label: "Read the guides" },
              { icon: HeartHandshake, title: "Contact information", text: "Find our published contact details. Online enquiry forms remain unavailable.", href: "/contact", label: "View contact details" },
            ].map(({ icon: Icon, title, text, href, label }) => (
              <article key={href} className="rounded-2xl border border-border bg-card p-6">
                <Icon aria-hidden="true" className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{text}</p>
                <Link to={href} className="mt-5 inline-flex min-h-12 items-center rounded-lg py-3 text-lg font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{label}</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
