import { useState } from "react";
import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const steps = [
  "Order Placed",
  "Processing",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

interface TrackingResult {
  orderId: string;
  status: string;
  currentStep: number;
  estimatedDelivery: string;
  courier: string;
  coldChain: boolean;
}

const sampleOrders = [
  {
    orderId: "AYZ-20240115-001",
    status: "in_transit",
    currentStep: 3,
    estimatedDelivery: "Jan 18, 2025",
    courier: "Ayuzee Express",
    coldChain: true,
  },
  {
    orderId: "AYZ-20240113-042",
    status: "delivered",
    currentStep: 5,
    estimatedDelivery: "Jan 15, 2025",
    courier: "Delhivery",
    coldChain: false,
  },
  {
    orderId: "AYZ-20240116-007",
    status: "processing",
    currentStep: 1,
    estimatedDelivery: "Jan 20, 2025",
    courier: "Ayuzee Express",
    coldChain: true,
  },
];

const statusColors: Record<string, string> = {
  placed: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

export default function LogisticsTracking() {
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);

  const handleTrack = () => {
    if (!trackingId.trim()) {
      toast.error("Please enter an Order ID");
      return;
    }

    const found = sampleOrders.find(
      (o) => o.orderId.toLowerCase() === trackingId.toLowerCase()
    );

    if (found) {
      setTrackingResult(found);
    } else {
      // Show demo data for any entered ID
      setTrackingResult({
        orderId: trackingId,
        status: "in_transit",
        currentStep: 3,
        estimatedDelivery: "Jan 22, 2025",
        courier: "Ayuzee Express",
        coldChain: true,
      });
    }
    toast.success("Tracking information loaded");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Order & Logistics Tracking</h1>
          <p className="text-muted-foreground">
            Track your AYUSH medicine deliveries — cold-chain guaranteed
          </p>
        </div>
      </div>

      {/* Track Order */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter Order ID (e.g., AYZ-20240115-001)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTrack}>Track</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Result */}
      {trackingResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Order: {trackingResult.orderId}</CardTitle>
              <div className="flex gap-2">
                <Badge className={statusColors[trackingResult.status] || "bg-gray-100"}>
                  {trackingResult.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {trackingResult.coldChain && (
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Cold-chain maintained ❄️
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline Stepper */}
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, idx) => (
                <div key={step} className="flex flex-col items-center min-w-[100px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= trackingResult.currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center ${
                      idx <= trackingResult.currentStep
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </p>
                  {idx < steps.length - 1 && (
                    <div
                      className={`hidden sm:block absolute h-0.5 w-full ${
                        idx < trackingResult.currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">{trackingResult.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Courier Partner</p>
                <p className="font-medium">{trackingResult.courier}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Status</p>
                <p className="font-medium capitalize">
                  {trackingResult.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleOrders.map((order) => (
            <div
              key={order.orderId}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{order.orderId}</p>
                <p className="text-sm text-muted-foreground">
                  Est. delivery: {order.estimatedDelivery}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[order.status] || "bg-gray-100"}>
                  {order.status.replace(/_/g, " ")}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTrackingId(order.orderId);
                    setTrackingResult(order);
                  }}
                >
                  Track
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl">🌡️</p>
            <p className="font-semibold mt-2">Temperature-controlled storage</p>
            <p className="text-sm text-muted-foreground">
              All medicines stored at optimal temperatures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl">🇮🇳</p>
            <p className="font-semibold mt-2">Pan-India delivery (28 states)</p>
            <p className="text-sm text-muted-foreground">
              Reach every corner of the country
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl">⚡</p>
            <p className="font-semibold mt-2">Same-day delivery in select cities</p>
            <p className="text-sm text-muted-foreground">
              Available in metros and Tier-1 cities
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
