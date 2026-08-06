import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QrCode, Download, Printer, Copy, Package, Calendar, Pill, Info } from "lucide-react";
import QRCode from "qrcode";

export interface ProductQRData {
  type: "product";
  productId: string;
  name: string;
  batch: string;
  expiry: string;
  mrp: number;
  manufacturer: string;
  nextPurchaseDate?: string;
  dosage?: string;
  frequency?: string;
  instruction?: string;
  duration?: string;
  storeUrl?: string;
}

interface QRCodeGeneratorProps {
  productData?: Partial<ProductQRData>;
  onGenerated?: (qrDataUrl: string, payload: ProductQRData) => void;
}

const QRCodeGenerator = ({ productData, onGenerated }: QRCodeGeneratorProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [payload, setPayload] = useState<ProductQRData>({
    type: "product",
    productId: productData?.productId || "",
    name: productData?.name || "",
    batch: productData?.batch || "",
    expiry: productData?.expiry || "",
    mrp: productData?.mrp || 0,
    manufacturer: productData?.manufacturer || "",
    nextPurchaseDate: productData?.nextPurchaseDate || "",
    dosage: productData?.dosage || "",
    frequency: productData?.frequency || "",
    instruction: productData?.instruction || "",
    duration: productData?.duration || "",
    storeUrl: productData?.storeUrl || "",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-calculate next purchase date based on duration
  useEffect(() => {
    if (payload.duration && !payload.nextPurchaseDate) {
      const days = parseInt(payload.duration) || 0;
      if (days > 0) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        setPayload((prev) => ({ ...prev, nextPurchaseDate: nextDate.toISOString().split("T")[0] }));
      }
    }
  }, [payload.duration]);

  const generateQR = async () => {
    if (!payload.name) {
      toast.error("Product name is required to generate QR");
      return;
    }

    try {
      // Create structured QR payload
      const qrPayload = JSON.stringify({
        t: "product",
        id: payload.productId,
        n: payload.name,
        b: payload.batch,
        e: payload.expiry,
        m: payload.mrp,
        mfr: payload.manufacturer,
        np: payload.nextPurchaseDate,
        d: payload.dosage,
        f: payload.frequency,
        i: payload.instruction,
        dur: payload.duration,
        url: payload.storeUrl,
      });

      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });

      setQrDataUrl(dataUrl);
      onGenerated?.(dataUrl, payload);
      toast.success("QR Code generated successfully");
    } catch (err) {
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `QR_${payload.name.replace(/\s+/g, "_")}_${payload.batch || "nobatch"}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("QR Code downloaded");
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Product QR - ${payload.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .label { border: 1px solid #ccc; padding: 15px; display: inline-block; max-width: 300px; }
              .product-name { font-size: 14px; font-weight: bold; margin: 8px 0 4px; }
              .details { font-size: 11px; color: #555; margin: 2px 0; }
              .next-purchase { font-size: 12px; color: #d35400; font-weight: bold; margin-top: 8px; padding: 4px 8px; border: 1px solid #d35400; border-radius: 4px; display: inline-block; }
              img { width: 200px; height: 200px; }
            </style>
          </head>
          <body>
            <div class="label">
              <img src="${qrDataUrl}" />
              <div class="product-name">${payload.name}</div>
              ${payload.batch ? `<div class="details">Batch: ${payload.batch} | Exp: ${payload.expiry}</div>` : ""}
              ${payload.manufacturer ? `<div class="details">Mfr: ${payload.manufacturer}</div>` : ""}
              ${payload.dosage ? `<div class="details">Dosage: ${payload.dosage} | ${payload.frequency || ""}</div>` : ""}
              ${payload.instruction ? `<div class="details">${payload.instruction}</div>` : ""}
              ${payload.nextPurchaseDate ? `<div class="next-purchase">Next Purchase: ${payload.nextPurchaseDate}</div>` : ""}
              ${payload.mrp ? `<div class="details" style="margin-top:6px">MRP: ₹${payload.mrp}</div>` : ""}
              <div class="details" style="margin-top:8px;font-size:9px;color:#999">Scan QR for product details & reorder</div>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success("QR data copied to clipboard");
  };

  const updateField = (field: keyof ProductQRData, value: any) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          Product QR Code Generator
          <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs ml-2">
            Smart Label
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Product Name *</Label>
              <Input value={payload.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g., Dasamoolarishtam 450ml" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Batch No</Label>
                <Input value={payload.batch} onChange={(e) => updateField("batch", e.target.value)} placeholder="Batch" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Expiry Date</Label>
                <Input type="date" value={payload.expiry} onChange={(e) => updateField("expiry", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">MRP (₹)</Label>
                <Input type="number" value={payload.mrp || ""} onChange={(e) => updateField("mrp", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Manufacturer</Label>
                <Input value={payload.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} placeholder="Manufacturer" />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-orange-600 mb-2 flex items-center gap-1">
                <Pill className="h-3 w-3" /> Usage Instructions (for patient QR)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Dosage</Label>
                  <Input value={payload.dosage} onChange={(e) => updateField("dosage", e.target.value)} placeholder="e.g., 15ml" className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Frequency</Label>
                  <Input value={payload.frequency} onChange={(e) => updateField("frequency", e.target.value)} placeholder="e.g., 1-0-1" className="h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Instruction</Label>
                  <Select value={payload.instruction} onValueChange={(v) => updateField("instruction", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before Food">Before Food</SelectItem>
                      <SelectItem value="After Food">After Food</SelectItem>
                      <SelectItem value="With Food">With Food</SelectItem>
                      <SelectItem value="Empty Stomach">Empty Stomach</SelectItem>
                      <SelectItem value="At Bedtime">At Bedtime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Duration (days)</Label>
                  <Input value={payload.duration} onChange={(e) => updateField("duration", e.target.value)} placeholder="e.g., 30" className="h-8 text-xs" />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Next Purchase / Refill Date
              </p>
              <Input type="date" value={payload.nextPurchaseDate} onChange={(e) => updateField("nextPurchaseDate", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Auto-calculated from duration if left blank. Patient scans QR to see when to refill.</p>
            </div>

            <Button onClick={generateQR} className="w-full bg-blue-600 hover:bg-blue-700">
              <QrCode className="mr-2 h-4 w-4" /> Generate QR Code
            </Button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <div className="text-center space-y-3">
                <div className="border rounded-lg p-4 bg-white inline-block">
                  <img src={qrDataUrl} alt="Product QR Code" className="w-48 h-48" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{payload.name}</p>
                  {payload.batch && <p className="text-xs text-muted-foreground">Batch: {payload.batch} | Exp: {payload.expiry}</p>}
                  {payload.nextPurchaseDate && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      Next Purchase: {payload.nextPurchaseDate}
                    </p>
                  )}
                  {payload.dosage && (
                    <p className="text-xs text-muted-foreground">
                      {payload.dosage} | {payload.frequency} | {payload.instruction}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="mr-1 h-3 w-3" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="mr-1 h-3 w-3" /> Print Label
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopyPayload}>
                    <Copy className="mr-1 h-3 w-3" /> Copy Data
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg w-full">
                <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-muted-foreground">QR code preview will appear here</p>
                <p className="text-xs text-muted-foreground mt-1">Fill in product details and click Generate</p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>QR Code contains:</strong> Product name, batch, expiry, MRP, manufacturer, dosage instructions, next purchase date.
            Patients can scan to see usage info and get reminders for their next refill. Staff can scan for instant product lookup in stock system.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
