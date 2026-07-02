import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export const PageLoader = ({
  label = "Loading…",
  fullScreen = true,
  className,
}: PageLoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={cn(
      "flex flex-col items-center justify-center gap-3 text-muted-foreground",
      fullScreen ? "min-h-[50vh] w-full py-16" : "py-8",
      className,
    )}
  >
    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const RouteFallback = () => <PageLoader label="Loading page…" />;
