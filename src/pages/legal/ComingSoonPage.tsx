import { Link } from "react-router-dom";

const ComingSoonPage = ({ title, description }: { title: string; description?: string }) => (
  <main className="container max-w-2xl py-24 text-center">
    <div className="rounded-3xl border bg-card p-12 shadow-soft">
      <div className="text-6xl">🌿</div>
      <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 text-muted-foreground">
        {description ?? "This page is being prepared by the Ayuzee team. Please check back shortly."}
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        ← Back to Home
      </Link>
    </div>
  </main>
);

export default ComingSoonPage;
