import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Plus, Save, Search, CheckSquare, Square } from "lucide-react";

// Define all permission categories with their individual permissions
// Adapted from MocDoc's structure + AYUSH-specific modules
const PERMISSION_SECTIONS: Record<string, string[]> = {
  "Front Office": [
    "Patient Registration", "Edit Patient", "Delete Patient", "View Patient List",
    "Create Appointment", "Edit Appointment", "Cancel Appointment", "Reschedule Appointment",
    "View Appointment List", "Online Appointment", "Walk-in Registration",
    "Token Generation", "Queue Management", "Self Check-in Kiosk",
    "Print Patient Card", "QR Code Generation", "UHID Management",
    "Family Linking", "Corporate Patient Mapping", "VIP Patient Flagging",
    "Referral Tracking", "Follow-up Scheduling", "WhatsApp Confirmation Send",
    "SMS Reminder Send", "Teleconsultation Initiate", "Video Consult Link Generate",
  ],
  "OPD": [
    "View OPD Queue", "Issue Token", "Edit Token", "Cancel Token",
    "Mark In-Progress", "Mark Completed", "Transfer Patient",
    "Department Change", "Doctor Reassignment", "Priority Override",
    "View Queue Display", "Manage Queue Display Settings",
    "Print Token Slip", "SMS Token Alert",
  ],
  "EMR & Clinical": [
    "Create Consultation", "Edit Consultation", "View Consultation History",
    "SOAP Notes - Create", "SOAP Notes - Edit", "SOAP Notes - View",
    "Voice-to-Text (AI Scribe)", "Clinical Image Upload", "PDF Document Upload",
    "Lab Integration View", "Prescription Create", "Prescription Edit",
    "Prescription Print", "Prescription WhatsApp Send", "Prescription ABDM Push",
    "Digital Signature", "Progress Charts View", "Follow-up Plan Create",
    "Discharge Summary Create", "Discharge Summary Print",
    "Clinical Template Use", "Template Create/Edit",
    "Patient History Full View", "Patient History Print",
  ],
  "Ayurveda Module": [
    "Ashtavidha Pareeksha - Create", "Ashtavidha Pareeksha - Edit", "Ashtavidha Pareeksha - View",
    "Dashavidha Pareeksha - Create", "Dashavidha Pareeksha - Edit",
    "Prakruti Assessment", "Vikruti Analysis", "Dosha Scoring",
    "Agni Assessment", "Ama Assessment", "Ojas Assessment",
    "Samprapti Builder", "Chikitsa Siddhanta",
    "Nadi Pareeksha Record", "Dhatu Assessment",
    "Ayurveda Prescription Create", "Classical Medicine Search",
  ],
  "Siddha Module": [
    "Envagai Thervu - Create", "Envagai Thervu - Edit", "Envagai Thervu - View",
    "Neikuri Examination", "Manikadai Nool",
    "Siddha Diagnosis Create", "Siddha Prescription Create",
    "Pulse Assessment (Naadi)",
  ],
  "Homeopathy Module": [
    "Case Taking - Create", "Case Taking - Edit", "Case Taking - View",
    "Repertorization", "Remedy Selection", "Miasm Analysis",
    "Follow-up Evaluation", "Kent Repertory Access",
    "Materia Medica Access", "Homeopathy Prescription Create",
  ],
  "Unani Module": [
    "Mizaj Assessment", "Nabz Examination", "Akhlat Assessment",
    "Ilaj Planning", "Unani Prescription Create",
    "Regimental Therapy Assign",
  ],
  "Yoga & Naturopathy": [
    "Yoga Assessment Create", "Lifestyle Scoring",
    "Exercise Prescription", "Diet Plan Create",
    "Naturopathy Treatment Assign", "Wellness Tracking",
    "Meditation Protocol Assign",
  ],
  "Panchakarma": [
    "View Panchakarma Dashboard", "Schedule Session", "Edit Session", "Cancel Session",
    "Mark Session Complete", "Session Notes Record", "Vitals Before/After",
    "Therapist Assignment", "Room Allocation", "Oil Usage Record",
    "Package Create", "Package Edit", "Package Assign to Patient",
    "Treatment Progress View", "Before/After Photo Upload",
    "Therapy Schedule View", "Therapy Schedule Edit",
    "Daily Treatment Record", "Oil Stock Deduction",
    "Package Balance View", "Adverse Event Report",
  ],
  "Lab & Diagnostics": [
    "View Lab Orders", "Create Lab Order", "Edit Lab Order", "Cancel Lab Order",
    "Sample Collection", "Sample Accession", "Record Sample Taken",
    "Result Entry", "Result Verification", "Result Approval",
    "Print Lab Report", "Email Lab Report", "WhatsApp Lab Report",
    "View Completed Orders", "View Pending Orders",
    "Critical Value Alert", "Retest Order", "Outsource Order",
    "Lab QC Results", "Lab Barcode Print", "Lab MIS Reports",
    "Edit Normal Values", "Template Module Order",
    "Radiology Order", "Radiology Result Upload", "PACS View",
  ],
  "Pharmacy & Stocks": [
    "View Stock", "Add Stock (GRN)", "Edit Stock", "Stock Adjustment",
    "Dispense Medicine", "E-Prescription Dispense", "Barcode Scan Dispense",
    "View Low Stock", "View Expiry List", "Generate Purchase Order",
    "Edit Purchase Order", "Approve Purchase Order", "Cancel Purchase Order",
    "Purchase Requisition Create", "PR Approval",
    "GRN Create", "GRN Edit", "GRN Verify", "GRN Cancel",
    "Stock Transfer Between Stores", "Stock Return",
    "Batch Management", "Expiry Management",
    "Sale Create", "Sale Edit", "Sale Return", "Sale Cancel",
    "Print Sale Bill", "Email Sale Bill",
    "Counter Sale", "Ward Requisition", "Indent Management",
    "Supplier Management", "Price Update",
    "Pharmacy MIS Reports", "GST Reports",
    "Disposal Initiate", "Disposal Approve",
  ],
  "Manufacturing": [
    "View Batch Records", "Create Batch", "Edit Batch", "Approve Batch",
    "Raw Material Inventory", "Raw Material QC",
    "Formulation View", "Formulation Create/Edit",
    "Quality Control - Test Entry", "Quality Control - Approve",
    "Stability Testing", "GMP Documentation",
    "Label Generation", "Cost Calculation",
    "Vendor Management", "Batch Yield Report",
  ],
  "Billing & Accounts": [
    "Create OP Bill", "Edit OP Bill", "Cancel OP Bill", "Print OP Bill",
    "Create IP Bill", "Edit IP Bill", "Cancel IP Bill", "Print IP Bill",
    "Therapy Billing", "Package Billing", "Pharmacy Billing",
    "Advance Payment Collect", "Refund Process",
    "Discount Apply", "Discount Authorize", "Discount Override",
    "GST Invoice Generate", "E-Invoice Generate",
    "Payment Mode - Cash", "Payment Mode - Card", "Payment Mode - UPI",
    "Payment Mode - Insurance", "Payment Mode - Credit",
    "Insurance Claim Submit", "Insurance Pre-auth",
    "Settlement Create", "Settlement Approve",
    "Due List View", "Credit Bill Settle",
    "Daily Collection Report", "MIS Accounts Reports",
    "Expense Create", "Expense Approve", "Petty Cash Manage",
    "Income Entry", "Tally Export", "Franchise Invoice",
  ],
  "IPD & Ward": [
    "IP Admission Create", "IP Admission Edit", "IP Discharge",
    "Ward Allocation", "Room Transfer", "Bed Management",
    "Ward Requisition Create", "Nursing Notes",
    "Medication Administration", "Vitals Record",
    "Diet Order", "Consultant Visit Record",
    "Discharge Summary Create", "Discharge Summary Approve",
    "IP Bill Finalize", "IP Advance Collect",
  ],
  "Inventory & Assets": [
    "View Inventory", "Add Inventory Item", "Edit Inventory Item",
    "Purchase Order Create", "Purchase Order Approve",
    "Goods Received Note", "Indent Create", "Indent Approve",
    "Stock Transfer", "Stock Adjustment", "Disposal",
    "Asset Register", "Asset Assign", "Asset Maintenance",
    "Asset Calibration", "Asset Decommission",
    "AMC Management", "Warranty Track",
  ],
  "HR & Payroll": [
    "Manage Employee", "Create Employee", "Update Employee", "View Employee",
    "Attendance Mark", "Attendance Override", "Leave Approve",
    "Leave Type Create", "Holiday Manage",
    "Payroll Generate", "Payroll Approve", "Payslip Print",
    "Salary Component Create", "Incentive Generate",
    "Performance Appraisal", "Appraisal Approve",
    "Department Master", "Designation Create",
    "Shift Management", "Overtime Approve",
    "Employee Self-Service", "Download Payslip",
    "Create Role", "Update Role", "Role Master",
  ],
  "MIS Collection": [
    "My Daily Summary", "Consultation Collection", "My Income By Dept",
    "My Income By Dept Format2", "My Income By Dept With Expense", "Daily Summary",
    "My Income By Dept VisitWise", "My Income By Consultant", "My Income By Referral",
    "User Wise Collection", "My User Wise Collection", "Lab Collection",
    "My Income BillWise", "My Net Collection", "My Transaction",
    "MIS Shiftwise Collection", "My OPIP Cancelled Bills", "My Sale Cancelled Bills",
    "My Sale Return Cancelled Bills", "Income By Dept Format2", "Income By Dept With Expense",
  ],
  "MIS Accounts": [
    "Net Collection", "Total Income", "Shift Userwise",
    "Shiftwise Collection", "Sale Counter BillWise", "OP Counter BillWise",
    "IP Counter BillWise", "Billwise Bill Value", "Provider Billwise",
    "Income By Month", "Income By Consultant", "Income By Patient",
    "Income By Patient Source", "Income By Nature of Visit (O/P)", "Income By Nature of Visit (I/P)",
    "Income By Dept/Group - Userwise", "Income By Billwise - Userwise",
    "Income By Marketing Executive", "Income By Referral",
    "Income By PaymentType", "Total Expense", "Expense By Month",
    "Expense By Type", "Expense By Consultant", "Expense By Patient",
    "Due All", "Due Detailed", "Due Aging", "Due Written Off",
    "Credit Bills All", "Credit Bills Pending", "Credit Bills Settled",
    "Invoice OP", "Invoice IP", "Invoice All",
  ],
  "MIS Stock": [
    "Schedule Register", "Current Stock - Consolidated",
    "Current Stock - Batch Wise", "Current Stock - Supplier Wise",
    "Current Stock - Category Wise", "Zero Stock",
    "ReOrder List", "Expiry List", "Short Expiry List",
    "Fast Moving Stock", "Slow Moving Stock", "Non Moving Stock",
    "Product Flow Analysis", "ABC-VED Analysis",
    "Sale - Product Wise", "Sale - Patient Wise", "Sale - Tax Wise",
    "Sale Margin", "Purchase Order", "Goods Received Notes",
  ],
  "MIS Lab": [
    "By Date - Test Granular", "By Date - Test Consolidated",
    "By Test - Test Granular", "By Test - Test Consolidated",
    "By Dept", "By Patient", "By Consultant",
    "By Machine", "Outsourced - All",
    "TAT - By Test", "TAT - By Department", "TAT - By Order",
    "Cancelled Orders", "Rejected Orders", "ReTest",
    "OHS Results Status", "Emergency - By Date", "Emergency TAT",
  ],
  "MIS Visit & Patient": [
    "OP Casesheet Summary", "Medication Administered", "Diet",
    "Patient Followed Up", "Visit By Type", "MIS Footfall",
    "Appointment VS Checkin", "Old VS New Patient", "Visit Per Dr",
    "VideoConsultation - By Date", "VideoConsultation - By Speciality",
    "IP Discharge Summary", "IP Discharge TAT",
    "Room Occupancy", "Transfer Room",
    "Registration By Patient Source", "Registration By Area",
    "Registration By Type", "Registration By Tag",
    "Checked In - By Speciality", "Hospital Referrals",
  ],
  "MIS Appointment": [
    "By Speciality", "By Tokenwise", "By Date",
    "Staff Wise Detail", "Staff Wise Total", "Booked Via",
    "Waiting Time Per Dr", "Waiting List", "Waiting List Cancelled",
    "Rescheduled List", "Online Appointments By Date",
    "Online Waiting List", "Online Cancelled List",
  ],
  "ABDM & Digital Health": [
    "Link Patient Visit with ABHA", "Create ABHA Account", "Verify ABHA Account",
    "HIU Make Consent Request", "Create ABHA Consent Request", "View ABHA Consent Data",
    "Push Health Record to ABDM", "Fetch Health Record from ABDM",
    "FHIR Resource View", "ABDM Dashboard View",
  ],
  "AI & Intelligence": [
    "AI Scribe - Record Consultation", "AI Scribe - Generate Notes",
    "AI Assist - Case Summary", "AI Assist - Diagnosis Suggestion",
    "AI Assist - Treatment Plan", "AI Assist - Prescription Draft",
    "AI Assist - Discharge Summary", "CDSS Alerts View",
    "CDSS Interaction Checker", "Records Analyser - Upload",
    "Records Analyser - View Extracted", "OCR Process",
  ],
  "WhatsApp & Communication": [
    "Send Prescription via WhatsApp", "Send Appointment Reminder",
    "Send Follow-up Nudge", "Send Medicine Reminder",
    "Broadcast Message", "Template Management",
    "View Message Log", "View Analytics",
    "SMS Send", "Email Send",
  ],
  "Print Configuration": [
    "Print Configuration Manage", "Lab Print", "Radiology Print",
    "General Print", "I/P Visit", "O/P Visit",
    "O/P Bill", "I/P Bill", "Prescription Print",
    "Discharge Summary Print", "Barcode Print",
    "Patient ID Card", "Patient Certificate", "Reports Print",
    "Stocks Print", "Token Print", "Invoice Print",
  ],
  "Research & Academic": [
    "Create Research Project", "Edit Research Project", "View Research Projects",
    "Publication Entry", "CME Management", "Student Logbook",
    "Thesis Management", "Case Series Document",
  ],
  "Public Health & Outreach": [
    "Create Health Camp", "Edit Health Camp", "View Camp Reports",
    "School Screening", "Community Program",
    "Wellness Campaign", "Referral Tracking",
  ],
  "Developer & API": [
    "View API Keys", "Generate API Key", "Revoke API Key",
    "Webhook Management", "Sandbox Access",
    "API Documentation View", "Usage Analytics",
  ],
  "Command Center": [
    "Multi-Branch Dashboard", "Branch Performance View",
    "Video Consultation Launch", "Video Consultation Join",
    "Google Business Analytics", "Franchisee Management",
    "Revenue Comparison", "Cross-Branch Patient Search",
  ],
};

type Role = {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  createdAt: string;
  isSystem: boolean;
};

const mockRoles: Role[] = [
  { id: "1", name: "SuperAdmin", description: "Full access to all modules", usersCount: 1, createdAt: "2024-01-01", isSystem: true },
  { id: "2", name: "Admin", description: "Administrative access without system settings", usersCount: 2, createdAt: "2024-01-01", isSystem: true },
  { id: "3", name: "Doctor", description: "Clinical access - EMR, Prescriptions, AYUSH modules", usersCount: 5, createdAt: "2024-01-01", isSystem: true },
  { id: "4", name: "FrontOffice", description: "Registration, Appointments, Queue, Billing", usersCount: 3, createdAt: "2024-01-01", isSystem: true },
  { id: "5", name: "Pharmacist", description: "Pharmacy, Stock management, Dispensing", usersCount: 2, createdAt: "2024-01-01", isSystem: true },
  { id: "6", name: "LabTechnician", description: "Lab orders, Results, Reports", usersCount: 2, createdAt: "2024-01-01", isSystem: true },
  { id: "7", name: "Therapist", description: "Panchakarma sessions, Treatment records", usersCount: 4, createdAt: "2024-01-01", isSystem: true },
  { id: "8", name: "Nurse", description: "IPD, Medication administration, Vitals", usersCount: 3, createdAt: "2024-02-01", isSystem: false },
  { id: "9", name: "Accounts", description: "Billing, Collections, Expenses, MIS Accounts", usersCount: 2, createdAt: "2024-03-01", isSystem: false },
  { id: "10", name: "MIS Viewer", description: "Read-only access to all MIS reports", usersCount: 3, createdAt: "2024-06-01", isSystem: false },
];

const RoleMaster = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [roles] = useState<Role[]>(mockRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [searchPerm, setSearchPerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(Object.keys(PERMISSION_SECTIONS));

  const togglePermission = (perm: string) => {
    setSelectedPermissions({ ...selectedPermissions, [perm]: !selectedPermissions[perm] });
  };

  const selectAllInSection = (section: string) => {
    const perms = PERMISSION_SECTIONS[section];
    const allSelected = perms.every((p) => selectedPermissions[p]);
    const updated = { ...selectedPermissions };
    perms.forEach((p) => { updated[p] = !allSelected; });
    setSelectedPermissions(updated);
  };

  const deselectAllInSection = (section: string) => {
    const updated = { ...selectedPermissions };
    PERMISSION_SECTIONS[section].forEach((p) => { updated[p] = false; });
    setSelectedPermissions(updated);
  };

  const isSectionAllSelected = (section: string) => {
    return PERMISSION_SECTIONS[section].every((p) => selectedPermissions[p]);
  };

  const isSectionPartial = (section: string) => {
    const perms = PERMISSION_SECTIONS[section];
    const selected = perms.filter((p) => selectedPermissions[p]).length;
    return selected > 0 && selected < perms.length;
  };

  const getSectionCount = (section: string) => {
    return PERMISSION_SECTIONS[section].filter((p) => selectedPermissions[p]).length;
  };

  const totalPermissions = Object.values(PERMISSION_SECTIONS).flat().length;
  const totalSelected = Object.values(selectedPermissions).filter(Boolean).length;

  const handleSave = () => {
    if (!roleName.trim()) return toast.error("Role name is required");
    toast.success(editingRole ? "Role updated successfully" : "Role created successfully");
    setActiveTab("list");
    setRoleName(""); setRoleDesc(""); setSelectedPermissions({}); setEditingRole(null);
  };

  const editRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    // Simulate pre-selected permissions
    const perms: Record<string, boolean> = {};
    if (role.name === "SuperAdmin") {
      Object.values(PERMISSION_SECTIONS).flat().forEach((p) => { perms[p] = true; });
    }
    setSelectedPermissions(perms);
    setActiveTab("create");
  };

  const filteredSections = Object.entries(PERMISSION_SECTIONS).map(([section, perms]) => ({
    section,
    perms: searchPerm ? perms.filter((p) => p.toLowerCase().includes(searchPerm.toLowerCase())) : perms,
  })).filter((s) => s.perms.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" /> Role Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create roles with granular permissions for every module and action
          </p>
        </div>
        <Button onClick={() => { setEditingRole(null); setRoleName(""); setRoleDesc(""); setSelectedPermissions({}); setActiveTab("create"); }}>
          <Plus className="mr-1 h-4 w-4" /> Create Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Roles</TabsTrigger>
          <TabsTrigger value="create">{editingRole ? "Edit Role" : "Create Role"}</TabsTrigger>
        </TabsList>

        {/* ROLE LIST */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Role Name</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                      <th className="px-4 py-3 text-left font-medium">Users</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Created</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, i) => (
                      <tr key={role.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-primary">{role.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{role.description}</td>
                        <td className="px-4 py-3"><Badge variant="secondary">{role.usersCount}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge variant={role.isSystem ? "outline" : "default"} className="text-xs">
                            {role.isSystem ? "System" : "Custom"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{role.createdAt}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => editRole(role)}>
                            Edit Permissions
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE/EDIT ROLE */}
        <TabsContent value="create" className="space-y-4">
          {/* Role Name & Description */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Role Name <span className="text-red-500">*</span></Label>
                  <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g., Senior Doctor, Branch Manager" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} placeholder="Brief description of this role's access level" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {totalSelected} / {totalPermissions} permissions selected
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {Object.keys(PERMISSION_SECTIONS).length} modules
              </Badge>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-xs" placeholder="Search permissions..." value={searchPerm} onChange={(e) => setSearchPerm(e.target.value)} />
            </div>
          </div>

          {/* Permission Sections */}
          <div className="space-y-4">
            {filteredSections.map(({ section, perms }) => (
              <Card key={section}>
                <CardHeader className="pb-2 bg-primary/5 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-sm text-primary">{section}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {getSectionCount(section)}/{PERMISSION_SECTIONS[section].length}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isSectionAllSelected(section) ? "default" : "outline"}
                        className="h-6 text-[10px] px-2"
                        onClick={() => selectAllInSection(section)}
                      >
                        <CheckSquare className="h-3 w-3 mr-1" /> Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2 text-red-600"
                        onClick={() => deselectAllInSection(section)}
                      >
                        <Square className="h-3 w-3 mr-1" /> Deselect All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                    {perms.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                        <Checkbox
                          checked={!!selectedPermissions[perm]}
                          onCheckedChange={() => togglePermission(perm)}
                        />
                        <span className={selectedPermissions[perm] ? "font-medium" : "text-muted-foreground"}>
                          {perm}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <Card className="sticky bottom-0 z-10 border-t-2 border-primary">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Role: <span className="text-primary">{roleName || "(unnamed)"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalSelected} permissions selected across {Object.entries(PERMISSION_SECTIONS).filter(([s]) => getSectionCount(s) > 0).length} modules
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab("list")}>Cancel</Button>
                <Button onClick={handleSave}>
                  <Save className="mr-1 h-4 w-4" /> {editingRole ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleMaster;
