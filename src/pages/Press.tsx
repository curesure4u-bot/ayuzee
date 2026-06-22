import { Footer } from "@/components/site/Footer";
import { Mail, Download, Award, Globe, Newspaper } from "lucide-react";

const awards = [
  { title: "TOBIP Award 2024", org: "The Best of Indian Products" },
  { title: "Kamal Patra Award 2024", org: "Excellence in AYUSH Innovation" },
  { title: "Young Scientist Award 2019", org: "Research in Traditional Medicine" },
];

const featuredIn = [
  "The Economic Times",
  "YourStory",
  "Inc42",
  "Business Standard",
  "The Hindu BusinessLine",
];

const Press = () => {
  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Press & Media</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            News, announcements and media resources for Ayuzee — India&apos;s AYUSH super-app.
          </p>
        </header>

        <section className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Media Contact</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              For press inquiries, interview requests and media partnerships, reach out to us at{" "}
              <a href="mailto:press@ayuzee.com" className="text-primary hover:underline">press@ayuzee.com</a>.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Press Kit</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Download our official press kit for logos, founder bios, fact sheets and brand assets.
            </p>
            <a
              href="/press-kit.pdf"
              download
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download Press Kit
            </a>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Awards & Recognition</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <div
                key={award.title}
                className="rounded-2xl border bg-card p-5 text-center"
              >
                <Award className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-lg font-semibold">{award.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{award.org}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">UN Geneva Presentation</h2>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Ayuzee was invited to present its AYUSH digital-health vision at a United Nations Geneva
            side event, highlighting the role of traditional Indian medicine systems in global
            wellness and sustainable healthcare access.
          </p>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="font-display text-3xl font-semibold">Featured In</h2>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {featuredIn.map((name) => (
              <div
                key={name}
                className="flex h-16 items-center justify-center rounded-xl border bg-card px-6 text-sm font-semibold text-muted-foreground"
              >
                {name}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Publication logos are placeholders and will be replaced with official assets.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Press;
