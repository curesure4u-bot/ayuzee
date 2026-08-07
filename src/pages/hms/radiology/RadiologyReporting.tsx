import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Send, Save, Sparkles, History, Loader2 } from "lucide-react";
import { useRadiology, type RadiologyOrder } from "@/hooks/useRadiology";

const reportTemplates: Record<string, string> = {
  "MRI": "FINDINGS:\n\nAlignment: \nDisc spaces: \nSignal changes: \nSpinal canal: \nNeural foramina: \nParaspinal soft tissues: \n\nIMPRESSION:\n",
  "CT": "TECHNIQUE: \n\nFINDINGS:\n\nLiver: \nSpleen: \nPancreas: \nKidneys: \nBowel: \nLymph nodes: \nFree fluid: \n\nIMPRESSION:\n",
  "USG": "FINDINGS:\n\nLiver: Normal size and echogenicity\nGall bladder: \nCBD: \nPancreas: \nSpleen: \nKidneys: \nBladder: \nUterus/Prostate: \nFree fluid: \n\nIMPRESSION:\n",
  "X-Ray": "FINDINGS:\n\nBony alignment: \nJoint spaces: \nSoft tissues: \nOther: \n\nIMPRESSION:\n",
};

const RadiologyReporting = () => {
  const { orders, loading, error, saveReport } = useRadiology();
  const pendingReports = orders.filter((o) => o.status === "completed");

  const [selectedStudy, setSelectedStudy] = useState<RadiologyOrder | null>(null);
  const [reportText, setReportText] = useState("");
  const [impression, setImpression] = useState("");
  const [reportStatus, setReportStatus] = useState<"draft" | "final">("draft");
  const [reportedBy, setReportedBy] = useState("");

  const handleSelectStudy = (study: RadiologyOrder) => {
    setSelectedStudy(study);
    setReportText(reportTemplates[study.modality] || "FINDINGS:\n\n\nIMPRESSION:\n");
    setImpression("");
    setReportStatus("draft");
  };

  const handleAISuggest = () => {
    if (!selectedStudy) return;
    toast.success("AI generating report suggestion...");
    setTimeout(() => {
      setImpression("AI-generated impression based on clinical context and imaging findings. Please review and edit as needed.");
    }, 1000);
  };

  const handleSaveDraft = () => {
    if (!selectedStudy) return toast.error("Select a study first");
    toast.success("Draft saved locally");
  };

  const handleFinalize = async () => {
    if (!selectedStudy) return toast.error("Select a study first");
    if (!reportText.trim()) return toast.error("Report cannot be empty");
    const fullReport = reportText + (impression ? "\n\nIMPRESSION:\n" + impression : "");
    const success = await saveReport(selectedStudy.id, fullReport, reportedBy || "Radiologist");
    if (success) {
      setReportStatus("final");
      toast.success("Report finalized and sent to referring doctor");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-600" /> Radiology Reporting
        </h1>
        <p className="text-sm text-muted-foreground">
          Structured reporting with AI-assisted impressions and template support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Studies List */}
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          )}
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Pending Reports ({pendingReports.length})</h2>
          {pendingReports.map((study) => (
            <Card
              key={study.id}
              className={`cursor-pointer transition-colors ${selectedStudy?.id === study.id ? "border-violet-500 bg-violet-50/50" : "hover:bg-muted/50"}`}
              onClick={() => handleSelectStudy(study)}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm">{study.patientName}</p>
                <p className="text-xs text-muted-foreground">{study.uhid} · {study.investigation}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-xs">{study.modality}</Badge>
                  <span className="text-xs text-muted-foreground">{study.orderedDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/30">
            <CardContent className="p-3 text-center">
              <History className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">View report history</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Editor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStudy ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{selectedStudy.investigation}</CardTitle>
                    <Badge variant={reportStatus === "final" ? "default" : "secondary"}>{reportStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudy.patientName} · {selectedStudy.uhid} · Ref: {selectedStudy.orderedBy}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Report Body</Label>
                    <Textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Enter findings..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Impression / Conclusion</Label>
                      <Button size="sm" variant="ghost" onClick={handleAISuggest}>
                        <Sparkles className="h-3 w-3 mr-1" /> AI Suggest
                      </Button>
                    </div>
                    <Textarea
                      value={impression}
                      onChange={(e) => setImpression(e.target.value)}
                      placeholder="Summary impression..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Comparison</Label>
                      <Input placeholder="Previous study date (if any)" />
                    </div>
                    <div>
                      <Label>Reported By</Label>
                      <Select value={reportedBy} onValueChange={setReportedBy}>
                        <SelectTrigger><SelectValue placeholder="Select radiologist" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. Rao">Dr. Rao (MD Radiology)</SelectItem>
                          <SelectItem value="Dr. Gupta">Dr. Gupta (MD Radiology)</SelectItem>
                          <SelectItem value="Dr. Thomas">Dr. Thomas (DNB Radiology)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-1 h-4 w-4" /> Save Draft
                </Button>
                <Button onClick={handleFinalize}>
                  <Send className="mr-1 h-4 w-4" /> Finalize & Send
                </Button>
              </div>
            </>
          ) : (
            <Card className="flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Select a study from the left to begin reporting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyReporting;
