import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Apple, CheckCircle, Clock, Users, Truck } from "lucide-react";

type DietOrder = { id: string; patient: string; ward: string; bed: string; dietType: string; meal: string; time: string; specialInstructions: string; status: "pending" | "preparing" | "ready" | "delivered" };

const mockOrders: DietOrder[] = [
  { id: "1", patient: "Ramesh Kumar", ward: "General", bed: "Bed 3", dietType: "Samsarjana Krama (Day 2)", meal: "Breakfast", time: "07:30", specialInstructions: "Only Peya (rice gruel). No salt, no oil.", status: "delivered" },
  { id: "2", patient: "Ramesh Kumar", ward: "General", bed: "Bed 3", dietType: "Samsarjana Krama (Day 2)", meal: "Lunch", time: "12:30", specialInstructions: "Vilepi (thick gruel). Minimal salt.", status: "preparing" },
  { id: "3", patient: "Meera Nair", ward: "PK Suite", bed: "Suite 2", dietType: "Snehapana Diet", meal: "Lunch", time: "After digestion", specialInstructions: "NO food until hunger returns. Warm water only. Inform nurse when hungry.", status: "pending" },
  { id: "4", patient: "Sunil Menon", ward: "General", bed: "Bed 5", dietType: "Normal Pathya", meal: "Breakfast", time: "08:00", specialInstructions: "Warm food. Avoid curd. Include ginger.", status: "delivered" },
  { id: "5", patient: "Sunil Menon", ward: "General", bed: "Bed 5", dietType: "Normal Pathya", meal: "Lunch", time: "12:30", specialInstructions: "Rice + dal + warm vegetables. No cold items.", status: "ready" },
  { id: "6", patient: "Lakshmi Devi", ward: "Private", bed: "Room 2", dietType: "Kapha-reducing", meal: "Breakfast", time: "08:00", specialInstructions: "Light, warm, dry food. Honey water. No dairy.", status: "delivered" },
  { id: "7", patient: "Anand Sharma", ward: "PK Suite", bed: "Suite 4", dietType: "Pre-Virechana", meal: "Lunch", time: "12:00", specialInstructions: "Light khichdi only. Evening: Virechana medicine to be given.", status: "preparing" },
];

const HmsDietKitchen = () => {
  const [orders] = useState<DietOrder[]>(mockOrders);
  const [mealFilter, setMealFilter] = useState("all");

  const filtered = orders.filter(o => mealFilter === "all" || o.meal === mealFilter);
  const pending = orders.filter(o => o.status === "pending").length;
  const preparing = orders.filter(o => o.status === "preparing").length;
  const ready = orders.filter(o => o.status === "ready").length;
  const delivered = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Apple className="h-6 w-6 text-green-600" /> Diet & Kitchen Management
          </h1>
          <p className="text-sm text-muted-foreground">Patient diet orders, Samsarjana Krama, Pathya diet, kitchen workflow & delivery</p>
        </div>
        <Select value={mealFilter} onValueChange={setMealFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meals</SelectItem>
            <SelectItem value="Breakfast">Breakfast</SelectItem>
            <SelectItem value="Lunch">Lunch</SelectItem>
            <SelectItem value="Dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Apple className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">{preparing}</p><p className="text-xs text-muted-foreground">Preparing</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{ready}</p><p className="text-xs text-muted-foreground">Ready</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Truck className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{delivered}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Kitchen Order Board</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((o) => (
              <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg border ${o.status === "pending" ? "border-amber-200 bg-amber-50/20" : o.status === "preparing" ? "border-orange-200 bg-orange-50/20" : o.status === "ready" ? "border-green-200 bg-green-50/20" : ""}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{o.patient}</p>
                    <Badge variant="outline" className="text-[10px]">{o.ward} · {o.bed}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{o.meal} · {o.time}</Badge>
                  </div>
                  <p className="text-xs font-medium text-primary">{o.dietType}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{o.specialInstructions}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge variant={o.status === "delivered" ? "outline" : o.status === "ready" ? "default" : "secondary"} className={`text-xs capitalize ${o.status === "delivered" ? "text-green-600" : ""}`}>{o.status}</Badge>
                  {o.status === "pending" && <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => toast.success("Marked: Preparing")}>Start</Button>}
                  {o.status === "preparing" && <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => toast.success("Marked: Ready")}>Ready</Button>}
                  {o.status === "ready" && <Button size="sm" className="text-xs h-6" onClick={() => toast.success("Marked: Delivered")}>Deliver</Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AYUSH Diet Types Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">AYUSH Diet Protocols (Quick Reference)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Samsarjana Krama", desc: "Post-Panchakarma graded diet: Peya → Vilepi → Akrita Yusha → Krita Yusha → Normal", days: "3-7 days" },
              { name: "Snehapana Diet", desc: "During internal oleation: No food until previous dose digested. Only warm water.", days: "5-7 days" },
              { name: "Pre-Virechana", desc: "Light khichdi day before. Evening: Virechana medicine. Next day: Samsarjana starts.", days: "1 day" },
              { name: "Kapha-Reducing", desc: "Light, warm, dry foods. Honey water. Barley, green gram. No dairy, no cold.", days: "As advised" },
              { name: "Vata-Pacifying", desc: "Warm, oily, nourishing. Ghee, sesame, warm milk. Regular timings. Avoid raw.", days: "As advised" },
              { name: "Normal Pathya", desc: "Balanced warm food. Rice + dal + seasonal vegetables. Ginger, cumin. Avoid viruddha.", days: "Standard IP" },
            ].map(d => (
              <Card key={d.name} className="border-green-200">
                <CardContent className="p-3">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                  <Badge variant="outline" className="text-[9px] mt-1">{d.days}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsDietKitchen;
