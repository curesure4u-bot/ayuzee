import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Truck, Plus, Phone, MapPin, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAmbulance } from "@/hooks/useAmbulance";

const HmsAmbulance = () => {
  const { vehicles, trips, loading, error, available, onTrip, todayTrips, dispatchVehicle } = useAmbulance();
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [newPatient, setNewPatient] = useState("");
  const [newPickup, setNewPickup] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [newUrgency, setNewUrgency] = useState("emergency");

  const handleDispatch = async () => {
    if (!newPickup.trim() || !newVehicle) return toast.error("Pickup location and vehicle required");
    await dispatchVehicle(newVehicle, newPatient || "Emergency Call", newPickup, newUrgency);
    toast.success("Ambulance dispatched!");
    setDispatchOpen(false);
    setNewPatient(""); setNewPickup(""); setNewVehicle(""); setNewUrgency("emergency");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" /> Ambulance & EMS
          </h1>
          <p className="text-sm text-muted-foreground">Vehicle tracking, dispatch, trip history & emergency admission link</p>
        </div>
        <Button size="sm" onClick={() => setDispatchOpen(true)} className="bg-red-600 hover:bg-red-700">
          <Phone className="mr-1 h-4 w-4" /> Emergency Dispatch
        </Button>
      </div>

      {/* Vehicle Status */}
      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading fleet...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {vehicles.map((v) => (
          <Card key={v.id} className={v.status === "on_trip" ? "border-red-300 bg-red-50/20" : v.status === "maintenance" ? "border-amber-300 bg-amber-50/20" : "border-green-200 bg-green-50/20"}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs font-bold">{v.number}</p>
                <Badge variant={v.status === "on_trip" ? "destructive" : v.status === "available" ? "outline" : "secondary"} className={`text-[10px] capitalize ${v.status === "available" ? "text-green-600" : ""}`}>{v.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{v.type}</p>
              <p className="text-xs mt-1"><span className="font-medium">{v.driver}</span> · {v.driverPhone}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{v.currentLocation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats & Trips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{available}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{onTrip}</p><p className="text-xs text-muted-foreground">On Trip</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{todayTrips}</p><p className="text-xs text-muted-foreground">Trips Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">18 min</p><p className="text-xs text-muted-foreground">Avg Response</p></CardContent></Card>
      </div>

      {/* Trip Log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Trip Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                  <th className="px-3 py-2 text-left font-medium">Patient / Call</th>
                  <th className="px-3 py-2 text-left font-medium">Pickup</th>
                  <th className="px-3 py-2 text-left font-medium">Destination</th>
                  <th className="px-3 py-2 text-left font-medium">Dispatch</th>
                  <th className="px-3 py-2 text-left font-medium">Arrival</th>
                  <th className="px-3 py-2 text-left font-medium">Urgency</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{t.vehicle}</td>
                    <td className="px-3 py-2 font-medium text-xs">{t.patient}</td>
                    <td className="px-3 py-2 text-xs">{t.pickup}</td>
                    <td className="px-3 py-2 text-xs">{t.destination}</td>
                    <td className="px-3 py-2 text-xs">{t.dispatchTime}</td>
                    <td className="px-3 py-2 text-xs">{t.arrivalTime}</td>
                    <td className="px-3 py-2"><Badge variant={t.urgency === "Emergency" ? "destructive" : "secondary"} className="text-[10px]">{t.urgency}</Badge></td>
                    <td className="px-3 py-2"><Badge variant={t.status === "completed" ? "outline" : "default"} className={`text-xs capitalize ${t.status === "completed" ? "text-green-600" : ""}`}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">Emergency Dispatch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Caller / Patient Info</Label><Input placeholder="Name or call details" value={newPatient} onChange={(e) => setNewPatient(e.target.value)} /></div>
            <div><Label>Pickup Location *</Label><Input placeholder="Address / Landmark" value={newPickup} onChange={(e) => setNewPickup(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle *</Label>
                <Select value={newVehicle} onValueChange={setNewVehicle}><SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger>
                  <SelectContent>{vehicles.filter(v => v.status === "available").map(v => <SelectItem key={v.id} value={v.id}>{v.number} ({v.type})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Urgency</Label>
                <Select value={newUrgency} onValueChange={setNewUrgency}><SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="routine">Routine</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDispatch}>Dispatch Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsAmbulance;
