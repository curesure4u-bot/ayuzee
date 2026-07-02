import { usePageSEO } from "@/hooks/usePageSEO";
import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { BookOpen, GraduationCap, Newspaper, Video } from "lucide-react";

const tabs = [
  { to: "/learning/courses", label: "Courses", icon: GraduationCap },
  { to: "/learning/webinars", label: "Webinars", icon: Video },
  { to: "/learning/quiz", label: "Quizzes", icon: BookOpen },
  { to: "/learning/blogs", label: "Health Blogs", icon: Newspaper },
];

const LearningLayout = () => {
  usePageSEO({ title: "Learning — Ayuzee" });
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="gradient-soft border-b border-border">
        <div className="container py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Learning Hub</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Grow your Ayurvedic practice</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Curated courses, expert webinars, knowledge quizzes, and articles by leading practitioners.</p>
          <nav className="mt-8 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-smooth ${
                  isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`
              }>
                <t.icon className="h-4 w-4" /> {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </section>
      <main className="container py-10"><Outlet /></main>
      <Footer />
    </div>
  );
};

export default LearningLayout;
