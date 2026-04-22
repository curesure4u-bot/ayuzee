import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, Stethoscope, Store, User } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const choices = [
  {
    to: "/doctor/auth",
    title: "Doctor/Student",
    description: "Join 1 Lakh+ registered Ayurveda practitioners.",
    icon: Stethoscope,
  },
  {
    to: "/doctor/auth",
    title: "Chemist/Retailer",
    description: "The Largest Selection of Ayurvedic Medicines.",
    icon: Store,
  },
  {
    to: "/auth",
    title: "Patient",
    description: "Consult certified Ayurvedic doctors online.",
    icon: User,
  },
];

export const WelcomeUserTypeDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold">Welcome to Ayuzee</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select your user type to continue</p>
        </div>

        <div className="mt-6 space-y-3">
          {choices.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              onClick={() => onOpenChange(false)}
              className="group flex items-center gap-4 rounded-2xl bg-primary p-4 text-primary-foreground transition hover:opacity-95"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-foreground/15">
                <c.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <div className="font-display text-lg font-semibold">{c.title}</div>
                <div className="text-sm opacity-90">{c.description}</div>
              </div>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
