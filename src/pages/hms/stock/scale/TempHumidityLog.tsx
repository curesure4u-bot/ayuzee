import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Thermometer, Droplets, AlertTriangle, CheckCircle, Wifi } from "lucide-react";

const zones = [
  { name: "Central Store - Main Hall", temp: 24.5, humidity: 58, tempRange: "15-30°C", humRange: "40-65%", status: "normal", lastUpdated: "10:45 AM", sensor: "IoT-CS-01" },
  { name: "Central Store - Cold Room", temp: 8.2, humidity: 45, tempRange: "2-15°C", humRange: "30-50%", status: "normal", lastUpdated: "10:45 AM", sensor: "IoT-CS-02" },
  { name: "PK Room - Oil Storage", temp: 26.8, humidity: 52, tempRange: "20-30°C", humRange: "40-60%", status: "normal", lastUpdated: "10:44 AM", sensor: "IoT-PK-01" },
  { name: "Pharmacy - Dispensing", temp: 25.1, humidity: 55, tempRange: "20-28°C", humRange: "40-60%", status: "normal", lastUpdated: "10:45 AM", sensor: "IoT-PH-01" },
  { name: "Manufacturing - Drying Room", temp: 35.2, humidity: 72, tempRange: "30-40°C", humRange: "40-65%", status: "humidity_high", lastUpdated: "10:43 AM", sensor: "IoT-MF-01" },
  { name: "Branch HSR - Store Room", temp: 27.5, humidity: 68, tempRange: "15-30°C", humRange: "40-65%", status: "humidity_high", lastUpdated: "10:40 AM", sensor: "IoT-HSR-01" },
];

const alerts = [
  { time: "10:43 AM", zone: "Manufacturing - Drying Room", type: "Humidity High", value: "72% (limit: 65%)", action: "Dehumidifier activated automatically", resolved: false },
  { time: "10:40 AM", zone: "Branch HSR - Store Room", type: "Humidity High", value: "68% (limit: 65%)", action: "Alert sent to branch manager — open ventilation", resolved: false },
  { time: "09:15 AM", zone: "Central Store - Cold Room", type: "Temp Spike", value: "16°C (limit: 15°C)", action: "Compressor cycled — back to 8°C by 09:25", resolved: true },
  { time: "Yesterday 11 PM", zone: "PK Room - Oil Storage", type: "Power Outage", value: "Temp rose to 32°C for 45 min", action: "UPS backup activated. No oil degradation (short duration).", resolved: true },
];

const storageRules = [
  { form: "Kashayam / Arishta", tempReq: "15-30°C", humReq: "<65%", notes: "Keep away from direct sunlight" },
  { form: "Churna (Powders)", tempReq: "15-28°C", humReq: "<55% (critical)", notes: "Highly hygroscopic — moisture causes caking" },
  { form: "Taila / Ghrita (Oils)", tempReq: "20-30°C", humReq: "<60%", notes: "Dark storage. Avoid temp fluctuation (condensation risk)" },
  { form: "Bhasma / Pishti", tempReq: "15-30°C", humReq: "<40% (critical)", notes: "Moisture-proof containers mandatory" },
  { form: "Vaccines / Biologicals", tempReq: "2-8°C (cold chain)", humReq: "N/A", notes: "Cold room only. Continuous monitoring required." },
];

export default function TempHumidityLog() {
  const normalZones = zones.filter(z => z.status === "normal").length;
  const alertZones = zones.filter(z => z.status !== "normal").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Thermometer className="h-6 w-6 text-red-500" /> Temperature & Humidity Log</h1>
          <p className="text-muted-foreground mt-1">IoT-ready storage monitoring — track conditions for temperature-sensitive AYUSH medicines (GMP requirement)</p>
        </div>
        <Badge variant="outline" className="text-xs flex items-center gap-1"><Wifi className="h-3 w-3 text-green-500" /> {zones.length} sensors online</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{zones.length}</p><p className="text-xs text-muted-foreground">Zones Monitored</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{normalZones}</p><p className="text-xs text-muted-foreground">Normal</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{alertZones}</p><p className="text-xs text-muted-foreground">Alert</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{alerts.filter(a => !a.resolved).length}</p><p className="text-xs text-muted-foreground">Active Alerts</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone, i) => (
          <Card key={i} className={zone.status !== "normal" ? "border-red-300" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">{zone.name}</p>
                {zone.status === "normal" ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded bg-muted/30">
                  <Thermometer className="h-3.5 w-3.5 mx-auto text-red-500" />
                  <p className="text-lg font-bold mt-0.5">{zone.temp}°C</p>
                  <p className="text-[9px] text-muted-foreground">{zone.tempRange}</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <Droplets className="h-3.5 w-3.5 mx-auto text-blue-500" />
                  <p className={`text-lg font-bold mt-0.5 ${zone.status === "humidity_high" ? "text-red-600" : ""}`}>{zone.humidity}%</p>
                  <p className="text-[9px] text-muted-foreground">{zone.humRange}</p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 text-center">{zone.sensor} • Updated {zone.lastUpdated}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`p-2 rounded border text-xs ${alert.resolved ? "border-green-200" : "border-red-200 bg-red-50/30"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.resolved ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-600" />}
                  <span className="font-medium">{alert.zone}</span>
                  <Badge variant={alert.resolved ? "outline" : "destructive"} className="text-[9px]">{alert.type}</Badge>
                </div>
                <span className="text-muted-foreground text-[10px]">{alert.time}</span>
              </div>
              <p className="text-muted-foreground mt-1 ml-5">Value: {alert.value} | Action: {alert.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-1"><CardTitle className="text-sm">AYUSH Storage Requirements</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b"><tr><th className="px-3 py-1 text-left">Dosage Form</th><th className="px-3 py-1 text-center">Temp</th><th className="px-3 py-1 text-center">Humidity</th><th className="px-3 py-1 text-left">Notes</th></tr></thead><tbody>
            {storageRules.map((r, i) => <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{r.form}</td><td className="px-3 py-1.5 text-center">{r.tempReq}</td><td className="px-3 py-1.5 text-center">{r.humReq}</td><td className="px-3 py-1.5 text-muted-foreground">{r.notes}</td></tr>)}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Environmental Monitor</p><p className="text-sm text-purple-700">Manufacturing drying room humidity at 72% — monsoon effect. AI auto-activated dehumidifier. HSR branch at 68% — Churna packets at risk of moisture absorption. Recommend moving Bhasma stock to sealed containers (current humidity above 40% threshold). Annual savings from preventing moisture damage: ₹45,000 estimated. GMP audit ready: Complete temperature log for past 365 days available.</p></div></CardContent></Card>
    </div>
  );
}
