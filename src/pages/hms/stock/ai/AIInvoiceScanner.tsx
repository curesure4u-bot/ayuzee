import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ScanLine, Upload, Camera, FileText, Brain, CheckCircle2,
  AlertTriangle, Loader2, Sparkles, Eye, RotateCcw, Zap,
} from "lucide-react";

export interface ExtractedInvoiceData {
  supplier: {
    name: string;
    gstNo: string;
    invoiceNo: string;
    invoiceDate: string;
    phone?: string;
    address?: string;
  };
  products: {
    name: string;
    matchedProductId?: string;
    matchConfidence: number;
    hsn?: string;
    batch: string;
    expiryDate: string;
    qty: number;
    freeQty?: number;
    rate: number;
    mrp: number;
    discPercent: number;
    taxPercent: number;
    total: number;
  }[];
  totals: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    grandTotal: number;
  };
  rawText?: string;
  confidence: number;
}

interface AIInvoiceScannerProps {
  onExtracted: (data: ExtractedInvoiceData) => void;
  context?: "grn" | "po" | "quotation";
}

const AIInvoiceScanner = ({ onExtracted, context = "grn" }: AIInvoiceScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an image (JPG, PNG, WebP) or PDF file");
      return;
    }

    // Show preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    await processInvoice(file);
  }, []);

  const handleCameraCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // In production, this would open a camera modal
      // For now, simulate with file input
      stream.getTracks().forEach(t => t.stop());
      toast.info("Camera capture - use the upload button to select an image for now");
    } catch {
      toast.error("Camera not available. Please upload an image instead.");
    }
  }, []);

  const processInvoice = async (file: File) => {
    setScanning(true);
    setProgress(0);
    setStage("Uploading invoice...");

    // Simulate AI processing pipeline stages
    const stages = [
      { label: "Preprocessing image...", progress: 15 },
      { label: "AI OCR: Extracting text from invoice...", progress: 35 },
      { label: "AI NLP: Identifying supplier details...", progress: 50 },
      { label: "AI: Parsing product line items...", progress: 65 },
      { label: "AI: Matching products to database...", progress: 80 },
      { label: "AI: Validating totals & cross-checking...", progress: 90 },
      { label: "Complete! Invoice data extracted.", progress: 100 },
    ];

    for (const s of stages) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setStage(s.label);
      setProgress(s.progress);
    }

    // Simulate extracted data (in production, this calls the AI/OCR API)
    const mockExtracted: ExtractedInvoiceData = {
      supplier: {
        name: "KOTTAKKAL ARYA VAIDYA SALA",
        gstNo: "32AABCK1234F1ZP",
        invoiceNo: "KAV/2026/INV-4521",
        invoiceDate: "2026-07-18",
        phone: "0483-2742216",
        address: "Kottakkal, Malappuram, Kerala",
      },
      products: [
        { name: "Dasamoolarishtam 450ml", matchedProductId: "P001", matchConfidence: 0.96, hsn: "3004", batch: "KAV-B2026-445", expiryDate: "2029-07-17", qty: 50, rate: 142, mrp: 185, discPercent: 5, taxPercent: 12, total: 7100 },
        { name: "Ksheerabala 101 Avarti 200ml", matchedProductId: "P003", matchConfidence: 0.92, hsn: "3004", batch: "KAV-B2026-890", expiryDate: "2029-07-17", qty: 20, rate: 365, mrp: 450, discPercent: 3, taxPercent: 12, total: 7300 },
        { name: "Dhanwantharam Tailam 200ml", matchedProductId: undefined, matchConfidence: 0.78, hsn: "3004", batch: "KAV-B2026-334", expiryDate: "2028-07-17", qty: 30, rate: 255, mrp: 320, discPercent: 5, taxPercent: 12, total: 7650 },
        { name: "Simhanada Guggulu Tablets", matchedProductId: "P002", matchConfidence: 0.94, hsn: "3004", batch: "KAV-B2026-112", expiryDate: "2028-07-17", qty: 100, freeQty: 10, rate: 98, mrp: 145, discPercent: 8, taxPercent: 12, total: 9800 },
        { name: "Rasnasaptakam Kashayam 200ml", matchedProductId: undefined, matchConfidence: 0.72, hsn: "3004", batch: "KAV-B2026-667", expiryDate: "2027-07-17", qty: 40, rate: 135, mrp: 175, discPercent: 5, taxPercent: 12, total: 5400 },
      ],
      totals: {
        subtotal: 37250,
        taxAmount: 4470,
        discountAmount: 2100,
        grandTotal: 39620,
      },
      rawText: "KOTTAKKAL ARYA VAIDYA SALA\nInvoice No: KAV/2026/INV-4521\nDate: 18/07/2026\nGSTIN: 32AABCK1234F1ZP\n...\n[Full OCR text would appear here]",
      confidence: 0.91,
    };

    setExtractedData(mockExtracted);
    setScanning(false);
    toast.success("Invoice scanned successfully! Review extracted data below.");
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExtracted(extractedData);
      toast.success("Data applied to form. Review and save.");
    }
  };

  const handleRetry = () => {
    setExtractedData(null);
    setPreview(null);
    setProgress(0);
    setStage("");
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Invoice Scanner
          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs ml-2">
            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered OCR
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!scanning && !extractedData && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white/50">
            <ScanLine className="h-10 w-10 mx-auto text-blue-500 mb-3" />
            <p className="text-sm font-medium mb-1">Upload or Scan Invoice</p>
            <p className="text-xs text-muted-foreground mb-4">
              AI will auto-extract supplier, products, batch, expiry, prices & totals
            </p>
            <div className="flex items-center justify-center gap-3">
              <label>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span><Upload className="mr-1 h-4 w-4" /> Upload Image/PDF</span>
                </Button>
              </label>
              <Button variant="outline" onClick={handleCameraCapture}>
                <Camera className="mr-1 h-4 w-4" /> Camera Scan
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Supports: JPG, PNG, WebP, PDF | Max 10MB
            </p>
          </div>
        )}

        {/* Scanning Progress */}
        {scanning && (
          <div className="bg-white rounded-lg p-6 text-center space-y-3">
            <Loader2 className="h-8 w-8 mx-auto text-purple-600 animate-spin" />
            <p className="text-sm font-medium text-purple-700">{stage}</p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
            {preview && (
              <img src={preview} alt="Invoice preview" className="max-h-32 mx-auto rounded opacity-50 mt-3" />
            )}
          </div>
        )}

        {/* Extracted Results */}
        {extractedData && !scanning && (
          <div className="space-y-4">
            {/* Confidence Score */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">AI Extraction Complete</span>
              </div>
              <Badge className={`${extractedData.confidence >= 0.9 ? "bg-green-600" : extractedData.confidence >= 0.8 ? "bg-amber-600" : "bg-red-600"}`}>
                {Math.round(extractedData.confidence * 100)}% Confidence
              </Badge>
            </div>

            {/* Supplier Info */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Supplier (Auto-Detected)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div><span className="text-xs text-muted-foreground">Name:</span><br/><strong>{extractedData.supplier.name}</strong></div>
                <div><span className="text-xs text-muted-foreground">Invoice No:</span><br/><strong>{extractedData.supplier.invoiceNo}</strong></div>
                <div><span className="text-xs text-muted-foreground">Date:</span><br/><strong>{extractedData.supplier.invoiceDate}</strong></div>
                <div><span className="text-xs text-muted-foreground">GST:</span><br/><strong>{extractedData.supplier.gstNo}</strong></div>
                {extractedData.supplier.phone && <div><span className="text-xs text-muted-foreground">Phone:</span><br/><strong>{extractedData.supplier.phone}</strong></div>}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Products ({extractedData.products.length} items detected)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 py-1 text-left">Product</th>
                      <th className="px-2 py-1 text-left">Match</th>
                      <th className="px-2 py-1">Batch</th>
                      <th className="px-2 py-1">Expiry</th>
                      <th className="px-2 py-1">Qty</th>
                      <th className="px-2 py-1">Rate</th>
                      <th className="px-2 py-1">MRP</th>
                      <th className="px-2 py-1">Tax%</th>
                      <th className="px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.products.map((p, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1 font-medium max-w-[150px] truncate">{p.name}</td>
                        <td className="px-2 py-1">
                          {p.matchedProductId ? (
                            <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> {Math.round(p.matchConfidence * 100)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> New
                            </Badge>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center font-mono">{p.batch}</td>
                        <td className="px-2 py-1 text-center">{p.expiryDate}</td>
                        <td className="px-2 py-1 text-center">{p.qty}{p.freeQty ? `+${p.freeQty}` : ""}</td>
                        <td className="px-2 py-1 text-center">₹{p.rate}</td>
                        <td className="px-2 py-1 text-center">₹{p.mrp}</td>
                        <td className="px-2 py-1 text-center">{p.taxPercent}%</td>
                        <td className="px-2 py-1 text-center font-medium">₹{p.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="grid grid-cols-4 gap-3 text-sm text-center">
                <div><span className="text-xs text-muted-foreground">Subtotal</span><br/><strong>₹{extractedData.totals.subtotal.toLocaleString()}</strong></div>
                <div><span className="text-xs text-muted-foreground">Tax</span><br/><strong>₹{extractedData.totals.taxAmount.toLocaleString()}</strong></div>
                <div><span className="text-xs text-muted-foreground">Discount</span><br/><strong>₹{extractedData.totals.discountAmount.toLocaleString()}</strong></div>
                <div><span className="text-xs text-muted-foreground">Grand Total</span><br/><strong className="text-green-600">₹{extractedData.totals.grandTotal.toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Raw Text Toggle */}
            {extractedData.rawText && (
              <div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowRawText(!showRawText)}>
                  <Eye className="mr-1 h-3 w-3" /> {showRawText ? "Hide" : "Show"} Raw OCR Text
                </Button>
                {showRawText && (
                  <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded mt-2 max-h-32 overflow-y-auto">
                    {extractedData.rawText}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 flex-1">
                <Zap className="mr-1 h-4 w-4" /> Apply to {context === "grn" ? "GRN" : context === "po" ? "Purchase Order" : "Quotation"} Form
              </Button>
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-1 h-4 w-4" /> Scan Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInvoiceScanner;
