import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Watch, Heart, Activity, Droplets, Thermometer, Scale,
  Bluetooth, Wifi, RefreshCw, Plus, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Smartphone, Footprints, Moon
} from "lucide-react";

type ConnectedDevice = {
  id: string;
  name: string;
  type: string;
  brand: string;
  sync_source: string;
  status: "connected" | "disconnected" | "error";
  last_sync: string;
  battery?: number;
};

type VitalReading = {
  id: string;
  type: string;
  label: string;
  value: number;
  secondary?: number;
  unit: string;
  time: string;
  source: string;
  is_abnormal: boolean;
  trend: "up" | "down" | "stable";
  context?: string;
};

const mockDevices: ConnectedDevice[] = [
  { id: "1", name: "Mi Band 8", type: "fitness_band", brand: "Xiaomi", sync_source: "google_fit", status: "connected", last_sync: "2 min ago", battery: 72 },
  { id: "2", name: "Omron BP Monitor", type: "bp_monitor", brand: "Omron", sync_source: "bluetooth_direct", status: "connected", last_sync: "1 hour ago", battery: 90 },
  { id: "3", name: "Accu-Chek Active", type: "glucometer", brand: "Roche", sync_source: "manual_entry", status: "disconnected", last_sync: "Yesterday" },
  { id: "4", name: "Apple Watch SE", type: "smartwatch", brand: "Apple", sync_source: "apple_health", status: "connected", last_sync: "5 min ago", battery: 58 },
];

const mockReadings: VitalReading[] = [
  { id: "1", type: "blood_pressure", label: "Blood Pressure", value: 128, secondary: 82, unit: "mmHg", time: "08:30 AM", source: "Omron BP", is_abnormal: false, trend: "stable", context: "resting" },
  { id: "2", type: "heart_rate", label: "Heart Rate", value: 72, unit: "bpm", time: "09:15 AM", source: "Mi Band", is_abnormal: false, trend: "stable", context: "resting" },
  { id: "3", type: "spo2", label: "SpO2", value: 97, unit: "%", time: "09:15 AM", source: "Mi Band", is_abnormal: false, trend: "stable" },
  { id: "4", type: "blood_glucose", label: "Blood Sugar (Fasting)", value: 142, unit: "mg/dL", time: "07:00 AM", source: "Accu-Chek", is_abnormal: true, trend: "up", context: "fasting" },
  { id: "5", type: "steps", label: "Steps Today", value: 4280, unit: "steps", time: "Live", source: "Mi Band", is_abnormal: false, trend: "up" },
  { id: "6", type: "sleep", label: "Sleep Duration", value: 6.5, unit: "hours", time: "Last Night", source: "Apple Watch", is_abnormal: true, trend: "down" },
  { id: "7", type: "weight", label: "Body Weight", value: 74.2, unit: "kg", time: "Yesterday", source: "Manual", is_abnormal: false, trend: "down" },
  { id: "8", type: "body_temperature", label: "Temperature", value: 98.4, unit: "°F", time: "08:00 AM", source: "Manual", is_abnormal: false, trend: "stable" },
];

const vitalIcons: Record<string, typeof Heart> = {
  blood_pressure: Activity,
  heart_rate: Heart,
  spo2: Droplets,
  blood_glucose: Droplets,
  steps: Footprints,
  sleep: Moon,
  weight: Scale,
  body_temperature: Thermometer,
};

const HmsWearableSync = () => {
  const [devices] = useState<ConnectedDevice[]>(mockDevices);
  const [readings] = useState<VitalReading[]>(mockReadings);

  const connectedCount = devices.filter(d => d.status === "connected").length;
  const abnormalCount = readings.filter(r => r.is_abnormal).length;

  const handleSync = () => {
    toast.success("Syncing all connected devices... Latest vitals will appear in 10 seconds.");
  };

  const handleConnect = () => {
    toast.info("Open Ayuzee mobile app → Settings → Connect Device → Select your device");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Watch className="h-6 w-6 text-primary" /> Wearable & Device Sync
          </h1>
          <p className="text-sm text-muted-foreground">
            Sync vitals from smartwatches, BP monitors, glucometers via Google Fit / Apple Health / Bluetooth
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/patient/vitals"}>Clinical Vitals</Button>
          <Button size="sm" variant="outline" onClick={handleSync}><RefreshCw className="mr-1 h-4 w-4" /> Sync All</Button>
          <Button size="sm" onClick={handleConnect}><Plus className="mr-1 h-4 w-4" /> Connect Device</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{connectedCount}</p><p className="text-xs text-muted-foreground">Connected Devices</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{readings.length}</p><p className="text-xs text-muted-foreground">Today's Readings</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{abnormalCount}</p><p className="text-xs text-muted-foreground">Abnormal Values</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">3</p><p className="text-xs text-muted-foreground">Sync Sources</p></CardContent></Card>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Live Vitals</TabsTrigger>
          <TabsTrigger value="devices">Connected Devices ({devices.length})</TabsTrigger>
          <TabsTrigger value="trends">Trends & AI Insights</TabsTrigger>
        </TabsList>

        {/* Live Vitals */}
        <TabsContent value="vitals">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {readings.map(reading => {
              const Icon = vitalIcons[reading.type] || Activity;
              return (
                <Card key={reading.id} className={reading.is_abnormal ? "border-red-200 bg-red-50/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${reading.is_abnormal ? "text-red-500" : "text-primary"}`} />
                      {reading.trend === "up" && <TrendingUp className={`h-4 w-4 ${reading.is_abnormal ? "text-red-500" : "text-green-500"}`} />}
                      {reading.trend === "down" && <TrendingDown className={`h-4 w-4 ${reading.type === "weight" ? "text-green-500" : "text-amber-500"}`} />}
                      {reading.trend === "stable" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{reading.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${reading.is_abnormal ? "text-red-600" : ""}`}>
                      {reading.value}{reading.secondary ? `/${reading.secondary}` : ""} <span className="text-sm font-normal text-muted-foreground">{reading.unit}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{reading.time}</span>
                      <span>{reading.source}</span>
                    </div>
                    {reading.context && <Badge variant="outline" className="text-[10px] mt-1">{reading.context}</Badge>}
                    {reading.is_abnormal && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" /> Above normal range
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Connected Devices */}
        <TabsContent value="devices">
          <div className="space-y-3">
            {devices.map(device => (
              <Card key={device.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full grid place-items-center ${device.status === "connected" ? "bg-green-100" : "bg-gray-100"}`}>
                      {device.type === "smartwatch" || device.type === "fitness_band" ? <Watch className="h-5 w-5" /> :
                       device.type === "bp_monitor" ? <Activity className="h-5 w-5" /> :
                       device.type === "glucometer" ? <Droplets className="h-5 w-5" /> :
                       <Smartphone className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.brand} · {device.sync_source.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Last sync: {device.last_sync}</p>
                      {device.battery && <p>Battery: {device.battery}%</p>}
                    </div>
                    <Badge variant={device.status === "connected" ? "default" : device.status === "error" ? "destructive" : "secondary"}>
                      {device.status === "connected" ? <Wifi className="mr-1 h-3 w-3" /> : <Bluetooth className="mr-1 h-3 w-3" />}
                      {device.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Connect a New Device</p>
                <p className="text-xs text-muted-foreground mt-1">Supports: Google Fit, Apple Health, Health Connect, Bluetooth LE devices</p>
                <Button size="sm" className="mt-3" onClick={handleConnect}>Connect via App</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends & AI */}
        <TabsContent value="trends">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Health Insights (from Continuous Monitoring)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Blood Sugar Trending Up</p>
                    <p className="text-xs text-amber-700 mt-0.5">Fasting glucose has increased from 110 → 142 mg/dL over the past 2 weeks. Consider reviewing diet and medication adherence. Ayurvedic suggestion: Meshashringi (Gymnema) support may help.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-2">
                  <Moon className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Sleep Duration Declining</p>
                    <p className="text-xs text-blue-700 mt-0.5">Average sleep dropped to 6.2 hours (from 7.5). This correlates with increased resting heart rate. Yoga Nidra or Ashwagandha before bed may improve sleep quality.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3 bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Blood Pressure Well Controlled</p>
                    <p className="text-xs text-green-700 mt-0.5">BP has been consistently in the 120-130/78-85 range for 3 weeks. Current Ayurvedic + allopathic management is working well. Continue current regimen.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <Footprints className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Activity Goal: 67% Achieved</p>
                    <p className="text-xs text-muted-foreground mt-0.5">4,280 / 6,000 daily step goal. Walking 30 min more would meet target. According to Dinacharya, a morning walk (Pratas-Charana) is ideal for Kapha pacification.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsWearableSync;
