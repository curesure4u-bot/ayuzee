import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Pill, Apple, Leaf, Shield, Plus, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatientAllergies } from "@/hooks/usePatientAllergies";

export default function AllergiesAlerts() {
  const { patientId } = useParams();
  const { drugAllergies, foodAllergies, herbDrugInteractions, viruddhaAhara, criticalConditions, totalCount, severeCount, loading, error } = usePatientAllergies(patientId);

  const handleAddAllergy = () => toast.info("Add allergy dialog opened");
  const handleDismissAlert = () => toast.success("Alert acknowledged");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Critical Banner */}
      <Card className="border-red-300 bg-red-50 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold text-red-800 text-lg">Critical Patient Alerts</p>
              <p className="text-sm text-red-700">{totalCount} allergies recorded, {severeCount} severe</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700" onClick={handleDismissAlert}>
              <Bell className="h-4 w-4 mr-1" /> Acknowledged
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Allergies & Alerts</h1>
        <Button size="sm" onClick={handleAddAllergy}><Plus className="h-4 w-4 mr-1" /> Add Allergy</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading allergies...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4 text-red-600" /> Drug Allergies</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drugAllergies.map((a) => (
                <div key={a.id} className="p-2 border border-red-100 rounded-lg bg-red-50/50">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{a.allergen}</p>
                    <Badge variant={a.severity === "severe" || a.severity === "life_threatening" ? "destructive" : "secondary"} className="text-xs">{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction: {a.reaction}</p>
                  {a.reportedDate && <p className="text-xs text-muted-foreground">Reported: {a.reportedDate}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Apple className="h-4 w-4 text-orange-600" /> Food Allergies</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foodAllergies.map((a) => (
                <div key={a.id} className="p-2 border border-orange-100 rounded-lg bg-orange-50/50">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{a.allergen}</p>
                    <Badge variant={a.severity === "severe" || a.severity === "life_threatening" ? "destructive" : "secondary"} className="text-xs">{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction: {a.reaction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Viruddha Ahara (Incompatible Foods)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {viruddhaAhara.map((v) => (
                <div key={v.id} className="p-2 border rounded-lg">
                  <p className="font-medium text-sm">{v.allergen}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.reaction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-purple-600" /> Herb-Drug Interactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {herbDrugInteractions.map((d) => (
                <div key={d.id} className="p-2 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{d.allergen} + {d.interactingWith}</p>
                    <Badge variant={d.severity === "severe" ? "destructive" : d.severity === "moderate" ? "default" : "secondary"} className="text-xs">{d.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.reaction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Critical Conditions / History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {criticalConditions.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-2 border-b last:border-0">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{c.conditionName}</p>
                  {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
