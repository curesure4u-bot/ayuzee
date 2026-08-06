import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package, Truck, CheckCircle, Clock, Brain, MapPin } from "lucide-react";

const orders = [
  { id: "ORD-4521", patient: "Rajesh Kumar", items: ["Rasnasaptakam 450ml x2", "Simhanada Guggulu 60t x1"], total: 735, status: "pending", date: "22 Jul 2026", address: "HSR Layout, Bangalore", type: "prescription" },
  { id: "ORD-4520", patient: "Meera Nair", items: ["Kottamchukkadi Taila 200ml x1", "Triphala Churna 100g x2"], total: 520, status: "packed", date: "22 Jul 2026", address: "Koramangala, Bangalore", type: "online" },
  { id: "ORD-4519", patient: "Suresh Menon", items: ["Ashwagandha Churna 100g x3"], total: 450, status: "shipped", date: "21 Jul 2026", address: "Indiranagar, Bangalore", type: "prescription" },
  { id: "ORD-4518", patient: "Priya Sharma", items: ["Dashamoolarishtam 450ml x1", "Chandraprabha Vati 60t x2"], total: 680, status: "delivered", date: "20 Jul 2026", address: "Whitefield, Bangalore", type: "online" },
  { id: "ORD-4517", patient: "Amit Patel", items: ["Mahanarayan Taila 200ml x2"], total: 390, status: "delivered", date: "20 Jul 2026", address: "JP Nagar, Bangalore", type: "online" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  packed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const OrderFulfillment = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);
  const pending = orders.filter(o => o.status === "pending").length;
  const packed = orders.filter(o => o.status === "packed").length;
  const shipped = orders.filter(o => o.status === "shipped").length;
  const delivered = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" /> Online Order Fulfillment
          </h1>
          <p className="text-muted-foreground mt-1">
            Pack → Ship → Deliver → Track — E-commerce & prescription delivery
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-xl font-bold mt-1 text-amber-600">{pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-xl font-bold mt-1 text-blue-600">{packed}</p>
            <p className="text-xs text-muted-foreground">Packed</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <Truck className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-xl font-bold mt-1 text-purple-600">{shipped}</p>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-xl font-bold mt-1 text-green-600">{delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending})</TabsTrigger>
          <TabsTrigger value="packed">Packed ({packed})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({delivered})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filtered.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card key={order.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`h-5 w-5 mt-0.5 ${
                        order.status === "pending" ? "text-amber-600" :
                        order.status === "packed" ? "text-blue-600" :
                        order.status === "shipped" ? "text-purple-600" : "text-green-600"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{order.id}</p>
                          <Badge variant="outline" className="text-[10px]">{order.type}</Badge>
                          <Badge className={`text-[10px] ${statusColors[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{order.patient} • {order.date}</p>
                        <p className="text-xs mt-1">{order.items.join(", ")}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {order.address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total}</p>
                      <div className="flex gap-1 mt-2">
                        {order.status === "pending" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${order.id} marked as packed`)}>
                            Pack Now
                          </Button>
                        )}
                        {order.status === "packed" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${order.id} shipped`)}>
                            Ship
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${order.id} delivered`)}>
                            Mark Delivered
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Fulfillment Optimizer</p>
            <p className="text-sm text-purple-700">
              ORD-4521 (Rajesh Kumar) — prescription order contains temperature-sensitive kashayam.
              AI recommends: Use insulated packaging + same-day delivery (HSR Layout is 4km from branch).
              Auto-deduct from dispensing stock, update e-commerce inventory sync.
              Estimated delivery: 2 hours if dispatched now.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderFulfillment;
