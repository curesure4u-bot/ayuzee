import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import {
  getCookieConsent,
  recordConsent,
  setCookieConsent,
} from "@/lib/consent";
import { initMonitoring } from "@/lib/monitoring";

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getCookieConsent());
  }, []);

  const save = async (analytics: boolean) => {
    setCookieConsent(analytics);
    await recordConsent({
      purpose: analytics ? "cookies_analytics" : "cookies_essential",
      granted: true,
    });
    if (analytics) initMonitoring();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] border-t bg-card/95 p-4 shadow-lg backdrop-blur sm:p-6"
    >
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">We use cookies</p>
            <p className="mt-1">
              Essential cookies keep you signed in. Optional analytics help us improve Ayuzee. See our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => save(false)}>
            Essential only
          </Button>
          <Button size="sm" onClick={() => save(true)}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
};
