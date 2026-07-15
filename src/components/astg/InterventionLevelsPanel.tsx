import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Building2, Hospital, Stethoscope } from "lucide-react";

export interface InterventionLevel {
  level_number: number;
  level_label?: string | null;
  facility_type?: string | null;
  facility_description?: string | null;
  description?: string | null;
  management_text?: string | null;
  panchakarma_details?: string | null;
}

const ICONS = [Stethoscope, Hospital, Building2];

/**
 * Renders intervention_levels as a 3-tier expandable panel so a Vaidya can
 * see facility-tier escalation criteria at a glance.
 */
export function InterventionLevelsPanel({
  levels,
}: {
  levels: InterventionLevel[];
}) {
  if (!levels?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Intervention levels have not been captured yet.
      </p>
    );
  }
  const sorted = [...levels].sort((a, b) => a.level_number - b.level_number);
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={`level-${sorted[0].level_number}`}
      className="space-y-2"
    >
      {sorted.map((lvl) => {
        const Icon = ICONS[(lvl.level_number - 1) % ICONS.length];
        return (
          <AccordionItem
            key={lvl.level_number}
            value={`level-${lvl.level_number}`}
            className="rounded-lg border bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-3 text-left">
                <Badge className="gap-1">
                  <Icon className="h-3 w-3" />
                  Level {lvl.level_number}
                </Badge>
                <div>
                  <div className="font-medium">
                    {lvl.level_label ?? lvl.facility_type ?? `Level ${lvl.level_number}`}
                  </div>
                  {lvl.facility_description && (
                    <div className="text-xs font-normal text-muted-foreground">
                      {lvl.facility_description}
                    </div>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2 text-sm leading-relaxed">
              {lvl.management_text && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Management
                  </div>
                  <p className="whitespace-pre-line">{lvl.management_text}</p>
                </div>
              )}
              {lvl.description && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {lvl.description}
                </p>
              )}
              {lvl.panchakarma_details && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                  <span className="font-semibold">Panchakarma: </span>
                  {lvl.panchakarma_details}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export default InterventionLevelsPanel;
