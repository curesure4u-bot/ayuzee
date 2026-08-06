import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Star, Users, IndianRupee, Zap } from "lucide-react";

const plans = [
  { name: "Basic", price: 999, period: "/mo", color: "border-blue-200", badge: "", features: ["Daily Logger access", "AI diet suggestions (Prakriti-based)", "Monthly wellness report", "WhatsApp reminders", "Seasonal Ritucharya updates"], subscribers: 45 },
  { name: "Pro", price: 2999, period: "/mo", color: "border-purple-200", badge: "Popular", features: ["Everything in Basic +", "Weekly AI Health Coach call", "Priority appointments", "Lab test 15% discount", "Quarterly Nadi assessment", "Yoga prescription (AI)", "Community challenges access"], subscribers: 28 },
  { name: "Premium", price: 5999, period: "/mo", color: "border-amber-200", badge: "Best Value", features: ["Everything in Pro +", "Monthly Panchakarma session", "Personal dietitian consultation", "Unlimited teleconsult", "Home sample collection free", "Annual full-body checkup", "Dravya-Guna personalized herbs", "Genomic profile analysis (1x)"], subscribers: 12 },
];

const activeSubscribers = [
  { name: "Mr. Rajesh Kumar", plan: "Pro", startDate: "2026-05-01", renewal: "2026-08-01", status: "Active" },
  { name: "Mrs. Lakshmi Devi", plan: "Premium", startDate: "2026-03-15", renewal: "2026-07-15", status: "Renewal Due" },
  { name: "Mr. Suresh Babu", plan: "Basic", startDate: "2026-06-10", renewal: "2026-09-10", status: "Active" },
  { name: "Mrs. Priya Sharma", plan: "Pro", startDate: "2026-04-01", renewal: "2026-07-01", status: "Expired" },
];

const SubscriptionPlans = () => {
  const totalRevenue = plans.reduce((s, p) => s + (p.subscribers * p.price), 0);
  const totalSubs = plans.reduce((s, p) => s + p.subscribers, 0);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6" /> Wellness Subscription Plans</h1>
        <Button size="sm" onClick={() => toast.success("New subscription created")}><Zap className="h-4 w-4 mr-1" /> Subscribe Patient</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{totalSubs}</p><p className="text-[10px] text-muted-foreground">Active Subscribers</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(totalRevenue/1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Monthly Revenue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{plans[1].subscribers}</p><p className="text-[10px] text-muted-foreground">Pro (Most Popular)</p></CardContent></Card>
      </div>
      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`${plan.color} relative`}>
            {plan.badge && <Badge className="absolute -top-2 right-3 bg-purple-600 text-white text-[10px]">{plan.badge}</Badge>}
            <CardHeader className="pb-2"><CardTitle className="text-lg">{plan.name}</CardTitle><p className="text-2xl font-bold">₹{plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p></CardHeader>
            <CardContent className="space-y-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" /><span>{f}</span></div>
              ))}
              <p className="text-[10px] text-muted-foreground pt-2 border-t">{plan.subscribers} active subscribers</p>
              <Button className="w-full mt-2" size="sm" onClick={() => toast.success(`${plan.name} plan selected`)}>Subscribe</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Active Subscribers Table */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Subscribers</CardTitle></CardHeader>
        <CardContent><table className="w-full text-xs"><thead className="border-b"><tr><th className="text-left py-2">Patient</th><th className="text-left py-2">Plan</th><th className="text-left py-2">Start</th><th className="text-left py-2">Renewal</th><th className="text-center py-2">Status</th></tr></thead>
          <tbody>{activeSubscribers.map((s, i) => (
            <tr key={i} className="border-b"><td className="py-2 font-medium">{s.name}</td><td className="py-2"><Badge variant="outline" className="text-[9px]">{s.plan}</Badge></td><td className="py-2 text-muted-foreground">{s.startDate}</td><td className="py-2 text-muted-foreground">{s.renewal}</td><td className="py-2 text-center"><Badge className={`text-[9px] ${s.status === "Active" ? "bg-green-100 text-green-700" : s.status === "Renewal Due" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{s.status}</Badge></td></tr>
          ))}</tbody></table></CardContent>
      </Card>
    </div>
  );
};
export default SubscriptionPlans;
