import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Clock, TrendingUp, AlertTriangle, Activity, ThermometerSun,
} from "lucide-react";

const heatmapData = [
  { hour: "8AM", level: "high" }, { hour: "9AM", level: "high" },
  { hour: "10AM", level: "high" }, { hour: "11AM", level: "medium" },
  { hour: "12PM", level: "low" }, { hour: "1PM", level: "low" },
  { hour: "2PM", level: "medium" }, { hour: "3PM", level: "medium" },
  { hour: "4PM", level: "high" }, { hour: "5PM", level: "medium" },
  { hour: "6PM", level: "low" },
];

const waitingPatients = [
  { name: "Rajesh Kumar", token: "T-033", wait: "28 min", alert: true },
  { name: "Anita Sharma", token: "T-034", wait: "26 min", alert: true },
  { name: "Vikram Patel", token: "T-035", wait: "14 min", alert: false },
  { name: "Meera Joshi", token: "T-036", wait: "8 min", alert: false },
  { name: "Suresh Nair", token: "T-037", wait: "3 min", alert: false },
];

const satisfactionData = [
  { wait: "< 10 min", satisfaction: 92 },
  { wait: "10-15 min", satisfaction: 85 },
  { wait: "15-20 min", satisfaction: 72 },
  { wait: "20-25 min", satisfaction: 58 },
  { wait: "> 25 min", satisfaction: 41 },
];

const levelColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const QueueAnalytics = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" /> Queue Analytics
        </h1>
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> 2 patients waiting &gt; 25min
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Queue Depth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">5</div><p className="text-xs text-muted-foreground">patients waiting</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Wait</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">18 min</div><p className="text-xs text-muted-foreground">current average</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seen Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">32</div><p className="text-xs text-muted-foreground">avg 12 min/consultation</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak Load</CardTitle>
            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">8-10 AM</div><p className="text-xs text-muted-foreground">highest volume</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Peak Hours Heatmap</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 flex-wrap">
              {heatmapData.map((slot) => (
                <div key={slot.hour} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded ${levelColors[slot.level]} opacity-80`} />
                  <span className="text-xs text-muted-foreground">{slot.hour}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> High</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /> Medium</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Low</span>
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
                <th className="pb-2">Token</th><th className="pb-2">Patient</th><th className="pb-2">Wait Time</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {waitingPatients.map((p) => (
                  <tr key={p.token} className="border-b last:border-0">
                    <td className="py-2 font-mono">{p.token}</td>
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.wait}</td>
                    <td className="py-2">
                      {p.alert
                        ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Exceeding</Badge>
                        : <Badge variant="secondary">Normal</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueAnalytics;
