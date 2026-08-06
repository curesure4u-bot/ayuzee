import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Factory, Brain, ArrowRight, Package, FlaskConical, CheckCircle } from "lucide-react";

const batches = [
  {
    id: "MFG-2026-071",
    product: "Rasnasaptakam Kashayam 450ml",
    batchNo: "RSK-072026-A",
    startDate: "15 Jul 2026",
    status: "in_progress",
    progress: 65,
    yield: "50 bottles (22.5L)",
    rawMaterials: [
      { name: "Rasna (Pluchea lanceolata)", qty: "2 kg", consumed: "1.3 kg", status: "ok" },
      { name: "Guduchi (Tinospora cordifolia)", qty: "1.5 kg", consumed: "1 kg", status: "ok" },
      { name: "Eranda Moola (Castor root)", qty: "1 kg", consumed: "650 g", status: "ok" },
      { name: "Bala (Sida cordifolia)", qty: "800 g", consumed: "520 g", status: "ok" },
      { name: "Devadaru (Cedrus deodara)", qty: "500 g", consumed: "325 g", status: "ok" },
      { name: "Jaggery (Guda)", qty: "5 kg", consumed: "3.2 kg", status: "ok" },
      { name: "Water (for Kashayam)", qty: "50 L", consumed: "32 L", status: "ok" },
    ],
    stage: "Kashayam reduction (16x → 4x)",
  },
  {
    id: "MFG-2026-072",
    product: "Kottamchukkadi Taila 200ml",
    batchNo: "KCT-072026-B",
    startDate: "18 Jul 2026",
    status: "completed",
    progress: 100,
    yield: "30 bottles (6L)",
    rawMaterials: [
      { name: "Kottam (Saussurea lappa)", qty: "1 kg", consumed: "1 kg", status: "done" },
      { name: "Chukku (Dry Ginger)", qty: "500 g", consumed: "500 g", status: "done" },
      { name: "Tila Taila (Sesame oil)", qty: "8 L", consumed: "8 L", status: "done" },
      { name: "Goat milk (Aja Ksheera)", qty: "4 L", consumed: "4 L", status: "done" },
      { name: "Kalka dravyas (paste herbs)", qty: "750 g", consumed: "750 g", status: "done" },
    ],
    stage: "Completed — QC passed",
  },
  {
    id: "MFG-2026-073",
    product: "Simhanada Guggulu 60 tablets",
    batchNo: "SNG-072026-C",
    startDate: "20 Jul 2026",
    status: "planned",
    progress: 0,
    yield: "200 bottles (12,000 tablets)",
    rawMaterials: [
      { name: "Shuddha Guggulu (purified)", qty: "3 kg", consumed: "0", status: "pending" },
      { name: "Triphala Churna", qty: "1.5 kg", consumed: "0", status: "pending" },
      { name: "Gandhaka (purified Sulphur)", qty: "500 g", consumed: "0", status: "pending" },
      { name: "Eranda Taila (Castor oil)", qty: "1 L", consumed: "0", status: "pending" },
      { name: "Honey (binding)", qty: "500 ml", consumed: "0", status: "pending" },
    ],
    stage: "Awaiting raw material release",
  },
];

export default function ManufacturingBatch() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6 text-green-600" /> Manufacturing Batch Linkage
          </h1>
          <p className="text-muted-foreground mt-1">
            Raw material → finished product traceability — AYUSH GMP compliance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("New batch initiated")}>
          + New Batch
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-600">{batches.filter(b => b.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{batches.filter(b => b.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{batches.filter(b => b.status === "planned").length}</p><p className="text-xs text-muted-foreground">Planned</p></CardContent></Card>
      </div>

      {batches.map((batch) => (
        <Card key={batch.id} className={batch.status === "completed" ? "border-green-200" : batch.status === "in_progress" ? "border-blue-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {batch.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Factory className="h-4 w-4 text-blue-600" />}
                {batch.product}
              </CardTitle>
              <Badge variant={batch.status === "completed" ? "outline" : batch.status === "in_progress" ? "default" : "secondary"} className={`text-[10px] ${batch.status === "completed" ? "text-green-600" : ""}`}>
                {batch.status === "in_progress" ? "In Progress" : batch.status === "completed" ? "Completed" : "Planned"}
              </Badge>
            </div>
            <div className="flex gap-4 text-[10px] text-muted-foreground mt-1">
              <span>Batch: {batch.batchNo}</span>
              <span>ID: {batch.id}</span>
              <span>Started: {batch.startDate}</span>
              <span>Yield: {batch.yield}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{batch.stage}</span>
                <span className="font-bold">{batch.progress}%</span>
              </div>
              <Progress value={batch.progress} className="h-2" />
            </div>

            <div>
              <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                <FlaskConical className="h-3 w-3" /> Raw Materials
                <ArrowRight className="h-3 w-3" />
                <Package className="h-3 w-3" /> Finished Product
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {batch.rawMaterials.map((rm, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/30">
                    <span className="truncate flex-1">{rm.name}</span>
                    <span className="text-muted-foreground mx-2">Need: {rm.qty}</span>
                    <span className={rm.status === "done" ? "text-green-600 font-bold" : rm.status === "ok" ? "text-blue-600" : "text-amber-600"}>
                      {rm.consumed === "0" ? "Pending" : rm.consumed}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Batch Intelligence</p>
            <p className="text-sm text-purple-700">
              Batch RSK-072026-A (Rasnasaptakam): Kashayam reduction progressing well — estimated completion in 2 days.
              AI detected: Jaggery consumption slightly higher than AFI standard (6.4% excess) — may indicate higher
              water content in raw jaggery. Recommend quality check on jaggery supplier.
              <br/><strong>GMP Compliance:</strong> All 3 batches traceable from raw herb procurement to finished product.
              Automatic stock deduction of raw materials prevents double-counting. Finished product auto-added to
              dispensing inventory on QC pass.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
