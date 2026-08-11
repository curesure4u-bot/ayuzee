import { useState } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const initialConsents = [
  { id: 1, purpose: "Care Management", hip: "City Lab", hiu: "Dr. Nair", range: "Jun–Aug 2026", detail: "Lab reports", status: "granted" },
  { id: 2, purpose: "Claim Processing", hip: "Apollo Hospital", hiu: "Apollo Insurance", range: "Jan–Dec 2026", detail: "Claim processing", status: "granted" },
  { id: 3, purpose: "Research", hip: "ICMR", hiu: "ICMR Research", range: "2025–2026", detail: "Anonymized data", status: "revoked" },
  { id: 4, purpose: "Care Management", hip: "Hospital XYZ", hiu: "Hospital XYZ", range: "Jan–Mar 2025", detail: "Prescription history", status: "expired" },
  { id: 5, purpose: "Care Management", hip: "Family Clinic", hiu: "Family Doctor", range: "Jan 2026–Dec 2027", detail: "Full records", status: "granted" },
];

export default function NdhmConsentManager() {
  const [consents, setConsents] = useState(initialConsents);
  const [showGrant, setShowGrant] = useState(false);

  const revoke = (id: number) => {
    setConsents((prev) => prev.map((c) => c.id === id ? { ...c, status: "revoked" } : c));
    toast.success("Consent revoked successfully");
  };

  const statusColor = (s: string) => s === "granted" ? "default" : s === "revoked" ? "destructive" : "secondary";

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Lock className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">Consent Manager</h1>
          <p className="text-muted-foreground">Manage health data sharing consents as per NDHM/ABDM framework</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Consents</CardTitle>
          <Button size="sm" onClick={() => setShowGrant(!showGrant)}>Grant New Consent</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {consents.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded">
              <div className="space-y-1">
                <p className="font-medium text-sm">{c.hiu} — {c.detail}</p>
                <p className="text-xs text-muted-foreground">{c.purpose} • {c.hip} • {c.range}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                {c.status === "granted" && <Button size="sm" variant="destructive" onClick={() => revoke(c.id)}>Revoke</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showGrant && (
        <Card>
          <CardHeader><CardTitle>Grant New Consent</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Purpose (e.g., Care Management)" />
            <Input placeholder="Health Information Provider" />
            <div className="flex gap-2">
              {["1 month", "3 months", "6 months", "1 year"].map((d) => (
                <Button key={d} size="sm" variant="outline">{d}</Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Prescriptions", "Lab Reports", "Discharge Summary", "Immunizations"].map((dt) => (
                <label key={dt} className="flex items-center gap-2 text-sm"><Checkbox />{dt}</label>
              ))}
            </div>
            <Button onClick={() => { setShowGrant(false); toast.success("Consent granted"); }}>Submit Consent</Button>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground text-center">You control who sees your health data. Revoke anytime.</p>
    </div>
  );
}
