import { Link } from "react-router-dom";

export function PublicPreviewNav() {
  return (
    <header className="border-b border-border bg-background">
      <nav aria-label="Main navigation" className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link to="/" className="inline-flex min-h-12 items-center rounded-lg font-display text-2xl font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Ayuzee</Link>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-lg">
          {[["Home", "/"], ["About", "/about-us"], ["Guides", "/guides"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} to={href} className="inline-flex min-h-12 items-center rounded-lg py-3 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{label}</Link>
          ))}
        </div>
      </nav>
      <p className="container pb-3 text-base leading-relaxed text-muted-foreground">Platform preview — online accounts, bookings and purchases are not available yet.</p>
    </header>
  );
}
