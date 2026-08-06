import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Circle, ArrowRight, Minus, Type, Pencil, Save, Image } from "lucide-react";

type Tool = "circle" | "arrow" | "line" | "text" | "freehand";

const tools: { id: Tool; label: string; icon: typeof Circle }[] = [
  { id: "circle", label: "Circle", icon: Circle },
  { id: "arrow", label: "Arrow", icon: ArrowRight },
  { id: "line", label: "Line", icon: Minus },
  { id: "text", label: "Text", icon: Type },
  { id: "freehand", label: "Freehand", icon: Pencil },
];

const bodyRegions = ["Spine L1", "Spine L2", "Spine L3", "Spine L4", "Spine L5", "S1", "Cervical", "Thoracic"];

const mockAnnotations = [
  { id: 1, tool: "circle", region: "L4-L5", note: "Disc bulge observed", color: "red" },
  { id: 2, tool: "arrow", region: "L5-S1", note: "Nerve compression", color: "orange" },
  { id: 3, tool: "text", region: "S1", note: "Mild degeneration", color: "yellow" },
];

const ImageAnnotation = () => {
  const [activeTool, setActiveTool] = useState<Tool>("circle");
  const [annotations, setAnnotations] = useState(mockAnnotations);
  const [viewMode, setViewMode] = useState<"current" | "compare">("current");

  const handleSave = () => toast.success("Annotations saved to patient record");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clinical Image Annotation</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === "current" ? "default" : "outline"}
            onClick={() => setViewMode("current")}>Current</Button>
          <Button size="sm" variant={viewMode === "compare" ? "default" : "outline"}
            onClick={() => setViewMode("compare")}>Before/After</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Toolbar */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-sm">Tools</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tools.map((t) => (
              <Button key={t.id} variant={activeTool === t.id ? "default" : "outline"}
                size="sm" className="w-full justify-start gap-2"
                onClick={() => setActiveTool(t.id)}>
                <t.icon className="h-4 w-4" /> {t.label}
              </Button>
            ))}
            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium mb-2">Body Region Tags</p>
              <div className="flex flex-wrap gap-1">
                {bodyRegions.map((r) => (
                  <Badge key={r} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">{r}</Badge>
                ))}
              </div>
            </div>
            <Button className="w-full mt-3 gap-2" onClick={handleSave}><Save className="h-4 w-4" /> Save</Button>
          </CardContent>
        </Card>

        {/* Image Canvas */}
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            {viewMode === "current" ? (
              <div className="border-2 border-dashed rounded-lg aspect-[4/3] flex flex-col items-center justify-center bg-muted/30 relative">
                <Image className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">X-Ray / Clinical Image</p>
                <p className="text-xs text-muted-foreground mt-1">Mock: Lumbar Spine AP View</p>
                {/* Mock annotation markers */}
                <div className="absolute top-[35%] left-[45%] w-8 h-8 border-2 border-red-500 rounded-full" title="L4-L5 Disc bulge" />
                <div className="absolute top-[50%] left-[48%] text-orange-500 text-xs font-bold">← L5-S1</div>
                <Badge className="absolute bottom-3 right-3 text-xs">Active: {activeTool}</Badge>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center bg-muted/30">
                  <p className="text-xs text-muted-foreground">Before</p>
                  <p className="text-xs text-muted-foreground">2024-01-01</p>
                </div>
                <div className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center bg-muted/30">
                  <p className="text-xs text-muted-foreground">After</p>
                  <p className="text-xs text-muted-foreground">2024-01-15</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Annotations List */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-sm">Annotations ({annotations.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {annotations.map((a) => (
              <div key={a.id} className="p-2 rounded border text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{a.tool}</Badge>
                  <span className="text-muted-foreground">{a.region}</span>
                </div>
                <p>{a.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageAnnotation;
