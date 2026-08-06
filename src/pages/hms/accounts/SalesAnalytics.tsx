import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart, Pill, ReceiptText, QrCode, Repeat, TrendingUp,
  Search, Download, Users, Calendar, ArrowUpRight, Brain, Sparkles,
  ScanLine, Phone, RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#f97316", "#10b981", "#6366f1", "#ec4899", "#eab308"];

const otcSalesData = [
  { date: "Jul 16", amount: 8500, bills: 18 },
  { date: "Jul 17", amount: 9200, bills: 22 },
  { date: "Jul 18", amount: 7800, bills: 15 },
  { date: "Jul 19", amount: 11200, bills: 28 },
  { date: "Jul 20", amount: 10500, bills: 24 },
  { date: "Jul 21", amount: 12800, bills: 30 },
  { date: "Jul 22", amount: 8700, bills: 20 },
];

const prescriptionSalesData = [
  { date: "Jul 16", amount: 12500, bills: 8 },
  { date: "Jul 17", amount: 15200, bills: 10 },
  { date: "Jul 18", amount: 11800, bills: 7 },
  { date: "Jul 19", amount: 18200, bills: 12 },
  { date: "Jul 20", amount: 14500, bills: 9 },
  { date: "Jul 21", amount: 16800, bills: 11 },
  { date: "Jul 22", amount: 13700, bills: 8 },
];

const topOtcProducts = [
  { name: "Chyawanprash (500g)", qty: 45, revenue: 33750, category: "Health Supplement" },
  { name: "Triphala Churna", qty: 38, revenue: 7600, category: "Digestive" },
  { name: "Ashwagandha Capsules", qty: 32, revenue: 12800, category: "Immunity" },
  { name: "Kumkumadi Oil (30ml)", qty: 28, revenue: 19600, category: "Skin Care" },
  { name: "Dhanwantharam Oil", qty: 25, revenue: 8750, category: "Pain Relief" },
  { name: "Giloy Tablets", qty: 22, revenue: 5500, category: "Immunity" },
  { name: "Brahmi Ghritam", qty: 18, revenue: 9000, category: "Brain Health" },
  { name: "Mahanarayan Oil", qty: 16, revenue: 6400, category: "Joint Care" },
];

const repeatedSalesData = [
  { patient: "Rajesh Kumar", phone: "98xxx12345", lastPurchase: "Jul 15", product: "Triphala + Ashwagandha", visits: 8, totalSpent: 12500, nextDue: "Aug 12" },
  { patient: "Sunita Devi", phone: "97xxx45678", lastPurchase: "Jul 18", product: "Kumkumadi Oil", visits: 5, totalSpent: 8400, nextDue: "Aug 15" },
  { patient: "Mohammed Ali", phone: "90xxx11223", lastPurchase: "Jul 10", product: "Dhanwantharam Oil", visits: 12, totalSpent: 24000, nextDue: "Aug 05" },
  { patient: "Lakshmi Narayan", phone: "94xxx33445", lastPurchase: "Jul 20", product: "Brahmi + Giloy", visits: 6, totalSpent: 9800, nextDue: "Aug 18" },
  { patient: "Anand Sharma", phone: "91xxx55667", lastPurchase: "Jul 12", product: "Mahanarayan Oil + Capsules", visits: 15, totalSpent: 35000, nextDue: "Aug 08" },
];

const qrCodeIntegrations = [
  { type: "Payment QR", description: "Patient scans to pay instantly via UPI", usage: 145, revenue: 185000 },
  { type: "Prescription QR", description: "Links to digital prescription for repeat orders", usage: 89, revenue: 95000 },
  { type: "Product Info QR", description: "Scan product for usage instructions & reorder", usage: 234, revenue: 0 },
  { type: "Follow-up QR", description: "Patient scans for booking follow-up appointment", usage: 67, revenue: 45000 },
  { type: "Feedback QR", description: "Quick feedback & review collection", usage: 112, revenue: 0 },
];

const salesCategories = [
  { name: "OTC (Walk-in)", value: 195000 },
  { name: "Prescription", value: 125000 },
  { name: "Repeated/Refill", value: 85000 },
  { name: "Online Order", value: 35000 },
  { name: "Camp Sales", value: 22000 },
];

const SalesAnalytics = () => {
  const [activeTab, setActiveTab] = useState("otc");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Sales Analytics & QR Integration
          </h2>
          <p className="text-sm text-muted-foreground">OTC, Prescription, Repeated Sales with AI-driven insights</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm"><QrCode className="mr-1 h-4 w-4" /> Generate QR</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <ShoppingCart className="h-4 w-4 text-orange-500" />
              <Badge className="bg-green-100 text-green-700 text-[10px]">+18%</Badge>
            </div>
            <p className="font-display text-lg font-bold">₹1,95,000</p>
            <p className="text-xs text-muted-foreground">OTC Sales (157 bills)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <Pill className="h-4 w-4 text-blue-500" />
              <Badge className="bg-green-100 text-green-700 text-[10px]">+12%</Badge>
            </div>
            <p className="font-display text-lg font-bold">₹1,25,000</p>
            <p className="text-xs text-muted-foreground">Prescription Sales (65 bills)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <Repeat className="h-4 w-4 text-purple-500" />
              <Badge className="bg-green-100 text-green-700 text-[10px]">+25%</Badge>
            </div>
            <p className="font-display text-lg font-bold">₹85,000</p>
            <p className="text-xs text-muted-foreground">Repeat Sales (42 patients)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <QrCode className="h-4 w-4 text-green-500" />
              <Badge className="bg-blue-100 text-blue-700 text-[10px]">Active</Badge>
            </div>
            <p className="font-display text-lg font-bold">647</p>
            <p className="text-xs text-muted-foreground">QR Scans This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <RefreshCw className="h-4 w-4 text-amber-500" />
              <Badge className="bg-amber-100 text-amber-700 text-[10px]">Due</Badge>
            </div>
            <p className="font-display text-lg font-bold">28</p>
            <p className="text-xs text-muted-foreground">Follow-ups Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="otc">OTC Sales</TabsTrigger>
          <TabsTrigger value="prescription">Prescription Sales</TabsTrigger>
          <TabsTrigger value="repeated">Repeated Sales</TabsTrigger>
          <TabsTrigger value="qr">QR Code Integration</TabsTrigger>
          <TabsTrigger value="followups">Sales Follow-ups</TabsTrigger>
        </TabsList>

        {/* OTC Sales Tab */}
        <TabsContent value="otc" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily OTC Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={otcSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={salesCategories} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                      {salesCategories.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top OTC Products */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Top Selling OTC Products</CardTitle>
                <Input className="w-48" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-right font-medium">Qty Sold</th>
                      <th className="px-4 py-2 text-right font-medium">Revenue</th>
                      <th className="px-4 py-2 text-center font-medium">QR Reorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOtcProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{p.name}</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                        <td className="px-4 py-2 text-right">{p.qty}</td>
                        <td className="px-4 py-2 text-right font-semibold">₹{p.revenue.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-center">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><QrCode className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Sales Tab */}
        <TabsContent value="prescription" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prescription-Based Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={prescriptionSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Rx Sales" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700">AI Prescription Intelligence</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• 12 prescriptions pending dispensing from today's OPD</li>
                    <li>• Average prescription value: ₹1,712 (↑8% from last week)</li>
                    <li>• 6 patients eligible for repeat prescription refill this week</li>
                    <li>• Suggested: Auto-generate QR for commonly prescribed combos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repeated Sales Tab */}
        <TabsContent value="repeated" className="space-y-4 mt-4">
          <Card className="border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-700">Repeat Sales AI Insights</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    42 patients have active refill schedules. QR-based reorder enabled for top 20 products.
                    Estimated monthly recurring revenue from repeats: ₹1,25,000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Repeat Purchase Patients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Patient</th>
                      <th className="px-4 py-2 text-left font-medium">Products</th>
                      <th className="px-4 py-2 text-center font-medium">Visits</th>
                      <th className="px-4 py-2 text-right font-medium">Total Spent</th>
                      <th className="px-4 py-2 text-left font-medium">Next Refill Due</th>
                      <th className="px-4 py-2 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedSalesData.map((r, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <p className="font-medium">{r.patient}</p>
                          <p className="text-xs text-muted-foreground">{r.phone}</p>
                        </td>
                        <td className="px-4 py-2 text-xs">{r.product}</td>
                        <td className="px-4 py-2 text-center">
                          <Badge variant="outline">{r.visits}</Badge>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">₹{r.totalSpent.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2">
                          <Badge className={new Date(r.nextDue + " 2026") < new Date() ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                            {r.nextDue}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Send QR Reorder Link">
                              <QrCode className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="WhatsApp Reminder">
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Integration Tab */}
        <TabsContent value="qr" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {qrCodeIntegrations.map((qr, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{qr.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">{qr.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">{qr.usage} scans</Badge>
                        {qr.revenue > 0 && (
                          <span className="text-xs font-semibold text-green-600">₹{qr.revenue.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-sm">Generate New QR Code</p>
                <Button size="sm"><QrCode className="mr-1 h-4 w-4" /> Create</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select>
                  <SelectTrigger><SelectValue placeholder="QR Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment QR</SelectItem>
                    <SelectItem value="prescription">Prescription Refill QR</SelectItem>
                    <SelectItem value="product">Product Reorder QR</SelectItem>
                    <SelectItem value="followup">Follow-up Booking QR</SelectItem>
                    <SelectItem value="feedback">Feedback QR</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Patient/Product Name" />
                <Input placeholder="Amount (optional)" type="number" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Follow-ups Tab */}
        <TabsContent value="followups" className="space-y-4 mt-4">
          <Card className="border-amber-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">AI Follow-up Scheduler</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    28 patients need follow-up reminders. AI has auto-scheduled WhatsApp messages with personalized QR codes 
                    for easy reorder. Estimated conversion: 65% (based on past data).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {repeatedSalesData.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{r.patient}</p>
                    <p className="text-xs text-muted-foreground">Last: {r.lastPurchase} · {r.product}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700">Refill due: {r.nextDue}</Badge>
                    <Button size="sm" variant="outline"><Phone className="mr-1 h-3.5 w-3.5" /> Remind</Button>
                    <Button size="sm"><QrCode className="mr-1 h-3.5 w-3.5" /> QR Link</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
