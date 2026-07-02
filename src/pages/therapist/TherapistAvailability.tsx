import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { TherapistContext } from "./TherapistLayout";
import { useEffect } from "react";

const TherapistAvailability = () => {
  const { therapist, reload } = useOutletContext<TherapistContext>();
  usePageSEO({ title: "Availability | Therapist | Ayuzee", noIndex: true });

  const toggle = async (next: boolean) => {
    const { error } = await supabase.from("therapists").update({ is_available: next }).eq("id", therapist.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    await reload();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Availability</h1>
      <Card><CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-base">Accepting new sessions</Label>
            <p className="text-sm text-muted-foreground mt-1">When online, you'll appear in patient searches and receive new session assignments.</p>
          </div>
          <Switch checked={therapist.is_available} onCheckedChange={toggle} />
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-semibold mb-2">Weekly schedule</h2>
        <p className="text-sm text-muted-foreground">Custom schedules and time-off planning are coming soon.</p>
      </CardContent></Card>
    </div>
  );
};

export default TherapistAvailability;
