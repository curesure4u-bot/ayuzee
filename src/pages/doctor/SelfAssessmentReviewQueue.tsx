import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Stethoscope } from "lucide-react";
import GutHealthReviewQueue from "./GutHealthReviewQueue";
import MutraBinduReviewQueue from "./MutraBinduReviewQueue";
import JihvaReviewQueue from "./JihvaReviewQueue";
import NetraReviewQueue from "./NetraReviewQueue";

const TABS = [
  { value: "gut-health", label: "Gut Health" },
  { value: "mutra-bindu", label: "Mutra Bindu" },
  { value: "jihva", label: "Jihva Pariksha" },
  { value: "netra", label: "Netra Pariksha" },
] as const;

type TabValue = typeof TABS[number]["value"];

const SelfAssessmentReviewQueue = () => {
  const [params, setParams] = useSearchParams();
  const active = (TABS.find((t) => t.value === params.get("type"))?.value ?? "gut-health") as TabValue;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Stethoscope className="h-3.5 w-3.5" /> Self-Assessment Reviews
        </div>
        <h1 className="mt-1 font-display text-3xl">Patient self-assessment queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One place to review Gut Health, Mutra Bindu, Jihva Pariksha, and Netra Pariksha submissions. Filter by type below.
        </p>
      </div>

      <Tabs
        value={active}
        onValueChange={(v) => {
          const next = new URLSearchParams(params);
          next.set("type", v);
          setParams(next, { replace: true });
        }}
      >
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="min-w-[7.5rem]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="gut-health" className="mt-6">
          <GutHealthReviewQueue />
        </TabsContent>
        <TabsContent value="mutra-bindu" className="mt-6">
          <MutraBinduReviewQueue />
        </TabsContent>
        <TabsContent value="jihva" className="mt-6">
          <JihvaReviewQueue />
        </TabsContent>
        <TabsContent value="netra" className="mt-6">
          <NetraReviewQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfAssessmentReviewQueue;
