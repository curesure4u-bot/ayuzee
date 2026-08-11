import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Subscription {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  nextDelivery: string;
  status: "active" | "paused";
}

export default function SubscriptionRefill() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("");
  const [duration, setDuration] = useState("");
  const [address, setAddress] = useState("");

  const handleSubscribe = () => {
    if (!medicine || !dosage || !frequency || !duration || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newSub: Subscription = {
      id: Date.now().toString(),
      medicine,
      dosage,
      frequency,
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "active",
    };

    setSubscriptions([...subscriptions, newSub]);
    toast.success(`Subscription created for ${medicine}`);
    setMedicine("");
    setDosage("");
    setFrequency("");
    setDeliveryDay("");
    setDuration("");
    setAddress("");
  };

  const toggleStatus = (id: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === id
          ? { ...sub, status: sub.status === "active" ? "paused" : "active" }
          : sub
      )
    );
    toast("Subscription status updated");
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    toast("Subscription cancelled");
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const datesOfMonth = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Subscription & Refill</h1>
            {activeCount > 0 && (
              <Badge className="bg-green-600">{activeCount} Active</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Never run out of your daily medicines — auto-refill delivered to your door
          </p>
        </div>
      </div>

      {/* My Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>My Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active subscriptions yet. Create one below to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.medicine}</TableCell>
                    <TableCell>{sub.dosage}</TableCell>
                    <TableCell>{sub.frequency}</TableCell>
                    <TableCell>{sub.nextDelivery}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.status === "active" ? "default" : "secondary"}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(sub.id)}
                      >
                        {sub.status === "active" ? "Pause" : "Resume"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelSubscription(sub.id)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Create Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Medicine Name</label>
              <Input
                placeholder="e.g., Triphala Churna"
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dosage</label>
              <Input
                placeholder="e.g., 5g twice daily"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Day</label>
              <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery day" />
                </SelectTrigger>
                <SelectContent>
                  {(frequency === "Monthly"
                    ? datesOfMonth.map((d) => ({ label: `${d}`, value: `${d}` }))
                    : daysOfWeek.map((d) => ({ label: d, value: d }))
                  ).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Address</label>
              <Input
                placeholder="Your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSubscribe} className="w-full md:w-auto">
            Subscribe
          </Button>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">15% OFF</p>
            <p className="text-sm text-muted-foreground mt-1">Save 15% on subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-blue-600">FREE</p>
            <p className="text-sm text-muted-foreground mt-1">Free delivery on monthly plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-orange-600">FLEXIBLE</p>
            <p className="text-sm text-muted-foreground mt-1">Pause or cancel anytime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
