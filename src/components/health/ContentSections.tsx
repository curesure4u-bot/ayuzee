import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export interface ContentSection {
  key: string;
  title: string;
  body_markdown: string;
}

interface Props {
  sections: ContentSection[];
}

/**
 * Sticky-tab nav that scrolls to anchored long-form sections rendered as Markdown.
 * Used on health condition / disease pages (e.g. Rhinitis, Asthma, Gallstones).
 */
export const ContentSections = ({ sections }: Props) => {
  const valid = (sections ?? []).filter((s) => s?.key && s?.title && s?.body_markdown);
  const [active, setActive] = useState<string>(valid[0]?.key ?? "");
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (valid.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    valid.forEach((s) => {
      const el = document.getElementById(s.key);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [valid.length]);

  if (valid.length === 0) return null;

  const scrollTo = (key: string) => {
    const el = document.getElementById(key);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section className="container mt-10">
      <div
        ref={navRef}
        className="sticky top-16 z-20 -mx-4 mb-6 overflow-x-auto border-b border-border bg-background/90 px-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-2 sm:shadow-soft"
      >
        <div className="flex items-center gap-1 py-1">
          {valid.map((s) => (
            <button
              key={s.key}
              onClick={() => scrollTo(s.key)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-smooth",
                active === s.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10 rounded-3xl border border-border bg-background p-6 md:p-8">
        {valid.map((s) => (
          <article key={s.key} id={s.key} className="scroll-mt-32">
            <h2 className="font-display text-2xl text-primary md:text-3xl">{s.title}</h2>
            <div className="prose prose-sm mt-3 max-w-none text-foreground prose-headings:font-display prose-headings:text-foreground prose-h3:mt-6 prose-h3:text-lg prose-h3:font-bold prose-h4:mt-4 prose-h4:text-base prose-h4:font-semibold prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-li:my-1 prose-li:text-muted-foreground prose-ul:my-2 prose-ol:my-2 md:prose-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body_markdown}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
