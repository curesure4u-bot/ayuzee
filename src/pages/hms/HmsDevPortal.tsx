import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Code2, Key, Activity, Webhook, TestTube, BarChart3,
  Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Zap,
  BookOpen, Lock,
} from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  type: "live" | "sandbox";
  created: string;
  lastUsed: string;
  requests: number;
  status: "active" | "revoked";
};

type WebhookConfig = {
  id: string;
  url: string;
  events: string[];
  status: "active" | "paused" | "failed";
  lastTriggered: string;
  successRate: number;
};

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  category: string;
};

const mockKeys: ApiKey[] = [
  { id: "1", name: "Production - Main Hospital", key: "ayz_live_sk_7f8g9h0j1k2l3m4n5o6p", type: "live", created: "2026-05-01", lastUsed: "2026-07-15", requests: 12450, status: "active" },
  { id: "2", name: "Sandbox - Testing", key: "ayz_test_sk_1a2b3c4d5e6f7g8h9i0j", type: "sandbox", created: "2026-06-10", lastUsed: "2026-07-14", requests: 890, status: "active" },
  { id: "3", name: "Branch 2 - City Center", key: "ayz_live_sk_9p8o7n6m5l4k3j2i1h0g", type: "live", created: "2026-06-15", lastUsed: "2026-07-15", requests: 5230, status: "active" },
  { id: "4", name: "Old Integration (Deprecated)", key: "ayz_live_sk_old_deprecated_key", type: "live", created: "2025-12-01", lastUsed: "2026-03-15", requests: 2100, status: "revoked" },
];

const mockWebhooks: WebhookConfig[] = [
  { id: "1", url: "https://hospital.example.com/webhooks/ayuzee", events: ["appointment.created", "prescription.generated", "bill.paid"], status: "active", lastTriggered: "2 min ago", successRate: 99.2 },
  { id: "2", url: "https://franchise.example.com/api/sync", events: ["patient.registered", "consultation.completed"], status: "active", lastTriggered: "15 min ago", successRate: 97.8 },
  { id: "3", url: "https://old-system.example.com/hook", events: ["bill.created"], status: "failed", lastTriggered: "2 days ago", successRate: 45.0 },
];

const apiEndpoints: ApiEndpoint[] = [
  { method: "GET", path: "/api/v1/patients", description: "List all patients with pagination", category: "Patients" },
  { method: "POST", path: "/api/v1/patients", description: "Register a new patient", category: "Patients" },
  { method: "GET", path: "/api/v1/patients/:id/records", description: "Get patient health records", category: "Patients" },
  { method: "POST", path: "/api/v1/appointments", description: "Book an appointment", category: "Appointments" },
  { method: "GET", path: "/api/v1/appointments/today", description: "Today's appointments", category: "Appointments" },
  { method: "POST", path: "/api/v1/consultations", description: "Create consultation record", category: "Clinical" },
  { method: "POST", path: "/api/v1/prescriptions", description: "Generate prescription", category: "Clinical" },
  { method: "GET", path: "/api/v1/prescriptions/:id/pdf", description: "Download prescription PDF", category: "Clinical" },
  { method: "POST", path: "/api/v1/billing/invoice", description: "Create invoice", category: "Billing" },
  { method: "GET", path: "/api/v1/billing/collections", description: "Get collection summary", category: "Billing" },
  { method: "GET", path: "/api/v1/inventory/stock", description: "Current stock levels", category: "Inventory" },
  { method: "POST", path: "/api/v1/panchakarma/sessions", description: "Schedule Panchakarma session", category: "Panchakarma" },
  { method: "GET", path: "/api/v1/analytics/dashboard", description: "Dashboard metrics", category: "Analytics" },
  { method: "POST", path: "/api/v1/abdm/verify-abha", description: "Verify ABHA number", category: "ABDM" },
  { method: "POST", path: "/api/v1/abdm/push-record", description: "Push record to ABDM", category: "ABDM" },
  { method: "POST", path: "/api/v1/whatsapp/send", description: "Send WhatsApp message", category: "Communication" },
];

const HmsDevPortal = () => {
  const [keys] = useState<ApiKey[]>(mockKeys);
  const [webhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyOpen, setNewKeyOpen] = useState(false);

  const toggleKeyVisibility = (id: string) => setShowKeys({ ...showKeys, [id]: !showKeys[id] });

  const copyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const methodColor = (m: string) => {
    switch (m) { case "GET": return "text-green-600 bg-green-50"; case "POST": return "text-blue-600 bg-blue-50"; case "PUT": return "text-amber-600 bg-amber-50"; case "DELETE": return "text-red-600 bg-red-50"; default: return ""; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6 text-slate-600" /> Developer Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Build AI-powered AYUSH health apps · Ship health-tech faster with our APIs
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-300">REST API v1</Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">FHIR R4</Badge>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">18.5K</p><p className="text-xs text-muted-foreground">API Calls (This Month)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Key className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{keys.filter(k => k.status === "active").length}</p><p className="text-xs text-muted-foreground">Active Keys</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Webhook className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{webhooks.filter(w => w.status === "active").length}</p><p className="text-xs text-muted-foreground">Webhooks Active</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Zap className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">99.8%</p><p className="text-xs text-muted-foreground">Uptime</p></CardContent></Card>
      </div>

      <Tabs defaultValue="keys">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">API Docs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">API Keys</CardTitle>
                <Button size="sm" onClick={() => setNewKeyOpen(true)}><Plus className="mr-1 h-3 w-3" /> Generate Key</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className={`rounded-lg border p-3 ${k.status === "revoked" ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm">{k.name}</p>
                        <Badge variant={k.type === "live" ? "default" : "secondary"} className="text-xs">{k.type}</Badge>
                        {k.status === "revoked" && <Badge variant="destructive" className="text-xs">Revoked</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleKeyVisibility(k.id)}>
                          {showKeys[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copyKey(k.key)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-mono text-xs bg-muted/50 rounded p-2">
                      {showKeys[k.id] ? k.key : "•".repeat(32)}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Created: {k.created}</span>
                      <span>Last used: {k.lastUsed}</span>
                      <span>{k.requests.toLocaleString()} requests</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> API Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Base URL: <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">https://api.ayuzee.com/v1</code>
              </p>
              <div className="space-y-2">
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded border hover:bg-muted/30 transition cursor-pointer">
                    <Badge className={`font-mono text-[10px] w-14 justify-center ${methodColor(ep.method)}`}>{ep.method}</Badge>
                    <code className="font-mono text-xs flex-1">{ep.path}</code>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.description}</span>
                    <Badge variant="outline" className="text-[10px]">{ep.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Webhook Endpoints</CardTitle>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add Webhook</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs font-mono">{wh.url}</code>
                      </div>
                      <Badge variant={wh.status === "active" ? "outline" : wh.status === "failed" ? "destructive" : "secondary"} className={`text-xs capitalize ${wh.status === "active" ? "text-green-600" : ""}`}>
                        {wh.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wh.events.map((e) => (
                        <Badge key={e} variant="secondary" className="text-[10px] font-mono">{e}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Last triggered: {wh.lastTriggered}</span>
                      <span>Success rate: {wh.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs">
                <p className="font-medium mb-1">Available Events:</p>
                <div className="flex flex-wrap gap-1">
                  {["patient.registered", "appointment.created", "appointment.cancelled", "consultation.completed", "prescription.generated", "bill.created", "bill.paid", "panchakarma.session.completed", "inventory.low_stock", "abdm.consent.granted"].map((e) => (
                    <Badge key={e} variant="outline" className="text-[10px] font-mono">{e}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sandbox" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TestTube className="h-4 w-4" /> Sandbox Environment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test API calls without affecting production data. All sandbox responses use mock data.
              </p>
              <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-auto">
                <p className="text-slate-400"># Example: Get patient list</p>
                <p className="mt-1"><span className="text-green-400">curl</span> -X GET https://sandbox.ayuzee.com/v1/patients \</p>
                <p className="ml-4">-H "Authorization: Bearer ayz_test_sk_1a2b3c..." \</p>
                <p className="ml-4">-H "Content-Type: application/json"</p>
                <p className="mt-3 text-slate-400"># Response (200 OK)</p>
                <p className="text-amber-300">{"{"}</p>
                <p className="ml-4">"data": [{"{"}"id": "pat_001", "name": "Test Patient", "uhid": "AYZ-TEST-001"...{"}"}],</p>
                <p className="ml-4">"pagination": {"{"}"page": 1, "total": 25{"}"}</p>
                <p className="text-amber-300">{"}"}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="border-green-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm font-medium">Sandbox URL</p>
                    <code className="text-xs text-muted-foreground">sandbox.ayuzee.com</code>
                  </CardContent>
                </Card>
                <Card className="border-blue-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm font-medium">Rate Limit</p>
                    <code className="text-xs text-muted-foreground">100 req/min</code>
                  </CardContent>
                </Card>
                <Card className="border-purple-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm font-medium">Data Reset</p>
                    <code className="text-xs text-muted-foreground">Every 24 hours</code>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-1 h-4 w-4" /> Open Full API Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Key Dialog */}
      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate New API Key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Key Name</Label><Input placeholder="e.g., Branch 3 - Integration" /></div>
            <div>
              <Label>Environment</Label>
              <div className="flex gap-3 mt-1">
                <label className="flex items-center gap-2"><input type="radio" name="env" defaultChecked /><span className="text-sm">Live</span></label>
                <label className="flex items-center gap-2"><input type="radio" name="env" /><span className="text-sm">Sandbox</span></label>
              </div>
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Patients (Read/Write)", "Appointments", "Billing", "Prescriptions", "Inventory", "Analytics (Read)", "ABDM", "WhatsApp"].map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <Lock className="inline h-3 w-3 mr-1" /> API keys grant access to hospital data. Store securely and never expose in client-side code.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewKeyOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("API key generated"); setNewKeyOpen(false); }}>Generate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsDevPortal;
