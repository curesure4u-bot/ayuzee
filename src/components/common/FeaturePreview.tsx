import { useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { previewForPath } from "@/lib/previewPolicy";

export function FeaturePreviewBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const title = previewForPath(pathname);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (title) heading.current?.focus();
  }, [pathname, title]);

  if (!title) return <>{children}</>;

  return (
    <main className="min-h-screen bg-orange-50/40 px-5 py-16 sm:py-24">
      <section aria-labelledby="feature-preview-title" className="mx-auto max-w-2xl rounded-3xl border border-orange-200 bg-white p-7 shadow-sm sm:p-12">
        <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-base font-semibold text-orange-900">Preview</span>
        <h1 ref={heading} tabIndex={-1} id="feature-preview-title" className="mt-6 text-3xl font-semibold leading-tight text-slate-900 focus:outline-none sm:text-4xl">{title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-700">We’re preparing this area for you. Its services and actions are not available yet.</p>
        <p className="mt-3 text-lg leading-relaxed text-slate-700">You can return home to explore Ayuzee and read the available information.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-700 px-6 py-3 text-lg font-semibold text-white hover:bg-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">Back to home</Link>
          <Link to="/about-us" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700">About Ayuzee</Link>
        </div>
      </section>
    </main>
  );
}
