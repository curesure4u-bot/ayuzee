import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/monitoring";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-lg font-semibold">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            An unexpected error occurred. You can try again or reload the page.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" variant="outline" onClick={this.handleRetry}>
              Try again
            </Button>
            <Button type="button" onClick={this.handleReload}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Reload page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
