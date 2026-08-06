import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Package, CheckCircle, ArrowRight, Pill } from "lucide-react";

const kits = [
  {
    id: "KIT-001", name: "Spine Ayush - 5 Day Package", type: "PK Treatment", price: 4500, assembled: 8, available: 3,
    items: [
      { item: "Kottamchukkadi Taila 200ml", qty: 2 },
      { item: "Mahanarayan Taila 200ml", qty: 1 },
      { item: "Rasnasaptakam Kashayam 450ml", qty: 1 },
      { item: "Simhanada Guggulu 60t", qty: 1 },
      { item: "Triphala Churna 100g", qty: 1 },
    ],
  },
  {
    id: "KIT-002", name: "Spine Ayush - 14 Day Package", type: "PK Treatment", price: 12000, assembled: 4, available: 2,
    items: [
      { item: "Kottamchukkadi Taila 200ml", qty: 5 },
      { item: "Mahanarayan Taila 200ml", qty: 3 },
      { item: "Rasnasaptakam Kashayam 450ml", qty: 2 },
      { item: "Simhanada Guggulu 60t", qty: 2 },
      { item: "Ashwagandha Churna 100g", qty: 2 },
      { item: "Dashamoolarishtam 450ml", qty: 1 },
    ],
  },
  {
    id: "KIT-003", name: "Franchise Starter Kit", type: "Franchise Supply", price: 35000, assembled: 2, available: 1,
    items: [
      { item: "Rasnasaptakam Kashayam 450ml", qty: 20 },
      { item: "Simhanada Guggulu 60t", qty: 20 },
      { item: "Kottamchukkadi Taila 200ml", qty: 15 },
      { item: "Ashwagandha Churna 100g", qty: 15 },
      { item: "Dashamoolarishtam 450ml", qty: 10 },
      { item: "Triphala Churna 100g", qty: 20 },
      { item: "Chandraprabha Vati 60t", qty: 10 },
    ],
  },
  {
    id: "KIT-004", name: "Detox / Rejuvenation Kit", type: "Patient Package", price: 2800, assembled: 6, available: 4,
    items: [
      { item: "Triphala Churna 100g", qty: 1 },
      { item: "Dashamoolarishtam 450ml", qty: 1 },
      { item: "Ashwagandha Churna 100g", qty: 1 },
      { item: "Chandraprabha Vati 60t", qty: 1 },
    ],
  },
  {
    id: "KIT-005", name: "Joint Care Monthly Kit", type: "Patient Package", price: 1800, assembled: 10, available: 6,
    items: [
      { item: "Simhanada Guggulu 60t", qty: 1 },
      { item: "Rasnasaptakam Kashayam 450ml", qty: 2 },
      { item: "Kottamchukkadi Taila 200ml", qty: 1 },
    ],
  },
];

export default function KitAssembly() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-indigo-600" /> Kit / Package Assembly</h1>
          <p className="text-muted-foreground mt-1">Pre-pack PK treatment kits, franchise starter kits, patient monthly packages — dispatch as single unit</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New kit template created")}>+ Create Kit</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{kits.length}</p><p className="text-xs text-muted-foreground">Kit Templates</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{kits.reduce((s, k) => s + k.assembled, 0)}</p><p className="text-xs text-muted-foreground">Total Assembled</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{kits.reduce((s, k) => s + k.available, 0)}</p><p className="text-xs text-muted-foreground">Ready to Dispatch</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{kits.filter(k => k.type === "Franchise Supply").length}</p><p className="text-xs text-muted-foreground">Franchise Kits</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {kits.map((kit) => (
          <Card key={kit.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">{kit.name}<Badge variant="outline" className="text-[10px]">{kit.type}</Badge></CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kit.id} • ₹{kit.price.toLocaleString()} per kit • {kit.items.length} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 text-[10px]">{kit.available} ready</Badge>
                  <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`Assembling 1 more ${kit.name}`)}>Assemble</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {kit.items.map((item, j) => (
                  <Badge key={j} variant="secondary" className="text-[10px] font-normal">
                    <Pill className="h-2.5 w-2.5 mr-0.5" />{item.item} × {item.qty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Kit Intelligence</p><p className="text-sm text-purple-700">Spine Ayush 5-Day Package is most popular (8 assembled this month). Stock check: Can assemble 4 more with current inventory before Kottamchukkadi Taila runs out. Franchise Starter Kit: 1 ready — new Delhi franchise onboarding next week, pre-assemble 1 more by 25 Jul. Joint Care Monthly Kit sells best via e-commerce (6/10 dispatched online) — consider subscription model auto-assembly every 28 days.</p></div></CardContent></Card>
    </div>
  );
}
