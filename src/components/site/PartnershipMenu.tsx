import { useState } from "react";
import { Link } from "react-router-dom";
import { Handshake, Stethoscope, ChevronDown } from "lucide-react";

export const PartnershipMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
        Partnership <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
            <Link
              to="/doctor/about-partner"
              className="flex items-start gap-3 border-b border-border p-4 transition hover:bg-muted/50"
            >
              <Handshake className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Ayuzee Partner</p>
                <p className="text-xs text-muted-foreground">Earn rewards & grow your practice</p>
              </div>
            </Link>
            <Link
              to="/vaidya"
              className="flex items-start gap-3 p-4 transition hover:bg-muted/50"
            >
              <Stethoscope className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Ayush HMS Tool</p>
                <p className="text-xs text-muted-foreground">Free Hospital Mgmt System for your clinic</p>
              </div>
            </Link>
            <Link
              to="/partner/apply"
              className="block border-t border-border bg-muted/30 px-4 py-3 text-center text-xs font-medium text-primary hover:bg-muted/50"
            >
              Join the Network →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
