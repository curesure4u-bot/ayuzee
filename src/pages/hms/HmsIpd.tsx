import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BedDouble, Plus, Users, AlertTriangle } from "lucide-react";

const WARDS = [
  { id: "general-male", name: "General Male", beds: 20, occupied: 12 },
  { id: "general-female", name: "General Female", beds: 20, occupied: 15 },
  { id: "private", name: "Private Rooms", beds: 10, occupied: 7 },
  { id: "icu", name: "ICU", beds: 6, occupied: 4 },
  { id: "pediatric", name: "Pediatric", beds: 8, occupied: 3 },
  { id: "maternity", name: "Maternity", beds: 10, occupied: 6 },
];

const ADMISSIONS = [
  { id: "1", patient: "Ravi Kumar", ward: "General Male", bed: "GM-04", admitDate: "2026-07-13", status: "active", doctor: "Dr. Sharma" },
  { id: "2", patient: "Priya Devi", ward: "Maternity", bed: "MT-02", admitDate: "2026-07-12", status: "active", doctor: "Dr. Meena" },
  { id: "3", patient: "Anand Singh", ward: "ICU", bed: "ICU-03", admitDate: "2026-07-14", status: "critical", doctor: "Dr. Patel" },
  { id: "4", patient: "Lakshmi R", ward: "Private Rooms", bed: "PVT-05", admitDate: "2026-07-10", status: "discharge_pending", doctor: "Dr. Reddy" },
];

const HmsIpd = () => {
  const [tab, setTab] = useState("wards");
  const totalBeds = WARDS.reduce((s, w) => s + w.beds, 0);
  const totalOccupied = WARDS.reduce((s, w) => s + w.occupied, 0);

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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="wards">Ward Status</TabsTrigger>
          <TabsTrigger value="admissions">Active Admissions</TabsTrigger>
        </TabsList>

        <TabsContent value="wards" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WARDS.map((ward) => {
              const pct = Math.round((ward.occupied / ward.beds) * 100);
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
                    {ADMISSIONS.map((a) => (
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
