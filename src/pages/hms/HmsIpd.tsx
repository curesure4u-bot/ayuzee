import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BedDouble, Plus, Users, Heart, Leaf, Warehouse, Package, Loader2 } from "lucide-react";
import { useIpd } from "@/hooks/useIpd";

const HmsIpd = () => {
  const [tab, setTab] = useState("wards");
  const { wards, admissions, totalBeds, totalOccupied, loading, error } = useIpd();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">IPD & Ward Management</h1>
          <p className="text-sm text-muted-foreground">
            {totalOccupied}/{totalBeds} beds occupied ({Math.round((totalOccupied / totalBeds) * 100)}% occupancy)
          </p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Admission</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading IPD data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="flex gap-2 flex-wrap">
        <Button asChild size="sm" variant="outline"><Link to="/hms/nursing"><Heart className="mr-1 h-3 w-3" /> Nursing Station</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/hms/diet-kitchen"><Leaf className="mr-1 h-3 w-3" /> Diet & Kitchen</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/hms/ward-store"><Warehouse className="mr-1 h-3 w-3" /> Ward Consumables</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/hms/cssd-linen"><Package className="mr-1 h-3 w-3" /> CSSD & Linen</Link></Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="wards">Ward Status</TabsTrigger>
          <TabsTrigger value="admissions">Active Admissions ({admissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="wards" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wards.map((ward) => {
              const pct = ward.beds > 0 ? Math.round((ward.occupied / ward.beds) * 100) : 0;
              return (
                <Card key={ward.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{ward.name}</h3>
                      <Badge variant={pct > 80 ? "destructive" : pct > 50 ? "secondary" : "outline"}>
                        {pct}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <BedDouble className="h-4 w-4" />
                      <span>{ward.occupied}/{ward.beds} beds</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {ward.chargePerDay > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">₹{ward.chargePerDay}/day</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="admissions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Patient</th>
                      <th className="px-4 py-3 text-left font-medium">Ward / Bed</th>
                      <th className="px-4 py-3 text-left font-medium">Doctor</th>
                      <th className="px-4 py-3 text-left font-medium">Admitted</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{a.patient}</td>
                        <td className="px-4 py-3">{a.ward} · {a.bed}</td>
                        <td className="px-4 py-3">{a.doctor}</td>
                        <td className="px-4 py-3">{a.admitDate}</td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            a.status === "critical" ? "destructive" :
                            a.status === "discharge_pending" ? "secondary" : "default"
                          }>
                            {a.status === "discharge_pending" ? "Discharge Pending" : a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {admissions.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No active admissions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsIpd;
