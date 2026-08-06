import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Calendar, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

const photoSessions = [
  {
    id: 1, date: "2024-12-01", bodyRegion: "Lumbar Spine", condition: "Kati Shoola",
    annotation: "Postural deviation noted – left lateral tilt",
    phase: "before",
  },
  {
    id: 2, date: "2024-12-15", bodyRegion: "Lumbar Spine", condition: "Kati Shoola",
    annotation: "Improved alignment after 7 days Kati Basti",
    phase: "during",
  },
  {
    id: 3, date: "2024-12-28", bodyRegion: "Lumbar Spine", condition: "Kati Shoola",
    annotation: "Significant postural correction achieved",
    phase: "after",
  },
  {
    id: 4, date: "2024-11-10", bodyRegion: "Right Knee", condition: "Sandhivata",
    annotation: "Mild swelling at medial joint line",
    phase: "before",
  },
  {
    id: 5, date: "2024-12-10", bodyRegion: "Right Knee", condition: "Sandhivata",
    annotation: "Swelling reduced post Janu Basti (5 sessions)",
    phase: "after",
  },
];

const comparisons = [
  { region: "Lumbar Spine", before: "2024-12-01", after: "2024-12-28", improvement: "Postural correction +70%" },
  { region: "Right Knee", before: "2024-11-10", after: "2024-12-10", improvement: "Swelling reduced ~60%" },
];

export default function ClinicalPhotography() {
  const handleUpload = () => toast.info("Camera/upload dialog opened");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6 text-teal-600" /> Clinical Photography
          </h1>
          <p className="text-muted-foreground">Mr. Rajesh Kumar • Before/After Documentation</p>
        </div>
        <Button size="sm" onClick={handleUpload}>
          <Upload className="h-4 w-4 mr-1" /> Upload Photo
        </Button>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Photo Timeline</TabsTrigger>
          <TabsTrigger value="compare">Before/After Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photoSessions.map((photo) => (
              <Card key={photo.id}>
                <CardContent className="pt-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center mb-3">
                    <Camera className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{photo.bodyRegion}</Badge>
                      <Badge variant={
                        photo.phase === "before" ? "destructive" :
                        photo.phase === "after" ? "default" : "secondary"
                      } className="text-xs capitalize">{photo.phase}</Badge>
                    </div>
                    <p className="text-sm font-medium">{photo.condition}</p>
                    <p className="text-xs text-muted-foreground">{photo.annotation}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {photo.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <div className="space-y-4">
            {comparisons.map((comp, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" /> {comp.region}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium mb-2 text-red-600">Before ({comp.before})</p>
                      <div className="aspect-[4/3] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
                        <Camera className="h-8 w-8 text-red-300" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2 text-green-600">After ({comp.after})</p>
                      <div className="aspect-[4/3] bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
                        <Camera className="h-8 w-8 text-green-300" />
                      </div>
                    </div>
                  </div>
                  <Badge className="mt-3">{comp.improvement}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
