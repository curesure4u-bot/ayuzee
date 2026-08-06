import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText, Plus, Edit2, Copy, Eye, Trash2, Settings,
  Image, Type, Table, Columns, QrCode, Printer,
  CheckCircle2, Star, Download, Upload,
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  department: string;
  type: "Standard" | "Letterhead" | "Compact" | "Detailed" | "Smart" | "Custom";
  paperSize: "A4" | "A5" | "Letter";
  orientation: "Portrait" | "Landscape";
  headerType: "Full Logo" | "Compact" | "Minimal" | "No Header";
  footerType: "Full" | "Compact" | "Signature Only" | "No Footer";
  showQR: boolean;
  showAI: boolean;
  showTrends: boolean;
  showReference: boolean;
  showBarcode: boolean;
  colorScheme: "Green" | "Blue" | "Orange" | "Purple" | "Monochrome";
  isDefault: boolean;
  isActive: boolean;
  lastModified: string;
  usedCount: number;
}

interface TemplateSection {
  id: string;
  name: string;
  type: "header" | "patient-info" | "results-table" | "interpretation" | "ai-insight" | "signature" | "footer" | "qr-code" | "barcode" | "trend-graph" | "custom-text";
  enabled: boolean;
  order: number;
  config: Record<string, string | boolean>;
}

const mockTemplates: ReportTemplate[] = [
  { id: "t1", name: "Standard Lab Report", department: "All", type: "Standard", paperSize: "A4", orientation: "Portrait", headerType: "Full Logo", footerType: "Full", showQR: true, showAI: false, showTrends: false, showReference: true, showBarcode: true, colorScheme: "Green", isDefault: true, isActive: true, lastModified: "2026-07-20", usedCount: 1250 },
  { id: "t2", name: "Smart Report (Color-coded)", department: "All", type: "Smart", paperSize: "A4", orientation: "Portrait", headerType: "Full Logo", footerType: "Full", showQR: true, showAI: true, showTrends: true, showReference: true, showBarcode: true, colorScheme: "Blue", isDefault: false, isActive: true, lastModified: "2026-07-22", usedCount: 340 },
  { id: "t3", name: "Compact Receipt Report", department: "All", type: "Compact", paperSize: "A5", orientation: "Portrait", headerType: "Compact", footerType: "Signature Only", showQR: false, showAI: false, showTrends: false, showReference: true, showBarcode: true, colorScheme: "Monochrome", isDefault: false, isActive: true, lastModified: "2026-07-15", usedCount: 560 },
  { id: "t4", name: "Detailed Clinical Report", department: "BIOCHEMISTRY", type: "Detailed", paperSize: "A4", orientation: "Portrait", headerType: "Full Logo", footerType: "Full", showQR: true, showAI: true, showTrends: true, showReference: true, showBarcode: true, colorScheme: "Purple", isDefault: false, isActive: true, lastModified: "2026-07-18", usedCount: 180 },
  { id: "t5", name: "Microbiology Culture Report", department: "MICROBIOLOGY", type: "Custom", paperSize: "A4", orientation: "Portrait", headerType: "Full Logo", footerType: "Full", showQR: true, showAI: false, showTrends: false, showReference: false, showBarcode: true, colorScheme: "Green", isDefault: false, isActive: true, lastModified: "2026-07-10", usedCount: 95 },
  { id: "t6", name: "Radiology Report Template", department: "RADIOLOGY", type: "Custom", paperSize: "A4", orientation: "Landscape", headerType: "Compact", footerType: "Signature Only", showQR: false, showAI: true, showTrends: false, showReference: false, showBarcode: false, colorScheme: "Blue", isDefault: false, isActive: true, lastModified: "2026-07-12", usedCount: 72 },
];

const mockSections: TemplateSection[] = [
  { id: "sec1", name: "Header (Logo + Clinic Info)", type: "header", enabled: true, order: 1, config: { logoPosition: "left", showAddress: "true", showPhone: "true", showNABL: "true" } },
  { id: "sec2", name: "Patient Information", type: "patient-info", enabled: true, order: 2, config: { layout: "2-column", showAge: "true", showGender: "true", showReferredBy: "true", showSampleDate: "true" } },
  { id: "sec3", name: "Barcode", type: "barcode", enabled: true, order: 3, config: { position: "top-right" } },
  { id: "sec4", name: "Results Table", type: "results-table", enabled: true, order: 4, config: { showUnit: "true", showRange: "true", showFlag: "true", highlightAbnormal: "true", fontSize: "11px" } },
  { id: "sec5", name: "Interpretation", type: "interpretation", enabled: true, order: 5, config: { showBorder: "true" } },
  { id: "sec6", name: "AI Clinical Insight", type: "ai-insight", enabled: true, order: 6, config: { showIcon: "true", backgroundColor: "#f3e8ff" } },
  { id: "sec7", name: "Trend Graph", type: "trend-graph", enabled: false, order: 7, config: { maxHistory: "6" } },
  { id: "sec8", name: "QR Code (Verification)", type: "qr-code", enabled: true, order: 8, config: { position: "bottom-right", size: "60px" } },
  { id: "sec9", name: "Signature Block", type: "signature", enabled: true, order: 9, config: { showDesignation: "true", showDate: "true" } },
  { id: "sec10", name: "Footer (Contact + Disclaimer)", type: "footer", enabled: true, order: 10, config: { showDisclaimer: "true", fontSize: "8px" } },
];

const ReportTemplateBuilder = () => {
  const [templates] = useState<ReportTemplate[]>(mockTemplates);
  const [sections] = useState<TemplateSection[]>(mockSections);
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(mockTemplates[0]);

  const getColorDot = (color: string) => {
    const colors: Record<string, string> = { Green: "bg-green-500", Blue: "bg-blue-500", Orange: "bg-orange-500", Purple: "bg-purple-500", Monochrome: "bg-gray-500" };
    return colors[color] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><FileText className="h-5 w-5" /> Report Template Builder</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Template</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="templates">Templates</TabsTrigger><TabsTrigger value="builder">Section Builder</TabsTrigger><TabsTrigger value="settings">Global Settings</TabsTrigger></TabsList>

        {/* Templates List */}
        <TabsContent value="templates" className="space-y-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className={`cursor-pointer transition hover:shadow-md ${selectedTemplate?.id === tpl.id ? "border-orange-500" : ""}`} onClick={() => setSelectedTemplate(tpl)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${getColorDot(tpl.colorScheme)}`} />
                      <p className="text-sm font-medium">{tpl.name}</p>
                    </div>
                    {tpl.isDefault && <Badge className="bg-blue-100 text-blue-700 text-[9px]"><Star className="h-2.5 w-2.5 mr-0.5" /> Default</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                    <span>Dept: {tpl.department}</span>
                    <span>Type: {tpl.type}</span>
                    <span>Paper: {tpl.paperSize} {tpl.orientation}</span>
                    <span>Header: {tpl.headerType}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tpl.showQR && <Badge variant="outline" className="text-[8px]">QR</Badge>}
                    {tpl.showAI && <Badge variant="outline" className="text-[8px]">AI</Badge>}
                    {tpl.showTrends && <Badge variant="outline" className="text-[8px]">Trends</Badge>}
                    {tpl.showBarcode && <Badge variant="outline" className="text-[8px]">Barcode</Badge>}
                    {tpl.showReference && <Badge variant="outline" className="text-[8px]">Ref Range</Badge>}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                    <span>Used: {tpl.usedCount} reports</span>
                    <span>Modified: {tpl.lastModified}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Edit2 className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Copy className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Preview printed")}><Printer className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Section Builder */}
        <TabsContent value="builder" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Report Sections — Drag to Reorder</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <div key={section.id} className={`flex items-center gap-3 border rounded p-3 ${section.enabled ? "bg-white" : "bg-gray-50 opacity-60"}`}>
                  <div className="cursor-grab text-gray-400">⋮⋮</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{section.order}. {section.name}</span>
                      <Badge variant="outline" className="text-[8px]">{section.type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(section.config).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="text-[9px] text-muted-foreground">{key}: {String(val)}</span>
                      ))}
                    </div>
                  </div>
                  <Switch checked={section.enabled} />
                  <Button size="sm" variant="outline" className="h-6 text-[9px]"><Settings className="h-3 w-3" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full mt-2 text-xs border-dashed"><Plus className="mr-1 h-3 w-3" /> Add Custom Section</Button>
            </CardContent>
          </Card>

          {/* Quick Config */}
          {selectedTemplate && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Template Configuration — {selectedTemplate.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1"><label className="text-[10px] font-medium">Paper Size</label><Select defaultValue={selectedTemplate.paperSize}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="A5">A5</SelectItem><SelectItem value="Letter">Letter</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] font-medium">Orientation</label><Select defaultValue={selectedTemplate.orientation}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Portrait">Portrait</SelectItem><SelectItem value="Landscape">Landscape</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] font-medium">Color Scheme</label><Select defaultValue={selectedTemplate.colorScheme}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Green">Green</SelectItem><SelectItem value="Blue">Blue</SelectItem><SelectItem value="Orange">Orange</SelectItem><SelectItem value="Purple">Purple</SelectItem><SelectItem value="Monochrome">Monochrome</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] font-medium">Header Style</label><Select defaultValue={selectedTemplate.headerType}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full Logo">Full Logo</SelectItem><SelectItem value="Compact">Compact</SelectItem><SelectItem value="Minimal">Minimal</SelectItem><SelectItem value="No Header">No Header</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] font-medium">Footer Style</label><Select defaultValue={selectedTemplate.footerType}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full">Full</SelectItem><SelectItem value="Compact">Compact</SelectItem><SelectItem value="Signature Only">Signature Only</SelectItem><SelectItem value="No Footer">No Footer</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><label className="text-[10px] font-medium">Font Size</label><Select defaultValue="11"><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="9">9px (Compact)</SelectItem><SelectItem value="10">10px</SelectItem><SelectItem value="11">11px (Default)</SelectItem><SelectItem value="12">12px (Large)</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t text-xs">
                  <div className="flex items-center gap-2"><Switch defaultChecked={selectedTemplate.showQR} /><span>QR Code</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={selectedTemplate.showBarcode} /><span>Barcode</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={selectedTemplate.showAI} /><span>AI Insight</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={selectedTemplate.showTrends} /><span>Trend Graph</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked={selectedTemplate.showReference} /><span>Reference Ranges</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>AYUSH Correlation</span></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Template saved")}><CheckCircle2 className="mr-1 h-3 w-3" /> Save</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Preview generated")}><Eye className="mr-1 h-3 w-3" /> Preview</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Global Settings */}
        <TabsContent value="settings" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Global Report Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium">Lab Logo</label><div className="border-2 border-dashed rounded p-4 text-center"><Image className="h-6 w-6 mx-auto text-gray-400" /><p className="text-[10px] text-muted-foreground mt-1">Upload logo (PNG/JPG, max 500KB)</p><Button size="sm" variant="outline" className="mt-2 h-6 text-[10px]"><Upload className="h-3 w-3 mr-1" /> Upload</Button></div></div>
                <div className="space-y-2"><label className="text-xs font-medium">Digital Signature</label><div className="border-2 border-dashed rounded p-4 text-center"><FileText className="h-6 w-6 mx-auto text-gray-400" /><p className="text-[10px] text-muted-foreground mt-1">Upload signature image (PNG)</p><Button size="sm" variant="outline" className="mt-2 h-6 text-[10px]"><Upload className="h-3 w-3 mr-1" /> Upload</Button></div></div>
                <div className="space-y-2"><label className="text-xs font-medium">Lab Name (Header)</label><Input className="h-8 text-xs" defaultValue="AYUZEE DIAGNOSTICS" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Address</label><Input className="h-8 text-xs" defaultValue="#11, Main Road, Kadayanallur, TN - 627751" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">NABL Certificate No</label><Input className="h-8 text-xs" defaultValue="MC-XXXX" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Report Footer Text</label><Textarea className="text-xs min-h-[50px]" defaultValue="This is a computer-generated report. All results should be clinically correlated." /></div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Global settings saved")}>Save Global Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportTemplateBuilder;
