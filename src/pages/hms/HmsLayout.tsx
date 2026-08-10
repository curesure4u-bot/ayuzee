import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import OnboardingWizard from "@/components/OnboardingWizard";
import { supabase } from "@/integrations/supabase/client";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2, LogOut, Users, CalendarClock, ClipboardList, ReceiptText,
  Activity, BarChart3, Home, Pill, BedDouble, FlaskConical, UserCog,
  Settings, Syringe, ChevronRight, Zap, Menu, X, Leaf, Heart, Droplets,
  Moon, Dumbbell, Sparkles, FileText, Package, Factory, Warehouse, Wallet,
  GraduationCap, Globe, Smartphone, Brain, Stethoscope, ScanLine, CreditCard,
  QrCode, AlertTriangle, Target, Truck, RotateCcw, Lock, Calculator, Clock,
  Calendar, RefreshCw, ArrowRight, CheckCircle2, Send, Crown, Monitor,
} from "lucide-react";

// 10 Primary Tabs
const primaryTabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "doctor", label: "Doctor", icon: Stethoscope },
  { id: "patient", label: "Patient", icon: Users },
  { id: "stock", label: "Stock", icon: Package },
  { id: "lab", label: "Lab", icon: FlaskConical },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "mis", label: "MIS", icon: BarChart3 },
  { id: "ayush", label: "AYUSH", icon: Leaf },
  { id: "spine", label: "Spine", icon: Activity },
  { id: "more", label: "More", icon: Menu },
];

// Sidebar sub-items per tab
const tabSubItems: Record<string, { divider?: string; to: string; label: string; icon: any }[]> = {
  dashboard: [
    { divider: "Overview", to: "/hms", label: "Dashboard", icon: Home },
    { to: "/hms/owner-dashboard", label: "Owner Dashboard", icon: Building2 },
    { to: "/hms/branch-dashboard", label: "Branch Dashboard", icon: Building2 },
    { to: "/hms/branch-performance", label: "Branch Performance", icon: Target },
    { to: "/hms/command-center", label: "Command Center", icon: Building2 },
    { to: "/hms/data-analytics", label: "Data Analytics & BI", icon: BarChart3 },
    { to: "/hms/revenue-cycle", label: "Revenue Cycle (AI)", icon: Wallet },
    { to: "/hms/department-pl", label: "Department P&L", icon: BarChart3 },
    { to: "/hms/population-health", label: "Population Health (AI)", icon: Users },
    { to: "/hms/gamification-kpi", label: "Gamification & KPI", icon: Activity },
    { divider: "Hospital Management", to: "/hms/branch-management", label: "Hospital Profile", icon: Building2 },
    { to: "/hms/masters", label: "Master Settings", icon: Settings },
    { to: "/hms/masters/users", label: "User Management", icon: Users },
    { to: "/hms/masters/roles", label: "Roles & Permissions", icon: UserCog },
    { to: "/hms/access-control", label: "HMS Access Control", icon: Settings },
    { to: "/hms/partner-portal", label: "Partner Portal", icon: Users },
    { to: "/hms/masters/service-providers", label: "Service Provider / Supplier", icon: Users },
    { to: "/hms/masters/data-import", label: "Import Patient / Data", icon: FileText },
    { divider: "Configuration", to: "/hms/print-configuration", label: "Print Configuration", icon: FileText },
    { to: "/hms/widget-generator", label: "Widget Generator", icon: Globe },
    { to: "/hms/switch-entity", label: "Switch Entity", icon: Building2 },
    { to: "/hms/settings", label: "Settings", icon: Settings },
    { to: "/hms/language-config", label: "Multi-Language", icon: Globe },
  ],
  doctor: [
    { divider: "My Practice", to: "/hms/consultation-hub", label: "Consultation Hub", icon: ClipboardList },
    { to: "/hms/opd", label: "OPD Queue & Tokens", icon: Activity },
    { to: "/hms/digital-checkin", label: "Digital Check-in (QR)", icon: QrCode },
    { to: "/hms/appointments", label: "My Appointments", icon: CalendarClock },
    { to: "/hms/appointment-slot-config", label: "Slot Configuration", icon: Settings },
    { to: "/hms/appointment-calendar", label: "Calendar (Drag-Drop)", icon: CalendarClock },
    { to: "/hms/online-booking", label: "Online Booking", icon: Globe },
    { to: "/hms/teleconsult", label: "Teleconsultation", icon: Smartphone },
    { to: "/hms/waitlist", label: "Waitlist (AI)", icon: Users },
    { to: "/hms/triage", label: "Nursing Triage", icon: Stethoscope },
    { to: "/hms/doctor-followups", label: "Follow-up Tracker (AI)", icon: CalendarClock },
    { to: "/hms/doctor-inbox", label: "Doctor Inbox", icon: FileText },
    { divider: "Clinical Workflow", to: "/hms/doctor-retention", label: "Patient Retention Engine", icon: Heart },
    { to: "/hms/consultations", label: "Consultations", icon: ClipboardList },
    { to: "/hms/post-visit-summary", label: "Post-Visit Auto-Summary", icon: FileText },
    { to: "/hms/ai-copilot", label: "AI Copilot", icon: Brain },
    { to: "/hms/voice-interface", label: "Voice Interface", icon: Smartphone },
    { to: "/hms/doctor-soap-notes", label: "Smart Consultation", icon: FileText },
    { to: "/hms/doctor-templates", label: "Prescription Center", icon: ClipboardList },
    { to: "/hms/doctor-diet", label: "Patient Guidance", icon: Leaf },
    { to: "/hms/doctor-prakriti", label: "Examination Center", icon: Brain },
    { to: "/hms/doctor-lab-order", label: "Lab & Procedure Orders", icon: FlaskConical },
    { to: "/hms/doctor-procedure-notes", label: "Procedure Notes", icon: Syringe },
    { to: "/hms/doctor-referral", label: "Referral & Discharge", icon: Users },
    { divider: "AYUSH Reference", to: "/hms/doctor-formulary", label: "AFI Formulary (AI)", icon: Leaf },
    { to: "/hms/doctor-astg", label: "ASTG Disease Index (AI)", icon: Brain },
    { to: "/hms/afi-formulary", label: "Full AFI Formulary", icon: Leaf },
    { to: "/hms/classical-prescriptions", label: "Classical Formulary", icon: Leaf },
    { to: "/hms/afi-formulary/disease-index", label: "Ingredient Encyclopedia", icon: FlaskConical },
    { divider: "Review Queues", to: "/hms/gut-health-queue", label: "Gut Health Reviews", icon: Heart },
    { to: "/hms/jihva-queue", label: "Jihva Reviews", icon: Activity },
    { to: "/hms/mutra-bindu-queue", label: "Mutra Bindu Reviews", icon: Droplets },
    { to: "/hms/self-assessment-queue", label: "Self-Assessment Reviews", icon: ClipboardList },
    { to: "/hms/ashtavidha/mala/dashboard", label: "Mala Pareeksha", icon: Activity },
    { divider: "My Analytics", to: "/hms/doctor-kpi", label: "Doctor Dashboard", icon: BarChart3 },
    { to: "/hms/doctor/earnings", label: "Revenue & Earnings", icon: Wallet },
    { to: "/hms/doctor-case-discussion", label: "AI Case Discussion", icon: Brain },
    { to: "/hms/doctor-chat", label: "Doctor Chat", icon: Smartphone },
    { to: "/hms/doctor-patient-brief", label: "Patient Brief (AI)", icon: FileText },
    { to: "/hms/doctor-timeline", label: "My Patient Timeline", icon: Calendar },
    { to: "/hms/doctor-research", label: "Clinical Research", icon: GraduationCap },
    { to: "/hms/doctor-leave", label: "Leave & Availability", icon: Calendar },
    { to: "/hms/shift-roster", label: "Duty Roster", icon: CalendarClock },
  ],
  patient: [
    { divider: "Registration", to: "/hms/patient/register", label: "Register Patient", icon: Users },
    { to: "/hms/patient/manage-op", label: "Manage OP (Check-in)", icon: Activity },
    { to: "/hms/patients", label: "Patient Registry", icon: Users },
    { to: "/hms/patient/find", label: "Quick Search (AI)", icon: Brain },
    { to: "/hms/patient-card", label: "Patient Health Card", icon: CreditCard },
    { to: "/hms/patient-merge", label: "Duplicate Merge", icon: Users },
    { divider: "Patient 360°", to: "/hms/patient/dashboard", label: "Patient Dashboard", icon: Home },
    { to: "/hms/patient/profile", label: "Profile & History", icon: Users },
    { to: "/hms/patient/vitals", label: "Vitals & Growth", icon: Activity },
    { to: "/hms/iot-vitals", label: "IoT Auto-Vitals", icon: Zap },
    { to: "/hms/patient/mrd", label: "Documents & MRD", icon: FileText },
    { divider: "Clinical", to: "/hms/patient/casesheet", label: "Case Sheet (Ayurveda)", icon: Leaf },
    { to: "/hms/patient/prescription", label: "Prescription (AI)", icon: Pill },
    { to: "/hms/e-prescription", label: "E-Prescription", icon: FileText },
    { to: "/hms/emr", label: "EMR & Records", icon: FileText },
    { to: "/hms/treatment-timeline", label: "Treatment Timeline", icon: Activity },
    { to: "/hms/treatment-view", label: "Live Treatment View", icon: Activity },
    { to: "/hms/outcome-scales", label: "Outcome Scales", icon: BarChart3 },
    { to: "/hms/proms", label: "Patient Outcomes (PROMs)", icon: Heart },
    { to: "/hms/integrative-medicine", label: "Integrative Protocol", icon: Leaf },
    { divider: "Finance", to: "/hms/patient/bills", label: "Bills & Payments", icon: ReceiptText },
    { to: "/hms/billing/insurance", label: "Insurance & TPA", icon: Wallet },
    { divider: "In-Patient", to: "/hms/patient/ip-summary", label: "IP / Admission", icon: BedDouble },
    { to: "/hms/op-ip-transfer", label: "OP → IP Transfer", icon: ArrowRight },
    { to: "/hms/op-therapy-transfer", label: "OP → Therapy (OPT)", icon: Sparkles },
    { to: "/hms/discharge-workflow", label: "Discharge Workflow", icon: CheckCircle2 },
    { divider: "Engagement", to: "/hms/patient/appointments", label: "Appointments", icon: CalendarClock },
    { to: "/hms/patient/messages", label: "Messages & Reminders", icon: Smartphone },
    { to: "/hms/feedback", label: "Feedback & PROMs", icon: Heart },
    { divider: "Self-Assessment", to: "/hms/prakriti", label: "Prakriti Assessment", icon: Leaf },
    { to: "/hms/posture", label: "Posture Analysis", icon: Activity },
    { to: "/hms/swasthavritta/new", label: "Swasthavritta (Lifestyle)", icon: Heart },
  ],
  stock: [
    { divider: "Core", to: "/hms/stock", label: "Stock Dashboard", icon: Package },
    { to: "/hms/stock-quick-dispensing", label: "Quick Dispensing (POS)", icon: Zap },
    { to: "/hms/pharmacy", label: "Pharmacy", icon: Pill },
    { divider: "Purchase & Sale", to: "/hms/stock/purchase/po", label: "Purchase Order", icon: FileText },
    { to: "/hms/stock/purchase/grn", label: "GRN", icon: Package },
    { to: "/hms/stock-purchase-return", label: "Purchase Return", icon: RotateCcw },
    { to: "/hms/stock/sale/new", label: "Sale Bill", icon: ReceiptText },
    { to: "/hms/stock/sale/return", label: "Sale Return", icon: RotateCcw },
    { to: "/hms/stock-patient-return", label: "Patient Return", icon: Users },
    { to: "/hms/stock-dose-calculator", label: "Dose Calculator (AI)", icon: Calculator },
    { to: "/hms/stock-medicine-mixing", label: "Medicine Mixing", icon: FlaskConical },
    { to: "/hms/stock-rx-sync", label: "Rx-to-Stock Sync", icon: Activity },
    { to: "/hms/stock-subscription", label: "Medicine Subscription", icon: CalendarClock },
    { divider: "Indent & Transfer", to: "/hms/stock/indent/new", label: "Indent / Issue", icon: ClipboardList },
    { to: "/hms/stock-indent-approval", label: "Indent Approval", icon: ClipboardList },
    { to: "/hms/stock-inter-branch", label: "Inter-Branch Transfer", icon: Truck },
    { to: "/hms/stock-branch-transfer", label: "Branch-to-Branch Req", icon: Building2 },
    { to: "/hms/stock-central-store", label: "Central Store (Hub)", icon: Warehouse },
    { to: "/hms/stock-courier-dispatch", label: "Courier Dispatch", icon: Truck },
    { to: "/hms/stock-order-fulfillment", label: "Order Fulfillment", icon: Package },
    { to: "/hms/stock-kit-assembly", label: "Kit Assembly", icon: Package },
    { divider: "AI & Analytics", to: "/hms/stock/ai/reorder", label: "AI Smart Reorder", icon: Brain },
    { to: "/hms/stock-reorder-level", label: "Min/Max/ROL", icon: BarChart3 },
    { to: "/hms/stock-abc-analysis", label: "ABC/VED/FSN Analysis", icon: BarChart3 },
    { to: "/hms/stock-substitute-suggestion", label: "Substitute AI", icon: Brain },
    { to: "/hms/stock-seasonal-demand", label: "Seasonal Demand AI", icon: Leaf },
    { to: "/hms/stock-purchase-rate", label: "Rate Comparison", icon: BarChart3 },
    { to: "/hms/stock-vendor-rating", label: "Vendor Rating", icon: Activity },
    { to: "/hms/stock-short-book", label: "Short-Book / Demand", icon: ClipboardList },
    { to: "/hms/stock-patient-dispensing", label: "Patient Dispensing", icon: Users },
    { to: "/hms/stock-drug-interaction", label: "Drug Interaction", icon: AlertTriangle },
    { to: "/hms/stock-redistribution", label: "Redistribution AI", icon: Brain },
    { to: "/hms/stock-franchise-portal", label: "Franchise Portal", icon: Globe },
    { to: "/hms/stock-consumption", label: "Consumption Dashboard", icon: BarChart3 },
    { to: "/hms/stock-supplier-sla", label: "Supplier SLA", icon: Activity },
    { divider: "Compliance", to: "/hms/stock-drug-license", label: "Drug License", icon: FileText },
    { to: "/hms/stock-drug-schedule", label: "Drug Schedule", icon: ClipboardList },
    { to: "/hms/stock-gst-returns", label: "GST / HSN", icon: ReceiptText },
    { to: "/hms/stock-eway-bill", label: "E-way Bill", icon: Truck },
    { to: "/hms/stock-barcode", label: "Barcode / QR", icon: QrCode },
    { to: "/hms/stock-batch-tracking", label: "Batch Tracking", icon: Package },
    { to: "/hms/stock-audit-trail", label: "Audit Trail", icon: FileText },
    { to: "/hms/stock-rate-contract", label: "Rate Contract", icon: FileText },
    { to: "/hms/stock-epharmacy", label: "e-Pharmacy License", icon: Globe },
    { to: "/hms/stock-ndps", label: "NDPS Register", icon: Lock },
    { to: "/hms/stock-return-policy", label: "Return Policy", icon: FileText },
    { divider: "Expiry & Wastage", to: "/hms/stock-near-expiry", label: "Near-Expiry FEFO", icon: AlertTriangle },
    { to: "/hms/stock/ai/expiry", label: "AI Expiry Mgmt", icon: Brain },
    { to: "/hms/stock-expiry-return", label: "Expiry Return", icon: RotateCcw },
    { to: "/hms/stock-dead-stock", label: "Dead Stock", icon: Package },
    { to: "/hms/stock-wastage", label: "Wastage Register", icon: AlertTriangle },
    { to: "/hms/stock-physical-verification", label: "Physical Verification", icon: ClipboardList },
    { divider: "Finance", to: "/hms/stock-supplier-payment", label: "Supplier Payment", icon: Wallet },
    { to: "/hms/stock/credit/supplier", label: "Credit Supplier", icon: CreditCard },
    { to: "/hms/stock/credit/patient", label: "Credit Patient", icon: CreditCard },
    { to: "/hms/stock/expense", label: "Expense", icon: Wallet },
    { to: "/hms/stock-insurance", label: "Stock Insurance", icon: Wallet },
    { to: "/hms/stock-daily-summary", label: "Daily Summary", icon: FileText },
    { divider: "AYUSH Specific", to: "/hms/stock-pk-oil-tracker", label: "PK Oil Tracker", icon: Droplets },
    { to: "/hms/stock-herb-procurement", label: "Herb Procurement", icon: Leaf },
    { to: "/hms/stock-yoga-kshema", label: "Yoga Kshema (Shelf-life)", icon: Clock },
    { to: "/hms/stock-manufacturing-batch", label: "Manufacturing Batch", icon: Factory },
    { to: "/hms/stock-homeopathy", label: "Homeopathy Stock", icon: Heart },
    { to: "/hms/stock-temp-humidity", label: "Temp & Humidity", icon: Activity },
    { divider: "Setup", to: "/hms/stock-rack-location", label: "Rack / Location", icon: Warehouse },
    { to: "/hms/stock-ecommerce", label: "E-Commerce Sync", icon: Globe },
    { to: "/hms/stock-ondc", label: "ONDC Integration", icon: Globe },
    { to: "/hms/stock/product-flow", label: "Product Flow", icon: Activity },
    { to: "/hms/stock/due", label: "Due Management", icon: Wallet },
  ],
  lab: [
    { divider: "Core", to: "/hms/lab-diagnostics", label: "Lab Dashboard", icon: FlaskConical },
    { to: "/hms/lab-diagnostics/order", label: "Lab Orders", icon: ClipboardList },
    { to: "/hms/lab-diagnostics/order-status", label: "Order Status", icon: Activity },
    { to: "/hms/lab-diagnostics/test", label: "Manage Tests", icon: FlaskConical },
    { to: "/hms/lab-diagnostics/profile", label: "Manage Profiles", icon: FileText },
    { to: "/hms/lab-diagnostics/master/department", label: "Lab Masters", icon: Settings },
    { divider: "Operations", to: "/hms/lab-diagnostics/home-collection", label: "Home Collection", icon: Truck },
    { to: "/hms/lab-diagnostics/camp", label: "Camp Management", icon: Users },
    { to: "/hms/lab-diagnostics/outsource", label: "Outsource / Refout", icon: Globe },
    { to: "/hms/lab-diagnostics/barcode", label: "Barcode / Worklist", icon: QrCode },
    { to: "/hms/lab-diagnostics/qc", label: "Quality Control", icon: Activity },
    { to: "/hms/radiology", label: "Radiology", icon: ScanLine },
    { to: "/hms/radiology/worklist", label: "Radiology Worklist", icon: ClipboardList },
    { to: "/hms/radiology/reporting", label: "Radiology Reporting", icon: FileText },
    { to: "/hms/radiology/pacs", label: "PACS Viewer", icon: Monitor },
    { to: "/hms/blood-bank", label: "Blood Bank", icon: Droplets },
    { divider: "AI & Advanced", to: "/hms/lab-diagnostics/ai", label: "AI Lab Intelligence", icon: Brain },
    { to: "/hms/lab-critical-results", label: "Critical Results", icon: AlertTriangle },
    { to: "/hms/lab-diagnostics/smart-reports", label: "Smart Reports", icon: FileText },
    { to: "/hms/lab-diagnostics/auto-comms", label: "Auto Communications", icon: Smartphone },
    { to: "/hms/lab-diagnostics/exceptions", label: "Exceptions", icon: AlertTriangle },
    { to: "/hms/lab-diagnostics/nadi-pariksha", label: "Nadi Pariksha", icon: Heart },
    { to: "/hms/lab-diagnostics/ayush-diagnostics", label: "AYUSH Diagnostics Hub", icon: Leaf },
    { divider: "AYUSH Advanced Diagnostics", to: "/hms/nadi-tarangini", label: "Nadi Tarangini Reports", icon: Activity },
    { to: "/hms/patient/genomic", label: "DNA / Prakriti Genomics", icon: Brain },
    { to: "/hms/patient/prakriti-profile", label: "Prakriti Lab Profile", icon: Leaf },
    { to: "/hms/patient/risk-score", label: "AI Risk Score", icon: AlertTriangle },
    { to: "/hms/patient/remote-monitoring", label: "Wearable / Remote Data", icon: Smartphone },
    { to: "/hms/iridology", label: "Iridology (Iris Dx)", icon: ScanLine },
    { to: "/hms/darkfield-microscopy", label: "Darkfield Microscopy", icon: FlaskConical },
    { to: "/hms/thermography", label: "Thermography", icon: Activity },
    { to: "/hms/hrv-analysis", label: "HRV Analysis (Dosha)", icon: Heart },
    { to: "/hms/gut-microbiome", label: "Gut Microbiome", icon: FlaskConical },
    { divider: "Processing", to: "/hms/lab-diagnostics/accession", label: "Accession", icon: FileText },
    { to: "/hms/lab-diagnostics/worklist", label: "Worklist", icon: ClipboardList },
    { to: "/hms/lab-diagnostics/result-entry", label: "Result Entry", icon: FileText },
    { to: "/hms/lab-diagnostics/reports", label: "Report Generation", icon: FileText },
    { to: "/hms/lab-diagnostics/report-templates", label: "Report Templates", icon: FileText },
    { to: "/hms/lab-diagnostics/machine-interface", label: "Machine Interface", icon: Settings },
    { to: "/hms/lab-diagnostics/tat-monitoring", label: "TAT Monitoring", icon: Clock },
    { to: "/hms/lab-diagnostics/sample-tracking", label: "Sample Tracking", icon: Activity },
    { divider: "Masters", to: "/hms/lab-diagnostics/master/group", label: "Group Master", icon: Settings },
    { to: "/hms/lab-diagnostics/master/medicine", label: "Medicine Master", icon: Pill },
    { to: "/hms/lab-diagnostics/master/organism", label: "Organism Master", icon: FlaskConical },
    { to: "/hms/lab-diagnostics/master/smear", label: "Smear Master", icon: FlaskConical },
    { to: "/hms/lab-diagnostics/master/sample", label: "Sample Master", icon: FlaskConical },
    { divider: "Finance & Business", to: "/hms/lab-diagnostics/billing", label: "Lab Billing", icon: ReceiptText },
    { to: "/hms/lab-diagnostics/referral-commission", label: "Referral Commission", icon: Users },
    { to: "/hms/lab-diagnostics/rate-plans", label: "Rate Plans", icon: BarChart3 },
    { to: "/hms/lab-diagnostics/online-payment", label: "Online Payment", icon: CreditCard },
    { to: "/hms/lab-diagnostics/packages", label: "Lab Packages", icon: Package },
    { to: "/hms/lab-diagnostics/appointments", label: "Lab Appointments", icon: CalendarClock },
    { divider: "Portals", to: "/hms/lab-diagnostics/patient-portal", label: "Patient Portal", icon: Users },
    { to: "/hms/lab-diagnostics/doctor-portal", label: "Doctor Portal", icon: Stethoscope },
    { to: "/hms/lab-diagnostics/b2b-portal", label: "B2B Portal", icon: Building2 },
    { to: "/hms/lab-diagnostics/patient-crm", label: "Patient CRM", icon: Users },
    { divider: "Compliance", to: "/hms/lab-diagnostics/nabl-compliance", label: "NABL Compliance", icon: Settings },
    { to: "/hms/lab-diagnostics/reagent-inventory", label: "Reagent Inventory", icon: FlaskConical },
    { to: "/hms/lab-diagnostics/audit-trail", label: "Lab Audit Trail", icon: FileText },
    { to: "/hms/lab-diagnostics/multi-location", label: "Multi-Location", icon: Building2 },
    { to: "/hms/lab-diagnostics/abdm-lab", label: "ABDM Lab", icon: Globe },
    { to: "/hms/lab-diagnostics/mis-reports", label: "Lab MIS Reports", icon: BarChart3 },
    { to: "/hms/lab-diagnostics/refout", label: "Ref-Out Management", icon: Globe },
  ],
  accounts: [
    { to: "/hms/billing", label: "Billing & Invoices", icon: ReceiptText },
    { to: "/hms/billing/insurance", label: "Insurance Claims", icon: Wallet },
    { to: "/hms/accounts", label: "Accounts (AI)", icon: Wallet },
    { to: "/hms/accounts/revenue", label: "Revenue Dashboard", icon: BarChart3 },
    { to: "/hms/accounts/collection", label: "Payment Collection", icon: CreditCard },
    { to: "/hms/accounts/expenses", label: "Expenses", icon: Wallet },
    { to: "/hms/accounts/payroll", label: "Payroll", icon: Users },
    { to: "/hms/accounts/gst", label: "GST", icon: ReceiptText },
    { to: "/hms/accounts/tds", label: "TDS", icon: FileText },
    { to: "/hms/accounts/insurance", label: "Insurance/TPA", icon: Wallet },
    { to: "/hms/insurance-preauth", label: "Pre-Auth & Claims", icon: FileText },
    { to: "/hms/accounts/day-end", label: "Day-End Close", icon: CalendarClock },
    { to: "/hms/accounts/refund-advance", label: "Refund & Advance", icon: RotateCcw },
    { to: "/hms/accounts/financial-reports", label: "Financial Reports", icon: BarChart3 },
    { to: "/hms/accounts/bank-ai", label: "Bank Statement AI", icon: Brain },
    { to: "/hms/accounts/reconciliation", label: "Reconciliation", icon: Activity },
    { to: "/hms/accounts/cash-flow", label: "Cash Flow", icon: Activity },
    { to: "/hms/accounts/cashier", label: "Cashier", icon: CreditCard },
    { to: "/hms/accounts/sales-analytics", label: "Sales Analytics", icon: BarChart3 },
    { to: "/hms/accounts/target-achieved", label: "Target vs Achieved", icon: Target },
    { to: "/hms/credit-settlement", label: "Credit Settlement", icon: CreditCard },
    { to: "/hms/accounts/tally", label: "Tally Export", icon: FileText },
    { divider: "CRM & Follow-up", to: "/hms/accounts/crm", label: "Accounts CRM", icon: Users },
    { to: "/hms/accounts/followup", label: "Follow-Up Manager", icon: CalendarClock },
    { to: "/hms/accounts/dashboard", label: "Accounts Dashboard", icon: Home },
    { divider: "Incentives & Credits", to: "/hms/accounts/incentive", label: "Incentive & Gamification", icon: Activity },
    { to: "/hms/accounts/staff-credits", label: "Staff Credits", icon: Users },
    { to: "/hms/accounts/supplier-franchise", label: "Supplier & Franchise", icon: Building2 },
    { to: "/hms/accounts/state-fund", label: "State Fund Docs", icon: FileText },
    { divider: "Validation & Estimates", to: "/hms/copay-calculator", label: "Copay Calculator", icon: Calculator },
    { to: "/hms/pan-validation", label: "PAN Validation (269ST)", icon: CreditCard },
    { to: "/hms/estimate-approval", label: "Estimate Approval", icon: FileText },
  ],
  mis: [
    { to: "/hms/mis", label: "MIS Reports (AI)", icon: BarChart3 },
    { to: "/hms/mis/ai", label: "AI Interpretation", icon: Brain },
    { to: "/hms/mis/filters", label: "Advanced Filters", icon: ClipboardList },
    { to: "/hms/mis/collection", label: "Collection Reports", icon: Wallet },
    { to: "/hms/mis/accounts", label: "Accounts Reports", icon: ReceiptText },
    { to: "/hms/mis/test-orders", label: "Test Orders", icon: FlaskConical },
    { to: "/hms/mis/stocks", label: "Stocks", icon: Package },
    { to: "/hms/mis/operational", label: "Operational", icon: Activity },
    { to: "/hms/mis/org", label: "Org Reporting", icon: Building2 },
    { divider: "Analytics", to: "/hms/reports", label: "HMS Reports", icon: FileText },
    { to: "/hms/governance", label: "Governance", icon: BarChart3 },
    { to: "/hms/data-analytics", label: "Data Analytics & BI", icon: Brain },
  ],
  ayush: [
    { divider: "Systems", to: "/hms/ayurveda", label: "Ayurveda", icon: Leaf },
    { to: "/hms/siddha", label: "Siddha", icon: Droplets },
    { to: "/hms/homeopathy", label: "Homeopathy", icon: Heart },
    { to: "/hms/unani", label: "Unani", icon: Moon },
    { to: "/hms/yoga", label: "Yoga & Naturopathy", icon: Dumbbell },
    { to: "/hms/naturopathy", label: "Naturopathy (Clinical)", icon: Leaf },
    { divider: "Panchakarma", to: "/hms/panchakarma", label: "PK Dashboard", icon: Sparkles },
    { to: "/hms/panchakarma/schedule", label: "Therapy Schedule", icon: CalendarClock },
    { to: "/hms/panchakarma/packages", label: "Packages & Plans", icon: Package },
    { to: "/hms/pk-consent", label: "Consent & Docs", icon: FileText },
    { to: "/hms/therapy-appointments", label: "Therapy Appointments", icon: CalendarClock },
    { to: "/hms/panchakarma/adverse-events", label: "PK Adverse Events", icon: AlertTriangle },
    { to: "/hms/panchakarma/bookings", label: "PK Bookings", icon: CalendarClock },
    { to: "/hms/panchakarma/course/new", label: "PK Course (New)", icon: Sparkles },
    { to: "/hms/panchakarma/post-care", label: "PK Post-Care Queue", icon: Heart },
    { to: "/hms/therapy-catalog", label: "Therapy Catalog", icon: ClipboardList },
    { to: "/hms/therapy-plans", label: "Therapy Plans", icon: FileText },
    { to: "/hms/hijama", label: "Hijama (Cupping)", icon: Droplets },
    { divider: "Clinical", to: "/hms/integrative-medicine", label: "Integrative Medicine", icon: Brain },
    { to: "/hms/icd-coding", label: "ICD Codes (AYUSH)", icon: ClipboardList },
    { to: "/hms/namaste-coding", label: "NAMASTE / TM2", icon: ClipboardList },
    { to: "/hms/sna-formulary", label: "Ayuzee Formulary", icon: Leaf },
    { to: "/hms/classical-prescriptions", label: "Classical Prescriptions", icon: Leaf },
    { to: "/hms/manufacturing", label: "Manufacturing Unit", icon: Factory },
    { divider: "System Prescriptions", to: "/hms/ayurveda-prescription", label: "Ayurveda Rx Writer", icon: Leaf },
    { to: "/hms/siddha-prescription", label: "Siddha Rx Writer", icon: Droplets },
    { to: "/hms/unani-prescription", label: "Unani Rx Writer", icon: Moon },
    { to: "/hms/homeopathy-prescription", label: "Homeopathy Rx Writer", icon: Heart },
    { divider: "Homeopathy Tools", to: "/hms/repertory", label: "Repertorisation Engine", icon: Brain },
    { to: "/hms/materia-medica", label: "Materia Medica", icon: FlaskConical },
    { to: "/hms/case-taking", label: "Case Taking Form", icon: ClipboardList },
    { divider: "AYUSH Modules", to: "/hms/ayush/panchakarma-therapy", label: "Panchakarma Therapy", icon: Sparkles },
    { to: "/hms/ayush/diet-pathya", label: "Diet & Pathya", icon: Leaf },
    { to: "/hms/ayush/wellness-score", label: "Wellness Score", icon: Heart },
    { to: "/hms/ayush/ritucharya", label: "Ritucharya (Seasonal)", icon: CalendarClock },
    { to: "/hms/ayush/formulations", label: "Formulations", icon: FlaskConical },
  ],
  spine: [
    { to: "/hms/spine-ayush", label: "Spine Dashboard", icon: Home },
    { to: "/hms/spine-ayush?tab=assessment", label: "AI Assessment (₹199)", icon: Brain },
    { to: "/hms/spine-ayush?tab=examination", label: "Examination (7 Systems)", icon: Stethoscope },
    { to: "/hms/spine-ayush?tab=level1", label: "Level 1: First Treatment", icon: Syringe },
    { to: "/hms/spine-ayush?tab=protocols", label: "Level 2: Panchakarma", icon: Sparkles },
    { to: "/hms/spine-ayush?tab=packages", label: "Packages & Pricing", icon: Package },
    { to: "/hms/spine-ayush?tab=followup", label: "Follow-up (Video LMS)", icon: Smartphone },
    { to: "/hms/spine-ayush?tab=rejuvenation", label: "Rejuvenation", icon: Heart },
    { to: "/hms/spine-ayush?tab=connections", label: "Disease Connection Map", icon: Activity },
    { divider: "Spine AYUSH Modules", to: "/hms/spine-modules", label: "All Modules (13)", icon: GraduationCap },
    { to: "/hms/spine-ayush-native", label: "AYUSH Native (M14-M18)", icon: Leaf },
    { to: "/hms/spine-quick-protocol", label: "Quick Protocol Builder", icon: Zap },
    { to: "/hms/spine-ai-tools", label: "AI Tools (Intelligence)", icon: Brain },
    { divider: "Integrative Therapies", to: "/hms/spine-therapies", label: "All Therapies (15)", icon: Globe },
    { divider: "Doctor Tools", to: "/hms/spine-level1-session", label: "Level 1 Session (OPD)", icon: Zap },
    { to: "/hms/spine-level2-session", label: "Level 2 Session (Panchakarma)", icon: Sparkles },
    { to: "/hms/spine-therapy-session", label: "Record Therapy Session", icon: Stethoscope },
    { to: "/hms/spine-patient-recovery", label: "Patient Recovery Score", icon: Target },
    { divider: "Community Coaching", to: "/hms/spine-community", label: "Community & Funnel", icon: Crown },
    { to: "/hms/spine-community-pipeline", label: "Engagement Pipeline", icon: Users },
    { divider: "Operations", to: "/hms/spine-ayush?tab=community", label: "Community & Gamification", icon: Users },
    { to: "/hms/spine-ayush?tab=franchise", label: "Franchise Operations", icon: Building2 },
    { to: "/hms/spine-ayush?tab=marketing", label: "Funnel & Marketing", icon: Globe },
    { to: "/hms/spine-ayush?tab=community", label: "Community Hub", icon: Users },
    { to: "/hms/spine-ayush?tab=kpis", label: "Franchise KPIs", icon: BarChart3 },
    { divider: "Productivity", to: "/task-tracker", label: "Task Tracker", icon: ClipboardList },
  ],
};

// "More" mega dropdown items (grouped)
const moreItems = [
  { group: "IPD & Nursing", items: [
    { to: "/hms/ipd", label: "IPD & Wards", icon: BedDouble },
    { to: "/hms/nursing", label: "Nursing Station", icon: Heart },
    { to: "/hms/diet-kitchen", label: "Diet & Kitchen", icon: Leaf },
    { to: "/hms/ward-store", label: "Ward Consumables", icon: Warehouse },
    { to: "/hms/ot", label: "Operation Theater", icon: Syringe },
    { to: "/hms/blood-bank", label: "Blood Bank", icon: Droplets },
    { to: "/hms/procedures", label: "Procedures", icon: Syringe },
  ]},
  { group: "AI & Intelligence", items: [
    { to: "/hms/ai-hub", label: "AI Hub", icon: Brain },
    { to: "/hms/ai-assist", label: "AI Clinical Support", icon: Brain },
    { to: "/hms/ai-scribe", label: "AI Scribe", icon: Stethoscope },
    { to: "/hms/cdss", label: "CDSS Alerts", icon: Brain },
    { to: "/hms/chatbot", label: "AI Chatbot", icon: Smartphone },
    { to: "/hms/records-analyser", label: "Records Analyser", icon: ScanLine },
    { to: "/hms/conflict-detection", label: "Conflict Detection", icon: AlertTriangle },
    { to: "/hms/voice-agent", label: "Voice Agent", icon: Smartphone },
    { to: "/hms/medassist", label: "MedAssist", icon: Brain },
    { to: "/hms/document-parser", label: "Document Parser", icon: FileText },
  ]},
  { group: "HR & Staff", items: [
    { to: "/hms/hr", label: "HR & Payroll", icon: UserCog },
    { to: "/hms/staff-attendance", label: "Staff Attendance", icon: Users },
    { to: "/hms/work-schedule", label: "Work Schedule", icon: CalendarClock },
    { to: "/hms/doctor-management", label: "Manage Doctors", icon: Stethoscope },
    { to: "/hms/therapist-management", label: "Manage Therapists", icon: Heart },
    { to: "/hms/task-management", label: "Task Management", icon: ClipboardList },
    { to: "/task-tracker", label: "All-in-One Tasks", icon: ClipboardList },
    { to: "/hms/checklist", label: "Checklists", icon: ClipboardList },
  ]},
  { group: "Marketing & Engagement", items: [
    { to: "/hms/marketing", label: "Marketing & Leads", icon: Globe },
    { to: "/hms/whatsapp", label: "WhatsApp Engage", icon: Smartphone },
    { to: "/hms/referral", label: "Referral Mgmt", icon: Users },
    { to: "/hms/loyalty", label: "Loyalty Program", icon: Heart },
    { to: "/hms/feedback", label: "Feedback & NPS", icon: Heart },
    { to: "/hms/invite-friends", label: "Invite Friends", icon: Users },
    { to: "/hms/address-book", label: "Address Book", icon: Users },
    { to: "/hms/notification-history", label: "Notification Log", icon: Smartphone },
  ]},
  { group: "Operations", items: [
    { to: "/hms/cssd-linen", label: "CSSD / Linen", icon: Package },
    { to: "/hms/assets", label: "Assets & Equipment", icon: Stethoscope },
    { to: "/hms/ambulance", label: "Ambulance / EMS", icon: Truck },
    { to: "/hms/inventory", label: "Inventory", icon: Warehouse },
    { to: "/hms/indent", label: "Indent & Audit", icon: ClipboardList },
    { to: "/hms/entity-log", label: "Entity Activity Log", icon: FileText },
    { to: "/hms/eod-reports", label: "EOD Reports", icon: BarChart3 },
  ]},
  { group: "Resort & Wellness", items: [
    { to: "/hms/reservation", label: "Room Reservation", icon: CalendarClock },
    { to: "/hms/housekeeping", label: "Housekeeping", icon: Sparkles },
    { to: "/hms/canteen", label: "Canteen", icon: Globe },
    { to: "/hms/maintenance", label: "Maintenance", icon: Settings },
    { to: "/hms/multi-currency", label: "Multi-Currency", icon: Globe },
  ]},
  { group: "Research & Public Health", items: [
    { to: "/hms/research", label: "Research Module", icon: GraduationCap },
    { to: "/hms/public-health", label: "Public Health", icon: Globe },
  ]},
  { group: "Compliance & Admin", items: [
    { to: "/hms/nabh", label: "NABH Compliance", icon: Settings },
    { to: "/hms/audit-trail", label: "Audit Trail", icon: Settings },
    { to: "/hms/security-controls", label: "Security Controls", icon: Lock },
    { to: "/hms/abdm", label: "ABDM Connect", icon: Globe },
    { to: "/hms/abdm-uhi", label: "ABDM 2.0 / UHI", icon: Globe },
    { to: "/hms/phr", label: "PHR", icon: Heart },
    { to: "/hms/wearable-sync", label: "Wearable Sync", icon: Activity },
    { to: "/hms/qr-attendance", label: "QR Attendance", icon: QrCode },
    { to: "/hms/queue-display", label: "Queue Display", icon: Smartphone },
  ]},
  { group: "Platform & Dev", items: [
    { to: "/hms/bridge", label: "HMS Bridge", icon: Settings },
    { to: "/hms/developer", label: "Developer Portal", icon: Settings },
    { to: "/hms/open-api", label: "Open API", icon: Globe },
    { to: "/hms/mcp-server", label: "MCP Server", icon: Globe },
    { to: "/hms/geo-seo-pages", label: "Geo SEO Pages", icon: Globe },
    { to: "/hms/about-partner", label: "Partner Network", icon: Users },
    { to: "/hms/patient-app", label: "Patient App (PWA)", icon: Smartphone },
  ]},
];

const HmsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const { hasAccess, branch, loading: accessLoading } = useHmsAccess();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Auto-detect active tab from URL
  useEffect(() => {
    const p = location.pathname;
    if (p.includes("/hms/doctor-") || p.includes("/hms/consultation-hub") || p.includes("/hms/opd") || p.includes("/hms/appointments") || p.includes("/hms/teleconsult") || p.includes("/hms/waitlist") || p.includes("/hms/shift-roster")) setActiveTab("doctor");
    else if (p.includes("/hms/patient") || p.includes("/hms/patients") || p.includes("/hms/treatment-timeline") || p.includes("/hms/integrative-medicine") || p.includes("/hms/billing") || p.includes("/hms/feedback")) setActiveTab("patient");
    else if (p.includes("/hms/stock") || p.includes("/hms/pharmacy")) setActiveTab("stock");
    else if (p.includes("/hms/lab") || p.includes("/hms/radiology") || p.includes("/hms/blood-bank")) setActiveTab("lab");
    else if (p.includes("/hms/accounts") || p.includes("/hms/credit-settlement")) setActiveTab("accounts");
    else if (p.includes("/hms/mis") || p.includes("/hms/reports") || p.includes("/hms/governance")) setActiveTab("mis");
    else if (p.includes("/hms/ayurveda") || p.includes("/hms/siddha") || p.includes("/hms/homeopathy") || p.includes("/hms/unani") || p.includes("/hms/yoga") || p.includes("/hms/naturopathy") || p.includes("/hms/panchakarma") || p.includes("/hms/pk-") || p.includes("/hms/icd-") || p.includes("/hms/namaste") || p.includes("/hms/sna-") || p.includes("/hms/classical") || p.includes("/hms/manufacturing") || p.includes("/hms/therapy-appointments")) setActiveTab("ayush");
    else if (p.includes("/hms/spine-ayush") || p.includes("/hms/spine-modules") || p.includes("/hms/spine-therapies") || p.includes("/hms/spine-community") || p.includes("/hms/spine-therapy-session") || p.includes("/hms/spine-patient-recovery") || p.includes("/hms/spine-level1")) setActiveTab("spine");
    else setActiveTab("dashboard");
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate("/hms/auth", { replace: true }); return; }
      if (mounted) { setUserEmail(data.session.user.email?.toLowerCase() ?? null); setChecking(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/hms/auth", { replace: true });
      else if (mounted) setUserEmail(session.user.email?.toLowerCase() ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const handleSignOut = async () => { await supabase.auth.signOut(); toast.success("Signed out"); navigate("/hms/auth"); };

  if (checking) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  const isSuperAdmin = userEmail === "curesure4u@gmail.com";
  if (!isSuperAdmin && accessLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Checking access...</div>;
  if (!isSuperAdmin && hasAccess === false) return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100"><Building2 className="h-8 w-8 text-amber-600" /></div>
        <div><h1 className="text-2xl font-bold">Access Pending Approval</h1><p className="text-muted-foreground mt-2">Contact your hospital administrator for HMS access.</p></div>
        <Button variant="outline" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
      </div>
    </div>
  );

  const sidebarItems = tabSubItems[activeTab] || [];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* TOP BAR */}
      <header className="h-14 border-b border-border bg-card flex items-center px-2 md:px-4 gap-2 sticky top-0 z-50">
        <Link to="/hms" className="flex items-center gap-2 mr-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary">
            <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
          </span>
          <span className="font-semibold text-sm hidden md:block">Ayuzee HMS</span>
        </Link>
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { if (tab.id === "more") setMoreOpen(!moreOpen); else { setActiveTab(tab.id); setMoreOpen(false); if (tab.id === "spine") navigate("/hms/spine-ayush"); }}}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"}`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] hidden md:flex">{branch ?? "HMS"}</Badge>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-7 w-7 p-0"><LogOut className="h-3.5 w-3.5" /></Button>
        </div>
      </header>

      {/* MORE MEGA DROPDOWN */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 pt-14" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-6xl mx-auto mt-1 bg-card border rounded-lg shadow-xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {moreItems.map((section) => (
                <div key={section.group}>
                  <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase">{section.group}</h4>
                  {section.items.map((item) => (
                    <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />{item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BODY: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* CONTEXTUAL SIDEBAR (desktop) */}
        {activeTab !== "more" && sidebarItems.length > 0 && (
          <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card overflow-y-auto">
            <nav className="p-3 space-y-0.5">
              {sidebarItems.map((item, i) => (
                <div key={item.to + i}>
                  {item.divider && (
                    <div className="mt-4 mb-2 px-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">{item.divider}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <NavLink
                    to={item.to}
                    end={item.to === "/hms"}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${isActive ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80 hover:bg-muted/60"}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className="h-3 w-3 ml-auto opacity-30" />
                  </NavLink>
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-card border-t border-border flex items-center justify-around z-50">
        {primaryTabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMoreOpen(false); if (tab.id === "spine") navigate("/hms/spine-ayush"); }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-[9px]">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition ${moreOpen ? "text-primary" : "text-muted-foreground"}`}
        >
          <Menu className="h-4 w-4" />
          <span className="text-[9px]">More</span>
        </button>
      </nav>
      <OnboardingWizard portal="hms" />
    </div>
  );
};

export default HmsLayout;
