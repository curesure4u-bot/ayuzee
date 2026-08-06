import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, ScanLine, Printer } from "lucide-react";
import QRCodeGenerator from "./QRCodeGenerator";
import QRBarcodeScanner from "./QRBarcodeScanner";
import PatientMedicineQRLabel from "./PatientMedicineQRLabel";
import { toast } from "sonner";

const QRToolsPage = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" /> QR Code & Barcode Tools
        </h2>
        <p className="text-xs text-muted-foreground">Generate QR codes for products, scan barcodes for quick lookup, and print patient medicine labels</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="generate" className="flex items-center gap-1">
            <QrCode className="h-3 w-3" /> Generate QR
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-1">
            <ScanLine className="h-3 w-3" /> Scan
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-1">
            <Printer className="h-3 w-3" /> Patient Labels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <QRCodeGenerator onGenerated={() => toast.success("QR generated")} />
        </TabsContent>

        <TabsContent value="scan">
          <QRBarcodeScanner
            onScanned={(result) => toast.success(`Found: ${result.name} | Batch: ${result.batch} | MRP: ₹${result.mrp}`)}
            context="lookup"
          />
        </TabsContent>

        <TabsContent value="labels">
          <PatientMedicineQRLabel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRToolsPage;
