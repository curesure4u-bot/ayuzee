// ============================================================
// Patient HMS Module - Comprehensive Type Definitions
// AI-Integrated Hospital Management System for Ayurveda/AYUSH
// ============================================================

// ─── Core Patient Types ─────────────────────────────────────

export type PatientTitle = "Mr" | "Mrs" | "Ms" | "Master" | "Dr" | "Baby" | "None";
export type Gender = "Male" | "Female" | "Other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "";
export type PatientStatus = "Active" | "Inactive" | "Deceased" | "Transferred";
export type VisitType = "Consultation" | "Follow-up" | "Emergency" | "Diagnostic" | "OP Treatment" | "Procedure";
export type PaymentMode = "Cash" | "Card" | "UPI" | "GooglePay" | "Insurance" | "Credit" | "Multiple";
export type BillStatus = "Paid" | "Partial" | "Pending" | "Cancelled" | "Refunded";

export interface PatientAddress {
  street: string;
  area: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  zip: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientPersonalDetails {
  id: string; // Auto-generated e.g., "AL-15568"
  externalId?: string;
  title: PatientTitle;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob?: string;
  ageYears?: number;
  ageMonths?: number;
  ageDays?: number;
  bloodGroup: BloodGroup;
  mobile: string;
  mobileVerified: boolean;
  email?: string;
  photo?: string;
  address: PatientAddress;
  emergencyContact?: EmergencyContact;
  registrationDate: string;
  registrationTime: string;
  status: PatientStatus;
  source?: string; // How they found us: "Family", "Walk-in", "Online", "Referral"
  guardian?: string;
}

export interface PatientAdditionalInfo {
  religion?: string;
  tag?: string;
  tagColor?: string;
  fileNo?: string;
  fileLocation?: string;
  groupTag?: string;
  familyId?: string;
  membershipCard?: string;
  membershipValidity?: string;
  abhaId?: string; // Ayushman Bharat Health Account
  insuranceProvider?: string;
  insurancePolicyNo?: string;
}

export interface Patient extends PatientPersonalDetails {
  additionalInfo: PatientAdditionalInfo;
  locationId: string;
  branchName?: string;
}

// ─── Medical History Types ──────────────────────────────────

export interface MedicalHistory {
  patientId: string;
  medical: string[]; // Past medical conditions
  family: string[]; // Family history
  drug: string[]; // Drug history
  social: string; // Social history
  allergies: string[];
  habits: string[]; // Smoking, alcohol, etc.
  surgical: string[]; // Past surgeries
  // Ayurveda-specific
  physicalHistory?: PhysicalHistory;
  familyHistory?: string;
  drugHistory?: string;
  menstrualHistory?: MenstrualHistory;
  vaginalHistory?: string;
  obstetricHistory?: string;
}

export interface PhysicalHistory {
  conditions: string[];
  duration: string;
  notes: string;
}

export interface MenstrualHistory {
  menarche?: string;
  cycle?: string;
  flow?: string;
  dysmenorrhea?: boolean;
  lmp?: string;
  notes?: string;
}

// ─── Vitals Types ───────────────────────────────────────────

export interface PatientVitals {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  time: string;
  type: "OP" | "IP";
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  bloodPressure?: string; // "120/80 mmHg"
  temperature?: number; // Fahrenheit
  respiratoryRate?: number; // breaths/min
  pulseRate?: number; // beats/min
  overallPainScore?: number;
  individualPainSpot?: string;
  spo2RA?: number; // SpO2 at Room Air
  spo2O2?: number; // SpO2 at O2
  cbg?: number; // Capillary Blood Glucose mg/dl
  heartRate?: number; // beats/min
  sugar?: number;
  headCircumference?: number; // cm
  createdBy: string;
  createdAt: string;
}

export interface DiabeticVitals {
  id: string;
  patientId: string;
  date: string;
  time: string;
  height?: number;
  weight?: number;
  fasting?: number;
  pp?: number; // Post-prandial
  hba1c?: number;
  bloodPressure?: string;
  urineAlbumin?: string;
  bloodUrea?: number;
  serumCreatinine?: number;
  comments?: string;
}

// ─── Visit & Check-in Types ─────────────────────────────────

export interface OPVisit {
  id: string;
  opNo: number;
  patientId: string;
  patientName: string;
  dobAge: string;
  gender: Gender;
  phone: string;
  doctorId: string;
  doctorName: string;
  referredBy?: string;
  modeOfVisit: "Direct" | "Referred" | "Online" | "Teleconsult";
  purpose: VisitType;
  chiefComplaint?: string;
  checkInTime: string;
  sessionToken: number;
  billDetails?: BillSummary;
  status: "Checked-In" | "In-Consultation" | "Checked-Out" | "Not-Paid";
  locationId: string;
}

export interface FollowUpVisitOption {
  visitId: string;
  chiefComplaint: string;
  doctorName: string;
  visitDate: string;
  visitTime: string;
}

export interface NewVisitRequest {
  patientId: string;
  consultantId: string;
  referredBy?: string;
  visitType: VisitType;
  purpose: string;
  locationId: string;
  isFollowUp: boolean;
  previousVisitId?: string;
}

// ─── Billing Types ──────────────────────────────────────────

export interface BillSummary {
  billNo?: string;
  amount: number;
  paid: number;
  balance: number;
  status: BillStatus;
  paymentMode: PaymentMode;
}

export interface BillLineItem {
  sNo: number;
  particulars: string;
  qty: number;
  price: number;
  gstPercent?: number;
  discPercent?: number;
  discAmount?: number;
  total: number;
}

export interface OPBill {
  id: string;
  billNo: string;
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  billDate: string;
  consultantId: string;
  consultantName: string;
  items: BillLineItem[];
  totalAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  amountReceivable: number;
  amountReceived: number;
  paymentMode: PaymentMode;
  cashTendered?: number;
  balance?: number;
  status: BillStatus;
}

export interface IPBill {
  id: string;
  billNo: string;
  patientId: string;
  billDate: string;
  totalAmount: number;
  paid: number;
  paymentMode: PaymentMode;
  ipNo: number;
}

export interface PharmacyBill {
  id: string;
  billNo: string; // e.g., "PHARMA-3532"
  patientId: string;
  billDate: string;
  consultantName: string;
  previousBalance: number;
  billAmount: number;
  amountReceived: number;
  paymentMode: PaymentMode;
}

// ─── Prescription Types ─────────────────────────────────────

export type MedicineForm = "Tablet" | "Capsule" | "Cream" | "Drops" | "Gel" | "Inhaler" | "Syrup" | "Kashayam" | "Churnam" | "Thailam" | "Ghritam" | "Guggulu" | "Lepa" | "Bhasma" | "Vati" | "Arka" | "Asava" | "Arishta";
export type MedicineTime = "Before Food" | "After Food" | "With Food" | "N/A";
export type Laterality = "Left" | "Right" | "Both" | "N/A";
export type DurationUnit = "Days" | "Weeks" | "Months";

export interface PrescriptionMedicine {
  id: string;
  sNo: number;
  type?: MedicineForm;
  name: string;
  genericName?: string;
  dosage?: string;
  frequency: string; // "1-0-1-0" (Morn-Noon-Eve-Night) or "BD", "TDS", "OD"
  duration: number;
  durationUnit: DurationUnit;
  instruction: MedicineTime;
  laterality: Laterality;
  notes?: string;
  currentStock?: number;
  pcode?: string;
  brand?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  visitId: string;
  doctorId: string;
  doctorName: string;
  medicationDate: string;
  chiefComplaint: string;
  visitType: "OP" | "IP" | "Discharge Summary";
  medicines: PrescriptionMedicine[];
  advice?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface MedicinePackage {
  packageName: string;
  medicines: {
    name: string;
    intake: number;
    medicineTime: MedicineTime;
    duration: string;
  }[];
}

export interface PastPrescription {
  sNo: number;
  name: string;
  date: string;
  medicines: string;
  genericName?: string;
}

// ─── Ayurveda Case Sheet Types ──────────────────────────────

export interface AyurvedaCaseSheet {
  id: string;
  patientId: string;
  visitId: string;
  consultantId: string;
  consultantName: string;
  visitDate: string;
  // Complaint Tab
  complaint: CaseSheetComplaint;
  // History Tab
  history: CaseSheetHistory;
  // Examination Tab
  examination: CaseSheetExamination;
  // Investigation Tab
  investigation: CaseSheetInvestigation;
  // Docket Tab
  docket: CaseSheetDocket;
  // Diagnosis Tab
  diagnosis: CaseSheetDiagnosis;
  // Treatment Tab
  treatment: CaseSheetTreatment;
  // Prescription Tab (references Prescription type)
  prescriptionId?: string;
}

export interface CaseSheetComplaint {
  pradhanaVedana: string; // Presenting Complaints with Duration
  chiefComplaintsList?: string[];
}

export interface CaseSheetHistory {
  vyadhiVruttanta: string; // History of illness
  purvaVyadhiVruttanta: string; // History of prior illness
  familyHistory: string; // Kula Vruttanta
  drugHistory: string; // Chikitsa Vruttanta
  menstrualHistory?: string; // Arthava Vruttanta
  personalHistory: PersonalHistory;
}

export interface PersonalHistory {
  diet: string; // Veg/Non-Veg/Mixed
  habitsAddiction: string;
  appetite: string;
  bowelHabit: string; // Constipated/Regular/Loose
  bowel: string;
  micturition: string;
  sleep: string;
}

export interface CaseSheetExamination {
  // Ashtavidha Pareeksha (8-fold examination)
  ashtavidha: AshtavidhaPareeksha;
  // Dashavidha Pareeksha (10-fold examination)
  dashavidha?: DashavidhaPareeksha;
  // General Physical Examination
  physicalExamination: string;
  // Systemic Examination
  systemicExamination: string;
  // Rogi Pareeksha (Patient-specific examination)
  rogiPareeksha?: string;
  // Overall Pain Score (0-10)
  overallPainScore?: number;
  // Pain Score breakdown
  painScores?: { [area: string]: number };
}

export interface AshtavidhaPareeksha {
  nadi: string; // Pulse
  mutra: string; // Urine
  mala: string; // Stool
  jihva: string; // Tongue
  shabda: string; // Sound/Voice
  sparsha: string; // Touch/Skin
  drik: string; // Eyes
  akriti: string; // Appearance/Build
  temperature?: number;
  bloodPressure?: string;
  bmi?: number;
  weight?: number;
  height?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
}

export interface DashavidhaPareeksha {
  prakruti: string; // Constitution
  vikruti: string; // Morbidity
  sara: string; // Essence/Tissue quality
  samhanana: string; // Compactness
  pramana: string; // Measurement
  satmya: string; // Adaptability
  satva: string; // Mind/Psyche
  aharaShakti: string; // Digestive capacity
  vyayamaShakti: string; // Exercise capacity
  vaya: string; // Age
}

export interface RogiPareeksha {
  // Agni Pareeksha
  agniPareeksha: {
    agniType: "Vishama" | "Tikshna" | "Manda" | "Sama";
    notes?: string;
  };
  // Koshtha Pareeksha
  koshthaPareeksha: {
    koshthaType: "Krura" | "Mridu" | "Madhyama";
    notes?: string;
  };
  // Dosha Pareeksha
  doshaPareeksha: {
    dominantDosha: "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Vata-Kapha" | "Pitta-Kapha" | "Tridosha";
    doshaDushti?: string;
  };
  // Yoga Vahi Pareeksha
  yogaVahiPareeksha?: {
    srotoDushti?: string;
    khaVaigunya?: string;
  };
  // Rogi Bala
  rogiBala?: {
    balaType: "Pravara" | "Madhyama" | "Avara";
    notes?: string;
  };
  // Roga Bala
  rogaBala?: {
    balaType: "Pravara" | "Madhyama" | "Avara";
    notes?: string;
  };
  // Rogi-Roga Bala
  rogiRogaBala?: string;
}

export interface CaseSheetInvestigation {
  vikrutiPareeksha: string; // Vikruthi Pareeksha text
  additionalInvestigations: {
    investigation: string;
    notes: string;
  }[];
  favoriteInvestigations?: {
    favoriteName: string;
    testNames: string[];
  }[];
  investigationNotes?: string;
}

export interface CaseSheetDocket {
  docs: {
    id: string;
    fileName: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface CaseSheetDiagnosis {
  sapekshitaRoganimayam: string; // Provisional Diagnosis
  vyavachetaka: string; // Differential Diagnosis
  roganimayam: string; // Final Diagnosis (Ayurvedic)
  sadhyasadhyata: string; // Prognosis
  upadrava: string; // Complications
  modernDiagnosis?: string; // ICD-10 mapping
}

export interface CaseSheetTreatment {
  kriyaKraman: TreatmentProcedure[]; // Procedures
  notes?: string;
  referral?: TreatmentReferral;
}

export interface TreatmentProcedure {
  id: string;
  treatment: string;
  quantity?: number;
  notes?: string;
  expectedCompletionDate?: string;
  advisedBy: string;
  status: "Advised" | "In Progress" | "Completed" | "Cancelled";
  billedStatus?: "Billed" | "Not Billed";
  completedDate?: string;
  completedBy?: string;
}

export interface TreatmentReferral {
  type: "Internal" | "External";
  referTo?: string;
  refNo?: string;
  department?: string;
  carePriority?: "Routine" | "Urgent" | "Emergency";
  referralReason?: string;
  notes?: string;
}

// ─── Appointment Types ──────────────────────────────────────

export interface PatientAppointment {
  id: string;
  patientId: string;
  apptDate: string;
  apptTime: string; // "15:00 - 15:05"
  purpose: string;
  doctorId: string;
  doctorName: string;
  bookedBy: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "No-Show";
  locationId: string;
}

export interface TherapyAppointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  therapistName: string;
  assistantTherapist?: string;
  staffName?: string;
  treatments: string; // e.g., "ABHYANGAM & KIZHI ONLY ONE JOINT"
  date: string;
  startTime: string;
  endTime: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
}

// ─── IP/Emergency Types ─────────────────────────────────────

export interface IPAdmission {
  id: string;
  ipNo: number;
  daycareNo?: number;
  patientId: string;
  patientName: string;
  age: number | string;
  gender: Gender;
  requestedBy: string;
  type: "IP" | "Daycare" | "Emergency";
  ipType: string;
  admittedOn: string;
  room: string;
  days: number;
  dutyDoctor?: string;
  referredBy?: string;
  doa: string; // Date of Admission
  dod?: string; // Date of Discharge
  billStatus: "Open" | "Closed";
  caseSheetId?: string;
  dischargeSummaryId?: string;
  bills: BillSummary;
}

export interface DischargeSummary {
  id: string;
  ipNo: number;
  patientId: string;
  admissionDate: string;
  dischargeDate: string;
  diagnosisAtAdmission: string;
  diagnosisAtDischarge: string;
  treatmentGiven: string;
  conditionAtDischarge: string;
  dischargeMedications: PrescriptionMedicine[];
  followUpDate?: string;
  advice?: string;
  preparedBy: string;
  approvedBy?: string;
}

// ─── MRD Types ──────────────────────────────────────────────

export interface MRDRecord {
  id: string;
  patientId: string;
  locationId: string;
  mrdDate: string;
  tag?: string;
  fileLocation: string;
  fileNo: string;
  patientType?: string;
  remarks?: string;
  diagnosis: MRDDiagnosis[];
}

export interface MRDDiagnosis {
  sNo: number;
  icd10Code: string;
  chapter: string;
  sectionRef: string;
  section: string;
  subSection: string;
  additionalFindings?: string;
}

// ─── Message & Reminder Types ───────────────────────────────

export interface PatientReminder {
  id: string;
  patientId: string;
  type: "Review" | "Follow-up" | "Medicine Refill" | "Lab Test" | "Birthday" | "Custom";
  addedFrom: string; // "OP Prescription", "Sale Bill", etc.
  date: string;
  time: string; // "Morning(06:00 AM)", "Evening(06:00 PM)"
  status: "Active" | "Completed" | "Dismissed";
  notes?: string;
}

export interface BirthdayMessage {
  patientId: string;
  enabled: boolean;
  customMessage?: string;
}

// ─── Certificate Types ──────────────────────────────────────

export interface PatientCertificate {
  id: string;
  sNo: number;
  patientId: string;
  location: string;
  template: string;
  createdAt: string;
  content: string;
}

// ─── Task Management ────────────────────────────────────────

export interface PatientTask {
  id: string;
  patientId: string;
  task: string;
  createdAt: string;
  createdBy: string;
  department: string;
  user: string;
  subject: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  mobileNo: string;
}

// ─── Test/Lab Types ─────────────────────────────────────────

export interface LabOrder {
  id: string;
  orderNo: string;
  patientId: string;
  test: string;
  referredBy: string;
  provider?: string;
  type: "O/P" | "I/P";
  orderDate: string;
  category: "Laboratory" | "Radiology" | "Pathology";
  status: "Ordered" | "Sample Collected" | "In Progress" | "Completed" | "Bill Paid";
  results?: LabResult[];
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "Normal" | "Abnormal" | "Critical";
}

// ─── AI Integration Types ───────────────────────────────────

export interface AIPatientInsight {
  patientId: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  insights: string[];
  suggestedActions: string[];
  prakritiAssessment?: string;
  doshaImbalance?: string;
  predictedConditions?: string[];
  lifestyleRecommendations?: string[];
  dietRecommendations?: string[];
  generatedAt: string;
}

export interface AIDiagnosisSuggestion {
  condition: string;
  confidence: number; // 0-100
  ayurvedicName?: string;
  modernName?: string;
  supportingEvidence: string[];
  suggestedInvestigations: string[];
}

export interface AIPrescriptionSuggestion {
  medicine: string;
  form: MedicineForm;
  dose: string;
  frequency: string;
  duration: string;
  instruction: MedicineTime;
  rationale: string;
  contraindications?: string[];
  interactions?: string[];
}

export interface AITreatmentPlan {
  phase: string;
  duration: string;
  procedures: string[];
  medicines: AIPrescriptionSuggestion[];
  diet: string[];
  lifestyle: string[];
  yoga?: string[];
}

export interface AICrossModuleContext {
  // Flows from Reception → Doctor → Pharmacy → Billing
  receptionNotes?: string;
  triageLevel?: "Green" | "Yellow" | "Orange" | "Red";
  vitalsAlert?: string[];
  drugInteractions?: string[];
  allergyAlerts?: string[];
  pendingInvestigations?: string[];
  insuranceEligibility?: boolean;
  predictedBillAmount?: number;
  pharmacyStockAlert?: string[];
  followUpDueAlerts?: string[];
}

// ─── Docket (Document Management) ───────────────────────────

export interface PatientDocket {
  id: string;
  patientId: string;
  type: "General" | "Confidential";
  files: DocketFile[];
}

export interface DocketFile {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  category: "Report" | "Image" | "Prescription" | "Certificate" | "Other";
}

// ─── Membership Types ───────────────────────────────────────

export interface PatientMembership {
  id: string;
  patientId: string;
  cardType: string;
  cardNo: string;
  validityDate: string;
  additionalInfo?: string;
  status: "Active" | "Expired" | "Cancelled";
}

// ─── Video Consultation ─────────────────────────────────────

export interface VideoConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number; // minutes
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "No Show";
  meetingLink?: string;
  recordingUrl?: string;
}

// ─── Growth & Vital Charts ──────────────────────────────────

export interface GrowthChartData {
  age: number; // in months or years
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  headCircumference?: number; // cm
  date: string;
}

export interface VitalChartData {
  date: string;
  fasting?: number;
  pp?: number;
  hba1c?: number;
  urineAlbumin?: number;
  urea?: number;
  systolic?: number;
  diastolic?: number;
}

// ─── Search & Filter Types ──────────────────────────────────

export interface PatientSearchResult {
  sNo: number;
  id: string;
  externalId?: string;
  name: string;
  dobAge: string;
  creditInfo?: string;
  phone: string;
  registrationDate: string;
  address: string;
  groupTag?: string;
}

export interface PatientSearchFilters {
  query: string; // ID or Name or Mobile
  location?: string;
  dateRange?: { from: string; to: string };
  gender?: Gender;
  ageRange?: { min: number; max: number };
  bloodGroup?: BloodGroup;
  status?: PatientStatus;
}

// ─── Timeline Types ─────────────────────────────────────────

export interface PatientTimelineEvent {
  id: string;
  patientId: string;
  eventType: "Visit" | "Admission" | "Discharge" | "Lab" | "Prescription" | "Procedure" | "Bill" | "Note";
  title: string;
  description: string;
  date: string;
  time: string;
  actor: string; // Doctor/Staff who did this
  metadata?: Record<string, any>;
}

// ─── Vaccination Types ──────────────────────────────────────

export interface Vaccination {
  id: string;
  patientId: string;
  vaccineName: string;
  doseNumber: number;
  dateGiven: string;
  nextDueDate?: string;
  givenBy: string;
  batchNo?: string;
  notes?: string;
}

// ─── Feedback Types ─────────────────────────────────────────

export interface PatientFeedback {
  id: string;
  patientId: string;
  visitId: string;
  rating: number; // 1-5
  feedback: string;
  categories: string[];
  createdAt: string;
}

// ─── Consumables Types ──────────────────────────────────────

export interface ConsumableItem {
  id: string;
  visitId: string;
  patientId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  addedBy: string;
}

// ─── Ward Request Types ─────────────────────────────────────

export interface WardRequest {
  id: string;
  sNo: number;
  date: string;
  patientName: string;
  roomNo: string;
  products: string;
  requestedBy: string;
  status: "Pending" | "Fulfilled" | "Cancelled";
}

// ─── Blood/Component Request ────────────────────────────────

export interface BloodComponentRequest {
  id: string;
  ipDaycareNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: Gender;
  consultant: string;
  bloodGroup: BloodGroup;
  bloodComponent: string;
  noOfUnits: number;
  status: "Requested" | "Available" | "Issued" | "Returned" | "Cancelled";
  requestDate: string;
}

// ─── Enhanced Patient Fields (Social, Platform, AYUSH, Identity) ─────

export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed" | "Separated" | "";
export type PrakritiType = "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Vata-Kapha" | "Pitta-Kapha" | "Tridosha" | "";
export type TreatmentSystemPreference = "Ayurveda" | "Siddha" | "Homeopathy" | "Unani" | "Yoga" | "Naturopathy" | "Integrative" | "Any" | "";
export type IdProofType = "Aadhaar" | "PAN" | "Passport" | "DrivingLicense" | "VoterID" | "RationCard" | "";
export type NotificationChannel = "SMS" | "WhatsApp" | "Email" | "AppPush" | "All";
export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical" | "";

export interface PatientSocialMedia {
  facebookUrl?: string;
  instagramHandle?: string;
  youtubeChannel?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  googleReviewDone?: boolean;
  testimonialGiven?: boolean;
}

export interface PatientContactEnhanced {
  alternateMobile?: string;
  whatsappNumber?: string;
  whatsappOptIn: boolean;
  preferredLanguage: string;
  emergencyContact: EmergencyContact;
  socialMedia: PatientSocialMedia;
}

export interface PatientMedicalAyush {
  treatmentSystemPreference: TreatmentSystemPreference;
  prakritiType: PrakritiType;
  prakritiAssessmentDate?: string;
  prakritiScore?: { vata: number; pitta: number; kapha: number };
  knownAllergies: string[];
  allergyTypes?: string[]; // drug, food, environmental
  chronicConditions: string[];
  currentMedications: string[];
  currentAyushMedications: string[];
  aiHealthRiskScore: RiskLevel;
  aiRiskFactors?: string[];
  bmi?: number;
  smokingStatus?: "Never" | "Former" | "Current";
  alcoholStatus?: "Never" | "Occasional" | "Regular";
  exerciseFrequency?: "None" | "Occasional" | "Regular" | "Daily";
}

export interface PatientIdentityInsurance {
  idProofType: IdProofType;
  idProofNumber?: string;
  idProofDocument?: string; // upload URL
  abhaId?: string;
  abhaVerified: boolean;
  insuranceProvider?: string;
  insurancePolicyNo?: string;
  insuranceValidity?: string;
  insuranceDocument?: string;
  corporateName?: string;
  tpaName?: string;
  ayushInsuranceCovered?: boolean;
  employeeId?: string;
}

export interface PatientPlatformPreferences {
  // Auto-created login
  patientLoginEnabled: boolean;
  patientLoginEmail?: string;
  patientLoginCreatedAt?: string;
  // Referral system
  referralCode: string; // auto-generated unique code
  referredByCode?: string; // code they used to register
  referralCount: number;
  referralEarnings: number;
  // Ayuzee marketplace
  ayuzeeShopLinked: boolean;
  ayuzeeShopCustomerId?: string;
  directPurchaseEnabled: boolean;
  // Loyalty
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  loyaltyEnrolledAt?: string;
  // Notifications
  preferredNotification: NotificationChannel[];
  // Consent
  consentDataSharing: boolean;
  consentMarketing: boolean;
  consentResearch: boolean;
  consentTelemedicine: boolean;
  consentDate?: string;
  // QR & Digital
  qrPatientCard?: string; // generated QR data URL
  digitalCardIssued: boolean;
  // Family
  familyGroupId?: string;
  familyMembers?: string[]; // linked patient IDs
  // Wearables
  wearableDeviceLinked?: boolean;
  wearableDeviceType?: string;
}

export interface PatientPersonalEnhanced {
  photo?: string;
  maritalStatus: MaritalStatus;
  occupation?: string;
  employer?: string;
  nationality: string;
  preferredLanguage: string;
}

// ─── Combined Enhanced Patient Type ─────────────────────────

export interface EnhancedPatient extends Patient {
  personalEnhanced: PatientPersonalEnhanced;
  contactEnhanced: PatientContactEnhanced;
  medicalAyush: PatientMedicalAyush;
  identityInsurance: PatientIdentityInsurance;
  platformPreferences: PatientPlatformPreferences;
}
