import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const devices = [
  { name: "Apple Watch Series 9", connected: true },
  { name: "Withings Body+ Scale", connected: true },
  { name: "Oura Ring Gen 3", connected: false },
  { name: "Fitbit Charge 6", connected: true },
  { name: "Omron Blood Pressure Monitor", connected: false },
];

const vitals = [
  { label: "Heart Rate", value: "72 bpm", icon: "❤️" },
  { label: "SpO2", value: "98%", icon: "🫁" },
  { label: "Steps Today", value: "8,432", icon: "👟" },
  { label: "Sleep", value: "7.2 hrs", icon: "😴" },
  { label: "HRV", value: "42 ms", icon: "📈" },
  { label: "Weight", value: "68.5 kg", icon: "⚖️" },
];

const interpretations = [
  { vital: "Heart Rate 72 bpm", insight: "Balanced — Pitta dosha in equilibrium. No tachycardia signs." },
  { vital: "SpO2 98%", insight: "Excellent Prana flow. Kapha channels clear." },
  { vital: "HRV 42 ms", insight: "Slightly low — indicates Vata aggravation. Consider grounding practices." },
  { vital: "Sleep 7.2 hrs", insight: "Adequate for Pitta-Vata type. Quality appears restorative." },
];

export default function SmartHomeVitals() {
  const [deviceList, setDeviceList] = useState(devices);

  const toggleDevice = (idx: number) => {
    const updated = [...deviceList];
    updated[idx].connected = !updated[idx].connected;
    setDeviceList(updated);
    toast.success(`${updated[idx].name} ${updated[idx].connected ? "connected" : "disconnected"}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Smart Home Vitals</h1>
      <p className="text-muted-foreground">Connected devices syncing with your Ayurvedic health profile.</p>

      <Card>
        <CardHeader><CardTitle>Connected Devices</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {deviceList.map((d, i) => (
            <div key={d.name} className="flex justify-between items-center border-b pb-2 last:border-0">
              <span className="text-sm font-medium">{d.name}</span>
              <Button size="sm" variant={d.connected ? "default" : "outline"} onClick={() => toggleDevice(i)}>
                {d.connected ? "Connected" : "Disconnected"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Today's Vitals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vitals.map((v) => (
              <div key={v.label} className="text-center p-3 border rounded-lg">
                <div className="text-2xl mb-1">{v.icon}</div>
                <div className="font-bold">{v.value}</div>
                <div className="text-xs text-muted-foreground">{v.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ayurvedic Interpretation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {interpretations.map((item) => (
            <div key={item.vital} className="border-b pb-2 last:border-0">
              <p className="text-sm font-medium">{item.vital}</p>
              <p className="text-sm text-muted-foreground">{item.insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => toast.success("Vitals synced successfully!")} className="w-full" size="lg">
        Sync All Devices
      </Button>
    </div>
  );
}
