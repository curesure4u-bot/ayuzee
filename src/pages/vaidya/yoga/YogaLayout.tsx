import { NavLink, Outlet } from "react-router-dom";
import { Flower2, ClipboardPlus, NotebookPen, LineChart, Library, ListChecks } from "lucide-react";

const tabs = [
  { to: "/vaidya/yoga", end: true, label: "Dashboard", icon: Flower2 },
  { to: "/vaidya/yoga/assessment/new", label: "New Assessment", icon: ClipboardPlus },
  { to: "/vaidya/yoga/plans", label: "Plans", icon: ListChecks },
  { to: "/vaidya/yoga/protocols", label: "Protocols", icon: Library },
  { to: "/vaidya/yoga/progress", label: "Progress", icon: LineChart },
  { to: "/vaidya/yoga/notes", label: "Notes", icon: NotebookPen },
];

const YogaLayout = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
            <Flower2 className="h-6 w-6 text-primary" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">Ayuzee Yoga Therapy AI</h1>
            <p className="text-sm text-muted-foreground">
              Doctor-Guided Yoga Intelligence for Pain, Posture, Stress & Rejuvenation
            </p>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-muted"
              }`
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />

      <footer className="pt-4 text-center text-xs text-muted-foreground">
        Powered by Ayuzee AI · Al Shifa Ayush Ecosystem · For wellness education & doctor-guided
        therapy only — not a substitute for medical care.
      </footer>
    </div>
  );
};

export default YogaLayout;
