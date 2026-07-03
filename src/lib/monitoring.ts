import * as Sentry from "@sentry/react";

export const initMonitoring = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    tracesSampleRate: 0.1,
  });
};

export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.error(error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
};
