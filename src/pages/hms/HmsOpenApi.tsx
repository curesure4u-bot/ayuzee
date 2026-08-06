import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Code, Key, Globe, BarChart3, Copy, Plus, Eye, EyeOff,
  CheckCircle, AlertTriangle, Zap, Lock, Webhook, Terminal
} from "lucide-react";

type ApiKey = {
  id: string;
  key_name: string;
  key_prefix: string;
  plan: string;
  status: "active" | "suspended" | "revoked";
  scopes: string[];
  total_requests: number;
  requests_this_month: number;
  rate_limit: number;
  last_used: string;
  created_at: string;
};

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  scopes: string[];
  example_response?: string;
};

const mockKeys: ApiKey[] = [
  { id: "1", key_name: "Production App", key_prefix: "ayu_live_8k2m", plan: "pro", status: "active", scopes: ["patients:read", "appointments:read", "appointments:write", "prescriptions:read"], total_requests: 45230, requests_this_month: 3400, rate_limit: 60, last_used: "2 min ago", created_at: "Jun 15, 2026" },
  { id: "2", key_name: "Development/Test", key_prefix: "ayu_test_4f9x", plan: "free", status: "active", scopes: ["patients:read", "appointments:read"], total_requests: 1280, requests_this_month: 120, rate_limit: 10, last_used: "1 hour ago", created_at: "Jul 01, 2026" },
  { id: "3", key_name: "Partner Integration", key_prefix: "ayu_live_2p7n", plan: "enterprise", status: "active", scopes: ["patients:read", "patients:write", "appointments:read", "appointments:write", "prescriptions:read", "lab:read", "formulary:read"], total_requests: 128900, requests_this_month: 18500, rate_limit: 0, last_used: "30 sec ago", created_at: "Mar 01, 2026" },
];

const apiEndpoints: ApiEndpoint[] = [
  { method: "GET", path: "/api/v1/patients", description: "Search patients by name, phone, or UHID", scopes: ["patients:read"] },
  { method: "GET", path: "/api/v1/patients/:id", description: "Get complete patient profile + medical history", scopes: ["patients:read"] },
  { method: "POST", path: "/api/v1/patients", description: "Register a new patient", scopes: ["patients:write"] },
  { method: "GET", path: "/api/v1/appointments", description: "List appointments (filter by date, doctor, status)", scopes: ["appointments:read"] },
  { method: "POST", path: "/api/v1/appointments", description: "Book a new appointment", scopes: ["appointments:write"] },
  { method: "PUT", path: "/api/v1/appointments/:id/reschedule", description: "Reschedule an appointment", scopes: ["appointments:write"] },
  { method: "DELETE", path: "/api/v1/appointments/:id", description: "Cancel an appointment", scopes: ["appointments:write"] },
  { method: "GET", path: "/api/v1/doctors", description: "Search doctors by name, specialty, availability", scopes: ["doctors:read"] },
  { method: "GET", path: "/api/v1/doctors/:id/slots", description: "Get available time slots for a doctor", scopes: ["doctors:read"] },
  { method: "GET", path: "/api/v1/prescriptions/:patientId", description: "Get patient prescriptions", scopes: ["prescriptions:read"] },
  { method: "GET", path: "/api/v1/lab-reports/:patientId", description: "Get patient lab reports", scopes: ["lab:read"] },
  { method: "POST", path: "/api/v1/documents/parse", description: "Upload medical document for AI parsing", scopes: ["documents:write"] },
  { method: "GET", path: "/api/v1/formulary/search", description: "Search AYUSH formulary (classical prescriptions)", scopes: ["formulary:read"] },
  { method: "GET", path: "/api/v1/formulary/:id", description: "Get formulation details + ingredients", scopes: ["formulary:read"] },
  { method: "POST", path: "/api/v1/medassist/chat", description: "Send message to MedAssist AI agent", scopes: ["medassist:write"] },
  { method: "GET", path: "/api/v1/vitals/:patientId", description: "Get patient vitals history", scopes: ["vitals:read"] },
  { method: "POST", path: "/api/v1/vitals", description: "Record patient vitals (from device/wearable)", scopes: ["vitals:write"] },
  { method: "GET", path: "/api/v1/abdm/verify/:abhaId", description: "Verify patient via ABHA ID", scopes: ["abdm:read"] },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

const HmsOpenApi = () => {
  const [keys] = useState<ApiKey[]>(mockKeys);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCopyKey = (prefix: string) => {
    navigator.clipboard.writeText(`${prefix}...full_key_here`);
    toast.success("API key copied to clipboard");
  };

  const handleCreateKey = () => {
    toast.success("New API key generated! Save your secret — it won't be shown again.");
    setCreateOpen(false);
  };

  const totalRequests = keys.reduce((s, k) => s + k.requests_this_month, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" /> Ayuzee Developer API
          </h1>
          <p className="text-sm text-muted-foreground">
            Open APIs for patients, appointments, prescriptions, AYUSH formulary & more
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/developer"}>Docs</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> Create API Key</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{keys.length}</p><p className="text-xs text-muted-foreground">API Keys</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{totalRequests.toLocaleString()}</p><p className="text-xs text-muted-foreground">Requests (This Month)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{apiEndpoints.length}</p><p className="text-xs text-muted-foreground">Endpoints Available</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">99.9%</p><p className="text-xs text-muted-foreground">Uptime</p></CardContent></Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints ({apiEndpoints.length})</TabsTrigger>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-3">
          {keys.map(key => (
            <Card key={key.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.key_name}</p>
                        <Badge variant={key.plan === "enterprise" ? "default" : key.plan === "pro" ? "secondary" : "outline"}>{key.plan}</Badge>
                        <Badge variant={key.status === "active" ? "outline" : "destructive"} className="text-xs">{key.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{key.key_prefix}••••••••</code>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => handleCopyKey(key.key_prefix)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{key.requests_this_month.toLocaleString()} / {key.rate_limit > 0 ? `${key.rate_limit}/min` : "unlimited"}</p>
                    <p>Last used: {key.last_used}</p>
                    <p className="mt-0.5">{key.scopes.length} scopes</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {key.scopes.map(scope => (
                    <Badge key={scope} variant="outline" className="text-[10px]"><Lock className="h-2 w-2 mr-0.5" />{scope}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {apiEndpoints.map((ep, i) => (
                <div key={i} className="flex items-center gap-3 rounded border px-3 py-2 hover:bg-muted/20 text-sm">
                  <Badge className={`${methodColors[ep.method]} font-mono text-xs w-16 justify-center`}>{ep.method}</Badge>
                  <code className="font-mono text-xs flex-1">{ep.path}</code>
                  <span className="text-xs text-muted-foreground hidden md:block">{ep.description}</span>
                  <div className="flex gap-0.5">
                    {ep.scopes.map(s => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4" /> Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">1. Get your API key</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`# Your API key (from the Keys tab above)
API_KEY="ayu_live_XXXXXXXXXXXXXXXX"`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">2. Search patients</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`curl -X GET "https://api.ayuzee.com/v1/patients?query=Rajesh&limit=5" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">3. Book an appointment</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`curl -X POST "https://api.ayuzee.com/v1/appointments" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_id": "pat_001",
    "doctor_id": "doc_saleem",
    "slot_time": "2026-07-31T10:30:00+05:30",
    "clinic_id": "clinic_001",
    "type": "consultation"
  }'`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">4. Search AYUSH formulary</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`curl -X GET "https://api.ayuzee.com/v1/formulary/search?q=dashamool&system=ayurveda" \\
  -H "Authorization: Bearer $API_KEY"

# Response:
{
  "results": [
    {
      "id": "form_001",
      "name": "Dashamoolarishtam",
      "system": "Ayurveda",
      "reference": "AFI Part-I",
      "ingredients": ["Bilva", "Agnimantha", "Shyonaka", ...],
      "indications": ["Vataroga", "Shoola", "Jvara"]
    }
  ]
}`}
                </pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                <p className="font-medium">Rate Limits</p>
                <p className="mt-1">Free: 10 req/min, 1K/day · Pro: 60 req/min, 10K/day · Enterprise: Unlimited</p>
                <p className="mt-1">All responses are JSON. FHIR-compatible where applicable.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New API Key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Key Name *</Label><Input placeholder="e.g. My Wellness App" /></div>
            <div><Label>App URL</Label><Input placeholder="https://myapp.com" /></div>
            <div><Label>Webhook URL (optional)</Label><Input placeholder="https://myapp.com/webhooks/ayuzee" /></div>
            <div>
              <Label>Scopes</Label>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {["patients:read", "patients:write", "appointments:read", "appointments:write", "prescriptions:read", "lab:read", "formulary:read", "medassist:write", "vitals:read", "vitals:write", "abdm:read", "documents:write"].map(scope => (
                  <label key={scope} className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" className="rounded" defaultChecked={scope.includes("read")} />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateKey}><Key className="mr-1 h-4 w-4" /> Generate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsOpenApi;
