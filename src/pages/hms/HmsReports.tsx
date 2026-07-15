import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, Download, TrendingUp, TrendingDown, Users, IndianRupee,
  Activity, BedDouble, Pill, FlaskConical, Sparkles, Leaf, Heart,
} from "lucide-react";

const HmsReports = () => {
  const [period, setPeriod] = useState("this_month");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" /> Analytics & MIS Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Hospital performance, clinical outcomes, revenue & operational analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard icon={<Users className="h-4 w-4 text-blue-600" />} label="OP Visits" value="342" trend={12} />
        <MetricCard icon={<BedDouble className="h-4 w-4 text-purple-600" />} label="IP Occupancy" value="78%" trend={5} />
        <MetricCard icon={<IndianRupee className="h-4 w-4 text-green-600" />} label="Revenue" value="₹18.5L" trend={8} />
        <MetricCard icon={<Sparkles className="h-4 w-4 text-amber-600" />} label="Panchakarma" value="89 sessions" trend={15} />
        <MetricCard icon={<Pill className="h-4 w-4 text-emerald-600" />} label="Pharmacy Sales" value="₹4.2L" trend={-3} />
        <MetricCard icon={<Heart className="h-4 w-4 text-pink-600" />} label="Patient Satisfaction" value="4.6/5" trend={2} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Outcomes</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="disease">Disease Trends</TabsTrigger>
          <TabsTrigger value="branch">Branch Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">OPD Growth (Monthly)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { month: "Jan", value: 245, max: 400 },
                    { month: "Feb", value: 268, max: 400 },
                    { month: "Mar", value: 290, max: 400 },
                    { month: "Apr", value: 310, max: 400 },
                    { month: "May", value: 285, max: 400 },
                    { month: "Jun", value: 320, max: 400 },
                    { month: "Jul", value: 342, max: 400 },
                  ].map((d) => (
                    <div key={d.month} className="flex items-center gap-3">
                      <span className="text-xs w-8 text-muted-foreground">{d.month}</span>
                      <div className="flex-1 bg-muted rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2" style={{ width: `${(d.value / d.max) * 100}%` }}>
                          <span className="text-[10px] text-white font-medium">{d.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Department-wise Patient Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { dept: "Ayurveda General", count: 145, color: "bg-green-500" },
                    { dept: "Panchakarma", count: 89, color: "bg-amber-500" },
                    { dept: "Homeopathy", count: 45, color: "bg-pink-500" },
                    { dept: "Siddha", count: 28, color: "bg-teal-500" },
                    { dept: "Yoga & Naturopathy", count: 22, color: "bg-orange-500" },
                    { dept: "Unani", count: 13, color: "bg-indigo-500" },
                  ].map((d) => (
                    <div key={d.dept} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${d.color}`} />
                        <span className="text-sm">{d.dept}</span>
                      </div>
                      <span className="text-sm font-medium">{d.count} patients</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Doctor Productivity</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Doctor</th>
                      <th className="px-3 py-2 text-left font-medium">Department</th>
                      <th className="px-3 py-2 text-left font-medium">OP Seen</th>
                      <th className="px-3 py-2 text-left font-medium">IP Managed</th>
                      <th className="px-3 py-2 text-left font-medium">Revenue</th>
                      <th className="px-3 py-2 text-left font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Dr. Arun Sharma</td><td className="px-3 py-2">Ayurveda</td><td className="px-3 py-2">145</td><td className="px-3 py-2">8</td><td className="px-3 py-2">₹5.2L</td><td className="px-3 py-2">4.8/5</td></tr>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Dr. Meena Patel</td><td className="px-3 py-2">Panchakarma</td><td className="px-3 py-2">89</td><td className="px-3 py-2">12</td><td className="px-3 py-2">₹8.5L</td><td className="px-3 py-2">4.7/5</td></tr>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Dr. Nair</td><td className="px-3 py-2">Orthopedics</td><td className="px-3 py-2">78</td><td className="px-3 py-2">5</td><td className="px-3 py-2">₹3.8L</td><td className="px-3 py-2">4.6/5</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Panchakarma Outcome Tracking</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { condition: "Sandhivata (OA Knee)", patients: 28, improved: 24, rate: 86 },
                    { condition: "Gridhrasi (Sciatica)", patients: 15, improved: 12, rate: 80 },
                    { condition: "Pakshaghata (Stroke Rehab)", patients: 8, improved: 5, rate: 63 },
                    { condition: "Amavata (RA)", patients: 12, improved: 9, rate: 75 },
                    { condition: "Obesity (Sthoulya)", patients: 18, improved: 14, rate: 78 },
                  ].map((c) => (
                    <div key={c.condition} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="text-sm font-medium">{c.condition}</p>
                        <p className="text-xs text-muted-foreground">{c.patients} patients treated</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{c.rate}%</p>
                        <p className="text-xs text-muted-foreground">improvement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Patient Retention & Repeat Visits</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-700">68%</p>
                      <p className="text-xs text-blue-600">Return Rate</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                      <p className="text-2xl font-bold text-green-700">4.6</p>
                      <p className="text-xs text-green-600">Avg. Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top reasons for return visits:</p>
                    <div className="space-y-1">
                      {["Follow-up Panchakarma (32%)", "Chronic condition management (28%)", "Seasonal detox (18%)", "Preventive care (12%)", "Referral from others (10%)"].map((r) => (
                        <p key={r} className="text-xs text-muted-foreground">• {r}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { source: "Consultation Fees", amount: 285000, pct: 15 },
                    { source: "Panchakarma Packages", amount: 850000, pct: 46 },
                    { source: "Pharmacy Sales", amount: 420000, pct: 23 },
                    { source: "Lab & Diagnostics", amount: 125000, pct: 7 },
                    { source: "IP Charges", amount: 170000, pct: 9 },
                  ].map((r) => (
                    <div key={r.source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{r.source}</span>
                        <span className="font-medium">₹{(r.amount/1000).toFixed(0)}K ({r.pct}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${r.pct * 2}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Collection & Pending</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                      <p className="text-xl font-bold text-green-700">₹16.8L</p>
                      <p className="text-xs text-green-600">Collected</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                      <p className="text-xl font-bold text-red-700">₹1.7L</p>
                      <p className="text-xs text-red-600">Pending</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Payment Modes</p>
                    <div className="space-y-1 text-xs">
                      {[{ mode: "UPI/QR", pct: 42 }, { mode: "Cash", pct: 28 }, { mode: "Card", pct: 15 }, { mode: "Insurance", pct: 12 }, { mode: "Bank Transfer", pct: 3 }].map((p) => (
                        <div key={p.mode} className="flex justify-between">
                          <span>{p.mode}</span><span className="font-medium">{p.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="disease" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top Disease Presentations This Month</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">AYUSH Diagnosis</th>
                      <th className="px-3 py-2 text-left font-medium">Modern Correlation</th>
                      <th className="px-3 py-2 text-left font-medium">Cases</th>
                      <th className="px-3 py-2 text-left font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { ayush: "Sandhivata", modern: "Osteoarthritis", cases: 42, trend: "up" },
                      { ayush: "Gridhrasi", modern: "Sciatica / IVDP", cases: 28, trend: "up" },
                      { ayush: "Amavata", modern: "Rheumatoid Arthritis", cases: 18, trend: "stable" },
                      { ayush: "Pandu", modern: "Anaemia", cases: 15, trend: "down" },
                      { ayush: "Madhumeha", modern: "Diabetes Mellitus", cases: 14, trend: "up" },
                      { ayush: "Shwasa", modern: "Bronchial Asthma", cases: 12, trend: "stable" },
                      { ayush: "Kushtha", modern: "Psoriasis / Eczema", cases: 11, trend: "up" },
                      { ayush: "Unmada / Chittodvega", modern: "Anxiety / Depression", cases: 9, trend: "up" },
                      { ayush: "Sthoulya", modern: "Obesity", cases: 8, trend: "up" },
                      { ayush: "Arsha", modern: "Hemorrhoids", cases: 7, trend: "stable" },
                    ].map((d, i) => (
                      <tr key={d.ayush} className="border-b">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{d.ayush}</td>
                        <td className="px-3 py-2 text-muted-foreground">{d.modern}</td>
                        <td className="px-3 py-2 font-bold">{d.cases}</td>
                        <td className="px-3 py-2">
                          {d.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {d.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                          {d.trend === "stable" && <span className="text-xs text-muted-foreground">→</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Branch Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Branch</th>
                      <th className="px-3 py-2 text-left font-medium">OP</th>
                      <th className="px-3 py-2 text-left font-medium">IP</th>
                      <th className="px-3 py-2 text-left font-medium">Panchakarma</th>
                      <th className="px-3 py-2 text-left font-medium">Revenue</th>
                      <th className="px-3 py-2 text-left font-medium">Collection %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Main Branch</td><td className="px-3 py-2">342</td><td className="px-3 py-2">12</td><td className="px-3 py-2">89</td><td className="px-3 py-2">₹18.5L</td><td className="px-3 py-2 text-green-600 font-medium">91%</td></tr>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Branch 2 (City Center)</td><td className="px-3 py-2">185</td><td className="px-3 py-2">5</td><td className="px-3 py-2">42</td><td className="px-3 py-2">₹9.2L</td><td className="px-3 py-2 text-green-600 font-medium">88%</td></tr>
                    <tr className="border-b"><td className="px-3 py-2 font-medium">Branch 3 (Suburb)</td><td className="px-3 py-2">98</td><td className="px-3 py-2">0</td><td className="px-3 py-2">15</td><td className="px-3 py-2">₹3.8L</td><td className="px-3 py-2 text-amber-600 font-medium">82%</td></tr>
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

const MetricCard = ({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: number }) => (
  <Card>
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{value}</p>
        <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
    </CardContent>
  </Card>
);

export default HmsReports;
