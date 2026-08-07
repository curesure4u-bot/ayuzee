import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Apple, CheckCircle, Clock, Users, Truck, AlertTriangle, Plus, Leaf, Loader2 } from "lucide-react";
import { useDietKitchen } from "@/hooks/useDietKitchen";

type DietOrder = { id: string; patient: string; ward: string; bed: string; dietType: string; meal: string; time: string; specialInstructions: string; status: "pending" | "preparing" | "ready" | "delivered" };

const HmsDietKitchen = () => {
  const { orders, loading, error, pending, preparing, ready, delivered, updateStatus } = useDietKitchen();
  const [mealFilter, setMealFilter] = useState("all");

  const filtered = orders.filter(o => mealFilter === "all" || o.meal === mealFilter);

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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {loading && (
          <div className="col-span-full flex items-center justify-center py-2 text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading kitchen orders...</span>
          </div>
        )}
        {error && !loading && (
          <Card className="col-span-full border-amber-200 bg-amber-50">
            <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
          </Card>
        )}
        <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Apple className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">{preparing}</p><p className="text-xs text-muted-foreground">Preparing</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{ready}</p><p className="text-xs text-muted-foreground">Ready</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Truck className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{delivered}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{orders.length}</p><p className="text-xs text-muted-foreground">Total Meals</p></CardContent></Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="orders">Order Board</TabsTrigger>
          <TabsTrigger value="schedule">Meal Schedule</TabsTrigger>
          <TabsTrigger value="inventory">Kitchen Inventory</TabsTrigger>
          <TabsTrigger value="protocols">AYUSH Diets</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={mealFilter} onValueChange={setMealFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} orders</span>
          </div>

          <Card>
            <CardContent className="pt-4">
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
                      {o.status === "pending" && <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => updateStatus(o.id, "preparing")}>Start</Button>}
                      {o.status === "preparing" && <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => updateStatus(o.id, "ready")}>Ready</Button>}
                      {o.status === "ready" && <Button size="sm" className="text-xs h-6" onClick={() => updateStatus(o.id, "delivered")}>Deliver</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Today's Patient Meal Schedule</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Patient</th>
                    <th className="px-3 py-2 text-left font-medium">Ward/Bed</th>
                    <th className="px-3 py-2 text-left font-medium">Diet Type</th>
                    <th className="px-3 py-2 text-center font-medium">Breakfast</th>
                    <th className="px-3 py-2 text-center font-medium">Lunch</th>
                    <th className="px-3 py-2 text-center font-medium">Dinner</th>
                    <th className="px-3 py-2 text-left font-medium">Allergies</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { patient: "Ramesh Kumar", ward: "Gen/Bed 3", diet: "Samsarjana (Day 2)", bf: "Peya", lunch: "Vilepi", dinner: "Vilepi", allergy: "None" },
                    { patient: "Meera Nair", ward: "PK/Suite 2", diet: "Snehapana", bf: "None (fasting)", lunch: "Warm water", dinner: "If hungry: Peya", allergy: "Lactose" },
                    { patient: "Sunil Menon", ward: "Gen/Bed 5", diet: "Normal Pathya", bf: "Dalia + tea", lunch: "Rice+Dal+Veg", dinner: "Khichdi", allergy: "None" },
                    { patient: "Lakshmi Devi", ward: "Pvt/Room 2", diet: "Kapha-reducing", bf: "Honey water + barley", lunch: "Warm soup + millet", dinner: "Light khichdi", allergy: "Cashew" },
                    { patient: "Anand Sharma", ward: "PK/Suite 4", diet: "Pre-Virechana", bf: "Light porridge", lunch: "Khichdi only", dinner: "Medicine (Trivrit)", allergy: "None" },
                  ].map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{p.patient}</td>
                      <td className="px-3 py-2 text-xs">{p.ward}</td>
                      <td className="px-3 py-2 text-xs text-primary font-medium">{p.diet}</td>
                      <td className="px-3 py-2 text-xs text-center">{p.bf}</td>
                      <td className="px-3 py-2 text-xs text-center">{p.lunch}</td>
                      <td className="px-3 py-2 text-xs text-center">{p.dinner}</td>
                      <td className="px-3 py-2">{p.allergy !== "None" ? <Badge variant="destructive" className="text-[9px]">{p.allergy}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Kitchen Inventory & Stock</CardTitle>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Item</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium">Stock</th>
                    <th className="px-3 py-2 text-right font-medium">Min Level</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: "Basmati Rice", cat: "Grains", stock: "25 kg", min: "10 kg", ok: true },
                    { item: "Moong Dal", cat: "Pulses", stock: "8 kg", min: "5 kg", ok: true },
                    { item: "Ghee (A2 Cow)", cat: "Oils & Fats", stock: "3 L", min: "5 L", ok: false },
                    { item: "Sesame Oil", cat: "Oils & Fats", stock: "5 L", min: "3 L", ok: true },
                    { item: "Honey (Raw)", cat: "Sweeteners", stock: "2 kg", min: "2 kg", ok: false },
                    { item: "Ginger (Fresh)", cat: "Spices", stock: "1.5 kg", min: "1 kg", ok: true },
                    { item: "Turmeric Powder", cat: "Spices", stock: "500 g", min: "500 g", ok: false },
                    { item: "Barley Flour", cat: "Grains", stock: "4 kg", min: "3 kg", ok: true },
                    { item: "Trikatu Powder", cat: "Herbal", stock: "200 g", min: "100 g", ok: true },
                    { item: "Milk (A2)", cat: "Dairy", stock: "10 L", min: "8 L", ok: true },
                  ].map((item, i) => (
                    <tr key={i} className={`border-b hover:bg-muted/30 ${!item.ok ? "bg-red-50/30" : ""}`}>
                      <td className="px-3 py-2 font-medium">{item.item}</td>
                      <td className="px-3 py-2 text-xs">{item.cat}</td>
                      <td className="px-3 py-2 text-right text-xs">{item.stock}</td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{item.min}</td>
                      <td className="px-3 py-2">
                        {item.ok ? (
                          <Badge variant="outline" className="text-[10px] text-green-600">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-0.5" />Low</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Leaf className="h-4 w-4" /> AYUSH Diet Protocols (Quick Reference)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Samsarjana Krama", desc: "Post-Panchakarma graded diet: Peya → Vilepi → Akrita Yusha → Krita Yusha → Normal", days: "3-7 days" },
                  { name: "Snehapana Diet", desc: "During internal oleation: No food until previous dose digested. Only warm water.", days: "5-7 days" },
                  { name: "Pre-Virechana", desc: "Light khichdi day before. Evening: Virechana medicine. Next day: Samsarjana starts.", days: "1 day" },
                  { name: "Kapha-Reducing", desc: "Light, warm, dry foods. Honey water. Barley, green gram. No dairy, no cold.", days: "As advised" },
                  { name: "Vata-Pacifying", desc: "Warm, oily, nourishing. Ghee, sesame, warm milk. Regular timings. Avoid raw.", days: "As advised" },
                  { name: "Pitta-Pacifying", desc: "Cool, sweet, bitter foods. Coconut, coriander, mint. Avoid spicy, sour, fried.", days: "As advised" },
                  { name: "Normal Pathya", desc: "Balanced warm food. Rice + dal + seasonal vegetables. Ginger, cumin. Avoid viruddha.", days: "Standard IP" },
                  { name: "Naturopathy Fast", desc: "Fruit/juice fast or eliminative diet. Progressive reintroduction.", days: "1-3 days" },
                  { name: "Unani Ghiza", desc: "Diet based on Mizaj correction. Haar/Barid food selection per patient temperament.", days: "As advised" },
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsDietKitchen;
