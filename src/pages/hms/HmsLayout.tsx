import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHmsAccess } from "@/hooks/useHmsAccess";
import { EntityProvider } from "@/contexts/EntityContext";
import EntitySwitcher from "@/components/hms/EntitySwitcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Building2, LogOut, Users, CalendarClock, ClipboardList,
  ReceiptText, Activity, BarChart3, Home, Pill, BedDouble,
  FlaskConical, UserCog, Settings, Syringe, ChevronRight,
  Zap, Menu, X, Leaf, Heart, Droplets, Moon, Dumbbell,
  Sparkles, FileText, Package, Factory, Warehouse, Wallet,
  GraduationCap, Globe, Smartphone, Brain, Stethoscope,
  ScanLine, LayoutGrid, Megaphone, Shield, Shirt, Target,
  Truck, RotateCcw, Receipt, History, Award, BookOpen, AlertTriangle, Clock,
  Trash2, Thermometer, Calculator, Lock, RefreshCw, TrendingDown,
  Phone, CreditCard,
} from "lucide-react";

// ─── PRIMARY TABS (bottom bar on mobile, icon sidebar on desktop) ───
const primaryTabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "doctor", label: "Doctor", icon: Stethoscope },
  { id: "patient", label: "Patient", icon: Users },
  { id: "stock", label: "Stock", icon: Pill },
  { id: "investigation", label: "Lab", icon: FlaskConical },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "mis", label: "MIS", icon: BarChart3 },
  { id: "ayush", label: "AYUSH", icon: Leaf },
  { id: "spine", label: "Spine", icon: Activity },
  { id: "more", label: "More", icon: LayoutGrid },
];

// ─── CONTEXTUAL SUB-ITEMS for each primary tab ───
type NavItem = { to: string; label: string; icon: typeof Home; divider?: string };

const tabSubItems: Record<string, NavItem[]> = {
  dashboard: [
    // ── Overview ──
    { to: "/hms", label: "Dashboard", icon: Home, divider: "Overview" },
    { to: "/hms/owner-dashboard", label: "Owner / Investor View", icon: Building2 },
    { to: "/hms/branch-dashboard", label: "Branch Dashboard", icon: Building2 },
    { to: "/hms/branch-performance", label: "Branch Performance", icon: Target },
    { to: "/hms/command-center", label: "Command Center", icon: Globe },
    { to: "/hms/data-analytics", label: "Data Analytics & BI", icon: BarChart3 },
    { to: "/hms/gamification-kpi", label: "Gamification & KPI", icon: Activity },
    // ── Hospital Management ──
    { to: "/hms/branch-management", label: "Hospital Profile", icon: Building2, divider: "Hospital Mgmt" },
    { to: "/hms/masters", label: "Master Settings", icon: Settings },
    { to: "/hms/masters/users", label: "User Management", icon: Users },
    { to: "/hms/masters/roles", label: "Roles & Permissions", icon: Settings },
    { to: "/hms/masters/service-providers", label: "Service Provider / Supplier", icon: Users },
    { to: "/hms/masters/data-import", label: "Import Patient / Data", icon: FileText },
    // ── Configuration ──
    { to: "/hms/print-configuration", label: "Print Configuration", icon: Settings, divider: "Configuration" },
    { to: "/hms/widget-generator", label: "Widget Generator", icon: Settings },
    { to: "/hms/switch-entity", label: "Switch Entity", icon: Building2 },
    { to: "/hms/settings", label: "Settings", icon: Settings },
  ],
  doctor: [
    // ── My Practice (daily cockpit) ──
    { to: "/hms/consultation-hub", label: "Consultation Hub", icon: Stethoscope, divider: "My Practice" },
    { to: "/hms/opd", label: "OPD Queue & Tokens", icon: Activity },
    { to: "/hms/appointments", label: "My Appointments", icon: CalendarClock },
    { to: "/hms/teleconsult", label: "Teleconsultation", icon: Smartphone },
    { to: "/hms/waitlist", label: "Waitlist (AI)", icon: Users },
    { to: "/hms/doctor-followups", label: "Follow-up Tracker (AI)", icon: Users },
    { to: "/hms/doctor-inbox", label: "Doctor Inbox", icon: ClipboardList },
    // ── Clinical Workflow (during consultation) ──
    { to: "/hms/doctor-retention", label: "Retention Engine (AI)", icon: Heart, divider: "Clinical Workflow" },
    { to: "/hms/doctor-soap-notes", label: "Smart Consultation", icon: Brain },
    { to: "/hms/doctor-templates", label: "Prescription Center", icon: Pill },
    { to: "/hms/doctor-diet", label: "Patient Guidance", icon: Leaf },
    { to: "/hms/doctor-prakriti", label: "Examination Center", icon: Activity },
    { to: "/hms/doctor-lab-order", label: "Lab & Procedure Orders", icon: FlaskConical },
    { to: "/hms/doctor-referral", label: "Referral & Discharge", icon: FileText },
    // ── AYUSH Reference ──
    { to: "/hms/doctor-formulary", label: "AFI Formulary (AI)", icon: Leaf, divider: "AYUSH Reference" },
    { to: "/hms/doctor-astg", label: "ASTG Disease Index (AI)", icon: ClipboardList },
    { to: "/hms/doctor-research", label: "Clinical Research (AI)", icon: GraduationCap },
    // ── My Analytics ──
    { to: "/hms/doctor-kpi", label: "Doctor Dashboard", icon: BarChart3, divider: "My Analytics" },
    { to: "/hms/doctor-case-discussion", label: "AI Case Discussion", icon: Brain },
    { to: "/hms/doctor-chat", label: "Doctor Chat", icon: Users },
    { to: "/hms/doctor-patient-brief", label: "Patient Brief (AI)", icon: Users },
    { to: "/hms/work-schedule", label: "Duty Roster", icon: CalendarClock },
    // ── Tools & Speed ──
    { to: "/hms/doctor/ai-scribe", label: "AI Scribe (Voice)", icon: Brain, divider: "Tools & Speed" },
    { to: "/hms/doctor/templates", label: "Quick Templates", icon: FileText },
    { to: "/hms/doctor/protocols", label: "Treatment Protocols", icon: ClipboardList },
    { to: "/hms/doctor/cdss", label: "CDSS Alerts", icon: AlertTriangle },
    { to: "/hms/doctor/ai-dx", label: "AI Differential Dx", icon: Brain },
    // ── Documentation ──
    { to: "/hms/doctor/procedure-notes", label: "Procedure Notes", icon: FileText, divider: "Documentation" },
    { to: "/hms/doctor/post-op", label: "Post-Op / Post-PK Care", icon: Activity },
    { to: "/hms/doctor/certificates", label: "Certificates", icon: Shield },
    { to: "/hms/doctor/consent", label: "Consent Builder", icon: FileText },
    { to: "/hms/doctor/annotation", label: "Image Annotation", icon: FileText },
    { to: "/hms/doctor/handoff", label: "Shift Handoff", icon: Users },
    // ── Revenue & Growth ──
    { to: "/hms/doctor/revenue", label: "My Earnings", icon: Wallet, divider: "Revenue & Growth" },
    { to: "/hms/doctor/queue-analytics", label: "Queue Analytics", icon: BarChart3 },
    { to: "/hms/doctor/second-opinion", label: "Second Opinion", icon: Users },
    { to: "/hms/doctor/cme", label: "CME & Learning", icon: GraduationCap },
    { to: "/hms/doctor/calendar", label: "Leave & Calendar", icon: CalendarClock },
    // ── AYUSH Clinical Tools ──
    { to: "/hms/doctor/roga-nidana", label: "Roga-Nidana Worksheet", icon: ClipboardList, divider: "AYUSH Clinical Tools" },
    { to: "/hms/doctor/pk-prescription", label: "Panchakarma Rx Builder", icon: Droplets },
    { to: "/hms/doctor/yoga-rx", label: "Yoga Prescription", icon: Heart },
    { to: "/hms/doctor/dravya-guna", label: "Dravya-Guna Search", icon: Leaf },
    { to: "/hms/doctor/prakriti-rx", label: "Prakriti-aware Rx", icon: AlertTriangle },
    // ── Patient Engagement ──
    { to: "/hms/patient/daily-logger", label: "Patient Daily Logger", icon: Activity, divider: "Patient Engagement" },
    { to: "/hms/patient/goals", label: "Goals & Streaks", icon: Target },
    { to: "/hms/patient/community", label: "Wellness Community", icon: Users },
    { to: "/hms/patient/subscription", label: "Subscription Plans", icon: CreditCard },
  ],
  patient: [
    // ── Registration & Front Desk ──
    { to: "/hms/patient/leads", label: "Lead Capture & Funnel", icon: Target },
    { to: "/hms/patient/register", label: "Register Patient", icon: Users, divider: "Registration" },
    { to: "/hms/patient/manage-op", label: "Manage OP (Check-in)", icon: Activity },
    { to: "/hms/patients", label: "Patient Registry (Find)", icon: Users },
    { to: "/hms/patient/find", label: "Quick Search (AI)", icon: Brain },
    // ── Patient 360° View ──
    { to: "/hms/patient/dashboard", label: "Patient Dashboard", icon: Home, divider: "Patient 360°" },
    { to: "/hms/patient/profile", label: "Profile & History", icon: Users },
    { to: "/hms/patient/vitals", label: "Vitals & Growth", icon: Heart },
    { to: "/hms/patient/mrd", label: "Documents & MRD", icon: FileText },
    // ── Clinical (Doctor) ──
    { to: "/hms/patient/casesheet", label: "Case Sheet (Ayurveda)", icon: Leaf, divider: "Clinical" },
    { to: "/hms/patient/prescription", label: "Prescription (AI)", icon: Pill },
    { to: "/hms/treatment-timeline", label: "Treatment & Outcomes", icon: Activity },
    // ── Billing & Finance ──
    { to: "/hms/patient/bills", label: "Bills & Payments", icon: ReceiptText, divider: "Finance" },
    { to: "/hms/billing/insurance", label: "Insurance & TPA", icon: Wallet },
    // ── In-Patient ──
    { to: "/hms/patient/ip-summary", label: "IP / Admission", icon: BedDouble, divider: "In-Patient" },
    // ── Communication ──
    { to: "/hms/patient/appointments", label: "Appointments", icon: CalendarClock, divider: "Engagement" },
    { to: "/hms/patient/messages", label: "Messages & Reminders", icon: Smartphone },
    { to: "/hms/patient/call-center", label: "Call Center", icon: Phone },
    { to: "/hms/patient/voice-agent", label: "AI Voice Agent", icon: Smartphone },
    { to: "/hms/patient/noshow-analytics", label: "No-show Analytics", icon: AlertTriangle },
    { to: "/hms/feedback", label: "Feedback & PROMs", icon: Heart },
    // ── AYUSH Clinical ──
    { to: "/hms/patient/prakriti-profile", label: "Prakriti Profile", icon: Leaf, divider: "AYUSH Clinical" },
    { to: "/hms/patient/treatment-plan", label: "Treatment Planner", icon: CalendarClock },
    { to: "/hms/patient/compliance", label: "Compliance Score", icon: Target },
    { to: "/hms/patient/daily-logger", label: "Daily Logger", icon: Activity },
    { to: "/hms/patient/goals", label: "Goals & Streaks", icon: Target },
    { to: "/hms/patient/community", label: "Wellness Community", icon: Users },
    { to: "/hms/patient/subscription", label: "Subscription Plans", icon: CreditCard },
    // ── Records & Safety ──
    { to: "/hms/patient/timeline", label: "Patient Timeline", icon: Activity, divider: "Records & Safety" },
    { to: "/hms/patient/allergies", label: "Allergies & Alerts", icon: AlertTriangle },
    { to: "/hms/patient/ai-brief", label: "AI Patient Brief", icon: Brain },
    { to: "/hms/patient/family", label: "Family Records", icon: Users },
    { to: "/hms/patient/abha", label: "ABHA / PHR", icon: Globe },
    { to: "/hms/patient/photos", label: "Clinical Photos", icon: FileText },
    { to: "/hms/patient/discharge", label: "Discharge Summary", icon: FileText },
    // ── Future & AI ──
    { to: "/hms/patient/journey", label: "Patient Journey Map", icon: Target, divider: "Future & AI" },
    { to: "/hms/patient/risk-score", label: "AI Risk Score", icon: AlertTriangle },
    { to: "/hms/patient/mental-health", label: "Mental Health (PHQ/GAD)", icon: Brain },
    { to: "/hms/patient/remote-monitoring", label: "Remote Monitoring", icon: Smartphone },
    { to: "/hms/patient/ai-coach", label: "AI Health Coach", icon: Smartphone },
    { to: "/hms/patient/genomic", label: "Genomic Profile", icon: Activity },
  ],

  stock: [
    { to: "/hms/stock", label: "Stock Dashboard", icon: Warehouse },
    { to: "/hms/stock-quick-dispensing", label: "Quick Dispensing (POS)", icon: ScanLine },
    { to: "/hms/stock/product", label: "Products & Masters", icon: Package },
    { to: "/hms/pharmacy", label: "Pharmacy", icon: Pill },
    // ── Purchase & Sale ──
    { to: "/hms/stock/purchase/po", label: "Purchase Order", icon: ClipboardList, divider: "Purchase & Sale" },
    { to: "/hms/stock/purchase/grn", label: "GRN (Goods Receipt)", icon: ClipboardList },
    { to: "/hms/stock-purchase-return", label: "Purchase Return", icon: RotateCcw },
    { to: "/hms/stock/sale/new", label: "Sale Bill & Dispensing", icon: ReceiptText },
    { to: "/hms/stock/sale/return", label: "Sale Return", icon: ReceiptText },
    { to: "/hms/stock-patient-return", label: "Patient Return / Exchange", icon: RotateCcw },
    { to: "/hms/stock-return-policy", label: "Return Policy Engine", icon: Settings },
    { to: "/hms/stock-rx-sync", label: "Rx-to-Stock Sync", icon: Lock },
    { to: "/hms/stock-subscription", label: "Medicine Subscription", icon: RefreshCw },
    { to: "/hms/stock-dose-calculator", label: "Dose Calculator & Bill Instructions", icon: Calculator },
    { to: "/hms/stock-medicine-mixing", label: "Medicine Mixing (Kerala Model)", icon: FlaskConical },
    // ── Indent & Transfer ──
    { to: "/hms/stock/indent/new", label: "Indent / Issue", icon: ClipboardList, divider: "Indent & Transfer" },
    { to: "/hms/stock-indent-approval", label: "Indent Approval Workflow", icon: Users },
    { to: "/hms/stock-inter-branch", label: "Inter-Branch Transfer", icon: Warehouse },
    { to: "/hms/stock-branch-transfer", label: "Branch-to-Branch Request", icon: Building2 },
    { to: "/hms/stock-central-store", label: "Central Store (Hub)", icon: Warehouse },
    { to: "/hms/stock-courier-dispatch", label: "Courier Dispatch", icon: Truck },
    { to: "/hms/stock-order-fulfillment", label: "Online Order Fulfillment", icon: Truck },
    { to: "/hms/stock-kit-assembly", label: "Kit / Package Assembly", icon: Package },
    // ── AI & Analytics ──
    { to: "/hms/stock/ai/reorder", label: "AI Smart Reorder", icon: Brain, divider: "AI & Analytics" },
    { to: "/hms/stock-reorder-level", label: "Min/Max/ROL", icon: BarChart3 },
    { to: "/hms/stock-redistribution", label: "Redistribution AI", icon: Brain },
    { to: "/hms/stock-consumption", label: "Consumption Dashboard", icon: BarChart3 },
    { to: "/hms/stock-franchise-portal", label: "Franchise Order Portal", icon: Building2 },
    { to: "/hms/stock-supplier-sla", label: "Supplier Performance SLA", icon: Award },
    { to: "/hms/stock-abc-analysis", label: "ABC/VED/FSN Analysis", icon: BarChart3 },
    { to: "/hms/stock-substitute-suggestion", label: "Substitute AI", icon: Brain },
    { to: "/hms/stock-seasonal-demand", label: "Seasonal Demand (Ritu)", icon: Leaf },
    { to: "/hms/stock-purchase-rate", label: "Rate Comparison", icon: Receipt },
    { to: "/hms/stock-vendor-rating", label: "Vendor Rating", icon: Award },
    { to: "/hms/stock-short-book", label: "Short-Book / Demand", icon: BookOpen },
    { to: "/hms/stock-patient-dispensing", label: "Patient Dispensing History", icon: Users },
    { to: "/hms/stock-drug-interaction", label: "Drug Interaction Check", icon: AlertTriangle },
    // ── Compliance & Tracking ──
    { to: "/hms/stock-drug-license", label: "Drug License & Form 41", icon: Shield, divider: "Compliance" },
    { to: "/hms/stock-epharmacy", label: "e-Pharmacy License", icon: Globe },
    { to: "/hms/stock-ndps", label: "NDPS Register", icon: Lock },
    { to: "/hms/stock-drug-schedule", label: "Drug Schedule (H/H1/E1)", icon: Shield },
    { to: "/hms/stock-gst-returns", label: "GST / HSN / ITC", icon: Receipt },
    { to: "/hms/stock-eway-bill", label: "E-way Bill", icon: Truck },
    { to: "/hms/stock-barcode", label: "Barcode / QR", icon: ScanLine },
    { to: "/hms/stock-batch-tracking", label: "Batch Tracking", icon: Package },
    { to: "/hms/stock-audit-trail", label: "Audit Trail (GMP)", icon: History },
    { to: "/hms/stock-rate-contract", label: "Rate Contract", icon: FileText },
    // ── Expiry & Wastage ──
    { to: "/hms/stock-near-expiry", label: "Near-Expiry & FEFO", icon: AlertTriangle, divider: "Expiry & Wastage" },
    { to: "/hms/stock/ai/expiry", label: "AI Expiry Management", icon: Brain },
    { to: "/hms/stock-expiry-return", label: "Expiry Return to Supplier", icon: RotateCcw },
    { to: "/hms/stock-dead-stock", label: "Dead Stock", icon: Activity },
    { to: "/hms/stock-wastage", label: "Wastage Register", icon: Trash2 },
    { to: "/hms/stock-physical-verification", label: "Physical Verification", icon: ClipboardList },
    // ── Finance ──
    { to: "/hms/stock-supplier-payment", label: "Supplier Payment & Aging", icon: Wallet, divider: "Finance" },
    { to: "/hms/stock/credit/supplier", label: "Credit Supplier", icon: Wallet },
    { to: "/hms/stock/credit/patient", label: "Credit Patient", icon: Wallet },
    { to: "/hms/stock/expense", label: "Expense", icon: Wallet },
    { to: "/hms/stock-insurance", label: "Insurance & Claims", icon: Shield },
    // ── AYUSH Specific ──
    { to: "/hms/stock-pk-oil-tracker", label: "PK Oil Tracker", icon: Droplets, divider: "AYUSH Specific" },
    { to: "/hms/stock-herb-procurement", label: "Herb Procurement & QC", icon: Leaf },
    { to: "/hms/stock-yoga-kshema", label: "Shelf-life (Yoga Kshema)", icon: Clock },
    { to: "/hms/stock-manufacturing-batch", label: "Manufacturing Batch", icon: Factory },
    { to: "/hms/stock-homeopathy", label: "Homeopathy Stock", icon: FlaskConical },
    { to: "/hms/stock-temp-humidity", label: "Temp & Humidity (IoT)", icon: Thermometer },
    // ── Setup ──
    { to: "/hms/stock-daily-summary", label: "Daily Stock Summary", icon: FileText, divider: "Daily Ops" },
    { to: "/hms/stock/master/manufacturer", label: "Masters & Setup", icon: Settings, divider: "Setup" },
    { to: "/hms/stock-rack-location", label: "Rack / Location", icon: ClipboardList },
    { to: "/hms/stock-ecommerce", label: "E-Commerce Sync", icon: Globe },
    { to: "/hms/stock-ondc", label: "ONDC Integration", icon: Globe },
    { to: "/hms/stock/product-flow", label: "Product Flow Report", icon: BarChart3 },
    { to: "/hms/stock/due", label: "Due Management", icon: FileText },
  ],
  investigation: [
    { to: "/hms/lab-diagnostics", label: "Lab Dashboard", icon: FlaskConical, divider: "Dashboard" },
    { to: "/hms/lab-diagnostics/ai", label: "AI Lab Intelligence", icon: Brain },
    { to: "/hms/lab-diagnostics/exceptions", label: "Exception Dashboard", icon: Activity },
    { to: "/hms/lab-diagnostics/mis-reports", label: "MIS Reports", icon: BarChart3 },
    // ── Test & Orders ──
    { to: "/hms/lab-diagnostics/test", label: "Manage Tests", icon: FlaskConical, divider: "Test & Orders" },
    { to: "/hms/lab-diagnostics/profile", label: "Manage Profiles", icon: FileText },
    { to: "/hms/lab-diagnostics/order", label: "Lab Orders", icon: ClipboardList },
    { to: "/hms/lab-diagnostics/order-status", label: "Order Status", icon: Activity },
    { to: "/hms/lab-diagnostics/result-entry", label: "Result Entry", icon: ClipboardList },
    { to: "/hms/lab-diagnostics/reports", label: "Report Generation", icon: FileText },
    { to: "/hms/lab-diagnostics/smart-reports", label: "Smart Reports", icon: Brain },
    // ── Sample & Collection ──
    { to: "/hms/lab-diagnostics/sample-tracking", label: "Sample Tracking", icon: Activity, divider: "Sample & Collection" },
    { to: "/hms/lab-diagnostics/barcode", label: "Barcode", icon: ScanLine },
    { to: "/hms/lab-diagnostics/home-collection", label: "Home Collection", icon: Home },
    { to: "/hms/lab-diagnostics/camp", label: "Camp Management", icon: Users },
    { to: "/hms/lab-diagnostics/appointments", label: "Appointments", icon: CalendarClock },
    // ── Operations ──
    { to: "/hms/lab-diagnostics/machine-interface", label: "Machine Interface", icon: Settings, divider: "Operations" },
    { to: "/hms/lab-diagnostics/tat-monitoring", label: "TAT Monitoring", icon: Clock },
    { to: "/hms/lab-diagnostics/outsource", label: "Outsource / Refout", icon: Globe },
    { to: "/hms/lab-diagnostics/qc", label: "Quality Control", icon: Activity },
    { to: "/hms/lab-diagnostics/reagent-inventory", label: "Reagent Inventory", icon: Package },
    { to: "/hms/lab-diagnostics/report-templates", label: "Report Templates", icon: FileText },
    // ── Finance ──
    { to: "/hms/lab-diagnostics/billing", label: "Billing & Payment", icon: Wallet, divider: "Finance" },
    { to: "/hms/lab-diagnostics/online-payment", label: "Online Payment", icon: Wallet },
    { to: "/hms/lab-diagnostics/rate-plans", label: "Rate Plans", icon: FileText },
    { to: "/hms/lab-diagnostics/referral-commission", label: "Referral Commission", icon: Users },
    { to: "/hms/lab-diagnostics/b2b-portal", label: "B2B Client Portal", icon: Building2 },
    // ── Patients & CRM ──
    { to: "/hms/lab-diagnostics/patient-crm", label: "Patient CRM", icon: Heart, divider: "Patients & CRM" },
    { to: "/hms/lab-diagnostics/patient-portal", label: "Patient Portal", icon: Globe },
    { to: "/hms/lab-diagnostics/packages", label: "Health Packages", icon: Package },
    { to: "/hms/lab-diagnostics/auto-comms", label: "Auto Communications", icon: Smartphone },
    { to: "/hms/lab-diagnostics/doctor-portal", label: "Doctor Portal", icon: Stethoscope },
    // ── AYUSH Diagnostics ──
    { to: "/hms/lab-diagnostics/nadi-pariksha", label: "Nadi Pariksha", icon: Activity, divider: "AYUSH Diagnostics" },
    { to: "/hms/lab-diagnostics/ayush-diagnostics", label: "Ashtavidha Pariksha", icon: Brain },
    // ── Master & Compliance ──
    { to: "/hms/lab-diagnostics/master/department", label: "Lab Masters", icon: Settings, divider: "Master & Compliance" },
    { to: "/hms/lab-diagnostics/accession", label: "Accession Config", icon: Settings },
    { to: "/hms/lab-diagnostics/nabl-compliance", label: "NABL Compliance", icon: Shield },
    { to: "/hms/lab-diagnostics/audit-trail", label: "Audit Trail", icon: FileText },
    { to: "/hms/lab-diagnostics/abdm-lab", label: "ABDM Integration", icon: Globe },
    { to: "/hms/lab-diagnostics/multi-location", label: "Multi-Location", icon: Building2 },
    // ── Imaging & Blood ──
    { to: "/hms/lab-diagnostics/radiology", label: "Radiology", icon: ScanLine, divider: "Imaging" },
    { to: "/hms/blood-bank", label: "Blood Bank", icon: Droplets, divider: "Blood" },
  ],
  accounts: [
    { to: "/hms/billing", label: "Billing & Invoices", icon: ReceiptText },
    { to: "/hms/accounts", label: "Accounts (AI)", icon: Wallet },
    { to: "/hms/credit-settlement", label: "Credit Settlement", icon: Wallet },
    // ── Revenue & Collection ──
    { to: "/hms/accounts/revenue", label: "Revenue Dashboard", icon: BarChart3, divider: "Revenue" },
    { to: "/hms/accounts/collection", label: "Payment Collection", icon: Wallet },
    { to: "/hms/accounts/sales-analytics", label: "Sales Analytics", icon: BarChart3 },
    { to: "/hms/accounts/target-achieved", label: "Target vs Achieved", icon: Target },
    { to: "/hms/accounts/day-end", label: "Day End / Shift Close", icon: Clock },
    { to: "/hms/accounts/cashier", label: "Cashier Role", icon: Users },
    // ── Expenses & Payroll ──
    { to: "/hms/accounts/expenses", label: "Expense Management", icon: TrendingDown, divider: "Expenses & Payroll" },
    { to: "/hms/accounts/payroll", label: "Payroll & Salary", icon: Users },
    { to: "/hms/accounts/incentive", label: "Incentive & Gamification", icon: Award },
    { to: "/hms/accounts/staff-credits", label: "Staff Credits", icon: Wallet },
    // ── Banking & Reconciliation ──
    { to: "/hms/accounts/bank-ai", label: "Bank Statement (AI)", icon: Brain, divider: "Banking" },
    { to: "/hms/accounts/reconciliation", label: "Bank Reconciliation", icon: RefreshCw },
    { to: "/hms/accounts/cash-flow", label: "Cash Flow Manager", icon: BarChart3 },
    { to: "/hms/accounts/supplier-franchise", label: "Supplier & Franchise", icon: Building2 },
    // ── Patient & CRM ──
    { to: "/hms/accounts/refund-advance", label: "Refund & Advance", icon: RotateCcw, divider: "Patient Finance" },
    { to: "/hms/accounts/followup", label: "Payment Follow-up", icon: Clock },
    { to: "/hms/accounts/crm", label: "Accounts CRM", icon: Heart },
    // ── Tax & Compliance ──
    { to: "/hms/accounts/gst", label: "GST Management", icon: Shield, divider: "Tax & Compliance" },
    { to: "/hms/accounts/tds", label: "TDS Management", icon: FileText },
    { to: "/hms/accounts/insurance", label: "Insurance & TPA", icon: Shield },
    // ── Reports ──
    { to: "/hms/accounts/financial-reports", label: "Financial Reports (P&L)", icon: BarChart3, divider: "Reports" },
    { to: "/hms/accounts/state-fund", label: "State Fund / Govt Claims", icon: Shield },
    { to: "/hms/accounts/tally", label: "Tally Export", icon: FileText },
    { to: "/hms/accounts/dashboard", label: "Accounts Dashboard", icon: Activity },
  ],
  mis: [
    { to: "/hms/mis", label: "MIS Reports (AI)", icon: BarChart3 },
    { to: "/hms/reports", label: "HMS Reports", icon: FileText },
    { to: "/hms/governance", label: "Governance Dashboard", icon: BarChart3 },
    // ── AI & Analytics ──
    { to: "/hms/mis/ai", label: "AI Interpretation", icon: Brain, divider: "AI & Analytics" },
    { to: "/hms/mis/filters", label: "Advanced Drill-down", icon: Target },
    { to: "/hms/data-analytics", label: "Data Analytics & BI", icon: BarChart3 },
    { to: "/hms/gamification-kpi", label: "Gamification & KPI", icon: Award },
    // ── Department Reports ──
    { to: "/hms/mis/collection", label: "Collection Reports", icon: Wallet, divider: "Department Reports" },
    { to: "/hms/mis/accounts", label: "Accounts Reports", icon: ReceiptText },
    { to: "/hms/mis/test-orders", label: "Lab & Test Reports", icon: FlaskConical },
    { to: "/hms/mis/stocks", label: "Stock & Pharmacy", icon: Package },
    { to: "/hms/mis/operational", label: "Operational Reports", icon: Activity },
    { to: "/hms/mis/org", label: "Organization / Branch", icon: Building2 },
  ],
  ayush: [
    { to: "/hms/ayurveda", label: "Ayurveda", icon: Leaf },
    { to: "/hms/siddha", label: "Siddha", icon: Droplets },
    { to: "/hms/homeopathy", label: "Homeopathy", icon: Heart },
    { to: "/hms/unani", label: "Unani", icon: Moon },
    { to: "/hms/yoga", label: "Yoga & Naturopathy", icon: Dumbbell },
    { to: "/hms/panchakarma", label: "Panchakarma", icon: Sparkles, divider: "Panchakarma" },
    { to: "/hms/panchakarma/schedule", label: "Therapy Schedule", icon: CalendarClock },
    { to: "/hms/panchakarma/packages", label: "Packages & Plans", icon: Package },
    { to: "/hms/therapy-appointments", label: "Therapy Appointments", icon: CalendarClock },
    { to: "/hms/pk-consent", label: "Consent & Docs", icon: FileText },
    { to: "/hms/integrative-medicine", label: "Integrative Medicine", icon: Leaf, divider: "Integrative" },
    { to: "/hms/icd-coding", label: "ICD Codes (AYUSH)", icon: ClipboardList },
    { to: "/hms/namaste-coding", label: "NAMASTE / TM2", icon: ClipboardList },
    { to: "/diagnosis/gut-health", label: "Gut Health Assessment", icon: Heart },
    { to: "/hms/manufacturing", label: "Manufacturing Unit", icon: Factory, divider: "Manufacturing" },
    // ── Therapy & Wellness ──
    { to: "/hms/ayush/panchakarma-therapy", label: "Panchakarma Therapy", icon: Droplets, divider: "Therapy & Wellness" },
    { to: "/hms/ayush/diet-pathya", label: "Diet & Pathya", icon: Leaf },
    { to: "/hms/ayush/wellness-score", label: "Wellness Score", icon: Heart },
    { to: "/hms/ayush/ritucharya", label: "Ritucharya & Dinacharya", icon: Clock },
    { to: "/hms/ayush/formulations", label: "AYUSH Formulations", icon: FlaskConical },
  ],
  spine: [
    { to: "/hms/spine-ayush", label: "Spine Dashboard", icon: Activity, divider: "Spine AYUSH" },
    { to: "/hms/spine-ayush?tab=assessment", label: "Assessment", icon: ClipboardList },
    { to: "/hms/spine-ayush?tab=examination", label: "Examination", icon: Stethoscope },
    { to: "/hms/spine-ayush?tab=level1", label: "Level 1 Treatment", icon: Activity },
    { to: "/hms/spine-ayush?tab=protocols", label: "Level 2 Protocols", icon: Brain },
    { to: "/hms/spine-ayush?tab=packages", label: "Packages", icon: Package },
    { to: "/hms/spine-ayush?tab=followup", label: "Follow-up", icon: CalendarClock },
    { to: "/hms/spine-ayush?tab=rejuvenation", label: "Rejuvenation", icon: Heart },
    { to: "/hms/spine-ayush?tab=connections", label: "Disease Map", icon: Target },
    { to: "/hms/spine-ayush?tab=community", label: "Community", icon: Users },
    { to: "/hms/spine-ayush?tab=franchise-ops", label: "Franchise Ops", icon: Building2 },
    { to: "/hms/spine-ayush?tab=funnel", label: "Funnel", icon: BarChart3 },
    { to: "/hms/spine-ayush?tab=community-hub", label: "Community Hub", icon: Globe },
    { to: "/hms/spine-ayush?tab=franchise", label: "Franchise KPIs", icon: Target },
  ],
};

// ─── "MORE" GRID items (grouped by category) ───
type MoreGridItem = { to: string; label: string; icon: typeof Home; category: string };

const moreGridItems: MoreGridItem[] = [
  // IPD & Nursing
  { to: "/hms/ipd", label: "IPD & Wards", icon: BedDouble, category: "IPD & Nursing" },
  { to: "/hms/nursing", label: "Nursing Station", icon: Heart, category: "IPD & Nursing" },
  { to: "/hms/diet-kitchen", label: "Diet & Kitchen", icon: Leaf, category: "IPD & Nursing" },
  { to: "/hms/ot", label: "Operation Theater", icon: Syringe, category: "IPD & Nursing" },
  { to: "/hms/procedures", label: "Procedures", icon: Syringe, category: "IPD & Nursing" },
  // AI & Intelligence
  { to: "/hms/ai-hub", label: "AI Hub", icon: Brain, category: "AI & Intelligence" },
  { to: "/hms/ai-assist", label: "AI Clinical", icon: Brain, category: "AI & Intelligence" },
  { to: "/hms/cdss", label: "CDSS Alerts", icon: Brain, category: "AI & Intelligence" },
  { to: "/hms/chatbot", label: "AI Chatbot", icon: Smartphone, category: "AI & Intelligence" },
  { to: "/hms/conflict-detection", label: "Conflict Detection", icon: ScanLine, category: "AI & Intelligence" },
  { to: "/hms/records-analyser", label: "Records Analyser", icon: ScanLine, category: "AI & Intelligence" },
  // HR & Staff
  { to: "/hms/hr", label: "HR & Payroll", icon: UserCog, category: "HR & Staff" },
  { to: "/hms/staff-attendance", label: "Attendance", icon: CalendarClock, category: "HR & Staff" },
  { to: "/hms/shift-roster", label: "Shift Rostering", icon: CalendarClock, category: "HR & Staff" },
  { to: "/hms/doctor-management", label: "Manage Doctors", icon: Stethoscope, category: "HR & Staff" },
  { to: "/hms/therapist-management", label: "Manage Therapists", icon: Heart, category: "HR & Staff" },
  // Marketing & Engage
  { to: "/hms/whatsapp", label: "WhatsApp", icon: Smartphone, category: "Marketing & Engage" },
  { to: "/hms/marketing", label: "Leads & Marketing", icon: Megaphone, category: "Marketing & Engage" },
  { to: "/hms/referral", label: "Referral Mgmt", icon: Users, category: "Marketing & Engage" },
  { to: "/hms/loyalty", label: "Loyalty Program", icon: Heart, category: "Marketing & Engage" },
  { to: "/hms/invite-friends", label: "Invite Friends", icon: Users, category: "Marketing & Engage" },
  { to: "/hms/address-book", label: "Address Book", icon: Users, category: "Marketing & Engage" },
  // Operations
  { to: "/hms/task-management", label: "Task Management", icon: ClipboardList, category: "Operations" },
  { to: "/hms/checklist", label: "Checklists", icon: ClipboardList, category: "Operations" },
  { to: "/hms/cssd-linen", label: "CSSD / Linen", icon: Shield, category: "Operations" },
  { to: "/hms/assets", label: "Assets", icon: Stethoscope, category: "Operations" },
  { to: "/hms/inventory", label: "Inventory", icon: Warehouse, category: "Operations" },
  { to: "/hms/indent", label: "Indent & Audit", icon: ClipboardList, category: "Operations" },
  { to: "/hms/ambulance", label: "Ambulance", icon: Globe, category: "Operations" },
  // Resort & Wellness
  { to: "/hms/reservation", label: "Reservation", icon: CalendarClock, category: "Resort & Wellness" },
  { to: "/hms/housekeeping", label: "Housekeeping", icon: Sparkles, category: "Resort & Wellness" },
  { to: "/hms/canteen", label: "Canteen", icon: Globe, category: "Resort & Wellness" },
  { to: "/hms/maintenance", label: "Maintenance", icon: Settings, category: "Resort & Wellness" },
  { to: "/hms/multi-currency", label: "Multi-Currency", icon: Globe, category: "Resort & Wellness" },
  // Research & Public Health
  { to: "/hms/research", label: "Research", icon: GraduationCap, category: "Research & Outreach" },
  { to: "/hms/public-health", label: "Public Health", icon: Globe, category: "Research & Outreach" },
  // Compliance
  { to: "/hms/nabh", label: "NABH", icon: Shield, category: "Compliance" },
  { to: "/hms/audit-trail", label: "Audit Trail", icon: FileText, category: "Compliance" },
  { to: "/hms/entity-log", label: "Entity Log", icon: FileText, category: "Compliance" },
  { to: "/hms/abdm", label: "ABDM Connect", icon: Globe, category: "Compliance" },
  { to: "/hms/phr", label: "PHR", icon: Heart, category: "Compliance" },
  // Admin & Settings
  { to: "/hms/queue-display", label: "Queue Display", icon: Smartphone, category: "Admin & Settings" },
  { to: "/hms/developer", label: "Developer", icon: Settings, category: "Admin & Settings" },
];

// ─── Determine active tab from URL ───
function getActiveTabFromPath(pathname: string): string {
  if (pathname === "/hms" || pathname.includes("branch-dashboard") || pathname.includes("command-center")) return "dashboard";
  if (pathname.includes("/hms/patient") || pathname.includes("emr") || pathname.includes("treatment-timeline") || pathname.includes("outcome-scales") || pathname.includes("proms") || pathname.includes("treatment-view") || pathname.includes("e-prescription") || pathname.includes("integrative-medicine") || pathname.includes("feedback")) return "patient";
  if (pathname.includes("/hms/stock") || pathname.includes("pharmacy") || pathname.includes("stock-inter") || pathname.includes("stock-batch") || pathname.includes("stock-ecommerce") || pathname.includes("stock-dead") || pathname.includes("stock-rack")) return "stock";
  if (pathname.includes("lab-diagnostics") || pathname.includes("radiology") || pathname.includes("blood-bank")) return "investigation";
  if (pathname.includes("billing") || pathname.includes("accounts") || pathname.includes("credit-settlement") || pathname.includes("insurance")) return "accounts";
  if (pathname.includes("mis") || pathname.includes("data-analytics") || pathname.includes("gamification") || pathname.includes("reports") || pathname.includes("governance")) return "mis";
  if (pathname.includes("ayurveda") || pathname.includes("siddha") || pathname.includes("homeopathy") || pathname.includes("unani") || pathname.includes("yoga") || pathname.includes("panchakarma") || pathname.includes("integrative") || pathname.includes("manufacturing") || pathname.includes("icd-coding") || pathname.includes("namaste") || pathname.includes("gut-health") || pathname.includes("therapy-appointments") || pathname.includes("pk-consent")) return "ayush";
  if (pathname.includes("spine-ayush")) return "spine";
  if (pathname.includes("opd") || pathname.includes("appointment") || pathname.includes("online-booking") || pathname.includes("waitlist") || pathname.includes("teleconsult") || pathname.includes("consultation") || pathname.includes("ai-scribe") || pathname.includes("work-schedule") || pathname.includes("doctor-")) return "doctor";
  return "more";
}

const HmsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { hasAccess, branch, loading: accessLoading } = useHmsAccess();

  const activeTab = getActiveTabFromPath(location.pathname);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/hms/auth", { replace: true });
        return;
      }
      if (mounted) setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/hms/auth", { replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/hms/auth");
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "more") {
      setMoreOpen(!moreOpen);
      return;
    }
    setMoreOpen(false);
    // Navigate to first item in that tab
    const items = tabSubItems[tabId];
    if (items?.[0]) navigate(items[0].to);
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Gate: if access check is still loading, show loading
  if (accessLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Checking access...
      </div>
    );
  }

  // Gate: if user is not approved for HMS access, show pending approval screen
  if (hasAccess === false) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Access Pending Approval</h1>
            <p className="text-muted-foreground mt-2">
              Your HMS access has not been approved yet. The administrator needs to grant you access before you can use the Hospital Management System.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 text-left text-sm text-blue-800 space-y-2">
            <p className="font-medium">What to do next:</p>
            <p>1. Contact your hospital administrator</p>
            <p>2. Ask them to approve your access in the Admin Panel</p>
            <p>3. Once approved, you can log in and use HMS</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="mt-4">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const currentSubItems = tabSubItems[activeTab] || [];
  const moreCategories = [...new Set(moreGridItems.map(i => i.category))];

  return (
    <EntityProvider>
    <div className="min-h-screen flex flex-col w-full bg-muted/30">

      {/* ─── TOP HEADER BAR ─── */}
      <header className="h-14 flex items-center justify-between border-b border-border bg-card px-3 md:px-5 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/hms" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-base font-semibold hidden sm:block">AYUSH HMS</span>
          </Link>
          <EntitySwitcher />
          {hasAccess && (
            <Badge className="bg-primary/10 text-primary border-primary/30 hidden sm:flex">
              <Zap className="mr-1 h-3 w-3" /> Active
            </Badge>
          )}
        </div>

        {/* Desktop top tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              } ${tab.id === "more" && moreOpen ? "bg-primary/10 text-primary" : ""}`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden lg:block">{branch}</span>
          <Button variant="ghost" size="sm" className="text-destructive hidden md:flex" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ─── MORE MEGA-DROPDOWN (desktop) ─── */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
          <div className="absolute top-14 left-0 right-0 z-50 bg-card border-b border-border shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {moreCategories.map((cat) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
                    <div className="space-y-1">
                      {moreGridItems.filter(i => i.category === cat).map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMoreOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                              isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"
                            }`
                          }
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t flex gap-2">
                <Button variant="ghost" size="sm" className="text-destructive md:hidden" onClick={handleSignOut}><LogOut className="mr-1 h-4 w-4" /> Sign Out</Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── MAIN BODY: Sidebar + Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT SIDEBAR (contextual sub-items) — desktop only ─── */}
        {activeTab !== "more" && currentSubItems.length > 0 && (
          <aside className={`hidden md:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-56" : "w-0 overflow-hidden"}`}>
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {primaryTabs.find(t => t.id === activeTab)?.label}
              </span>
              <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-1 rounded hover:bg-muted">
                <ChevronRight className={`h-3.5 w-3.5 transition ${sidebarExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-2 space-y-0.5">
                {currentSubItems.map((item, idx) => (
                  <div key={item.to}>
                    {item.divider && (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-1">{item.divider}</p>
                    )}
                    <NavLink
                      to={item.to}
                      end={item.to === "/hms"}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition ${
                          isActive
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-foreground/70 hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </aside>
        )}

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around px-1 py-1.5 safe-area-pb">
        {primaryTabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition min-w-[48px] ${
              activeTab === tab.id ? "text-primary" : "text-foreground/60"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
        {/* More button for remaining tabs on mobile */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition min-w-[48px] ${
            moreOpen ? "text-primary" : "text-foreground/60"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* ─── MOBILE MORE BOTTOM SHEET ─── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="relative bg-card rounded-t-2xl max-h-[80vh] overflow-y-auto pb-20">
            <div className="sticky top-0 bg-card pt-3 pb-2 px-4 border-b flex items-center justify-center">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            {/* Remaining tabs not in bottom bar */}
            <div className="px-4 py-3 grid grid-cols-4 gap-3">
              {primaryTabs.slice(5).filter(t => t.id !== "more").map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { handleTabClick(tab.id); setMoreOpen(false); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <tab.icon className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            {/* All more grid items */}
            <div className="px-4 pb-4">
              {moreCategories.map((cat) => (
                <div key={cat} className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {moreGridItems.filter(i => i.category === cat).map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border hover:bg-muted/50 text-center"
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="text-[9px] leading-tight">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </EntityProvider>
  );
};

export default HmsLayout;
