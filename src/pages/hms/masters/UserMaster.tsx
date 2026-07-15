import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, Plus, Search, Edit, Trash2, Download, Shield,
  CheckCircle, XCircle, Eye, EyeOff, Copy, Key,
  Building2, MapPin, Phone, Mail, Clock,
} from "lucide-react";

type User = {
  id: string;
  code: string;
  name: string;
  loginId: string;
  role: string[];
  department: string[];
  mobile: string;
  email: string;
  location: string[];
  pageView: string;
  designation: string;
  status: "active" | "inactive" | "locked";
  createdAt: string;
  createdBy: string;
  lastLogin: string;
};

const ROLES = [
  "Admin", "SuperAdmin", "Doctor", "FrontOffice", "Nurse", "Pharmacist",
  "LabTechnician", "Therapist", "Accounts", "HR", "MIS", "StoreManager",
  "PharmacyAdmin", "ReceptionManager", "BillingManager", "RadiologyTech",
];

const DEPARTMENTS = [
  "Ayurveda", "Siddha", "Homeopathy", "Unani", "Yoga & Naturopathy",
  "Panchakarma", "Pharmacy", "Laboratory", "Radiology", "Front Office",
  "IPD", "OPD", "Administration", "Accounts", "HR", "IT", "Housekeeping",
  "Store", "Manufacturing", "Research",
];

const PAGE_VIEWS = ["HMS", "Clinical", "Pharmacy", "Lab", "MIS", "Admin", "All"];

const LOCATIONS = [
  "Ayuzee Main Hospital - Trivandrum",
  "Ayuzee City Center - Kochi",
  "Ayuzee Wellness Hub - Calicut",
  "Ayuzee Panchakarma Center - Thrissur",
  "Ayuzee Suburban Clinic - Ernakulam",
];

const LAB_DEPTS = [
  "AYUSH", "BIOCHEMISTRY", "CLINICAL PATHOLOGY", "CT", "ENDOCRINOLOGY",
  "HAEMATOLOGY", "IMMUNOLOGY", "MICROBIOLOGY", "MRI", "RADIOLOGY",
  "SEROLOGY", "ULTRASONOGRAPHY", "X-RAY",
];

const mockUsers: User[] = [
  { id: "1", code: "U_1", name: "ADMIN", loginId: "al-admin", role: ["Admin", "SuperAdmin"], department: ["Administration"], mobile: "9042225333", email: "admin@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "All", designation: "System Admin", status: "active", createdAt: "2024-01-15 10:00", createdBy: "System", lastLogin: "2026-07-15 09:30" },
  { id: "2", code: "U_2", name: "Dr. Arun Sharma", loginId: "arun.sharma", role: ["Doctor"], department: ["Ayurveda", "Panchakarma"], mobile: "9876543210", email: "arun@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum", "Ayuzee Panchakarma Center - Thrissur"], pageView: "Clinical", designation: "Senior Consultant - Ayurveda", status: "active", createdAt: "2023-04-01 11:00", createdBy: "admin", lastLogin: "2026-07-15 08:45" },
  { id: "3", code: "U_3", name: "Dr. Meena Patel", loginId: "meena.patel", role: ["Doctor"], department: ["Panchakarma"], mobile: "9876543211", email: "meena@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum", "Ayuzee City Center - Kochi"], pageView: "Clinical", designation: "Panchakarma Specialist", status: "active", createdAt: "2024-01-15 14:00", createdBy: "admin", lastLogin: "2026-07-15 09:00" },
  { id: "4", code: "U_4", name: "Rajesh K", loginId: "rajesh.reception", role: ["FrontOffice"], department: ["Front Office"], mobile: "9876543212", email: "rajesh@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "HMS", designation: "Senior Receptionist", status: "active", createdAt: "2024-06-01 09:00", createdBy: "admin", lastLogin: "2026-07-15 08:30" },
  { id: "5", code: "U_5", name: "Vikram R", loginId: "vikram.pharma", role: ["Pharmacist", "StoreManager"], department: ["Pharmacy", "Store"], mobile: "9876543214", email: "vikram@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "Pharmacy", designation: "Chief Pharmacist", status: "active", createdAt: "2024-03-01 10:00", createdBy: "admin", lastLogin: "2026-07-14 17:30" },
  { id: "6", code: "U_6", name: "Anita D", loginId: "anita.lab", role: ["LabTechnician"], department: ["Laboratory"], mobile: "9876543215", email: "anita@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "Lab", designation: "Lab Technician", status: "active", createdAt: "2024-08-01 11:00", createdBy: "admin", lastLogin: "2026-07-15 08:00" },
  { id: "7", code: "U_7", name: "Suresh Therapist", loginId: "suresh.therapy", role: ["Therapist"], department: ["Panchakarma"], mobile: "9876543216", email: "suresh@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum", "Ayuzee Panchakarma Center - Thrissur"], pageView: "HMS", designation: "Senior Therapist", status: "active", createdAt: "2022-01-10 10:00", createdBy: "admin", lastLogin: "2026-07-15 07:45" },
  { id: "8", code: "U_8", name: "Kavita S", loginId: "kavita.admin", role: ["Admin", "HR", "Accounts"], department: ["Administration", "HR", "Accounts"], mobile: "9876543217", email: "kavita@ayuzee.com", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "Admin", designation: "Admin Manager", status: "active", createdAt: "2022-06-15 09:00", createdBy: "admin", lastLogin: "2026-07-15 09:15" },
  { id: "9", code: "U_9", name: "Old Staff Member", loginId: "old.staff", role: ["FrontOffice"], department: ["Front Office"], mobile: "9876543220", email: "", location: ["Ayuzee Main Hospital - Trivandrum"], pageView: "HMS", designation: "Receptionist", status: "inactive", createdAt: "2021-05-01 10:00", createdBy: "admin", lastLogin: "2025-03-15 17:00" },
];

const UserMaster = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [search, setSearch] = useState("");
  const [users] = useState<User[]>(mockUsers);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formLoginId, setFormLoginId] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoles, setFormRoles] = useState<string[]>([]);
  const [formPageView, setFormPageView] = useState("HMS");
  const [formLocation, setFormLocation] = useState("");
  const [formMultiLocation, setFormMultiLocation] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState("");
  const [formLabDepts, setFormLabDepts] = useState<string[]>([]);
  const [formWorkingDept, setFormWorkingDept] = useState("");
  const [formTrustedIp, setFormTrustedIp] = useState("");
  const [formMisDateRange, setFormMisDateRange] = useState("");
  const [formMisAllLocationRange, setFormMisAllLocationRange] = useState("");
  const [formEnableCounseling, setFormEnableCounseling] = useState(false);
  const [formCanAuthorizeDiscount, setFormCanAuthorizeDiscount] = useState(false);
  const [formAvoidDiscount, setFormAvoidDiscount] = useState(false);
  const [formMaxDiscountPct, setFormMaxDiscountPct] = useState("");
  const [formMaxDiscountAmt, setFormMaxDiscountAmt] = useState("");
  // AYUSH-specific permissions
  const [formCanPrescribe, setFormCanPrescribe] = useState(true);
  const [formCanViewEMR, setFormCanViewEMR] = useState(true);
  const [formCanAccessPanchakarma, setFormCanAccessPanchakarma] = useState(false);
  const [formCanAccessManufacturing, setFormCanAccessManufacturing] = useState(false);
  const [formCanAccessABDM, setFormCanAccessABDM] = useState(false);
  const [formCanAccessAIScribe, setFormCanAccessAIScribe] = useState(false);
  const [formCanAccessReports, setFormCanAccessReports] = useState(false);
  const [formCanAccessWhatsApp, setFormCanAccessWhatsApp] = useState(false);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.loginId.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile.includes(search) ||
    u.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = (role: string) => {
    setFormRoles(formRoles.includes(role) ? formRoles.filter((r) => r !== role) : [...formRoles, role]);
  };

  const toggleLabDept = (dept: string) => {
    setFormLabDepts(formLabDepts.includes(dept) ? formLabDepts.filter((d) => d !== dept) : [...formLabDepts, dept]);
  };

  const handleSaveUser = () => {
    if (!formName.trim()) return toast.error("Name is required");
    if (!formLoginId.trim()) return toast.error("Login ID is required");
    if (!formPassword && !editingUser) return toast.error("Password is required");
    if (formRoles.length === 0) return toast.error("Select at least one role");
    toast.success(editingUser ? "User updated successfully" : "User created successfully");
    setActiveTab("list");
    resetForm();
  };

  const resetForm = () => {
    setFormName(""); setFormMobile(""); setFormEmail(""); setFormDesignation("");
    setFormLoginId(""); setFormPassword(""); setFormRoles([]); setFormPageView("HMS");
    setFormLocation(""); setFormMultiLocation([]); setFormCategory(""); setFormLabDepts([]);
    setFormWorkingDept(""); setFormTrustedIp(""); setFormMisDateRange("");
    setFormMisAllLocationRange(""); setFormEnableCounseling(false);
    setFormCanAuthorizeDiscount(false); setFormAvoidDiscount(false);
    setFormMaxDiscountPct(""); setFormMaxDiscountAmt("");
    setFormCanPrescribe(true); setFormCanViewEMR(true); setFormCanAccessPanchakarma(false);
    setFormCanAccessManufacturing(false); setFormCanAccessABDM(false);
    setFormCanAccessAIScribe(false); setFormCanAccessReports(false); setFormCanAccessWhatsApp(false);
    setEditingUser(null);
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormMobile(user.mobile);
    setFormEmail(user.email);
    setFormDesignation(user.designation);
    setFormLoginId(user.loginId);
    setFormRoles(user.role);
    setFormPageView(user.pageView);
    setActiveTab("create");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> User Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, access permissions, locations & module access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Exported as CSV")}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setActiveTab("create"); }}>
            <Plus className="mr-1 h-4 w-4" /> Create User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Manage Users</TabsTrigger>
          <TabsTrigger value="create">{editingUser ? "Edit User" : "Create User"}</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        {/* USER LIST TAB */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Organization level user interface view is <strong>HMS</strong>
            </p>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="ID or Name or Mobile" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">S.No</th>
                      <th className="px-3 py-2 text-left font-medium">Code</th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Login ID</th>
                      <th className="px-3 py-2 text-left font-medium">View/</th>
                      <th className="px-3 py-2 text-left font-medium">Department</th>
                      <th className="px-3 py-2 text-left font-medium">Mobile</th>
                      <th className="px-3 py-2 text-left font-medium">Location</th>
                      <th className="px-3 py-2 text-left font-medium">Created At</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => (
                      <tr key={user.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-mono text-xs">{user.code}</td>
                        <td className="px-3 py-2">
                          <span className={`font-medium ${user.status === "active" ? "text-primary" : "text-muted-foreground"}`}>{user.name}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{user.loginId}</td>
                        <td className="px-3 py-2 text-xs">
                          {user.pageView} /<br />{user.role.join(", ")}
                        </td>
                        <td className="px-3 py-2 text-xs">{user.department.join(", ")}</td>
                        <td className="px-3 py-2">{user.mobile}</td>
                        <td className="px-3 py-2 text-xs">
                          {user.location.map((l, li) => (
                            <span key={li} className="block">• {l.split(" - ")[0]}</span>
                          ))}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{user.createdAt}</td>
                        <td className="px-3 py-2">
                          <Badge variant={user.status === "active" ? "outline" : "destructive"} className={`text-xs ${user.status === "active" ? "text-green-600" : ""}`}>
                            {user.status === "active" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editUser(user)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE/EDIT USER TAB */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b bg-primary/5">
              <CardTitle className="text-base text-center">
                {editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Name <span className="text-red-500">*</span></Label>
                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full Name" />
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <div className="flex gap-1">
                      <Select defaultValue="+91">
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="+91">+91 IN</SelectItem></SelectContent>
                      </Select>
                      <Input value={formMobile} onChange={(e) => setFormMobile(e.target.value)} placeholder="Mobile No" className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label>E-Mail</Label>
                    <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="E-Mail" />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} placeholder="Work Designation" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">e.g., Senior Consultant, Professor</p>
                  </div>
                </div>
              </div>

              {/* Login & Access */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Login & Access</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>User ID <span className="text-red-500">*</span></Label>
                    <Input value={formLoginId} onChange={(e) => setFormLoginId(e.target.value)} placeholder="Login ID / ayuzee-hospital01" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Unique login ID for the user</p>
                  </div>
                  <div>
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Password" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Min 8 characters, 1 alphabet, 1 digit</p>
                  </div>
                  <div>
                    <Label>Role <span className="text-red-500">*</span></Label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                      {ROLES.map((role) => (
                        <label key={role} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded">
                          <Checkbox checked={formRoles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                          {role}
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Select multiple roles</p>
                  </div>
                  <div>
                    <Label>Page View</Label>
                    <Select value={formPageView} onValueChange={setFormPageView}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_VIEWS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Top Menu will change as per selection</p>
                  </div>
                </div>
              </div>

              {/* Location & Department */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Location & Department</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Select value={formLocation} onValueChange={setFormLocation}>
                      <SelectTrigger><SelectValue placeholder="Choose Location" /></SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Primary work location</p>
                  </div>
                  <div>
                    <Label>Multi-Location</Label>
                    <div className="border rounded-md p-2 max-h-24 overflow-y-auto space-y-1">
                      {LOCATIONS.map((loc) => (
                        <label key={loc} className="flex items-center gap-2 text-[11px] cursor-pointer">
                          <Checkbox checked={formMultiLocation.includes(loc)} onCheckedChange={(checked) => {
                            setFormMultiLocation(checked ? [...formMultiLocation, loc] : formMultiLocation.filter(l => l !== loc));
                          }} />
                          {loc.split(" - ")[0]}
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Multi-location access</p>
                  </div>
                  <div>
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lab/Radiology Dept</Label>
                    <div className="border rounded-md p-2 max-h-24 overflow-y-auto space-y-1">
                      {LAB_DEPTS.map((dept) => (
                        <label key={dept} className="flex items-center gap-2 text-[11px] cursor-pointer">
                          <Checkbox checked={formLabDepts.includes(dept)} onCheckedChange={() => toggleLabDept(dept)} />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Restrictions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Security & Restrictions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>User Working Department</Label>
                    <Input value={formWorkingDept} onChange={(e) => setFormWorkingDept(e.target.value)} placeholder="Department" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Group users by working department</p>
                  </div>
                  <div>
                    <Label>Trusted IP</Label>
                    <Input value={formTrustedIp} onChange={(e) => setFormTrustedIp(e.target.value)} placeholder="Select IP Range" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Valid IP addresses for login</p>
                  </div>
                  <div>
                    <Label>MIS User DateRange</Label>
                    <Input value={formMisDateRange} onChange={(e) => setFormMisDateRange(e.target.value)} placeholder="Days" />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <Checkbox checked={formEnableCounseling} onCheckedChange={(c) => setFormEnableCounseling(!!c)} />
                    <Label className="text-sm">Enable Counseling Module</Label>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>MIS User All Location DateRange</Label>
                  <Input value={formMisAllLocationRange} onChange={(e) => setFormMisAllLocationRange(e.target.value)} placeholder="Days" className="max-w-xs" />
                </div>
              </div>

              {/* Discount Restriction */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Discount Restriction</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formCanAuthorizeDiscount} onCheckedChange={(c) => setFormCanAuthorizeDiscount(!!c)} />
                    <div>
                      <Label className="text-sm font-medium">Can authorize discount?</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formAvoidDiscount} onCheckedChange={(c) => setFormAvoidDiscount(!!c)} />
                    <div>
                      <Label className="text-sm font-medium">Avoid adding discount</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Maximum Discount % Allowed</Label>
                    <Input type="number" value={formMaxDiscountPct} onChange={(e) => setFormMaxDiscountPct(e.target.value)} placeholder="Percentage" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Should not be more than 100</p>
                  </div>
                  <div>
                    <Label>Maximum Discount Amount Allowed</Label>
                    <Input type="number" value={formMaxDiscountAmt} onChange={(e) => setFormMaxDiscountAmt(e.target.value)} placeholder="Amount" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Should be less than 0 for no limit</p>
                  </div>
                </div>
              </div>

              {/* AYUSH Module Access (Ayuzee-specific - beyond MocDoc) */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">AYUSH Module Access Permissions</h3>
                <p className="text-xs text-muted-foreground mb-3">Control which advanced modules this user can access</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">Prescriptions</Label>
                    <Switch checked={formCanPrescribe} onCheckedChange={setFormCanPrescribe} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">EMR Access</Label>
                    <Switch checked={formCanViewEMR} onCheckedChange={setFormCanViewEMR} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">Panchakarma Module</Label>
                    <Switch checked={formCanAccessPanchakarma} onCheckedChange={setFormCanAccessPanchakarma} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">Manufacturing</Label>
                    <Switch checked={formCanAccessManufacturing} onCheckedChange={setFormCanAccessManufacturing} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">ABDM Connect</Label>
                    <Switch checked={formCanAccessABDM} onCheckedChange={setFormCanAccessABDM} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">AI Scribe</Label>
                    <Switch checked={formCanAccessAIScribe} onCheckedChange={setFormCanAccessAIScribe} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">MIS Reports</Label>
                    <Switch checked={formCanAccessReports} onCheckedChange={setFormCanAccessReports} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label className="text-xs">WhatsApp Engage</Label>
                    <Switch checked={formCanAccessWhatsApp} onCheckedChange={setFormCanAccessWhatsApp} />
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveUser}>
                  {editingUser ? "Update User" : "Create User"}
                </Button>
                <Button variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLE MANAGEMENT TAB */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Role & Permission Matrix
                </CardTitle>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Create Role</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button asChild variant="default" size="sm">
                  <Link to="/hms/masters/roles">
                    <Shield className="mr-1 h-4 w-4" /> Open Full Role Management (Granular Permissions)
                  </Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Role</th>
                      <th className="px-2 py-2 text-center font-medium">Dashboard</th>
                      <th className="px-2 py-2 text-center font-medium">OPD</th>
                      <th className="px-2 py-2 text-center font-medium">IPD</th>
                      <th className="px-2 py-2 text-center font-medium">EMR</th>
                      <th className="px-2 py-2 text-center font-medium">Billing</th>
                      <th className="px-2 py-2 text-center font-medium">Pharmacy</th>
                      <th className="px-2 py-2 text-center font-medium">Lab</th>
                      <th className="px-2 py-2 text-center font-medium">Panchakarma</th>
                      <th className="px-2 py-2 text-center font-medium">MIS</th>
                      <th className="px-2 py-2 text-center font-medium">HR</th>
                      <th className="px-2 py-2 text-center font-medium">Masters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: "Admin", perms: [1,1,1,1,1,1,1,1,1,1,1] },
                      { role: "Doctor", perms: [1,1,1,1,0,0,1,1,1,0,0] },
                      { role: "FrontOffice", perms: [1,1,0,0,1,0,0,0,0,0,0] },
                      { role: "Nurse", perms: [1,1,1,1,0,0,1,1,0,0,0] },
                      { role: "Pharmacist", perms: [1,0,0,0,1,1,0,0,0,0,0] },
                      { role: "LabTechnician", perms: [1,0,0,0,0,0,1,0,0,0,0] },
                      { role: "Therapist", perms: [1,0,0,0,0,0,0,1,0,0,0] },
                      { role: "Accounts", perms: [1,0,0,0,1,1,0,0,1,0,0] },
                      { role: "HR", perms: [1,0,0,0,0,0,0,0,0,1,0] },
                      { role: "MIS", perms: [1,1,1,1,1,1,1,1,1,0,0] },
                    ].map((r) => (
                      <tr key={r.role} className="border-b hover:bg-muted/30">
                        <td className="px-2 py-2 font-medium">{r.role}</td>
                        {r.perms.map((p, i) => (
                          <td key={i} className="px-2 py-2 text-center">
                            {p ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-300 mx-auto" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click on any cell to toggle permissions. Changes are saved automatically.
              </p>
            </CardContent>
          </Card>

          {/* E-Sign Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">E-Sign Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Configure digital signature for prescriptions and reports.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition">
                  <Key className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-medium">Upload Signature Image</p>
                  <p className="text-[10px] text-muted-foreground">PNG/JPG, max 200KB</p>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition">
                  <Shield className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-medium">Upload Digital Certificate</p>
                  <p className="text-[10px] text-muted-foreground">DSC / .pfx file</p>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition">
                  <Building2 className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-medium">Upload Seal/Stamp</p>
                  <p className="text-[10px] text-muted-foreground">Hospital seal image</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserMaster;
