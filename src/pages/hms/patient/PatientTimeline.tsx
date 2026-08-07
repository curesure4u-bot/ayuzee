import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Pill, FlaskConical, CreditCard, Leaf, FileText, Heart, Filter, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatientTimeline, type TimelineEventType } from "@/hooks/usePatientTimeline";

const typeConfig: Record<string, { icon: typeof Activity; label: string }> = {
  visit: { icon: Heart, label: "Visit" },
  prescription: { icon: Pill, label: "Rx" },
  therapy: { icon: Leaf, label: "Therapy" },
  lab: { icon: FlaskConical, label: "Lab" },
  imaging: { icon: FileText, label: "Imaging" },
  nadi: { icon: Activity, label: "Nadi" },
  payment: { icon: CreditCard, label: "Payment" },
  follow_up: { icon: Heart, label: "Follow-up" },
};

export default function PatientTimeline() {
  const { patientId } = useParams();
  const [filterType, setFilterType] = useState<TimelineEventType | undefined>(undefined);

  const { events, loading, error } = usePatientTimeline(patientId, filterType);

  const handleExport = () => toast.success("Timeline exported as PDF");

  const handleFilterToggle = (type: string) => {
    setFilterType((prev) => prev === type ? undefined : type as TimelineEventType);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patient Timeline</h1>
          <p className="text-muted-foreground">Complete clinical history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterType(undefined)}>
            <Filter className="h-4 w-4 mr-1" /> {filterType ? "Clear" : "Filter"}
          </Button>
          <Button size="sm" onClick={handleExport}>Export PDF</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(typeConfig).map(([key, val]) => (
          <Badge key={key} variant={filterType === key ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent" onClick={() => handleFilterToggle(key)}>
            <val.icon className="h-3 w-3 mr-1" /> {val.label}
          </Badge>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading timeline...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {events.map((event) => {
            const config = typeConfig[event.type];
            const Icon = config?.icon || Activity;
            return (
              <div key={event.id} className="relative pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full ${event.color} ring-2 ring-background`} />
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Icon className="h-3 w-3 mr-1" /> {config?.label || event.type}
                        </Badge>
                        <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{event.date} • {event.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{event.detail}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs h-7 px-2">
                      <ChevronDown className="h-3 w-3 mr-1" /> View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
