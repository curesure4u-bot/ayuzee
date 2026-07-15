import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Plus, IndianRupee } from "lucide-react";

type PkgTemplate = {
  id: string;
  name: string;
  duration: string;
  therapies: string[];
  sessionsPerDay: number;
  totalSessions: number;
  price: number;
  description: string;
};

const defaultPackages: PkgTemplate[] = [
  {
    id: "1", name: "7-day Rejuvenation", duration: "7 days",
    therapies: ["Abhyanga", "Shirodhara", "Steam Bath"],
    sessionsPerDay: 2, totalSessions: 14, price: 28000,
    description: "Basic rejuvenation with full body oil massage and Shirodhara for stress relief.",
  },
  {
    id: "2", name: "14-day Full Panchakarma", duration: "14 days",
    therapies: ["Snehapana", "Abhyanga", "Swedana", "Vamana", "Virechana", "Vasti", "Nasya"],
    sessionsPerDay: 3, totalSessions: 42, price: 85000,
    description: "Complete Panchakarma detoxification program with all 5 procedures. Includes pre & post care.",
  },
  {
    id: "3", name: "21-day Spine Care", duration: "21 days",
    therapies: ["Kativasti", "Abhyanga", "Pizhichil", "Elakizhi", "Greevavasti"],
    sessionsPerDay: 2, totalSessions: 42, price: 65000,
    description: "Comprehensive spine care for disc problems, spondylosis and back pain management.",
  },
  {
    id: "4", name: "7-day Weight Management", duration: "7 days",
    therapies: ["Udwarthanam", "Steam Bath", "Virechana", "Lekhana Vasti"],
    sessionsPerDay: 2, totalSessions: 14, price: 22000,
    description: "Ayurvedic weight management with dry powder massage and detox protocols.",
  },
  {
    id: "5", name: "14-day Arthritis Care", duration: "14 days",
    therapies: ["Abhyanga", "Elakizhi", "Podikizhi", "Januvasti", "Pizhichil"],
    sessionsPerDay: 2, totalSessions: 28, price: 55000,
    description: "Specialized program for joint pain, arthritis and musculoskeletal conditions.",
  },
  {
    id: "6", name: "10-day Skin & Beauty", duration: "10 days",
    therapies: ["Abhyanga", "Lepanam", "Takradhara", "Virechana", "Mukhalepam"],
    sessionsPerDay: 2, totalSessions: 20, price: 35000,
    description: "Ayurvedic beauty care for skin rejuvenation, psoriasis and dermatological conditions.",
  },
];

const HmsPanchakarmaPackages = () => {
  const [packages] = useState<PkgTemplate[]>(defaultPackages);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" /> Panchakarma Packages & Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage treatment packages, pricing and therapy combinations
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{pkg.name}</CardTitle>
                <Badge variant="outline">{pkg.duration}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
              <div className="flex flex-wrap gap-1">
                {pkg.therapies.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Sessions/Day</p>
                  <p className="font-medium">{pkg.sessionsPerDay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                  <p className="font-medium">{pkg.totalSessions}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    {pkg.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <Button size="sm" variant="outline">Assign to Patient</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Package</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Package Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., 14-day Detox Program" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration</Label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 days">3 days</SelectItem>
                    <SelectItem value="5 days">5 days</SelectItem>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="10 days">10 days</SelectItem>
                    <SelectItem value="14 days">14 days</SelectItem>
                    <SelectItem value="21 days">21 days</SelectItem>
                    <SelectItem value="28 days">28 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (INR)</Label>
                <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g., 45000" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Package description and included therapies..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Package created"); setCreateOpen(false); }}>Create Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanchakarmaPackages;
