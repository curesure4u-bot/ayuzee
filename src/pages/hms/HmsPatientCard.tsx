import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard, QrCode, Printer, Download, Search, User,
  Phone, Calendar, MapPin, Heart, Shield
} from "lucide-react";

type PatientCardData = {
  id: string;
  uhid: string;
  name: string;
  phone: string;
  dob: string;
  gender: string;
  blood_group: string;
  allergies: string[];
  city: string;
  photo_url?: string;
  registration_date: string;
  prakriti?: string;
  insurance?: string;
  emergency_contact: string;
};

const mockPatient: PatientCardData = {
  id: "pat-001",
  uhid: "AYU-2026-00142",
  name: "Rajesh Kumar Sharma",
  phone: "+91 98765 43210",
  dob: "1985-03-15",
  gender: "Male",
  blood_group: "B+",
  allergies: ["Penicillin", "Sulfa drugs"],
  city: "Mumbai, Maharashtra",
  registration_date: "2024-06-10",
  prakriti: "Vata-Pitta",
  insurance: "Star Health - Policy #SH20260045",
  emergency_contact: "+91 87654 32100",
};

const HmsPatientCard = () => {
  const [patient] = useState<PatientCardData>(mockPatient);
  const [searchPhone, setSearchPhone] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (!searchPhone.trim()) return toast.error("Enter phone number to search");
    toast.success("Patient found: " + patient.name);
  };

  const handlePrint = () => {
    if (cardRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>Patient Card - ${patient.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; padding: 20px; }
            .card { width: 340px; border: 2px solid #0f766e; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f766e, #059669); color: white; padding: 12px 16px; text-align: center; }
            .header h2 { margin: 0; font-size: 14px; letter-spacing: 1px; }
            .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.9; }
            .body { padding: 16px; }
            .name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
            .uhid { font-size: 12px; color: #666; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
            .label { color: #666; } .value { font-weight: 600; }
            .qr { text-align: center; margin: 12px 0 8px; }
            .qr-box { display: inline-block; width: 80px; height: 80px; border: 2px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; }
            .allergies { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 6px 10px; margin-top: 8px; font-size: 10px; color: #991b1b; }
            .footer { background: #f0fdf4; padding: 8px 16px; font-size: 9px; text-align: center; color: #166534; border-top: 1px solid #dcfce7; }
          </style></head><body>
          <div class="card">
            <div class="header"><h2>AYUZEE HEALTH CARD</h2><p>Powered by Ayuzee AYUSH Aggregator</p></div>
            <div class="body">
              <div class="name">${patient.name}</div>
              <div class="uhid">UHID: ${patient.uhid}</div>
              <div class="row"><span class="label">DOB:</span><span class="value">${patient.dob}</span></div>
              <div class="row"><span class="label">Gender:</span><span class="value">${patient.gender}</span></div>
              <div class="row"><span class="label">Blood Group:</span><span class="value">${patient.blood_group}</span></div>
              <div class="row"><span class="label">Phone:</span><span class="value">${patient.phone}</span></div>
              <div class="row"><span class="label">Prakriti:</span><span class="value">${patient.prakriti || "—"}</span></div>
              <div class="row"><span class="label">Emergency:</span><span class="value">${patient.emergency_contact}</span></div>
              <div class="qr"><div class="qr-box">QR Code<br/>${patient.uhid}</div></div>
              ${patient.allergies.length > 0 ? `<div class="allergies">⚠️ Allergies: ${patient.allergies.join(", ")}</div>` : ""}
            </div>
            <div class="footer">Scan QR at any Ayuzee partner clinic for instant check-in · Valid across all branches</div>
          </div></body></html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    toast.success("Print dialog opened");
  };

  const handleDownload = () => {
    toast.success("Patient card PDF download initiated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> Patient Health Card
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate printable ID cards with QR code for instant check-in at any branch
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-sm">
              <Label className="text-xs">Search Patient by Phone / UHID</Label>
              <Input value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="Enter phone number or UHID..." />
            </div>
            <Button onClick={handleSearch}><Search className="mr-1 h-4 w-4" /> Find</Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Preview + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Card Preview */}
        <div ref={cardRef}>
          <Card className="overflow-hidden border-2 border-primary/30 max-w-sm mx-auto">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white p-4 text-center">
              <h2 className="text-sm font-bold tracking-wider uppercase">Ayuzee Health Card</h2>
              <p className="text-xs opacity-80 mt-0.5">Powered by Ayuzee AYUSH Aggregator</p>
            </div>
            {/* Card Body */}
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center border-2 border-primary/20">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{patient.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">UHID: {patient.uhid}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-medium">{patient.dob}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{patient.gender}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-muted-foreground">Blood:</span>
                  <span className="font-bold text-red-600">{patient.blood_group}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{patient.city}</span>
                </div>
                {patient.prakriti && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Prakriti:</span>
                    <Badge variant="secondary" className="text-xs h-5">{patient.prakriti}</Badge>
                  </div>
                )}
              </div>

              {/* QR Code Area */}
              <div className="flex justify-center py-2">
                <div className="border-2 border-dashed border-muted rounded-lg p-4 flex flex-col items-center gap-1">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground font-mono">{patient.uhid}</p>
                </div>
              </div>

              {/* Allergies Warning */}
              {patient.allergies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs text-red-800">
                  ⚠️ <span className="font-semibold">Allergies:</span> {patient.allergies.join(", ")}
                </div>
              )}

              {/* Insurance */}
              {patient.insurance && (
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-xs text-blue-800 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  {patient.insurance}
                </div>
              )}
            </CardContent>
            {/* Card Footer */}
            <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-2 text-center">
              <p className="text-[10px] text-emerald-700">Scan QR at any Ayuzee partner clinic for instant check-in · Valid across all branches</p>
            </div>
          </Card>
        </div>

        {/* Actions & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Card Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print Card (Credit Card Size)
              </Button>
              <Button className="w-full" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
              <Button className="w-full" variant="outline" onClick={() => toast.success("WhatsApp card link sent to patient")}>
                <Phone className="mr-2 h-4 w-4" /> Send via WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>1. Patient receives this card (printed or digital via WhatsApp)</p>
              <p>2. At any Ayuzee partner clinic, staff scans the QR code</p>
              <p>3. Patient profile auto-loads — no re-registration needed</p>
              <p>4. Works across all branches and partner clinics on the platform</p>
              <p className="text-primary font-medium mt-3">Aggregator Integration: Patient booked on Ayuzee app can show this card at clinic for instant OPD token generation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HmsPatientCard;
