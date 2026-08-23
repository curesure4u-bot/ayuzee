import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for HMS modules.
 * Catches render errors in children and shows a recovery UI
 * instead of crashing the entire page (white screen).
 *
 * Usage:
 *   <HmsErrorBoundary moduleName="Pharmacy">
 *     <PharmacyPage />
 *   </HmsErrorBoundary>
 */
export class HmsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[HMS Error Boundary - ${this.props.moduleName || "Unknown"}]`, error, errorInfo);
    // Could send to Sentry here if desired
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[40vh] px-4">
          <Card className="max-w-md w-full border-red-200">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 grid place-items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="font-semibold text-lg">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {this.props.moduleName
                  ? `The ${this.props.moduleName} module encountered an error.`
                  : "This section encountered an error."}
              </p>
              {this.state.error && (
                <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 rounded p-2 max-h-20 overflow-auto text-left">
                  {this.state.error.message}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button size="sm" onClick={this.handleRetry}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Try Again
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">
                If this keeps happening, contact support@ayuzee.com
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HmsErrorBoundary;
