import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Printer,
  MessageCircle,
  Mail,
  Send,
  AlertTriangle,
  User,
  Building2,
  Stethoscope,
} from "lucide-react";

const DoctorReferral = () => {
  const [formData, setFormData] = useState({
    fromDoctor: "Dr. Mohamad Saleem — BAMS, MD (Kayachikitsa)",
    toDoctor: "Dr. Rajendra Prasad — MS (Ortho), FICS",
    toHospital: "Apollo Hospitals, Chennai",
    patientName: "Suresh Patel",
    patientAge: "58",
    patientGender: "Male",
    patientId: "P003",
    condition: "Chronic Gridhrasi (Sciatica) — not responding to Basti therapy",
    reasonForReferral: "MRI evaluation of lumbar spine to rule out disc herniation. Patient has completed 2 courses of Kati Basti + Tikta Ksheer Basti (16 days each) with partial relief. Persistent SLR positive at 30°. Requesting orthopaedic opinion for surgical candidacy assessment.",
    urgency: "urgent",
  });

  const [showPreview, setShowPreview] = useState(true);

  const clinicalSummary = `Patient Suresh Patel (58/M) presented 4 months ago with severe radiating pain from left buttock to left foot (L4-L5 dermatomal pattern). 

Ayurvedic Diagnosis: Gridhrasi (Vataja type with Kapha Avarana)
Modern Correlation: Lumbar Radiculopathy / Sciatica

Treatment Given:
1. Kati Basti with Mahanarayan Taila — 2 courses (14 days each)
2. Tikta Ksheer Basti — 16 days (Anuvasana + Niruha alternate)
3. Agnikarma on trigger points — 3 sittings
4. Internal medicines: Yogaraja Guggulu, Rasnasaptaka Kashayam, Ashwagandha Churna

Current Status:
- Pain reduced from 9/10 to 5/10 (partial response)
- SLR still positive at 30° on left side
- Numbness in left big toe persists
- No bladder/bowel involvement

Investigations Done:
- X-ray LS Spine: Reduced L4-L5 disc space, mild osteophytes
- Blood: ESR 22, CRP mildly elevated (8 mg/L)

Reason for Referral: MRI evaluation recommended. Requesting orthopaedic opinion regarding surgical candidacy if disc herniation confirmed.`;

  const handleUpdate = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    toast.success("Referral letter sent to printer");
  };

  const handleEmail = () => {
    toast.success("Referral letter sent via email to Dr. Rajendra Prasad");
  };

  const handleWhatsApp = () => {
    toast.success("Referral letter sent via WhatsApp");
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-100 text-red-700 border-red-300";
      case "urgent":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Referral Letter Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate professional referral letters with auto-filled clinical data
          </p>
        </div>
        <Badge className={getUrgencyColor(formData.urgency)}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
        </Badge>
      </div>

      {/* Referral Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <User className="h-3 w-3" /> From Doctor
              </Label>
              <Input
                value={formData.fromDoctor}
                onChange={(e) => handleUpdate("fromDoctor", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> To Doctor
              </Label>
              <Input
                value={formData.toDoctor}
                onChange={(e) => handleUpdate("toDoctor", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> To Hospital
              </Label>
              <Input
                value={formData.toHospital}
                onChange={(e) => handleUpdate("toHospital", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input
                value={formData.patientName}
                onChange={(e) => handleUpdate("patientName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Input
                value={formData.condition}
                onChange={(e) => handleUpdate("condition", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select value={formData.urgency} onValueChange={(val) => handleUpdate("urgency", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Referral</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.reasonForReferral}
              onChange={(e) => handleUpdate("reasonForReferral", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Clinical Summary
              <Badge variant="secondary" className="text-xs">Auto-filled from case sheet</Badge>
            </Label>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-gray-50 px-3 py-2 text-sm font-mono"
              value={clinicalSummary}
              readOnly
            />
          </div>

          <Button onClick={() => setShowPreview(true)} className="w-full md:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Preview Letter
          </Button>
        </CardContent>
      </Card>

      {/* Letter Preview */}
      {showPreview && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-lg">Letter Preview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg p-6 bg-white space-y-4 font-serif">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">AYUZEE AYURVEDA CLINIC</h2>
                <p className="text-sm text-gray-600">Integrated Ayurveda & Wellness Center</p>
                <p className="text-xs text-gray-500">123 Health Avenue, Chennai — 600001 | Ph: +91-9876543210</p>
              </div>

              <div className="flex justify-between text-sm">
                <span><strong>Ref No:</strong> REF/2024/0847</span>
                <span><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>

              <div className="space-y-1 text-sm">
                <p><strong>To,</strong></p>
                <p>{formData.toDoctor}</p>
                <p>{formData.toHospital}</p>
              </div>

              <div className="space-y-1 text-sm">
                <p><strong>Subject:</strong> Referral of Patient — {formData.patientName} ({formData.patientAge}/{formData.patientGender})</p>
                <p><strong>Priority:</strong> <span className={formData.urgency === "urgent" ? "text-orange-600 font-semibold" : formData.urgency === "emergency" ? "text-red-600 font-bold" : ""}>{formData.urgency.toUpperCase()}</span></p>
              </div>

              <Separator />

              <div className="text-sm space-y-2">
                <p>Respected Sir/Madam,</p>
                <p>
                  I am referring the above-named patient who has been under my care for the condition of <strong>{formData.condition}</strong>.
                </p>
                <p>{formData.reasonForReferral}</p>
              </div>

              <div className="text-sm space-y-2">
                <p><strong>Clinical Summary:</strong></p>
                <p className="whitespace-pre-line text-gray-700 bg-gray-50 p-3 rounded text-xs font-mono">
                  {clinicalSummary}
                </p>
              </div>

              <div className="text-sm space-y-2">
                <p>Kindly evaluate and advise further management. Please do not hesitate to contact me for any additional information.</p>
                <p>Thanking you,</p>
              </div>

              <div className="text-sm pt-4">
                <p><strong>{formData.fromDoctor}</strong></p>
                <p className="text-gray-600">Reg. No: KA-BAMS-2015-1234</p>
                <p className="text-gray-600">Ayuzee Ayurveda Clinic, Chennai</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Letter
              </Button>
              <Button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </Button>
              <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorReferral;
