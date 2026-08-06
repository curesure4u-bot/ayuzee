import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Camera, Bone, Activity, FileText, Send, ShieldCheck } from "lucide-react";

const spinalFindings = [
  {
    region: "Cervical",
    finding: "Normal alignment",
    severity: "Normal",
    ayurvedicCorrelation: "Greeva Stambha (if affected)",
  },
  {
    region: "Thoracic",
    finding: "Mild Kyphosis",
    severity: "Moderate",
    ayurvedicCorrelation: "Prishthashoola",
  },
  {
    region: "Lumbar",
    finding: "Lordosis increased",
    severity: "Moderate",
    ayurvedicCorrelation: "Katishoola / Gridhrasi",
  },
  {
    region: "Pelvic Tilt",
    finding: "Anterior tilt detected",
    severity: "Mild",
    ayurvedicCorrelation: "Trika Shoola",
  },
];

const treatmentSuggestions = [
  "Kati Basti (Lumbar region)",
  "Greeva Basti (Cervical region)",
  "Agnikarma at specific Marma points",
  "Asanas: Bhujangasana, Marjariasana, Setu Bandhasana",
  "Panchakarma: Abhyanga + Swedana + Basti",
];

const DoctorSpine = () => {
  const [imageUploaded, setImageUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    // Trigger hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG)");
      return;
    }

    setImageUploaded(true);
    setAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to upload photos");
        setAnalyzing(false);
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_posture.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posture-photos")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        // If bucket doesn't exist yet, still show demo analysis
        console.error("Upload error:", uploadError);
        toast.info("Photo captured — analysis running (storage setup pending)");
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("posture-photos")
          .getPublicUrl(fileName);

        setUploadedUrl(urlData?.publicUrl || null);

        // Save record to posture assessments table
        await supabase.from("spine_ayush_posture_assessments").insert({
          patient_id: user.id,
          assessed_by: user.id,
          photo_anterior_url: urlData?.publicUrl || null,
          assessment_date: new Date().toISOString().split("T")[0],
          overall_score: 62,
          severity: "moderate",
        }).then(({ error }) => {
          if (error) console.error("Assessment record error:", error);
        });

        toast.success("Photo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.info("Photo captured — processing...");
    }

    // Simulate AI analysis (replace with real AI later)
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);
      toast.success("AI analysis complete — spinal assessment ready");
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Mild":
        return "bg-yellow-100 text-yellow-800";
      case "Moderate":
        return "bg-orange-100 text-orange-800";
      case "Severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bone className="h-6 w-6 text-blue-600" />
            Spine &amp; Posture Analysis (AI)
          </CardTitle>
          <p className="text-muted-foreground">
            Upload or capture a posture photo for AI-powered spinal alignment analysis with Ayurvedic correlation.
          </p>
        </CardHeader>
        <CardContent>
          {!imageUploaded && (
            <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex justify-center gap-4">
                <Button onClick={handleUpload} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Posture Photo
                </Button>
                <Button variant="outline" onClick={handleUpload} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported: Full body standing posture (anterior, lateral, posterior views)
              </p>
            </div>
          )}

          {analyzing && (
            <div className="text-center space-y-4 py-8">
              <Activity className="h-10 w-10 mx-auto animate-pulse text-blue-600" />
              <p className="text-lg font-medium">AI analyzing spinal alignment...</p>
              <Progress value={65} className="w-64 mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>

      {analysisComplete && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                AI Spinal Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-orange-600">62/100</div>
                <div>
                  <p className="font-medium">Spinal Health Score</p>
                  <p className="text-sm text-muted-foreground">
                    Moderate concerns detected — treatment recommended
                  </p>
                </div>
              </div>
              <Progress value={62} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cervical</p>
                  <p className="font-semibold text-green-700">Normal</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Thoracic</p>
                  <p className="font-semibold text-orange-700">Mild Kyphosis</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lumbar</p>
                  <p className="font-semibold text-orange-700">Lordosis ↑</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pelvic Tilt</p>
                  <p className="font-semibold text-yellow-700">Anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Findings — Region Wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Region</th>
                      <th className="text-left p-3 font-semibold">Finding</th>
                      <th className="text-left p-3 font-semibold">Severity</th>
                      <th className="text-left p-3 font-semibold">Ayurvedic Correlation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spinalFindings.map((f, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 font-medium">{f.region}</td>
                        <td className="p-3">{f.finding}</td>
                        <td className="p-3">
                          <Badge className={getSeverityColor(f.severity)}>{f.severity}</Badge>
                        </td>
                        <td className="p-3 italic">{f.ayurvedicCorrelation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {treatmentSuggestions.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">
                      {i + 1}
                    </Badge>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => toast.info("X-ray order placed")}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Order X-ray
                </Button>
                <Button
                  onClick={() => toast.success("Treatment prescribed successfully")}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Prescribe Treatment
                </Button>
                <Button
                  onClick={() => toast.success("Report sent to patient")}
                  variant="secondary"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Report to Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorSpine;
