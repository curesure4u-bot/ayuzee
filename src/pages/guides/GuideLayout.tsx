import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GuideLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  estimatedTime: string;
  roles: string[];
  children: React.ReactNode;
}

export const GuideLayout = ({
  title,
  subtitle,
  icon: Icon,
  color,
  estimatedTime,
  roles,
  children,
}: GuideLayoutProps) => {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Button variant="ghost" size="sm" asChild className="mb-6 print:hidden">
          <Link to="/guides">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Guides
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-8 border-b pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-lg ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="hidden sm:flex print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{estimatedTime} read</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <div className="flex gap-1.5">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs font-normal">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Guide Content */}
        <div className="prose prose-sm prose-slate max-w-none dark:prose-invert [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-3 [&_ol]:space-y-2 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

interface StepCardProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export const StepCard = ({ number, title, children }: StepCardProps) => (
  <div className="rounded-lg border bg-card p-4 mb-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
        {number}
      </span>
      <h3 className="text-sm font-semibold m-0">{title}</h3>
    </div>
    <div className="pl-8 text-sm text-muted-foreground [&_ul]:mt-2 [&_li]:text-sm">{children}</div>
  </div>
);

interface TipBoxProps {
  title?: string;
  children: React.ReactNode;
}

export const TipBox = ({ title = "Pro Tip", children }: TipBoxProps) => (
  <div className="rounded-lg border-l-4 border-l-primary/60 bg-primary/5 p-4 my-4">
    <p className="text-xs font-semibold text-primary mb-1">{title}</p>
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
);

interface KeyboardShortcutProps {
  shortcuts: { keys: string; action: string }[];
}

export const KeyboardShortcuts = ({ shortcuts }: KeyboardShortcutProps) => (
  <div className="rounded-lg border bg-muted/30 p-4 my-4">
    <p className="text-xs font-semibold mb-2">Keyboard Shortcuts</p>
    <div className="grid gap-1.5">
      {shortcuts.map((s) => (
        <div key={s.keys} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{s.action}</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{s.keys}</kbd>
        </div>
      ))}
    </div>
  </div>
);

export default GuideLayout;
