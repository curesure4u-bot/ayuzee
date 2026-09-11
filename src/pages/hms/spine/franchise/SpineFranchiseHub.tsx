import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Rocket, LayoutGrid, BarChart3, Calculator, CalendarClock,
  Smartphone, ArrowRight, Users, IndianRupee, Store, Wifi, Layers,
  TrendingUp, Star, Package, Target, Sparkles, MapPin,
} from "lucide-react";

const tools = [
  { id: "setup", num: 1, name: "Setup Wizard", desc: "Step-by-step launch guide — model, rooms, equipment, staff, licensing", icon: Rocket, color: "orange", route: "/hms/spine-franchise-setup" },
  { id: "layout", num: 2, name: "Layout Planner", desc: "Interactive floor plans for physical, hybrid & online centers", icon: LayoutGrid, color: "blue", route: "/hms/spine-franchise-layout" },
  { id: "ops", num: 3, name: "Operations Dashboard", desc: "Multi-center KPIs, revenue, leaderboard & network insights", icon: BarChart3, color: "purple", route: "/hms/spine-franchise-ops" },
  { id: "cost", num: 4, name: "Cost Calculator", desc: "Room-wise equipment lists with live investment totals", icon: Calculator, color: "green", route: "/hms/spine-franchise-cost" },
  { id: "roster", num: 5, name: "Staff Roster", desc: "Weekly shift scheduling with doctor coverage check", icon: CalendarClock, color: "cyan", route: "/hms/spine-franchise-roster" },
  { id: "portal", num: 6, name: "Patient Portal", desc: "Online/hybrid booking, teleconsult, home kits & follow-up", icon: Smartphone, color: "pink", route: "/hms/spine-franchise-portal" },
];

const modelIcon: Record<string, any> = { physical: Store, online: Wifi, hybrid: Layers };

export default function SpineFranchiseHub() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ centers: 0, patients: 0, revenue: 0, packages: 0, bookings: 0, kitOrders: 0, loaded: false });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase.from("spine_franchise_data").select("*").eq("is_active", true);
        if (data) {
          const centers = data.filter((d: any) => d.record_type === "center");
          const bookings = data.filter((d: any) => d.record_type === "booking");
          const kitOrders = data.filter((d: any) => d.record_type === "kit_order");
          setStats({
            centers: centers.length,
            patients: centers.reduce((s: number, c: any) => s + (c.patients || 0), 0),
            revenue: centers.reduce((s: number, c: any) => s + (c.revenue || 0), 0),
            packages: centers.reduce((s: number, c: any) => s + (c.packages || 0), 0),
            bookings: bookings.length,
            kitOrders: kitOrders.length,
            loaded: true,
          });
        }
      } catch (err) { /* fallback to defaults */ }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-600" />
            Franchise Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Central command for your Spine AYUSH franchise network — all tools in one place
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700">
          <Sparkles className="h-3 w-3 mr-1" /> Franchise Command Center
        </Badge>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card><CardContent className="pt-3 pb-2 text-center"><Building2 className="h-4 w-4 mx-auto text-orange-500" /><p className="text-lg font-bold mt-1">{stats.centers}</p><p className="text-[9px] text-muted-foreground">Active Centers</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Users className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">{stats.patients}</p><p className="text-[9px] text-muted-foreground">Total Patients</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-500" /><p className="text-sm font-bold mt-1">₹{(stats.revenue / 100000).toFixed(1)}L</p><p className="text-[9px] text-muted-foreground">Network Revenue</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Package className="h-4 w-4 mx-auto text-amber-500" /><p className="text-lg font-bold mt-1">{stats.packages}</p><p className="text-[9px] text-muted-foreground">Packages Sold</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Smartphone className="h-4 w-4 mx-auto text-pink-500" /><p className="text-lg font-bold mt-1">{stats.bookings}</p><p className="text-[9px] text-muted-foreground">Portal Bookings</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Target className="h-4 w-4 mx-auto text-purple-500" /><p className="text-lg font-bold mt-1">{stats.kitOrders}</p><p className="text-[9px] text-muted-foreground">Kit Orders</p></CardContent></Card>
      </div>

      {/* 6 Tools Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4 text-orange-500" /> Franchise Toolkit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-md transition group"
                onClick={() => navigate(tool.route)}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-lg bg-${tool.color}-100 flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${tool.color}-600`} />
                    </div>
                    <Badge variant="outline" className="text-[9px]">Tool #{tool.num}</Badge>
                  </div>
                  <h3 className="font-bold text-sm mt-2 flex items-center gap-1">
                    {tool.name}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Journey / How to Use */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1"><Rocket className="h-4 w-4 text-orange-600" /> Franchisee Onboarding Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {[
              { step: "Choose model & plan", tool: "Setup Wizard" },
              { step: "Design your space", tool: "Layout Planner" },
              { step: "Calculate investment", tool: "Cost Calculator" },
              { step: "Schedule staff", tool: "Staff Roster" },
              { step: "Launch online reach", tool: "Patient Portal" },
              { step: "Monitor performance", tool: "Ops Dashboard" },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium text-[10px]">{s.step}</p>
                  <p className="text-[9px] text-orange-600">{s.tool}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-orange-400" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { name: "Physical", icon: Store, color: "blue", investment: "₹15-25L", space: "800-1200 sq ft", staff: "4-5", reach: "Local" },
          { name: "Online", icon: Wifi, color: "green", investment: "₹2-5L", space: "Home office", staff: "2-3", reach: "Pan-India" },
          { name: "Hybrid", icon: Layers, color: "purple", investment: "₹10-18L", space: "500-800 sq ft", staff: "3-4", reach: "Local + Remote" },
        ].map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.name}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-${m.color}-100 flex items-center justify-center`}><Icon className={`h-5 w-5 text-${m.color}-600`} /></div>
                  <h3 className="font-bold text-sm">{m.name} Model</h3>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Investment</span><span className="font-medium">{m.investment}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Space</span><span className="font-medium">{m.space}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Staff</span><span className="font-medium">{m.staff}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reach</span><span className="font-medium">{m.reach}</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Powered by Ayuzee HMS — 19 therapies, 6 spine tools, clinical modules, and complete franchise infrastructure.
      </p>
    </div>
  );
}
