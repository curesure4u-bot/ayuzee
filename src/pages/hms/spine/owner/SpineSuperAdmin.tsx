import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck, Building2, Users, IndianRupee, Activity, TrendingUp,
  AlertTriangle, Bell, MapPin, Store, Wifi, Layers, Crown, Eye,
  Radio, Zap, Lock, Server, BarChart3, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, Stethoscope, Star, Smartphone,
} from "lucide-react";

const modelIcon: Record<string, any> = { physical: Store, online: Wifi, hybrid: Layers };

export default function SpineSuperAdmin() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<any[]>([]);
  const [network, setNetwork] = useState({ centers: 0, patients: 0, revenue: 0, packages: 0, bookings: 0, kitOrders: 0, sessions: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [franchiseRes, sessionsRes] = await Promise.all([
          supabase.from("spine_franchise_data").select("*").eq("is_active", true),
          supabase.from("spine_therapy_sessions").select("id", { count: "exact" }),
        ]);
        const data = franchiseRes.data || [];
        const centerList = data.filter((d: any) => d.record_type === "center");
        const bookings = data.filter((d: any) => d.record_type === "booking");
        const kitOrders = data.filter((d: any) => d.record_type === "kit_order");
        setCenters(centerList);
        setNetwork({
          centers: centerList.length,
          patients: centerList.reduce((s: number, c: any) => s + (c.patients || 0), 0),
          revenue: centerList.reduce((s: number, c: any) => s + (c.revenue || 0), 0),
          packages: centerList.reduce((s: number, c: any) => s + (c.packages || 0), 0),
          bookings: bookings.length,
          kitOrders: kitOrders.length,
          sessions: sessionsRes.count || 0,
        });
      } catch (err) { /* ignore */ }
      setLoaded(true);
    };
    fetchAll();
  }, []);

  // Alerts (computed from center health)
  const alerts = centers
    .filter((c: any) => (c.monthly_growth || 0) < 5 || (c.conversion_rate || 0) < 55)
    .map((c: any) => ({ center: c.center_name, issue: (c.monthly_growth || 0) < 5 ? "Low growth" : "Low conversion", severity: "warning" }));

  const liveActivity = [
    { time: "just now", text: "New booking — Chennai (Video consult)", icon: Smartphone, color: "blue" },
    { time: "2 min ago", text: "Session completed — Kadayanallur (Kati Basti)", icon: CheckCircle2, color: "green" },
    { time: "8 min ago", text: "Package sold — Online (₹8,500 Standard)", icon: IndianRupee, color: "emerald" },
    { time: "15 min ago", text: "Home kit dispatched — Sciatica Kit", icon: Activity, color: "purple" },
    { time: "22 min ago", text: "New lead — Tirunelveli (WhatsApp)", icon: Users, color: "amber" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-slate-700" />
            Super Admin — Command & Control
          </h1>
          <p className="text-muted-foreground mt-1">Remote oversight of your entire Spine AYUSH network — access everything, from anywhere</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-800 text-white gap-1"><Lock className="h-3 w-3" /> Owner Access</Badge>
          <Badge className="bg-green-100 text-green-700 gap-1"><Radio className="h-3 w-3 animate-pulse" /> Live</Badge>
        </div>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className="bg-slate-50"><CardContent className="pt-3 pb-2 text-center"><Building2 className="h-4 w-4 mx-auto text-slate-600" /><p className="text-lg font-bold mt-1">{network.centers}</p><p className="text-[9px] text-muted-foreground">Centers</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Users className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">{network.patients}</p><p className="text-[9px] text-muted-foreground">Patients</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-500" /><p className="text-sm font-bold mt-1">₹{(network.revenue / 100000).toFixed(1)}L</p><p className="text-[9px] text-muted-foreground">Revenue</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Star className="h-4 w-4 mx-auto text-amber-500" /><p className="text-lg font-bold mt-1">{network.packages}</p><p className="text-[9px] text-muted-foreground">Packages</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Activity className="h-4 w-4 mx-auto text-purple-500" /><p className="text-lg font-bold mt-1">{network.sessions}</p><p className="text-[9px] text-muted-foreground">Sessions</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Smartphone className="h-4 w-4 mx-auto text-pink-500" /><p className="text-lg font-bold mt-1">{network.bookings}</p><p className="text-[9px] text-muted-foreground">Bookings</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Zap className="h-4 w-4 mx-auto text-cyan-500" /><p className="text-lg font-bold mt-1">{network.kitOrders}</p><p className="text-[9px] text-muted-foreground">Kit Orders</p></CardContent></Card>
      </div>

      <Tabs defaultValue="centers">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="centers" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Centers</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1"><Radio className="h-3 w-3" /> Live Feed</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Alerts</TabsTrigger>
          <TabsTrigger value="controls" className="text-xs gap-1"><Server className="h-3 w-3" /> Controls</TabsTrigger>
        </TabsList>

        {/* TAB 1: All Centers */}
        <TabsContent value="centers" className="space-y-2">
          {centers.length === 0 && loaded && (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">No centers registered yet. Add centers via the Franchise Hub.</CardContent></Card>
          )}
          {centers.map((c: any) => {
            const Icon = modelIcon[c.model] || Store;
            const growth = c.monthly_growth || 0;
            return (
              <Card key={c.id}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-slate-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{c.center_name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {c.city} · {c.model}</p>
                    </div>
                    <div className="hidden sm:flex gap-4 text-center text-xs">
                      <div><p className="font-bold">{c.patients}</p><p className="text-[8px] text-muted-foreground">patients</p></div>
                      <div><p className="font-bold">₹{((c.revenue || 0) / 100000).toFixed(1)}L</p><p className="text-[8px] text-muted-foreground">revenue</p></div>
                      <div><p className="font-bold">{c.satisfaction} ⭐</p><p className="text-[8px] text-muted-foreground">rating</p></div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${growth >= 10 ? "text-green-600" : growth >= 5 ? "text-blue-600" : "text-amber-600"}`}>
                      {growth >= 5 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {growth}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => navigate("/hms/spine-franchise-ops")}>
            <BarChart3 className="h-3 w-3" /> Full Operations Dashboard
          </Button>
        </TabsContent>

        {/* TAB 2: Live Activity Feed */}
        <TabsContent value="activity" className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Radio className="h-3 w-3 text-green-500 animate-pulse" /> Real-time network activity</p>
          {liveActivity.map((a, i) => {
            const Icon = a.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-2.5 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${a.color}-100 flex items-center justify-center shrink-0`}><Icon className={`h-4 w-4 text-${a.color}-600`} /></div>
                    <span className="flex-1 text-sm">{a.text}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <p className="text-[10px] text-muted-foreground text-center">Connect real-time subscriptions to see live events as they happen across all centers.</p>
        </TabsContent>

        {/* TAB 3: Alerts */}
        <TabsContent value="alerts" className="space-y-2">
          {alerts.length === 0 ? (
            <Card><CardContent className="py-6 text-center"><CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" /><p className="text-sm font-medium">All centers healthy</p><p className="text-xs text-muted-foreground">No alerts. Every center is performing above threshold.</p></CardContent></Card>
          ) : (
            alerts.map((a: any, i) => (
              <Card key={i} className="border-amber-200 bg-amber-50/30">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.center}</p>
                      <p className="text-xs text-muted-foreground">{a.issue} — needs attention</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/hms/spine-franchise-ops")}>Review</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TAB 4: Quick Controls */}
        <TabsContent value="controls" className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Operations Dashboard", icon: BarChart3, route: "/hms/spine-franchise-ops" },
              { label: "Franchise Hub", icon: Building2, route: "/hms/spine-franchise-hub" },
              { label: "Staff Rosters", icon: Users, route: "/hms/spine-franchise-roster" },
              { label: "Follow-Up Rules", icon: Bell, route: "/hms/spine-followup-rules" },
              { label: "Cost Calculator", icon: IndianRupee, route: "/hms/spine-franchise-cost" },
              { label: "Command Center", icon: Activity, route: "/hms/spine-command-center" },
              { label: "Clinical Resources", icon: Stethoscope, route: "/hms/spine-clinical-resources" },
              { label: "Chief Physician Suite", icon: Crown, route: "/hms/spine-chief-physician" },
              { label: "Patient Portal", icon: Smartphone, route: "/hms/spine-franchise-portal" },
            ].map(c => {
              const Icon = c.icon;
              return (
                <button key={c.label} onClick={() => navigate(c.route)} className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:shadow-md hover:bg-muted/30 transition">
                  <Icon className="h-5 w-5 text-slate-600" />
                  <span className="text-[10px] font-medium text-center">{c.label}</span>
                </button>
              );
            })}
          </div>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="pt-3 pb-3 text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-600 shrink-0" />
              <span>This is your master control panel. From here you reach every module, every center, every tool — remotely, from any device. Access is owner-restricted.</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
