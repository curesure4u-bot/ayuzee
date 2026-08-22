import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

interface PortalComingSoonProps {
  portalName?: string;
  backTo?: string;
}

/**
 * "Coming Soon" fallback for unbuilt pages within a portal layout.
 * Keeps the user inside their portal (sidebar/nav remains visible).
 */
const PortalComingSoon = ({ portalName = "This module", backTo }: PortalComingSoonProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 grid place-items-center mb-4">
          <Construction className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold">Coming Soon</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {portalName} is under development and will be available soon.
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {location.pathname}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Go Back
          </Button>
          {backTo && (
            <Button size="sm" onClick={() => navigate(backTo)}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalComingSoon;
