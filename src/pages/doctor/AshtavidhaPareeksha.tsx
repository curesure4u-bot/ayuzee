import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASHTAVIDHA_ITEMS } from "@/data/ashtavidha";
import { Stethoscope } from "lucide-react";

const AshtavidhaPareeksha = () => {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ayuzee HMS · Clinical</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[hsl(150,45%,18%)]">
          Ashtavidha Pareeksha
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The eight-fold classical Ayurvedic examination. Record, analyze and track findings across
          Nadi, Mootra, Mala, Jihwa, Shabda, Sparsha, Drik and Aakruti pareeksha.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ASHTAVIDHA_ITEMS.map((item) => {
          const inner = (
            <Card className={`h-full border transition-all ${item.enabled ? "hover:border-primary hover:shadow-md cursor-pointer" : "opacity-70"}`}>
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-3xl" aria-hidden>{item.icon}</div>
                  {item.enabled
                    ? <Badge className="bg-[hsl(150,45%,18%)] text-[hsl(45,60%,70%)]">Active</Badge>
                    : <Badge variant="outline">Coming soon</Badge>}
                </div>
                <div className="mt-2 font-display text-lg font-semibold">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </CardContent>
            </Card>
          );
          return item.enabled
            ? <Link key={item.key} to="/doctor/ashtavidha/mala">{inner}</Link>
            : <div key={item.key}>{inner}</div>;
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Stethoscope className="mt-0.5 h-4 w-4 text-primary" />
        <p>
          This module supports Ayurvedic clinical documentation and patient education. It does not replace
          direct medical examination, diagnosis, laboratory tests, or emergency care.
        </p>
      </div>
    </div>
  );
};

export default AshtavidhaPareeksha;
