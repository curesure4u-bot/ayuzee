import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Printer, Building2, MapPin, ImageIcon, Save } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PrintMargins = { top: number; right: number; bottom: number; left: number };
type PrintUnit = "mm" | "px" | "in";

type PrintConfig = {
  entityLogoHeight: number;
  entityLogoWidth: number;
  entityHeaderNameFont: number;
  entityHeaderAddressFont: number;
  entityHeaderAddressFont2: number;
  fontSize: number;
  headerFontSize: number;
  subHeadingFontSize: number;
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  watermark: string;
  margins: PrintMargins;
  marginUnit: PrintUnit;
  includeOptions: Record<string, boolean>;
  excludeOptions: Record<string, boolean>;
  jsRules: string;
  cssRules: string;
  signature: string;
  enableSilentPrint: boolean;
  includeLetterhead: boolean;
  includeHeaderLogo: boolean;
  title: string;
  heightBetweenHeaderAndParticulars: number;
  template: string;
  notes: string;
  estimateNote: string;
};

const defaultConfig: PrintConfig = {
  entityLogoHeight: 100,
  entityLogoWidth: 17,
  entityHeaderNameFont: 22,
  entityHeaderAddressFont: 14,
  entityHeaderAddressFont2: 11,
  fontSize: 12,
  headerFontSize: 14,
  subHeadingFontSize: 17,
  fontFamily: "Calibri",
  lineHeight: 1.4,
  letterSpacing: 1,
  watermark: "Duplicate",
  margins: { top: 5, right: 5, bottom: 5, left: 5 },
  marginUnit: "mm",
  includeOptions: {},
  excludeOptions: {},
  jsRules: "",
  cssRules: "",
  signature: "Authorized Signature",
  enableSilentPrint: false,
  includeLetterhead: false,
  includeHeaderLogo: false,
  title: "",
  heightBetweenHeaderAndParticulars: 6,
  template: "Format 1",
  notes: "",
  estimateNote: "",
};

// ─── Department Configuration Definitions ─────────────────────────────────────
const DEPARTMENTS = [
  { id: "general", label: "General" },
  { id: "lab", label: "Lab" },
  { id: "ip", label: "IP" },
  { id: "op", label: "OP" },
  { id: "stocks", label: "Stocks" },
  { id: "accounts", label: "Accounts" },
  { id: "prescription", label: "Prescription" },
  { id: "patient", label: "Patient" },
  { id: "reports", label: "Reports" },
  { id: "art", label: "ART" },
] as const;

type DepartmentId = typeof DEPARTMENTS[number]["id"];

// Sub-tabs per department
const DEPARTMENT_SUBTABS: Record<DepartmentId, { id: string; label: string }[]> = {
  general: [
    { id: "logo-header", label: "Logo & Header" },
    { id: "font-settings", label: "Font Settings" },
    { id: "include-exclude", label: "Include/Exclude" },
    { id: "print-margins", label: "Print & Margins" },
  ],
  lab: [
    { id: "barcode", label: "Barcode" },
    { id: "work-list", label: "Work List" },
    { id: "trf", label: "TRF" },
    { id: "lab-report", label: "Lab" },
    { id: "lab-order", label: "Lab Order" },
    { id: "template-module", label: "Template Module" },
    { id: "batch-sheet", label: "Batch Sheet" },
  ],
  ip: [
    { id: "admission-slip", label: "Admission Slip" },
    { id: "ip-admission-barcode", label: "IP Admission Barcode" },
    { id: "attendar-pass", label: "Attendar Pass" },
    { id: "ip-visit", label: "IP Visit" },
    { id: "ip-bill", label: "IP Bill" },
    { id: "ip-spot-bill", label: "IP Spot Bill" },
    { id: "advance-receipt", label: "Advance Receipt" },
    { id: "ip-estimate", label: "IP Estimate" },
    { id: "discharge-summary", label: "Discharge Summary" },
    { id: "clinical-summary", label: "Clinical Summary" },
    { id: "ward-request", label: "Ward Request" },
    { id: "patient-handover", label: "Patient Handover Summary" },
    { id: "blood-request", label: "Blood Request" },
    { id: "emergency-assessment", label: "Emergency Assessment Sheet" },
    { id: "insurance-coverage", label: "Insurance Coverage" },
  ],
  op: [
    { id: "token", label: "Token" },
    { id: "empty-casesheet", label: "Empty Casesheet" },
    { id: "op-visit", label: "OP Visit" },
    { id: "op-bill", label: "OP Bill" },
    { id: "refund", label: "Refund" },
  ],
  stocks: [
    { id: "stock-bill", label: "Stock Bill" },
    { id: "po-grn", label: "PO / GRN" },
    { id: "pr", label: "PR" },
    { id: "gdn-indent", label: "GDN / Indent" },
    { id: "issue", label: "Issue" },
    { id: "optical-work-order", label: "Optical Work Order" },
    { id: "print-label", label: "Print Label" },
    { id: "product-barcode", label: "Product Barcode" },
  ],
  accounts: [
    { id: "invoice", label: "Invoice" },
    { id: "expense-income", label: "Expense/Income" },
    { id: "estimate-print", label: "Estimate Print" },
    { id: "print-envelope", label: "Print Envelope" },
  ],
  prescription: [
    { id: "prescription-print", label: "Prescription" },
  ],
  patient: [
    { id: "patient-id", label: "Patient ID" },
    { id: "patient-info", label: "Patient Info" },
  ],
  reports: [
    { id: "reports-general", label: "Reports" },
  ],
  art: [
    { id: "art-general", label: "ART" },
  ],
};

// Include/Exclude options per department
const INCLUDE_OPTIONS: Record<DepartmentId, string[]> = {
  general: ["Header Logo", "Header URL", "Patient ID Barcode", "Ip List Date Range", "Ip List Patient Type Categories Total", "Discharge List Date Range", "Discharge List Patient Categories Total"],
  lab: ["Result Column", "SampleID", "Profile TestName", "Patient Age", "Patient Gender", "Sample Temperature", "Location Name", "IP No", "Ward", "Room No"],
  ip: ["ID Proof", "Patient ID Barcode", "Consultant Name", "Printed ID Barcode", "Patient ID Barcode Left Align", "ID Registration", "Provider", "Patient Address", "Patient Photo", "Room", "Admission Date", "Age", "Gender", "Consultant"],
  op: ["Patient ID Barcode", "InTime", "Appt Time", "Age", "Gender", "Token No", "OP No"],
  stocks: ["Short Code", "Current Stock After Dispatch", "Current Stock Before Dispatch", "Show Name In GRN Footer", "Indent No", "MRP", "Product Batch Code"],
  accounts: ["OP Covered Price", "Bill Amount", "Discount Amount"],
  prescription: ["Patient ID Proof", "Printed By", "Visit Type", "Printed At", "Dr Department", "Brought By", "Patient ID Barcode", "Double Leaflet", "Page No", "Watermark"],
  patient: ["Street", "Area", "City", "State", "Zip", "Patient Photo", "Registration Date", "Age", "Gender", "MobileNo", "BloodGroup", "Patient ID Proof", "Patient ID Barcode", "DOB"],
  reports: ["Include Logo", "Patient ID Barcode"],
  art: ["Header Logo"],
};

const EXCLUDE_OPTIONS: Record<DepartmentId, string[]> = {
  general: ["Entity Name", "Entity Address", "Entity Header"],
  lab: ["Type", "Patient Name", "Patient ID", "Test IDs", "Sample ID", "Sample Type", "Sample Taken Time"],
  ip: ["Entity Header", "Entity Header Name", "Entity Header Address", "Age/Gender", "Relationship", "Marital Status", "Fluency", "Referred by", "Issue No", "Company Details", "Dimension", "Contact Address", "Attendant", "MLC/Medico-legal", "Provision", "Discharge", "Condition on Discharge", "Consultant", "Duty Consultant", "Advance Amount", "Attendar Details"],
  op: ["InTime", "Appt Time", "Patient ID Barcode", "Age", "Gender", "Token No", "OP No", "Entity Name"],
  stocks: ["Tax", "Total", "Free", "Discount", "Product Code", "External Code", "Mfr", "Ordered Qty", "Balance Qty"],
  accounts: ["Estimate Note", "Tax"],
  prescription: ["Registration status", "Mobile", "IP No", "Age/Gender", "Address", "Reg No", "Duty Dr", "Consulting Doctor", "Referred by", "Co-Morbidity", "Clinical Findings", "Last Food taken", "Provisional Diagnosis", "History", "Advices", "BHI No", "Category", "Provider"],
  patient: ["Patient IDs", "Address", "Referred By", "Occupation", "Languages Known", "Economic Criteria", "Credit Info", "Species", "Marital Status", "Patient Breed", "Registration Date", "Patient Caste", "Gender", "Mobile No", "Blood Group", "Patient ID Proof", "DOB", "Relationship", "Patient Tag"],
  reports: ["Entity Header", "Entity Header Name", "Entity Header Address"],
  art: ["Entity Header", "Entity Name", "Entity Address"],
};

// ─── Reusable Sub-Components ──────────────────────────────────────────────────

const MarginFields = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-sm">Print</h4>
    <p className="text-xs text-muted-foreground">Margin:</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <div key={side}>
          <Label className="text-xs capitalize">{side} Margin</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              className="h-8"
              value={config.margins[side]}
              onChange={(e) => onChange({ ...config, margins: { ...config.margins, [side]: Number(e.target.value) } })}
            />
            <span className="text-xs text-muted-foreground">{config.marginUnit}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeaderFields = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Entity Header Logo Height</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.entityLogoHeight} onChange={(e) => onChange({ ...config, entityLogoHeight: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Entity Logo Width</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.entityLogoWidth} onChange={(e) => onChange({ ...config, entityLogoWidth: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Entity Header Name Font</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.entityHeaderNameFont} onChange={(e) => onChange({ ...config, entityHeaderNameFont: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Entity Header Address Font</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.entityHeaderAddressFont} onChange={(e) => onChange({ ...config, entityHeaderAddressFont: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Entity Header Address Font2</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.entityHeaderAddressFont2} onChange={(e) => onChange({ ...config, entityHeaderAddressFont2: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Height between header and particulars</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.heightBetweenHeaderAndParticulars} onChange={(e) => onChange({ ...config, heightBetweenHeaderAndParticulars: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">mm</span>
        </div>
      </div>
    </div>
  </div>
);

const FontFields = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Font Size</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.fontSize} onChange={(e) => onChange({ ...config, fontSize: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Header Font Size</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.headerFontSize} onChange={(e) => onChange({ ...config, headerFontSize: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Font Family</Label>
        <Select value={config.fontFamily} onValueChange={(v) => onChange({ ...config, fontFamily: v })}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Calibri">Calibri</SelectItem>
            <SelectItem value="verdana">Verdana</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Sans-Serif">Sans-Serif</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Line Height</Label>
        <Input type="number" step="0.1" className="h-8" value={config.lineHeight} onChange={(e) => onChange({ ...config, lineHeight: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">Letter Spacing (Dot matrix)</Label>
        <div className="flex items-center gap-1">
          <Input type="number" className="h-8" value={config.letterSpacing} onChange={(e) => onChange({ ...config, letterSpacing: Number(e.target.value) })} />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Watermark - Duplicate</Label>
        <Input className="h-8" value={config.watermark} onChange={(e) => onChange({ ...config, watermark: e.target.value })} />
      </div>
    </div>
  </div>
);

const IncludeExcludeFields = ({ config, onChange, department }: { config: PrintConfig; onChange: (c: PrintConfig) => void; department: DepartmentId }) => {
  const includes = INCLUDE_OPTIONS[department] || [];
  const excludes = EXCLUDE_OPTIONS[department] || [];

  return (
    <div className="space-y-4">
      {includes.length > 0 && (
        <div>
          <Label className="text-xs font-semibold">Include:</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {includes.map((opt) => (
              <div key={opt} className="flex items-center gap-1.5">
                <Checkbox
                  id={`inc-${opt}`}
                  checked={config.includeOptions[opt] || false}
                  onCheckedChange={(checked) => onChange({
                    ...config,
                    includeOptions: { ...config.includeOptions, [opt]: !!checked },
                  })}
                />
                <label htmlFor={`inc-${opt}`} className="text-xs cursor-pointer">{opt}</label>
              </div>
            ))}
          </div>
        </div>
      )}
      {excludes.length > 0 && (
        <div>
          <Label className="text-xs font-semibold">Exclude:</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {excludes.map((opt) => (
              <div key={opt} className="flex items-center gap-1.5">
                <Checkbox
                  id={`exc-${opt}`}
                  checked={config.excludeOptions[opt] || false}
                  onCheckedChange={(checked) => onChange({
                    ...config,
                    excludeOptions: { ...config.excludeOptions, [opt]: !!checked },
                  })}
                />
                <label htmlFor={`exc-${opt}`} className="text-xs cursor-pointer">{opt}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RulesFields = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3">
    <div>
      <Label className="text-xs">JS Rules</Label>
      <Textarea
        rows={4}
        className="font-mono text-xs"
        placeholder="Custom JavaScript rules for print rendering..."
        value={config.jsRules}
        onChange={(e) => onChange({ ...config, jsRules: e.target.value })}
      />
    </div>
    <div>
      <Label className="text-xs">CSS Rules</Label>
      <Textarea
        rows={4}
        className="font-mono text-xs"
        placeholder="Custom CSS overrides for print layout..."
        value={config.cssRules}
        onChange={(e) => onChange({ ...config, cssRules: e.target.value })}
      />
    </div>
  </div>
);

const SignatureField = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div>
    <Label className="text-xs">Signature:</Label>
    <Select value={config.signature} onValueChange={(v) => onChange({ ...config, signature: v })}>
      <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="Authorized Signature">Authorized Signature</SelectItem>
        <SelectItem value="Doctor Signature">Doctor Signature</SelectItem>
        <SelectItem value="Admin Signature">Admin Signature</SelectItem>
        <SelectItem value="None">None</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const PrintFooterOptions = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3 border-t pt-4">
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={config.includeHeaderLogo}
          onCheckedChange={(c) => onChange({ ...config, includeHeaderLogo: !!c })}
        />
        <span className="text-xs">Include: Entity Header Logo</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-4">
      <span className="text-xs font-medium">Exclude:</span>
      <div className="flex items-center gap-2">
        <Checkbox checked={config.excludeOptions["Entity Header"] || false}
          onCheckedChange={(c) => onChange({ ...config, excludeOptions: { ...config.excludeOptions, "Entity Header": !!c } })} />
        <span className="text-xs">Entity Header</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={config.excludeOptions["Entity Header Name"] || false}
          onCheckedChange={(c) => onChange({ ...config, excludeOptions: { ...config.excludeOptions, "Entity Header Name": !!c } })} />
        <span className="text-xs">Entity Header Name</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={config.excludeOptions["Entity Header Address"] || false}
          onCheckedChange={(c) => onChange({ ...config, excludeOptions: { ...config.excludeOptions, "Entity Header Address": !!c } })} />
        <span className="text-xs">Entity Header Address</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox checked={config.includeLetterhead} onCheckedChange={(c) => onChange({ ...config, includeLetterhead: !!c })} />
      <span className="text-xs">Include Letterhead in Print</span>
    </div>
  </div>
);

const EmailSettings = ({ config, onChange }: { config: PrintConfig; onChange: (c: PrintConfig) => void }) => (
  <div className="space-y-3 border-t pt-4">
    <h4 className="font-semibold text-sm">Email</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <div key={side}>
          <Label className="text-xs capitalize">{side} Margin</Label>
          <div className="flex items-center gap-1">
            <Input type="number" className="h-8" defaultValue={side === "top" ? 20 : 0} />
            <span className="text-xs text-muted-foreground">mm</span>
          </div>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap gap-4 mt-2">
      <span className="text-xs font-medium">Include:</span>
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked />
        <span className="text-xs">Header Logo</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-4">
      <span className="text-xs font-medium">Exclude:</span>
      <div className="flex items-center gap-2">
        <Checkbox />
        <span className="text-xs">Entity Header Name</span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox />
        <span className="text-xs">Entity Header Address</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox />
      <span className="text-xs">Include Letterhead for Soft Copy</span>
    </div>
  </div>
);

// ─── Department Form Content ──────────────────────────────────────────────────

const DepartmentConfigForm = ({ department, subTab, config, onChange }: {
  department: DepartmentId;
  subTab: string;
  config: PrintConfig;
  onChange: (c: PrintConfig) => void;
}) => {
  // General department - shows full form
  if (department === "general") {
    return (
      <div className="space-y-6">
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        <IncludeExcludeFields config={config} onChange={onChange} department={department} />
        <RulesFields config={config} onChange={onChange} />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
      </div>
    );
  }

  // Lab department
  if (department === "lab") {
    if (subTab === "barcode") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
            <Label className="text-xs">Enable Silent Print</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Paper ID</Label><Input className="h-8" defaultValue="101" /></div>
            <div><Label className="text-xs">Paper Name</Label><Input className="h-8" defaultValue="MocDocLabelated" /></div>
            <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="13" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Weight</Label>
              <Select defaultValue="Bold"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Bold">Bold</SelectItem><SelectItem value="Normal">Normal</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Font Family</Label><Input className="h-8" value={config.fontFamily} onChange={(e) => onChange({ ...config, fontFamily: e.target.value })} /></div>
            <div><Label className="text-xs">Line Height</Label><Input type="number" step="0.1" className="h-8" value={config.lineHeight} onChange={(e) => onChange({ ...config, lineHeight: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="57" /><span className="text-xs text-muted-foreground">mm</span></div></div>
            <div><Label className="text-xs">Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="25" /><span className="text-xs text-muted-foreground">mm</span></div></div>
            <div><Label className="text-xs">Barcode Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="250" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Barcode Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="40" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Bar Height</Label><Input type="number" className="h-8" defaultValue="40" /></div>
            <div><Label className="text-xs">Bar Width</Label><Input type="number" step="0.1" className="h-8" defaultValue="2.0" /></div>
            <div><Label className="text-xs">Module Size</Label><Input type="number" className="h-8" defaultValue="5" /></div>
            <div><Label className="text-xs">Barcode Generation Type</Label>
              <Select defaultValue="Canvas"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Canvas">Canvas</SelectItem><SelectItem value="SVG">SVG</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <IncludeExcludeFields config={config} onChange={onChange} department="lab" />
          <RulesFields config={config} onChange={onChange} />
        </div>
      );
    }
    // Other lab sub-tabs
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
          <Label className="text-xs">Enable Silent Print</Label>
        </div>
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        <IncludeExcludeFields config={config} onChange={onChange} department="lab" />
        <RulesFields config={config} onChange={onChange} />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
      </div>
    );
  }

  // IP department
  if (department === "ip") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
          <Label className="text-xs">Enable Silent Print</Label>
        </div>
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        {subTab === "clinical-summary" && (
          <div className="space-y-3">
            <div><Label className="text-xs">Entity Name Font Color</Label><Input className="h-8" type="color" defaultValue="#000000" /></div>
            <div><Label className="text-xs">Notes</Label><Textarea rows={3} placeholder="Notes for clinical summary..." /></div>
          </div>
        )}
        <IncludeExcludeFields config={config} onChange={onChange} department="ip" />
        <RulesFields config={config} onChange={onChange} />
        <SignatureField config={config} onChange={onChange} />
        {(subTab === "discharge-summary" || subTab === "clinical-summary") && (
          <div className="space-y-2">
            <Label className="text-xs">Disable It Sign:</Label>
            <p className="text-xs text-muted-foreground">Note: This option is applicable only when signature is set as "Authorized Signature"</p>
          </div>
        )}
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
        {(subTab === "discharge-summary" || subTab === "ip-bill") && <EmailSettings config={config} onChange={onChange} />}
      </div>
    );
  }

  // OP department
  if (department === "op") {
    if (subTab === "token") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
            <Label className="text-xs">Enable Silent Print</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Hospital name Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="25" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Token Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="32" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="18" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Family</Label><Input className="h-8" value={config.fontFamily} onChange={(e) => onChange({ ...config, fontFamily: e.target.value })} /></div>
          </div>
          <IncludeExcludeFields config={config} onChange={onChange} department="op" />
          <RulesFields config={config} onChange={onChange} />
          <MarginFields config={config} onChange={onChange} />
          <PrintFooterOptions config={config} onChange={onChange} />
        </div>
      );
    }
    // OP Visit / OP Bill / Refund
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
          <Label className="text-xs">Enable Silent Print</Label>
        </div>
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        {subTab === "op-visit" && (
          <div className="space-y-3">
            <Label className="text-xs">Consultation Title</Label>
            <Input className="h-8" defaultValue="" placeholder="e.g. Consultation Receipt" />
          </div>
        )}
        <IncludeExcludeFields config={config} onChange={onChange} department="op" />
        <RulesFields config={config} onChange={onChange} />
        <SignatureField config={config} onChange={onChange} />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
        {subTab === "op-bill" && <EmailSettings config={config} onChange={onChange} />}
      </div>
    );
  }

  // Stocks department
  if (department === "stocks") {
    if (subTab === "product-barcode") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="10" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Family</Label><Input className="h-8" defaultValue="verdana" /></div>
            <div><Label className="text-xs">Label Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="100" /><span className="text-xs text-muted-foreground">%</span></div></div>
            <div><Label className="text-xs">Label Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="20" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Barcode Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="100" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Barcode Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="60" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Bar Width</Label><Input type="number" step="0.1" className="h-8" defaultValue="1.4" /></div>
            <div><Label className="text-xs">Bar Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="40" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Module Size</Label><Input type="number" className="h-8" defaultValue="5" /></div>
            <div><Label className="text-xs">QR Code Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="60" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">QR Code Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="42" /><span className="text-xs text-muted-foreground">px</span></div></div>
          </div>
          <IncludeExcludeFields config={config} onChange={onChange} department="stocks" />
          <RulesFields config={config} onChange={onChange} />
          <MarginFields config={config} onChange={onChange} />
        </div>
      );
    }
    // Stock Bill, PO/GRN, PR, GDN/Indent, Issue, Optical Work Order, Print Label
    return (
      <div className="space-y-6">
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        <IncludeExcludeFields config={config} onChange={onChange} department="stocks" />
        {subTab === "stock-bill" && (
          <div className="space-y-2">
            <Label className="text-xs">GRN Footer Note:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input className="h-8" placeholder="Created By" />
              <Input className="h-8" placeholder="Saved By" />
              <Input className="h-8" placeholder="Serviced By" />
            </div>
          </div>
        )}
        <RulesFields config={config} onChange={onChange} />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
        {subTab === "stock-bill" && <EmailSettings config={config} onChange={onChange} />}
      </div>
    );
  }

  // Accounts department
  if (department === "accounts") {
    if (subTab === "print-envelope") {
      return (
        <div className="space-y-6">
          <h4 className="font-medium text-sm">Print</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox />
              <span className="text-xs">Exclude: Bill Amount</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox />
              <span className="text-xs">Exclude: Discount Amount</span>
            </div>
          </div>
        </div>
      );
    }
    if (subTab === "estimate-print") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Entity Name Font</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="22" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Entity Address Font</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="14" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Entity Address Font2</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="11" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Line Height</Label><Input type="number" step="0.1" className="h-8" defaultValue="1.4" /></div>
            <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="11" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Family</Label><Input className="h-8" defaultValue="verdana" /></div>
          </div>
          <SignatureField config={config} onChange={onChange} />
          <RulesFields config={config} onChange={onChange} />
          <MarginFields config={config} onChange={onChange} />
          <PrintFooterOptions config={config} onChange={onChange} />
        </div>
      );
    }
    // Invoice, Expense/Income
    return (
      <div className="space-y-6">
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        <IncludeExcludeFields config={config} onChange={onChange} department="accounts" />
        <div>
          <Label className="text-xs">Estimate Note:</Label>
          <Textarea rows={3} className="text-xs" placeholder="Note: This estimate is generated as requested for information purpose only. The final amount may vary depending on actual service/medications." value={config.estimateNote} onChange={(e) => onChange({ ...config, estimateNote: e.target.value })} />
        </div>
        <RulesFields config={config} onChange={onChange} />
        <SignatureField config={config} onChange={onChange} />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
        <EmailSettings config={config} onChange={onChange} />
      </div>
    );
  }

  // Prescription department
  if (department === "prescription") {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-xs">Prescription Title</Label>
          <Input className="h-8" placeholder="Prescription Title" value={config.title} onChange={(e) => onChange({ ...config, title: e.target.value })} />
        </div>
        <HeaderFields config={config} onChange={onChange} />
        <FontFields config={config} onChange={onChange} />
        <IncludeExcludeFields config={config} onChange={onChange} department="prescription" />
        <div>
          <Label className="text-xs">Instructions</Label>
          <Textarea rows={3} className="text-xs" placeholder="Default instructions to appear on prescriptions..." />
        </div>
        <RulesFields config={config} onChange={onChange} />
        <SignatureField config={config} onChange={onChange} />
        <div className="space-y-2">
          <Label className="text-xs">Disable It Sign:</Label>
          <p className="text-xs text-muted-foreground">Note: This option is applicable only when signature is set as "Authorized Signature"</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs">Template:</Label>
            <Select defaultValue="Format 1"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Format 1">Format 1</SelectItem><SelectItem value="Format 2">Format 2</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Select Width</Label>
            <div className="flex gap-1 flex-wrap">
              {["1-Input", "2-Input", "3-GP", "4-Singhaniya", "5-SMS", "6-Hopedyley Salis", "7-Ruby", "8-Scan", "9-MedReach", "10-FormatV2"].map((f) => (
                <Button key={f} variant="outline" size="sm" className="text-[10px] h-6 px-1.5">{f}</Button>
              ))}
            </div>
          </div>
        </div>
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
        <EmailSettings config={config} onChange={onChange} />
      </div>
    );
  }

  // Patient department
  if (department === "patient") {
    if (subTab === "patient-id") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
            <Label className="text-xs">Enable Silent Print</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Entity Logo Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="30" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Entity Logo Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="70" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="15" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Entity Name Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="16" /><span className="text-xs text-muted-foreground">px</span></div></div>
            <div><Label className="text-xs">Entity Name Font Color</Label><Input className="h-8" type="color" defaultValue="#000000" /></div>
            <div><Label className="text-xs">Font Family</Label><Input className="h-8" defaultValue="Calibri" /></div>
          </div>
          <IncludeExcludeFields config={config} onChange={onChange} department="patient" />
          <RulesFields config={config} onChange={onChange} />
          <div><Label className="text-xs">Notes</Label><Textarea rows={3} className="text-xs" placeholder="Card print notes..." /></div>
          <MarginFields config={config} onChange={onChange} />
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="text-xs font-medium">Include:</span>
            <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Logo</span></div>
            <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Name</span></div>
            <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Address</span></div>
          </div>
        </div>
      );
    }
    // Patient Info
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={config.enableSilentPrint} onCheckedChange={(c) => onChange({ ...config, enableSilentPrint: c })} />
          <Label className="text-xs">Enable Silent Print</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs">Entity Logo Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="30" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Logo Width</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="70" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="10" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Name Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="16" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Name Font Color</Label><Input className="h-8" type="color" defaultValue="#000000" /></div>
          <div><Label className="text-xs">Font Family</Label><Input className="h-8" defaultValue="Calibri" /></div>
        </div>
        <IncludeExcludeFields config={config} onChange={onChange} department="patient" />
        <RulesFields config={config} onChange={onChange} />
        <div><Label className="text-xs">Notes</Label><Textarea rows={3} className="text-xs" placeholder="Additional notes..." /></div>
        <MarginFields config={config} onChange={onChange} />
        <div className="flex flex-wrap gap-4 mt-2">
          <span className="text-xs font-medium">Include:</span>
          <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Logo</span></div>
          <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Name</span></div>
          <div className="flex items-center gap-2"><Checkbox /><span className="text-xs">Entity Address</span></div>
        </div>
      </div>
    );
  }

  // Reports department
  if (department === "reports") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs">Header Logo Height</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="130" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Name Font</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="22" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Address Font</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="14" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Entity Address Font 2</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="11" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="12" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Header Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="14" /><span className="text-xs text-muted-foreground">px</span></div></div>
        </div>
        <div>
          <Label className="text-xs">Font Weight (Dot matrix)</Label>
          <Input className="h-8" defaultValue="normal" />
        </div>
        <div>
          <Label className="text-xs">Font Family (Dot matrix)</Label>
          <Input className="h-8" defaultValue="verdana" />
        </div>
        <div>
          <Label className="text-xs">Line Height (Dot matrix)</Label>
          <Input type="number" step="0.1" className="h-8" defaultValue="0.9" />
        </div>
        <div>
          <Label className="text-xs">Letter Spacing (Dot matrix)</Label>
          <div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="1" /><span className="text-xs text-muted-foreground">px</span></div>
        </div>
        <IncludeExcludeFields config={config} onChange={onChange} department="reports" />
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
      </div>
    );
  }

  // ART department
  if (department === "art") {
    return (
      <div className="space-y-6">
        <HeaderFields config={config} onChange={onChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-xs">Font Size</Label><div className="flex items-center gap-1"><Input type="number" className="h-8" defaultValue="10" /><span className="text-xs text-muted-foreground">px</span></div></div>
          <div><Label className="text-xs">Font Family</Label><Input className="h-8" defaultValue="Calibri" /></div>
        </div>
        <MarginFields config={config} onChange={onChange} />
        <PrintFooterOptions config={config} onChange={onChange} />
      </div>
    );
  }

  // Fallback
  return (
    <div className="space-y-6">
      <HeaderFields config={config} onChange={onChange} />
      <FontFields config={config} onChange={onChange} />
      <IncludeExcludeFields config={config} onChange={onChange} department={department} />
      <RulesFields config={config} onChange={onChange} />
      <MarginFields config={config} onChange={onChange} />
      <PrintFooterOptions config={config} onChange={onChange} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HmsPrintConfiguration = () => {
  const [managementTab, setManagementTab] = useState("entity-wise");
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>("general");
  const [activeSubTab, setActiveSubTab] = useState("logo-header");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [config, setConfig] = useState<PrintConfig>(defaultConfig);

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "tenkasi", name: "Tenkasi" },
    { id: "kadayanallur", name: "#11, Main Road, Kadayanallur" },
    { id: "rajapalayam", name: "Rajapalayam" },
    { id: "chennai", name: "Chennai - Keelkattalai" },
    { id: "tirunelveli", name: "Tirunelveli" },
    { id: "theni", name: "Theni" },
  ];

  const handleDepartmentChange = (dept: string) => {
    const d = dept as DepartmentId;
    setActiveDepartment(d);
    const subtabs = DEPARTMENT_SUBTABS[d];
    if (subtabs.length > 0) setActiveSubTab(subtabs[0].id);
  };

  const handleSave = () => {
    toast.success(`Print configuration saved for ${activeDepartment.toUpperCase()} - ${activeSubTab}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Printer className="h-6 w-6 text-orange-500" /> Print Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure print layouts for all hospital documents across entities and locations
          </p>
        </div>
      </div>

      {/* Management Level Tabs: Entity-wise / Location-wise / Manage Image */}
      <Tabs value={managementTab} onValueChange={setManagementTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="entity-wise" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Manage Entity wise
          </TabsTrigger>
          <TabsTrigger value="location-wise" className="flex items-center gap-1.5 text-orange-600 data-[state=active]:text-orange-600">
            <MapPin className="h-3.5 w-3.5" /> Manage Location wise
          </TabsTrigger>
          <TabsTrigger value="manage-image" className="flex items-center gap-1.5 text-orange-600 data-[state=active]:text-orange-600">
            <ImageIcon className="h-3.5 w-3.5" /> Manage Image
          </TabsTrigger>
        </TabsList>

        {/* ═══════ ENTITY WISE TAB ═══════ */}
        <TabsContent value="entity-wise" className="mt-4 space-y-4">
          {/* Department Tabs */}
          <Tabs value={activeDepartment} onValueChange={handleDepartmentChange}>
            <TabsList className="flex-wrap h-auto gap-0.5">
              {DEPARTMENTS.map((dept) => (
                <TabsTrigger key={dept.id} value={dept.id} className="text-xs">
                  {dept.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {DEPARTMENTS.map((dept) => (
              <TabsContent key={dept.id} value={dept.id} className="mt-3">
                {/* Sub-tabs within department */}
                {DEPARTMENT_SUBTABS[dept.id].length > 1 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {DEPARTMENT_SUBTABS[dept.id].map((st) => (
                      <Button
                        key={st.id}
                        variant={activeSubTab === st.id ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 ${activeSubTab === st.id ? "bg-orange-500 hover:bg-orange-600" : "text-orange-600 border-orange-200 hover:bg-orange-50"}`}
                        onClick={() => setActiveSubTab(st.id)}
                      >
                        {st.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Configuration Card */}
                <Card>
                  <CardContent className="p-6">
                    <DepartmentConfigForm
                      department={dept.id}
                      subTab={activeSubTab}
                      config={config}
                      onChange={setConfig}
                    />
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-1.5" /> Save
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* ═══════ LOCATION WISE TAB ═══════ */}
        <TabsContent value="location-wise" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Select Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Select Location:</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-purple-700 hover:bg-purple-800" onClick={() => toast.info("Loading location print config...")}>
                  Load
                </Button>
              </div>

              {selectedLocation !== "all" && (
                <div className="mt-6 space-y-4">
                  {/* Same department tabs but location-scoped */}
                  <Tabs value={activeDepartment} onValueChange={handleDepartmentChange}>
                    <TabsList className="flex-wrap h-auto gap-0.5">
                      {DEPARTMENTS.map((dept) => (
                        <TabsTrigger key={dept.id} value={dept.id} className="text-xs">
                          {dept.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {DEPARTMENTS.map((dept) => (
                      <TabsContent key={dept.id} value={dept.id} className="mt-3">
                        {DEPARTMENT_SUBTABS[dept.id].length > 1 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {DEPARTMENT_SUBTABS[dept.id].map((st) => (
                              <Button
                                key={st.id}
                                variant={activeSubTab === st.id ? "default" : "outline"}
                                size="sm"
                                className={`text-xs h-7 ${activeSubTab === st.id ? "bg-orange-500 hover:bg-orange-600" : "text-orange-600 border-orange-200 hover:bg-orange-50"}`}
                                onClick={() => setActiveSubTab(st.id)}
                              >
                                {st.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        <Card>
                          <CardContent className="p-6">
                            <DepartmentConfigForm
                              department={dept.id}
                              subTab={activeSubTab}
                              config={config}
                              onChange={setConfig}
                            />
                          </CardContent>
                        </Card>
                        <Button className="mt-4 bg-orange-500 hover:bg-orange-600" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-1.5" /> Save
                        </Button>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ MANAGE IMAGE TAB ═══════ */}
        <TabsContent value="manage-image" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Manage Print Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Upload and manage header logos, letterheads, watermarks, and stamp images used in print documents.
              </p>

              {/* Header Logo */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Header Logo</h4>
                <p className="text-xs text-muted-foreground">Recommended size: 300x100px, PNG/JPG format</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Drop logo file here or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">Choose File</Button>
                </div>
              </div>

              {/* Letterhead Background */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Letterhead Background</h4>
                <p className="text-xs text-muted-foreground">Full-page background image for printed documents (A4 size recommended)</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Drop letterhead image here or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">Choose File</Button>
                </div>
              </div>

              {/* Watermark */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Watermark Image</h4>
                <p className="text-xs text-muted-foreground">Semi-transparent image shown behind content (PNG with transparency)</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Drop watermark image here or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">Choose File</Button>
                </div>
              </div>

              {/* Doctor Signature / Stamp */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Doctor Signature / Stamp</h4>
                <p className="text-xs text-muted-foreground">Digital signature or stamp image (PNG with transparency, max 200x80px)</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Drop signature/stamp image here or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2 text-xs">Choose File</Button>
                </div>
              </div>

              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success("Images saved!")}>
                <Save className="h-4 w-4 mr-1.5" /> Save Images
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsPrintConfiguration;
