// ============================================================
// Lab & Diagnostics HMS Module - Comprehensive Type Definitions
// Based on DocDoc HMS Investigation Module Reference
// AI-Powered with AYUSH Diagnostics Integration
// ============================================================

// ─── Lab Master Types ───────────────────────────────────────

export interface LabGroup {
  id: string;
  name: string; // e.g., "Aminoglycosides", "Cephalosporines", "Penicillins"
  type: "Antibiotic" | "Organism" | "Smear" | "Sample" | "Custom";
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface LabMedicine {
  id: string;
  groupId: string;
  groupName: string;
  name: string; // e.g., "Amikacin", "Amoxicillin", "Cefixime"
  discContent?: string; // Disc content for antibiotic sensitivity
  unit?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface LabOrganism {
  id: string;
  groupId: string;
  groupName: string; // "Organism - Growth" | "Organism - No Growth"
  name: string; // e.g., "Candida sps", "E.coli", "Staphylococcus aureus"
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface LabSmear {
  id: string;
  groupId: string;
  groupName: string; // "Smear"
  name: string; // e.g., "gram stain", "Acid fast stain"
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface LabDepartment {
  id: string;
  groupType: "Laboratory" | "Radiology" | "AYUSH";
  name: string; // e.g., "HAEMATOLOGY", "BIOCHEMISTRY", "AYUSH", "MICROBIOLOGY"
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface LabSample {
  id: string;
  groupId: string;
  groupName: string; // "Sample"
  name: string; // e.g., "BLOOD", "SERUM", "URINE", "SPUTUM", "CSF", "STOOL"
  containerType?: string;
  storageTemp?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

// ─── Accession Types ────────────────────────────────────────

export interface LabAccessionConfig {
  id: string;
  locationId: string;
  enableLocationBasedId: boolean;
  locationIdDigits: number; // e.g., 3
  enableContainerId: boolean;
  addCurrentYear: boolean;
  addDepartment: boolean;
  yearPrefix: string; // e.g., "26"
  locationCode: string; // e.g., "001"
  containerCode: string; // e.g., "02"
  sampleIdLength: number; // e.g., 8 → "00000024"
  currentSampleId: number;
}

export interface LabBarcode {
  patientName: string;
  patientId: string;
  testName: string;
  barcodeNumber: string; // e.g., "260200100000024"
  generatedAt: string;
}

// ─── Test Types ─────────────────────────────────────────────

export type TestMethodType = "Numeric" | "Text" | "Options" | "Formula" | "Multi-Select" | "Rich Text" | "Culture";

export interface TestParameter {
  id: string;
  name: string;
  unit: string;
  method: TestMethodType;
  referenceRanges: TestReferenceRange[];
  options?: string[]; // For Options/Multi-Select method
  formula?: string; // For Formula method
  decimalPlaces?: number;
  isCritical: boolean;
  criticalLow?: number;
  criticalHigh?: number;
  order: number;
}

export interface TestReferenceRange {
  id: string;
  gender: "Male" | "Female" | "All";
  ageFrom: number;
  ageTo: number;
  ageUnit: "Years" | "Months" | "Days";
  normalLow?: number;
  normalHigh?: number;
  normalText?: string; // For text-based references
  unit: string;
}

export interface LabTest {
  id: string;
  code: string; // Internal test code
  loincCode?: string; // LOINC code
  cptCode?: string; // CPT code
  name: string;
  shortName?: string;
  departmentId: string;
  departmentName: string;
  sampleId: string;
  sampleName: string;
  sampleQuantity?: string; // e.g., "2 ml"
  sampleTemperature?: string;
  method?: string; // Technique/method used
  parameters: TestParameter[];
  price: number;
  tatValue: number; // Turnaround time
  tatUnit: "Min" | "Hrs" | "Days";
  standardTat?: number;
  standardTatUnit?: "Min" | "Hrs";
  barcodeLength?: number;
  instructions?: string; // Rich text instructions
  interpretation?: string; // Rich text interpretation
  isOutsourced: boolean;
  outsourceLabId?: string;
  outsourceLabName?: string;
  profileIds?: string[]; // Profiles this test belongs to
  status: "Active" | "Inactive";
  createdBy?: string;
  createdAt: string;
}

// ─── Profile Types ──────────────────────────────────────────

export interface LabProfile {
  id: string;
  sNo: number;
  code: string;
  loincCode?: string;
  cptCode?: string;
  sacCode?: string;
  name: string;
  shortName?: string;
  departmentId?: string;
  departmentName?: string;
  tests: ProfileTest[];
  // Profile Options
  separatePrint: boolean;
  showPrice: boolean;
  enableBiopsy: boolean;
  isOBGRate: boolean;
  enableAutoResult: boolean;
  enableAutoSms: boolean;
  enableAutoWhatsapp: boolean;
  // Outsourcing
  isOutsourced: boolean;
  outsourceLabId?: string;
  outsourceLabName?: string;
  // General Info
  instructions?: string; // Rich text
  interpretation?: string; // Rich text
  tatValue: number;
  tatUnit: "Min" | "Hrs" | "Days";
  standardTat?: number;
  standardTatUnit?: "Min" | "Hrs";
  barcodeLength?: number;
  sampleQuantity?: string;
  sampleTemperature?: string;
  price: number;
  status: "Active" | "Inactive";
  createdBy?: string;
  createdAt: string;
}

export interface ProfileTest {
  id: string;
  testId: string;
  testName: string;
  order: number;
  price: number;
  isAvoidInterpretation?: boolean;
}

// ─── Lab Order Types ────────────────────────────────────────

export type LabOrderStatus = "Ordered" | "Sample Collected" | "In Progress" | "Completed" | "Validated" | "Dispatched" | "Cancelled" | "On Hold" | "Rejected";
export type LabOrderType = "Lab" | "Misc" | "Radiology" | "AYUSH";

export interface LabOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  referredById?: string;
  referredByName?: string;
  providerId?: string;
  providerName?: string;
  locationId: string;
  locationName?: string;
  departmentId?: string;
  departmentName?: string;
  orderType: LabOrderType;
  tests: LabOrderTest[];
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  paymentMode?: string;
  status: LabOrderStatus;
  priority: "Routine" | "Urgent" | "STAT";
  clinicalNotes?: string;
  specialInstructions?: string;
  orderDate: string;
  orderTime: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  validatedAt?: string;
  validatedBy?: string;
  dispatchedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface LabOrderTest {
  id: string;
  testId?: string;
  profileId?: string;
  testName: string;
  testType: "Test" | "Profile";
  sampleId?: string;
  sampleName?: string;
  barcodeNo?: string;
  status: LabOrderStatus;
  results?: LabTestResult[];
  completedAt?: string;
  validatedBy?: string;
}

export interface LabTestResult {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  normalRange: string;
  flag: "Normal" | "Low" | "High" | "Critical Low" | "Critical High" | "";
  isAbnormal: boolean;
  isCritical: boolean;
  comment?: string;
}

// ─── Lab Order Request Types ────────────────────────────────

export interface LabOrderRequest {
  id: string;
  requestNo: string;
  patientId: string;
  patientName: string;
  requestedBy: string;
  requestedByName: string; // Doctor who requested
  tests: { testId: string; testName: string; priority: string }[];
  clinicalInfo?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Converted to Order";
  requestDate: string;
  notes?: string;
}

// ─── Home Collection Types ──────────────────────────────────

export interface LabHomeCollection {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  tests: { testId: string; testName: string }[];
  collectorId?: string;
  collectorName?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "Scheduled" | "Assigned" | "Collected" | "Cancelled";
  amount: number;
  homeVisitCharge: number;
  paymentStatus: "Pending" | "Paid";
  notes?: string;
  locationId: string;
  createdAt: string;
}

// ─── Outsource Management Types ─────────────────────────────

export interface LabOutsourceLab {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gstNo?: string;
  status: "Active" | "Inactive";
}

export interface LabOutsourceOrder {
  id: string;
  trfNo: string; // Test Request Form number
  orderId: string;
  patientId: string;
  patientName: string;
  outsourceLabId: string;
  outsourceLabName: string;
  tests: { testId: string; testName: string; price: number }[];
  sentDate: string;
  receivedDate?: string;
  status: "Sent" | "In Progress" | "Received" | "Cancelled";
  reportFile?: string;
  locationId: string;
  departmentType: "Laboratory" | "Radiology";
  createdAt: string;
}

// ─── Refout Management Types ────────────────────────────────

export interface LabRefout {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  referredToLab: string;
  tests: { testId: string; testName: string }[];
  sentDate: string;
  expectedDate?: string;
  receivedDate?: string;
  status: "Pending" | "Sent" | "Received" | "Cancelled";
  locationId: string;
  createdAt: string;
}

// ─── Quality Control Types ──────────────────────────────────

export interface LabQualityControl {
  id: string;
  testId: string;
  testName: string;
  departmentId: string;
  controlType: "Internal" | "External" | "EQAS";
  level: "Level 1" | "Level 2" | "Level 3";
  lotNumber: string;
  expiryDate: string;
  targetValue: number;
  sdValue: number; // Standard deviation
  results: QCResult[];
  status: "Active" | "Expired";
  createdAt: string;
}

export interface QCResult {
  id: string;
  date: string;
  value: number;
  flag: "Pass" | "Warning" | "Fail";
  comment?: string;
  runBy: string;
}

// ─── Barcode Generation Types ───────────────────────────────

export type BarcodeMode = "Container" | "Package";

export interface BarcodeGenerationRequest {
  mode: BarcodeMode;
  locationId: string;
  locationName?: string;
  containerId?: string;
  containerName?: string;
  sampleType?: string;
  noOfSamples: number;
  barcodeLength: number;
  departmentId?: string;
}

export interface GeneratedBarcode {
  id: string;
  generatedTime: string;
  user: string;
  start: string;
  end: string;
  containerId: string;
  department?: string;
  noOfSamples: number;
  barcodeLength: number;
  sampleType: string;
  isGenerated: boolean;
}

// ─── Print Worklist Types ───────────────────────────────────

export interface WorklistFilter {
  departmentType: "Laboratory" | "Radiology";
  locationId: string;
  status?: LabOrderStatus;
  departmentId?: string; // ALL, HAEMATOLOGY, BIOCHEMISTRY, etc.
  date: string;
  startTime: string;
  endTime: string;
  filterBy: "Department" | "Order No" | "Sample Id" | "Test" | "B2B";
  filterValue?: string;
  includeTests: boolean;
  includeBarcode: boolean;
  descendingOrder: boolean;
  excludePrinted: boolean;
}

// ─── Camp Management Types ──────────────────────────────────

export interface LabCamp {
  id: string;
  name: string;
  locationId: string;
  locationName?: string;
  date: string;
  creditProviderId: string;
  creditProviderName?: string;
  tests: CampTest[];
  participants: CampParticipant[];
  status: "Active" | "Inactive" | "Completed";
  totalParticipants: number;
  totalAmount: number;
  createdAt: string;
}

export interface CampTest {
  id: string;
  testId: string;
  testName: string;
  price: number;
}

export interface CampParticipant {
  id: string;
  patientId?: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: string;
  testsCompleted: boolean;
  orderId?: string;
}

// ─── AYUSH Diagnostic Types ─────────────────────────────────

export type AyushDiagnosticType = "Nadi Pariksha" | "Mutra Pariksha" | "Mala Pariksha" | "Jihva Pariksha" | "Netra Pariksha" | "Sparsha Pariksha" | "Shabda Pariksha" | "Akriti Pariksha" | "Prakriti Assessment" | "Pulse Diagnosis" | "Tongue Diagnosis" | "Iris Diagnosis";

export interface AyushDiagnostic {
  id: string;
  type: AyushDiagnosticType;
  patientId: string;
  patientName: string;
  assessedBy: string;
  assessedByName: string;
  findings: Record<string, string>;
  interpretation?: string;
  aiInterpretation?: string;
  images?: string[];
  status: "Pending" | "Completed" | "Reviewed";
  assessedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ─── AI Lab Intelligence Types ──────────────────────────────

export interface AIResultInterpretation {
  orderId: string;
  patientId: string;
  testName: string;
  results: LabTestResult[];
  interpretation: string;
  clinicalSignificance: "Normal" | "Borderline" | "Abnormal" | "Critical";
  possibleConditions: string[];
  suggestedFollowUp: string[];
  confidence: number;
}

export interface AICriticalAlert {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  testName: string;
  parameterName: string;
  value: string;
  criticalRange: string;
  severity: "Warning" | "Critical" | "Life Threatening";
  message: string;
  suggestedAction: string;
  notifiedTo: string[];
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface AITrendAnalysis {
  patientId: string;
  patientName: string;
  testName: string;
  parameterName: string;
  historicalValues: { date: string; value: number; flag: string }[];
  trend: "Improving" | "Stable" | "Worsening" | "Fluctuating";
  prediction: string;
  riskAssessment: string;
  confidence: number;
}

export interface AISuggestedTest {
  testId: string;
  testName: string;
  reason: string;
  basedOn: "symptoms" | "previous_results" | "age_gender" | "medical_history" | "protocol";
  priority: "Recommended" | "Optional" | "Urgent";
  confidence: number;
}

export interface AIAutoValidation {
  orderId: string;
  testId: string;
  testName: string;
  canAutoValidate: boolean;
  reason: string;
  allResultsNormal: boolean;
  deltaCheckPassed: boolean;
  qcStatusOk: boolean;
  noInterferences: boolean;
  validatedAt?: string;
}

// ─── Lab Dashboard Types ────────────────────────────────────

export interface LabDashboardStats {
  newPatients: number;
  returningPatients: number;
  pendingAmount: number;
  totalOrdersToday: number;
  completedToday: number;
  pendingToday: number;
  inProgressToday: number;
  editedToday: number;
  cancelledToday: number;
  discountedToday: number;
  avgTAT: string; // e.g., "2.5 Hrs"
  criticalAlerts: number;
  outsourcePending: number;
  homeCollectionScheduled: number;
}

export interface LabTargetData {
  month: string;
  target: number;
  achieved: number;
  revenue: number;
  testCount: number;
}

// ─── Lab Report Types ───────────────────────────────────────

export interface LabReport {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  referredBy?: string;
  tests: LabReportTest[];
  reportDate: string;
  validatedBy?: string;
  printedAt?: string;
  sentViaSms: boolean;
  sentViaWhatsapp: boolean;
  sentViaEmail: boolean;
  aiInterpretation?: string;
}

export interface LabReportTest {
  testName: string;
  departmentName: string;
  sampleName: string;
  results: LabTestResult[];
  interpretation?: string;
  methodology?: string;
  comments?: string;
}
