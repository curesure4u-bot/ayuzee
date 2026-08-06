import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  FileText,
  Pill,
  Salad,
  Activity,
  Calendar,
  FlaskConical,
  Plus,
  Sparkles,
  CheckCircle2,
  Edit,
  Search,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  condition: string;
  medicinesCount: number;
  dietIncluded: boolean;
  yogaIncluded: boolean;
}

const templates: Template[] = [
  { id: "1", name: "Diabetes OPD", condition: "Madhumeha (Type 2 DM)", medicinesCount: 6, dietIncluded: true, yogaIncluded: true },
  { id: "2", name: "Back Pain (Gridhrasi)", condition: "Gridhrasi / Sciatica", medicinesCount: 5, dietIncluded: true, yogaIncluded: true },
  { id: "3", name: "Knee Pain (Sandhivata)", condition: "Sandhivata / OA Knee", medicinesCount: 5, dietIncluded: true, yogaIncluded: true },
  { id: "4", name: "Rheumatoid Arthritis (Amavata)", condition: "Amavata / RA", medicinesCount: 7, dietIncluded: true, yogaIncluded: true },
  { id: "5", name: "Hypertension", condition: "Raktavata / HTN", medicinesCount: 4, dietIncluded: true, yogaIncluded: false },
  { id: "6", name: "Respiratory (Shwasa)", condition: "Shwasa / Bronchial Asthma", medicinesCount: 5, dietIncluded: true, yogaIncluded: true },
  { id: "7", name: "Panchakarma 7-Day Package", condition: "General Detox", medicinesCount: 6, dietIncluded: true, yogaIncluded: true },
  { id: "8", name: "Migraine (Ardhavabhedaka)", condition: "Ardhavabhedaka / Migraine", medicinesCount: 5, dietIncluded: true, yogaIncluded: false },
  { id: "9", name: "Skin Disease (Twak Vikara)", condition: "Twak Vikara / Psoriasis", medicinesCount: 6, dietIncluded: true, yogaIncluded: false },
  { id: "10", name: "Thyroid (Galaganda)", condition: "Galaganda / Hypothyroid", medicinesCount: 4, dietIncluded: true, yogaIncluded: true },
];

const amavataPreview = {
  chiefComplaint: "Joint pain, swelling, morning stiffness > 1 hour",
  diagnosis: "Amavata (Rheumatoid Arthritis) — Active phase",
  medicines: [
    { name: "Simhanada Guggulu", dose: "2 tabs", frequency: "BD", duration: "30 days" },
    { name: "Rasnasaptakam Kashayam", dose: "15ml", frequency: "BD (before food)", duration: "30 days" },
    { name: "Kottamchukkadi Taila", dose: "QS", frequency: "External application", duration: "30 days" },
    { name: "Ashwagandha Churna", dose: "3g", frequency: "HS with milk", duration: "30 days" },
    { name: "Amavatari Ras", dose: "1 tab", frequency: "BD", duration: "21 days" },
    { name: "Dashamoola Kwath", dose: "20ml", frequency: "BD", duration: "14 days" },
    { name: "Eranda Taila (Castor oil)", dose: "10ml", frequency: "HS (weekly purgation)", duration: "4 weeks" },
  ],
  dietChart: true,
  yogaPlan: true,
  followUp: 14,
  investigations: ["RA Factor", "Anti-CCP", "ESR", "CRP", "CBC", "LFT"],
};

const DoctorTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("4");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    toast.success("Template applied to current patient", {
      description: "All fields auto-filled. Review and modify as needed.",
    });
  };

  const handleCustomize = () => {
    toast.info("Opening template editor...", {
      description: "You can modify medicines, diet, and yoga plans.",
    });
  };

  const handleCreateNew = () => {
    toast.info("Create New Template", {
      description: "Start from scratch or duplicate an existing template.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Clinical Templates (AI Quick-fill)
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-built templates for common conditions — one click to auto-fill prescriptions
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates by name or condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id
                    ? "ring-2 ring-primary border-primary"
                    : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{template.condition}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Pill className="h-3 w-3 mr-1" />
                      {template.medicinesCount} medicines
                    </Badge>
                    {template.dietIncluded && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        <Salad className="h-3 w-3 mr-1" />
                        Diet
                      </Badge>
                    )}
                    {template.yogaIncluded && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                        <Activity className="h-3 w-3 mr-1" />
                        Yoga
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {selectedTemplate === "4" ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Template Preview: Amavata (RA)
                </CardTitle>
                <Badge className="w-fit bg-amber-100 text-amber-800">Auto-fill Preview</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{amavataPreview.chiefComplaint}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Diagnosis</p>
                  <p className="text-sm">{amavataPreview.diagnosis}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Medicines ({amavataPreview.medicines.length})
                  </p>
                  <div className="space-y-1">
                    {amavataPreview.medicines.map((med, idx) => (
                      <div key={idx} className="text-xs flex justify-between">
                        <span className="font-medium">{med.name}</span>
                        <span className="text-muted-foreground">
                          {med.dose} {med.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Diet Chart: Yes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Yoga Plan: Yes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    <span>Follow-up: {amavataPreview.followUp} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FlaskConical className="h-3 w-3 text-orange-500" />
                    <span>Investigations: {amavataPreview.investigations.length}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Investigations</p>
                  <div className="flex flex-wrap gap-1">
                    {amavataPreview.investigations.map((inv, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {inv}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={handleApply}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply to Current Patient
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleCustomize}>
                    <Edit className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a template to preview auto-fill details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Note */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-4 flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <p className="text-sm text-purple-800">
            <strong>AI learns from your prescribing patterns</strong> and suggests personalized templates.
            The more you prescribe, the smarter your templates become.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorTemplates;
