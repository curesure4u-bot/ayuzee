import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, MapPin, Users, IndianRupee, TrendingUp, TrendingDown,
  Video, Activity, Star, BarChart3, Globe, Wifi, WifiOff,
  CheckCircle, AlertTriangle,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  type: "own" | "linked" | "franchisee";
  location: string;
  status: "online" | "offline";
  doctors: number;
  patientsToday: number;
  revenue: number;
  rating: number;
  occupancy: number;
};

type VideoConsult = {
  id: string;
  patient: string;
  doctor: string;
  branch: string;
  scheduledAt: string;
  status: "waiting" | "active" | "completed";
};

const mockBranches: Branch[] = [
  { id: "1", name: "Ayuzee Main Hospital", type: "own", location: "Trivandrum, Kerala", status: "online", doctors: 5, patientsToday: 85, revenue: 185000, rating: 4.8, occupancy: 78 },
  { id: "2", name: "Ayuzee City Center", type: "own", location: "Kochi, Kerala", status: "online", doctors: 3, patientsToday: 52, revenue: 92000, rating: 4.6, occupancy: 65 },
  { id: "3", name: "Ayuzee Wellness Hub", type: "franchisee", location: "Calicut, Kerala", status: "online", doctors: 2, patientsToday: 28, revenue: 45000, rating: 4.5, occupancy: 50 },
  { id: "4", name: "Dharma Ayurveda Clinic", type: "linked", location: "Chennai, Tamil Nadu", status: "online", doctors: 2, patientsToday: 35, revenue: 62000, rating: 4.7, occupancy: 55 },
  { id: "5", name: "Ayuzee Panchakarma Center", type: "own", location: "Thrissur, Kerala", status: "online", doctors: 2, patientsToday: 18, revenue: 125000, rating: 4.9, occupancy: 90 },
  { id: "6", name: "Veda Life Clinic", type: "franchisee", location: "Bangalore, Karnataka", status: "offline", doctors: 1, patientsToday: 0, revenue: 0, rating: 4.3, occupancy: 0 },
  { id: "7", name: "Ayuzee Suburban Clinic", type: "own", location: "Ernakulam, Kerala", status: "online", doctors: 1, patientsToday: 22, revenue: 38000, rating: 4.4, occupancy: 40 },
];

const mockConsults: VideoConsult[] = [
  { id: "1", patient: "Ramesh Kumar", doctor: "Dr. Arun Sharma", branch: "Main Hospital", scheduledAt: "11:00 AM", status: "active" },
  { id: "2", patient: "Priya Menon", doctor: "Dr. Meena Patel", branch: "City Center", scheduledAt: "11:30 AM", status: "waiting" },
  { id: "3", patient: "Suresh (Dubai)", doctor: "Dr. Arun Sharma", branch: "Teleconsult", scheduledAt: "12:00 PM", status: "waiting" },
];

const HmsCommandCenter = () => {
  const [branches] = useState<Branch[]>(mockBranches);
  const [filterType, setFilterType] = useState("all");

  const totalRevenue = branches.reduce((s, b) => s + b.revenue, 0);
  const totalPatients = branches.reduce((s, b) => s + b.patientsToday, 0);
  const totalDoctors = branches.reduce((s, b) => s + b.doctors, 0);
  const onlineBranches = branches.filter((b) => b.status === "online").length;

  const filtered = branches.filter((b) => filterType === "all" || b.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" /> Clinic Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-location management · Own hospitals + Linked clinics + Franchisees
          </p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="own">Own Hospitals</SelectItem>
            <SelectItem value="linked">Linked Clinics</SelectItem>
            <SelectItem value="franchisee">Franchisees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Building2 className="h-5 w-5 mx-auto text-indigo-600" /><p className="text-xl font-bold mt-1">{onlineBranches}/{branches.length}</p><p className="text-xs text-muted-foreground">Online</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalPatients}</p><p className="text-xs text-muted-foreground">Patients Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{(totalRevenue / 100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Revenue Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{totalDoctors}</p><p className="text-xs text-muted-foreground">Doctors Active</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Video className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{mockConsults.filter(c => c.status === "active").length}</p><p className="text-xs text-muted-foreground">Live Consults</p></CardContent></Card>
      </div>

      <Tabs defaultValue="branches">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="branches">All Locations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="video">Video Consults</TabsTrigger>
          <TabsTrigger value="gmb">Google Business</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((branch) => (
              <Card key={branch.id} className={`${branch.status === "offline" ? "opacity-60" : ""} hover:shadow-md transition`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{branch.name}</p>
                        {branch.status === "online" ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{branch.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{branch.type}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-sm font-bold">{branch.patientsToday}</p><p className="text-[10px] text-muted-foreground">Patients</p></div>
                    <div><p className="text-sm font-bold">{branch.doctors}</p><p className="text-[10px] text-muted-foreground">Doctors</p></div>
                    <div><p className="text-sm font-bold">₹{(branch.revenue / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Revenue</p></div>
                    <div><p className="text-sm font-bold flex items-center justify-center gap-0.5"><Star className="h-3 w-3 text-amber-500" />{branch.rating}</p><p className="text-[10px] text-muted-foreground">Rating</p></div>
                  </div>
                  {branch.occupancy > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Occupancy</span><span>{branch.occupancy}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${branch.occupancy > 80 ? "bg-red-500" : branch.occupancy > 60 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${branch.occupancy}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Branch Performance Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Branch</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">OP/Day</th>
                      <th className="px-3 py-2 text-left font-medium">Revenue</th>
                      <th className="px-3 py-2 text-left font-medium">Collection %</th>
                      <th className="px-3 py-2 text-left font-medium">Rating</th>
                      <th className="px-3 py-2 text-left font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.filter(b => b.status === "online").map((b) => (
                      <tr key={b.id} className="border-b">
                        <td className="px-3 py-2 font-medium">{b.name}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{b.type}</Badge></td>
                        <td className="px-3 py-2">{b.patientsToday}</td>
                        <td className="px-3 py-2">₹{(b.revenue / 1000).toFixed(0)}K</td>
                        <td className="px-3 py-2">{85 + Math.floor(Math.random() * 10)}%</td>
                        <td className="px-3 py-2"><Star className="inline h-3 w-3 text-amber-500" /> {b.rating}</td>
                        <td className="px-3 py-2">
                          {b.revenue > 80000 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4 text-red-600" /> Video Consultations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConsults.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{c.patient}</p>
                      <p className="text-xs text-muted-foreground">{c.doctor} · {c.branch} · {c.scheduledAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === "active" ? "default" : c.status === "waiting" ? "secondary" : "outline"} className="text-xs capitalize">
                        {c.status === "active" && <span className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse inline-block" />}
                        {c.status}
                      </Badge>
                      {c.status === "waiting" && (
                        <Button size="sm" onClick={() => toast.info("Launching video consult...")}>
                          <Video className="mr-1 h-3 w-3" /> Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => toast.info("Starting instant video consultation...")}>
                <Video className="mr-1 h-4 w-4" /> Start Instant Video Consult
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmb" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Google My Business Analytics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Clinic Reach (Last 30 days)</p>
                  {[
                    { metric: "Profile Views", value: "12,450", trend: "+18%" },
                    { metric: "Direction Requests", value: "890", trend: "+12%" },
                    { metric: "Phone Calls", value: "345", trend: "+8%" },
                    { metric: "Website Visits", value: "2,100", trend: "+25%" },
                    { metric: "Booking Clicks", value: "156", trend: "+32%" },
                  ].map((m) => (
                    <div key={m.metric} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{m.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{m.value}</span>
                        <span className="text-xs text-green-600">{m.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Google Reviews Summary</p>
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                    <p className="text-3xl font-bold text-amber-700">4.7</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= 4 ? "text-amber-500 fill-amber-500" : "text-amber-300"}`} />)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Based on 342 reviews</p>
                  </div>
                  <div className="space-y-1">
                    {[
                      { stars: 5, count: 215, pct: 63 },
                      { stars: 4, count: 87, pct: 25 },
                      { stars: 3, count: 25, pct: 7 },
                      { stars: 2, count: 10, pct: 3 },
                      { stars: 1, count: 5, pct: 2 },
                    ].map((r) => (
                      <div key={r.stars} className="flex items-center gap-2 text-xs">
                        <span className="w-4">{r.stars}★</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                      </div>
                    ))}
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

export default HmsCommandCenter;
