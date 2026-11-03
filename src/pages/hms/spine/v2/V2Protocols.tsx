import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, IndianRupee } from "lucide-react";

const protocols = [
  { name: "Kati Basti (Lumbar)", duration: "7 days", sessions: 7, price: 8500, successRate: 87 },
  { name: "Greeva Basti (Cervical)", duration: "7 days", sessions: 7, price: 8500, successRate: 85 },
  { name: "Prishtha Basti (Full Spine)", duration: "14 days", sessions: 14, price: 16000, successRate: 82 },
  { name: "Tikta Ksheer Basti", duration: "16 days", sessions: 16, price: 12000, successRate: 80 },
  { name: "Agnikarma (Trigger Points)", duration: "3 sessions", sessions: 3, price: 4500, successRate: 78 },
];

const V2Protocols = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-orange-600" /> Treatment Protocols V2</h1>
          <p className="text-muted-foreground mt-1">Enhanced protocol builder with AI suggestions</p>
        </div>
        <Badge className="bg-orange-600">10 Protocols</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((p) => (
          <Card key={p.name} className="hover:border-orange-300 cursor-pointer transition">
            <CardContent className="p-4">
              <h3 className="font-medium">{p.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{p.duration}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>• {p.sessions} sessions</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">₹{p.price.toLocaleString()}</span>
              </div>
              <div className="mt-2">
                <Badge variant="outline">{p.successRate}% success</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default V2Protocols;