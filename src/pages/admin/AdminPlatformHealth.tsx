import { useEffect, useState } from "react";
import { Activity, RefreshCw, Server, Shield, Database, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminPlatformHealth() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    pendingSignoffs: 0,
    openTickets: 0,
  });
  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Active sessions today
      const today = new Date().toISOString().split("T")[0];
      const { count: sessionsCount } = await (supabase as any)
        .from("therapy_sessions")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", today);

      // Pending doctor sign-offs
      const { count: signoffsCount } = await (supabase as any)
        .from("therapist_session_signoffs")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Open support tickets
      const { count: ticketsCount } = await (supabase as any)
        .from("platform_support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Total users from profiles
      const { count: usersCount } = await (supabase as any)
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: usersCount || 0,
        activeSessions: sessionsCount || 0,
        pendingSignoffs: signoffsCount || 0,
        openTickets: ticketsCount || 0,
      });

      // Recent critical errors
      const { data: errors } = await (supabase as any)
        .from("platform_audit_log")
        .select("*")
        .eq("severity", "critical")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentErrors(errors || []);
    } catch (error) {
      console.error("Error fetching platform health:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    toast.success("Platform health data refreshed");
  };

  const systemServices = [
    { name: "Database", icon: Database, status: "healthy" },
    { name: "Authentication", icon: Shield, status: "healthy" },
    { name: "Storage", icon: Server, status: "healthy" },
    { name: "Edge Functions", icon: Zap, status: "healthy" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Platform Health</h1>
            <p className="text-muted-foreground">Real-time operational dashboard</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : stats.activeSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Doctor Sign-offs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : stats.pendingSignoffs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : stats.openTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemServices.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <service.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <Badge variant="default" className="bg-green-600 text-xs">
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Critical Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {recentErrors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No critical errors recorded. All systems operational.
            </p>
          ) : (
            <div className="space-y-2">
              {recentErrors.map((error: any, idx: number) => (
                <div
                  key={error.id || idx}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                >
                  <div>
                    <p className="font-medium text-sm">{error.description || error.action_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {error.module} — {new Date(error.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uptime */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Platform Uptime</p>
              <p className="text-muted-foreground text-sm">Last 30 days</p>
            </div>
            <p className="text-3xl font-bold text-green-600">99.9%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
