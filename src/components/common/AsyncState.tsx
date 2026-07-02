import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/PageLoader";

interface AsyncStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const AsyncState = ({
  loading,
  error,
  empty,
  loadingLabel = "Loading…",
  emptyTitle = "Nothing here yet",
  emptyDescription,
  onRetry,
  children,
}: AsyncStateProps) => {
  if (loading) return <PageLoader label={loadingLabel} fullScreen={false} />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-sm text-destructive">{error}</p>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-10 text-center">
        <p className="font-medium">{emptyTitle}</p>
        {emptyDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
