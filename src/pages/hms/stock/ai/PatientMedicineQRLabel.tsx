import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QrCode, Printer, Plus, Trash2, Calendar, Pill, User } from "lucide-react";
import QRCode from "qrcode";

interface MedicineLabel {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  instruction: string;
  duration: string;
  nextRefillDate: string;
  qrDataUrl: string;
}

interface PatientMedicineQRLabelProps {
  patientName?: string;
  patientId?: string;
  consultantName?: string;
  prescriptionDate?: string;
}

const PatientMedicineQRLabel = ({
  patientName = "",
  patientId = "",
  consultantName = "",
  prescriptionDate = new Date().toISOString().split("T")[0],
}: PatientMedicineQRLabelProps) => {
  const [patient, setPatient] = useState(patientName);
  const [pId, setPId] = useState(patientId);
  const [doctor, setDoctor] = useState(consultantName);
  const [labels, setLabels] = useState<MedicineLabel[]>([]);
  const [newLabel, setNewLabel] = useState({
    medicineName: "", dosage: "", frequency: "1-0-1", instruction: "After Food", duration: "30",
  });

  const calculateRefillDate = (duration: string) => {
    const days = parseInt(duration) || 30;
    const refill = new Date();
    refill.setDate(refill.getDate() + days - 3); // 3 days before end of medication
    return refill.toISOString().split("T")[0];
  };

  const handleAddLabel = async () => {
    if (!newLabel.medicineName) { toast.error("Medicine name required"); return; }

    const refillDate = calculateRefillDate(newLabel.duration);

    // Generate QR containing patient medication info
    const qrPayload = JSON.stringify({
      t: "refill",
      p: patient,
      pid: pId,
      med: newLabel.medicineName,
      dos: newLabel.dosage,
      freq: newLabel.frequency,
      inst: newLabel.instruction,
      dur: newLabel.duration,
      refill: refillDate,
      dr: doctor,
      dt: prescriptionDate,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: "M",
      });

      const label: MedicineLabel = {
        id: Date.now().toString(),
        medicineName: newLabel.medicineName,
        dosage: newLabel.dosage,
        frequency: newLabel.frequency,
        instruction: newLabel.instruction,
        duration: newLabel.duration,
        nextRefillDate: refillDate,
        qrDataUrl,
      };

      setLabels([...labels, label]);
      setNewLabel({ medicineName: "", dosage: "", frequency: "1-0-1", instruction: "After Food", duration: "30" });
      toast.success(`Label created for ${label.medicineName}`);
    } catch {
      toast.error("Failed to generate QR");
    }
  };

  const handleRemoveLabel = (id: string) => {
    setLabels(labels.filter((l) => l.id !== id));
  };

  const handlePrintAll = () => {
    if (labels.length === 0) { toast.error("Add at least one medicine label"); return; }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const labelsHtml = labels.map((l) => `
        <div class="label">
          <div class="label-header">
            <img src="${l.qrDataUrl}" class="qr" />
            <div class="label-info">
              <div class="med-name">${l.medicineName}</div>
              <div class="dosage">${l.dosage} | ${l.frequency} | ${l.instruction}</div>
              <div class="duration">Duration: ${l.duration} days</div>
              <div class="refill">Next Refill: <strong>${l.nextRefillDate}</strong></div>
            </div>
          </div>
          <div class="patient-info">
            Patient: ${patient} ${pId ? `(${pId})` : ""} | Dr: ${doctor}
          </div>
          <div class="scan-note">Scan QR for refill reminder & reorder</div>
        </div>
      `).join("");

      printWindow.document.write(`
        <html>
          <head><title>Medicine Labels - ${patient}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 10px; }
              .label { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; page-break-inside: avoid; max-width: 400px; border-radius: 6px; }
              .label-header { display: flex; gap: 10px; align-items: flex-start; }
              .qr { width: 80px; height: 80px; }
              .label-info { flex: 1; }
              .med-name { font-size: 14px; font-weight: bold; color: #333; }
              .dosage { font-size: 11px; color: #555; margin-top: 3px; }
              .duration { font-size: 11px; color: #555; margin-top: 2px; }
              .refill { font-size: 12px; color: #d35400; margin-top: 4px; padding: 3px 6px; background: #fef3e2; border-radius: 3px; display: inline-block; }
              .patient-info { font-size: 10px; color: #888; margin-top: 6px; padding-top: 4px; border-top: 1px solid #eee; }
              .scan-note { font-size: 9px; color: #aaa; margin-top: 4px; text-align: center; }
              @media print { .label { border: 1px solid #000; } }
            </style>
          </head>
          <body>
            <h3 style="text-align:center;margin-bottom:15px;">Medicine Labels - ${patient}</h3>
            ${labelsHtml}
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-5 w-5 text-orange-600" />
          Patient Medicine QR Labels
          <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs ml-2">
            Refill & Dosage
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <Label className="text-xs">Patient Name</Label>
            <Input className="h-8 text-xs" value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Patient Name" />
          </div>
          <div>
            <Label className="text-xs">Patient ID</Label>
            <Input className="h-8 text-xs" value={pId} onChange={(e) => setPId(e.target.value)} placeholder="AL-XXXXX" />
          </div>
          <div>
            <Label className="text-xs">Consultant</Label>
            <Input className="h-8 text-xs" value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Name" />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input className="h-8 text-xs" type="date" value={prescriptionDate} readOnly />
          </div>
        </div>

        {/* Add Medicine Label */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs font-semibold mb-2">Add Medicine Label</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="sm:col-span-2">
              <Input className="h-8 text-xs" placeholder="Medicine Name" value={newLabel.medicineName} onChange={(e) => setNewLabel({ ...newLabel, medicineName: e.target.value })} />
            </div>
            <div>
              <Input className="h-8 text-xs" placeholder="Dosage (e.g., 15ml)" value={newLabel.dosage} onChange={(e) => setNewLabel({ ...newLabel, dosage: e.target.value })} />
            </div>
            <div>
              <Input className="h-8 text-xs" placeholder="Freq (1-0-1)" value={newLabel.frequency} onChange={(e) => setNewLabel({ ...newLabel, frequency: e.target.value })} />
            </div>
            <div>
              <Input className="h-8 text-xs" placeholder="Days" value={newLabel.duration} onChange={(e) => setNewLabel({ ...newLabel, duration: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <select className="h-8 text-xs border rounded px-2" value={newLabel.instruction} onChange={(e) => setNewLabel({ ...newLabel, instruction: e.target.value })}>
              <option value="Before Food">Before Food</option>
              <option value="After Food">After Food</option>
              <option value="With Food">With Food</option>
              <option value="Empty Stomach">Empty Stomach</option>
              <option value="At Bedtime">At Bedtime</option>
            </select>
            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={handleAddLabel}>
              <Plus className="mr-1 h-3 w-3" /> Add Label
            </Button>
          </div>
        </div>

        {/* Generated Labels Preview */}
        {labels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">{labels.length} Labels Ready</p>
              <Button size="sm" onClick={handlePrintAll} className="bg-orange-600 hover:bg-orange-700">
                <Printer className="mr-1 h-3 w-3" /> Print All Labels
              </Button>
            </div>
            {labels.map((label) => (
              <div key={label.id} className="flex items-center gap-3 border rounded p-2 bg-white">
                <img src={label.qrDataUrl} alt="QR" className="w-12 h-12" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{label.medicineName}</p>
                  <p className="text-xs text-muted-foreground">{label.dosage} | {label.frequency} | {label.instruction} | {label.duration} days</p>
                  <p className="text-xs text-orange-600">Refill: {label.nextRefillDate}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 h-7" onClick={() => handleRemoveLabel(label.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-700">
          <strong>How it works:</strong> Each medicine gets a QR label. Patient scans the QR with their phone to see dosage instructions and gets a reminder when it's time to refill. The QR links to your pharmacy for easy reorder.
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientMedicineQRLabel;
