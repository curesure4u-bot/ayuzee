import { Link, NavLink, Outlet } from "react-router-dom";
import { Trophy, Sparkles, Award, BarChart3, Home, ScrollText, Target, Heart, Gift } from "lucide-react";
import { ProtectedRoute } from "@/providers/ProtectedRoute";

const tabs = [
  { to: "/gamification", end: true, label: "Dashboard", icon: Home },
  { to: "/gamification/points", end: false, label: "My Points", icon: Sparkles },
  { to: "/gamification/badges", end: false, label: "My Badges", icon: Award },
  { to: "/gamification/certificates", end: false, label: "Certificates", icon: ScrollText },
  { to: "/gamification/challenges", end: false, label: "Challenges", icon: Target },
  { to: "/gamification/leaderboard", end: false, label: "Leaderboard", icon: BarChart3 },
  { to: "/gamification/wall", end: false, label: "Appreciation", icon: Heart },
  { to: "/gamification/rewards", end: false, label: "Rewards", icon: Gift },
];

const GamificationLayout = () => (
  <ProtectedRoute redirectTo="/auth">
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex flex-col gap-3 py-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-elegant">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl md:text-3xl">Ayuzee Growth & Appreciation Engine</h1>
              <p className="text-sm text-muted-foreground">
                Earn points, badges, and certificates for learning and community participation.
              </p>
            </div>
          </div>
          <Link to="/dashboard" className="text-sm text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
        <nav className="container flex gap-1 overflow-x-auto pb-3">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  </ProtectedRoute>
);

export default GamificationLayout;
