import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Monitor, Search, Download, Share2, ZoomIn, ZoomOut,
  RotateCw, Maximize2, Grid3X3, Layers,
} from "lucide-react";

type StudyRecord = {
  id: string;
  patientName: string;
  uhid: string;
  study: string;
  modality: string;
  date: string;
  images: number;
  status: "available" | "archived" | "pending-upload";
};

const mockStudies: StudyRecord[] = [
  { id: "PACS-001", patientName: "Ramesh Kumar", uhid: "UH-4521", study: "MRI Lumbar Spine", modality: "MRI", date: "2026-08-07", images: 124, status: "available" },
  { id: "PACS-002", patientName: "Lakshmi Devi", uhid: "UH-3892", study: "X-Ray Chest PA", modality: "CR", date: "2026-08-07", images: 2, status: "available" },
  { id: "PACS-003", patientName: "Sunil Menon", uhid: "UH-5120", study: "CT Abdomen", modality: "CT", date: "2026-08-06", images: 312, status: "available" },
  { id: "PACS-004", patientName: "Meera Nair", uhid: "UH-2987", study: "USG Pelvis", modality: "US", date: "2026-08-06", images: 18, status: "available" },
  { id: "PACS-005", patientName: "Anil Krishnan", uhid: "UH-6034", study: "X-Ray Knee AP/Lat", modality: "CR", date: "2026-08-05", images: 4, status: "archived" },
  { id: "PACS-006", patientName: "Priya Mohan", uhid: "UH-4456", study: "2D Echocardiography", modality: "US", date: "2026-08-05", images: 42, status: "available" },
];

const RadiologyPACS = () => {
  const [studies] = useState<StudyRecord[]>(mockStudies);
  const [selectedStudy, setSelectedStudy] = useState<StudyRecord | null>(null);
  const [search, setSearch] = useState("");
  const [filterModality, setFilterModality] = useState("all");

  const filtered = studies.filter((s) => {
    if (filterModality !== "all" && s.modality !== filterModality) return false;
    if (search && !s.patientName.toLowerCase().includes(search.toLowerCase()) && !s.uhid.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-violet-600" /> PACS Viewer
          </h1>
          <p className="text-sm text-muted-foreground">
            Picture Archiving and Communication System — view, compare, and share imaging studies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Browser */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search patient / UHID" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger><SelectValue placeholder="Filter modality" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="CR">X-Ray (CR)</SelectItem>
                <SelectItem value="US">Ultrasound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map((study) => (
              <Card
                key={study.id}
                className={`cursor-pointer transition-colors ${selectedStudy?.id === study.id ? "border-violet-500 bg-violet-50/50" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedStudy(study)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{study.patientName}</p>
                    <Badge variant={study.status === "available" ? "outline" : "secondary"} className="text-xs">{study.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{study.study}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-xs">{study.modality}</Badge>
                    <span className="text-xs text-muted-foreground">{study.date}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{study.images} imgs</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Viewer Area */}
        <div className="lg:col-span-2">
          {selectedStudy ? (
            <Card className="min-h-[500px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedStudy.study}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" title="Zoom In"><ZoomIn className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Zoom Out"><ZoomOut className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Rotate"><RotateCw className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Fullscreen"><Maximize2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Grid View"><Grid3X3 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Series"><Layers className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedStudy.patientName} · {selectedStudy.uhid} · {selectedStudy.images} images · {selectedStudy.date}
                </p>
              </CardHeader>
              <CardContent>
                {/* Simulated DICOM Viewer Area */}
                <div className="bg-black rounded-lg flex items-center justify-center min-h-[350px] relative">
                  <div className="text-center text-gray-400">
                    <Monitor className="h-16 w-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">DICOM Viewer</p>
                    <p className="text-xs mt-1 opacity-60">{selectedStudy.modality} · Series 1 of {Math.ceil(selectedStudy.images / 30)}</p>
                    <p className="text-xs mt-1 opacity-40">Window/Level: 400/40 · Slice: 1/{selectedStudy.images}</p>
                  </div>
                  {/* Corner annotations */}
                  <div className="absolute top-2 left-2 text-xs text-green-400 font-mono">
                    <p>{selectedStudy.patientName}</p>
                    <p>{selectedStudy.uhid}</p>
                  </div>
                  <div className="absolute top-2 right-2 text-xs text-green-400 font-mono text-right">
                    <p>{selectedStudy.date}</p>
                    <p>{selectedStudy.modality}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => toast.success("Downloading DICOM...")}>
                    <Download className="h-3 w-3 mr-1" /> Export DICOM
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Share link generated")}>
                    <Share2 className="h-3 w-3 mr-1" /> Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Compare mode: select another study")}>
                    <Grid3X3 className="h-3 w-3 mr-1" /> Compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-[500px]">
              <CardContent className="text-center">
                <Monitor className="h-16 w-16 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">Select a study to view images</p>
                <p className="text-xs text-muted-foreground mt-1">Supports DICOM viewing, windowing, measurements, and annotations</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyPACS;
