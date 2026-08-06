import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScanLine, Camera, CameraOff, Keyboard, Package, CheckCircle2 } from "lucide-react";
import type { ProductQRData } from "./QRCodeGenerator";

export interface ScannedProductResult {
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
}

interface QRBarcodeScannerProps {
  onScanned: (result: ScannedProductResult) => void;
  context?: "sale" | "grn" | "adjustment" | "issue" | "lookup";
  placeholder?: string;
}

const QRBarcodeScanner = ({ onScanned, context = "lookup", placeholder }: QRBarcodeScannerProps) => {
  const [mode, setMode] = useState<"camera" | "manual">("manual");
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [lastScanned, setLastScanned] = useState<ScannedProductResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Mock product database for lookup
  const mockProductDB: Record<string, ScannedProductResult> = {
    "P001": { productId: "P001", name: "Dasamoolarishtam 450ml", batch: "KAV-B2026-445", expiry: "2029-07-17", mrp: 185, manufacturer: "KOTTAKKAL" },
    "P002": { productId: "P002", name: "Simhanada Guggulu", batch: "KAV-B2026-112", expiry: "2028-07-17", mrp: 145, manufacturer: "KOTTAKKAL" },
    "P003": { productId: "P003", name: "Ksheerabala 101 Avarti", batch: "KAV-B2026-890", expiry: "2029-07-17", mrp: 450, manufacturer: "KOTTAKKAL" },
    "P004": { productId: "P004", name: "Aavarai Kudineer 50GM", batch: "3078", expiry: "2026-08-01", mrp: 65, manufacturer: "ALSHIFA" },
    "P005": { productId: "P005", name: "777 Soap", batch: "49", expiry: "2028-01-01", mrp: 79, manufacturer: "SANJEEVI" },
    "8901234567890": { productId: "P001", name: "Dasamoolarishtam 450ml", batch: "KAV-B2026-445", expiry: "2029-07-17", mrp: 185, manufacturer: "KOTTAKKAL" },
    "8901234567891": { productId: "P003", name: "Ksheerabala 101 Avarti", batch: "KAV-B2026-890", expiry: "2029-07-17", mrp: 450, manufacturer: "KOTTAKKAL" },
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
      setMode("camera");

      // Simulate scanning interval (in production, use a QR detection library like jsQR)
      intervalRef.current = window.setInterval(() => {
        // In production: capture frame from video, decode QR/barcode using jsQR or ZXing
        // For demo, we simulate a successful scan after a few seconds
      }, 500);

      toast.info("Camera active. Point at QR code or barcode...");
    } catch (err) {
      toast.error("Camera access denied. Use manual entry instead.");
      setMode("manual");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const processScannedData = (rawData: string) => {
    let result: ScannedProductResult | null = null;

    // Try parsing as JSON (QR code from our system)
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.t === "product" || parsed.type === "product") {
        result = {
          productId: parsed.id || parsed.productId || "",
          name: parsed.n || parsed.name || "",
          batch: parsed.b || parsed.batch || "",
          expiry: parsed.e || parsed.expiry || "",
          mrp: parsed.m || parsed.mrp || 0,
          manufacturer: parsed.mfr || parsed.manufacturer || "",
          nextPurchaseDate: parsed.np || parsed.nextPurchaseDate,
          dosage: parsed.d || parsed.dosage,
          frequency: parsed.f || parsed.frequency,
          instruction: parsed.i || parsed.instruction,
        };
      }
    } catch {
      // Not JSON - try as barcode/product code
      const lookup = mockProductDB[rawData] || mockProductDB[rawData.toUpperCase()];
      if (lookup) {
        result = lookup;
      }
    }

    if (result) {
      setLastScanned(result);
      onScanned(result);
      toast.success(`Scanned: ${result.name}`);
      stopCamera();
    } else {
      toast.error("Product not found. Check the code and try again.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processScannedData(manualInput.trim());
    setManualInput("");
  };

  // Simulate a scan for demo (in production, this would be triggered by the QR detection library)
  const handleSimulateScan = () => {
    const sampleCodes = Object.keys(mockProductDB);
    const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
    processScannedData(randomCode);
  };

  const contextLabels = {
    sale: "Scan product to add to sale bill",
    grn: "Scan product to add to GRN",
    adjustment: "Scan product for stock adjustment",
    issue: "Scan product to issue",
    lookup: "Scan to lookup product details",
  };

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-green-600" />
          QR / Barcode Scanner
          <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
            {context.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{contextLabels[context]}</p>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "camera" ? "default" : "outline"}
            onClick={() => { if (mode !== "camera") startCamera(); }}
            className={mode === "camera" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Camera className="mr-1 h-3 w-3" /> Camera Scan
          </Button>
          <Button
            size="sm"
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => { stopCamera(); setMode("manual"); }}
          >
            <Keyboard className="mr-1 h-3 w-3" /> Manual / Barcode Reader
          </Button>
        </div>

        {/* Camera View */}
        {mode === "camera" && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-48 object-cover" autoPlay playsInline muted />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-green-400 rounded-lg animate-pulse" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between">
              <Badge className="bg-green-600 text-xs">
                <ScanLine className="mr-1 h-3 w-3 animate-pulse" /> Scanning...
              </Badge>
              <Button size="sm" variant="secondary" className="h-6 text-xs" onClick={stopCamera}>
                <CameraOff className="mr-1 h-3 w-3" /> Stop
              </Button>
            </div>
            {/* Demo button - remove in production */}
            <Button size="sm" className="absolute top-2 right-2 h-6 text-xs bg-blue-600" onClick={handleSimulateScan}>
              Demo Scan
            </Button>
          </div>
        )}

        {/* Manual Entry */}
        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder={placeholder || "Enter barcode / product code / scan with reader..."}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 h-9"
              autoFocus
            />
            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 h-9">
              <ScanLine className="mr-1 h-4 w-4" /> Lookup
            </Button>
          </form>
        )}

        {/* Last Scanned Result */}
        {lastScanned && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Product Found</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><span className="text-muted-foreground">Name:</span> <strong>{lastScanned.name}</strong></div>
              <div><span className="text-muted-foreground">ID:</span> {lastScanned.productId}</div>
              <div><span className="text-muted-foreground">Batch:</span> {lastScanned.batch}</div>
              <div><span className="text-muted-foreground">Expiry:</span> {lastScanned.expiry}</div>
              <div><span className="text-muted-foreground">MRP:</span> ₹{lastScanned.mrp}</div>
              <div><span className="text-muted-foreground">Mfr:</span> {lastScanned.manufacturer}</div>
              {lastScanned.nextPurchaseDate && (
                <div className="col-span-2 text-orange-600 font-medium">Next Purchase: {lastScanned.nextPurchaseDate}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRBarcodeScanner;
