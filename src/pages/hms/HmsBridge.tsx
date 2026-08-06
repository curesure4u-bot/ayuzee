import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowRightLeft, CheckCircle2, XCircle, Clock, AlertTriangle,
  Calendar, ShoppingCart, Users, FileText, FlaskConical, Star,
  Activity, Settings, RefreshCw, Loader2, Zap, Link2,
} from "lucide-react";
import {
  getBridgeConfig, updateBridgeConfig, initBridgeConfig,
  getSyncStats, getRecentBridgeRecords, retrySyncRecord,
  getSyncLog, type BridgeConfig, type BridgeRecord,
  type SyncStats, type BridgeType,
} from "@/services/ayuzeeHmsBridge";

const BRIDGE_TYPE_META: Record<BridgeType, { label: string; icon: typeof Calendar; color: string }> = {
  appointment: { label: "Appointments", icon: Calendar, color: "text-blue-600 bg-blue-100" },
  patient: { label: "Patients", icon: Users, color: "text-violet-600 bg-violet-100" },
  doctor: { label: "Doctors", icon: Activity, color: "text-emerald-600 bg-emerald-100" },
  prescription_order: { label: "Prescription → Orders", icon: ShoppingCart, color: "text-orange-600 bg-orange-100" },
  stock_product: { label: "Stock / Products", icon: ShoppingCart, color: "text-teal-600 bg-teal-100" },
  lab_report: { label: "Lab Reports", icon: FlaskConical, color: "text-indigo-600 bg-indigo-100" },
  review_feedback: { label: "Reviews / Feedback", icon: Star, color: "text-amber-600 bg-amber-100" },
  treatment_outcome: { label: "Treatment Outcomes", icon: Activity, color: "text-green-600 bg-green-100" },
};

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  synced: { label: "Synced", icon: CheckCircle2, color: "text-green-600" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-600" },
  conflict: { label: "Conflict", icon: AlertTriangle, color: "text-orange-600" },
};

const HmsBridge = () => {
  const [config, setConfig] = useState<BridgeConfig | null>(null);
  const [stats, setStats] = useState<Record<BridgeType, SyncStats> | null>(null);
  const [records, setRecords] = useState<BridgeRecord[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicName, setClinicName] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [cfg, st, rec, lg] = await Promise.all([
      getBridgeConfig(),
      getSyncStats(),
      getRecentBridgeRecords(30),
      getSyncLog(50),
    ]);
    setConfig(cfg);
    setStats(st);
    setRecords(rec);
    setLogs(lg);
    setLoading(false);
  };

  const handleInit = async () => {
    if (!clinicName.trim()) { toast.error("Enter clinic name"); return; }
    setSaving(true);
    const ok = await initBridgeConfig(clinicName.trim());
    if (ok) { toast.success("Bridge initialized!"); await loadAll(); }
    else toast.error("Failed to initialize");
    setSaving(false);
  };

  const handleToggle = async (key: keyof BridgeConfig, value: boolean) => {
    const ok = await updateBridgeConfig({ [key]: value } as any);
    if (ok) {
      setConfig((c) => c ? { ...c, [key]: value } : c);
      toast.success("Updated");
    }
  };

  const handleRetry = async (id: string) => {
    const ok = await retrySyncRecord(id);
    if (ok) { toast.success("Retry queued"); await loadAll(); }
    else toast.error("Retry failed");
  };

  // Compute totals
  const totalSynced = stats ? Object.values(stats).reduce((s, v) => s + v.synced, 0) : 0;
  const totalPending = stats ? Object.values(stats).reduce((s, v) => s + v.pending, 0) : 0;
  const totalFailed = stats ? Object.values(stats).reduce((s, v) => s + v.failed, 0) : 0;
  const totalRecords = stats ? Object.values(stats).reduce((s, v) => s + v.total, 0) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If no config exists, show setup
  if (!config) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <Card className="text-center p-8">
          <Link2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-display text-2xl font-bold">Connect Ayuzee ↔ AYUSH HMS</h1>
          <p className="mt-2 text-muted-foreground">
            Link your AYUSH HMS clinic to the Ayuzee aggregator platform. Online bookings will sync to your OPD queue, prescriptions can push to the shop, and more.
          </p>
          <div className="mt-6 space-y-3 text-left">
            <Label>Clinic Name</Label>
            <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="e.g., Spine Ayush Clinic" />
          </div>
          <Button className="mt-6 w-full gap-2" onClick={handleInit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Initialize Bridge
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" /> Ayuzee ↔ HMS Bridge
          </h1>
          <p className="text-muted-foreground">
            Sync status between Ayuzee aggregator and your AYUSH HMS clinic tool.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="pt-5 pb-4 text-center">
          <p className="font-display text-2xl font-bold">{totalRecords}</p>
          <p className="text-xs text-muted-foreground">Total Linked</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-green-600 mb-1" />
          <p className="font-display text-2xl font-bold text-green-600">{totalSynced}</p>
          <p className="text-xs text-muted-foreground">Synced</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-amber-600 mb-1" />
          <p className="font-display text-2xl font-bold text-amber-600">{totalPending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center">
          <XCircle className="mx-auto h-5 w-5 text-red-600 mb-1" />
          <p className="font-display text-2xl font-bold text-red-600">{totalFailed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
          <TabsTrigger value="config"><Settings className="mr-1 h-3.5 w-3.5" /> Config</TabsTrigger>
          <TabsTrigger value="log">Sync Log</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4 mt-4">
          {/* Per-type breakdown */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats && Object.entries(stats).map(([type, s]) => {
              const meta = BRIDGE_TYPE_META[type as BridgeType];
              return (
                <Card key={type}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`grid h-8 w-8 place-items-center rounded-lg ${meta.color}`}>
                        <meta.icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold">{meta.label}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">{s.synced} synced</span>
                      <span className="text-amber-600">{s.pending} pending</span>
                      <span className="text-red-600">{s.failed} failed</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Bridge Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {records.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No bridge records yet. Sync will appear as data flows between systems.</div>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {records.map((r) => {
                    const meta = BRIDGE_TYPE_META[r.bridge_type];
                    const statusMeta = STATUS_META[r.sync_status];
                    return (
                      <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.color}`}>
                          <meta.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{meta.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {r.sync_direction.replace(/_/g, " ")} · {new Date(r.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Badge className={`${statusMeta.color} bg-transparent border`}>
                          <statusMeta.icon className="mr-1 h-3 w-3" />{statusMeta.label}
                        </Badge>
                        {r.sync_status === "failed" && (
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleRetry(r.id)}>
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bridge Configuration</CardTitle>
              <p className="text-xs text-muted-foreground">Toggle which data flows between Ayuzee and your HMS.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "sync_appointments" as const, label: "Sync Appointments", desc: "Ayuzee bookings auto-appear in HMS OPD queue" },
                { key: "sync_prescriptions" as const, label: "Sync Prescriptions → Shop", desc: "HMS prescriptions suggest medicine orders to patients" },
                { key: "sync_stock" as const, label: "Sync Stock Visibility", desc: "HMS pharmacy stock shown on Ayuzee product pages" },
                { key: "sync_lab_reports" as const, label: "Sync Lab Reports", desc: "HMS lab results appear in patient's Ayuzee dashboard" },
                { key: "sync_patient_profiles" as const, label: "Sync Patient Profiles", desc: "Unified patient record across both systems" },
                { key: "sync_reviews" as const, label: "Sync Reviews", desc: "Trigger review request after HMS marks visit complete" },
                { key: "sync_treatment_outcomes" as const, label: "Sync Treatment Outcomes", desc: "HMS clinical outcomes feed into doctor's Ayuzee profile" },
                { key: "auto_queue_online_bookings" as const, label: "Auto-Queue Online Bookings", desc: "Online appointments get OPD token automatically" },
                { key: "auto_push_prescription_to_shop" as const, label: "Auto-Push Prescription to Shop", desc: "Patient gets 'Buy Medicines' link after prescription" },
                { key: "auto_trigger_review_after_visit" as const, label: "Auto-Trigger Review After Visit", desc: "Patient gets review prompt 24h after consultation" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30">
                  <div>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={config[item.key] as boolean}
                    onCheckedChange={(v) => handleToggle(item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Log Tab */}
        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sync Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No sync activity recorded yet.</div>
              ) : (
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {logs.map((log: any, i: number) => (
                    <div key={log.id ?? i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                      <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-[10px]">
                        {log.status}
                      </Badge>
                      <span className="font-medium">{log.operation}</span>
                      <span className="text-muted-foreground">{log.entity_type}</span>
                      <span className="text-muted-foreground ml-auto">
                        {log.source_system} → {log.target_system}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsBridge;
