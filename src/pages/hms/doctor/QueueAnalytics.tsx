import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Clock, TrendingUp, AlertTriangle, Activity, ThermometerSun, Loader2,
} from "lucide-react";
import { useQueueAnalytics } from "@/hooks/useQueueAnalytics";

const levelColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const QueueAnalytics = () => {
  const { stats, waitingPatients, hourlyLoad, satisfactionData, loading, error } = useQueueAnalytics();

  const alertCount = waitingPatients.filter((p) => p.alert).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" /> Queue Analytics
        </h1>
        {alertCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> {alertCount} patient{alertCount > 1 ? "s" : ""} waiting &gt; 25min
          </Badge>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading queue data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing cached/demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Queue Depth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.queueDepth}</div><p className="text-xs text-muted-foreground">patients waiting</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Wait</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.avgWaitMinutes} min</div><p className="text-xs text-muted-foreground">current average</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seen Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.seenToday}</div><p className="text-xs text-muted-foreground">avg {stats.avgConsultationMinutes} min/consultation</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak Load</CardTitle>
            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.peakHour}</div><p className="text-xs text-muted-foreground">highest volume</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Peak Hours Heatmap</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 flex-wrap">
              {hourlyLoad.map((slot) => (
                <div key={slot.hour} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded ${levelColors[slot.level]} opacity-80 flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{slot.count || ""}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{slot.hour}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> High (6+)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /> Medium (3-5)</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Low (0-2)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Satisfaction vs Wait Time</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {satisfactionData.map((row) => (
              <div key={row.wait} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{row.wait}</span>
                  <span className={row.satisfaction < 60 ? "text-red-500" : "text-muted-foreground"}>{row.satisfaction}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${row.satisfaction >= 80 ? "bg-green-500" : row.satisfaction >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${row.satisfaction}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Currently Waiting</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Token</th><th className="pb-2">Patient</th><th className="pb-2">Wait Time</th><th className="pb-2">Type</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {waitingPatients.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-mono">{p.token}</td>
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.waitMinutes} min</td>
                    <td className="py-2 capitalize text-muted-foreground">{p.visitType.replace("_", " ")}</td>
                    <td className="py-2">
                      {p.alert
                        ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Exceeding</Badge>
                        : <Badge variant="secondary">Normal</Badge>}
                    </td>
                  </tr>
                ))}
                {waitingPatients.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No patients currently waiting</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueAnalytics;
