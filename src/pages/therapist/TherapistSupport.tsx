import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import { useEffect } from "react";

const TherapistSupport = () => {
  usePageSEO({ title: "Support | Therapist | Ayuzee", noIndex: true });
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Support</h1>
      <Card><CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><LifeBuoy className="h-5 w-5" /></div><div><div className="font-semibold">We're here to help</div><div className="text-sm text-muted-foreground">Reach our therapist support team anytime.</div></div></div>
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <a href="mailto:support@ayuzee.com" className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40"><Mail className="h-4 w-4 text-primary" /><span className="text-sm">support@ayuzee.com</span></a>
          <a href="tel:+919319361976" className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/40"><Phone className="h-4 w-4 text-primary" /><span className="text-sm">+91 931-9361-976</span></a>
        </div>
      </CardContent></Card>
    </div>
  );
};

export default TherapistSupport;
