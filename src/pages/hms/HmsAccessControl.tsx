import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Users, Building2, Settings, CheckCircle2, XCircle, Clock, Search, Loader2 } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";

type HmsRole = "owner" | "branch_admin" | "branch_doctor" | "franchise_doctor" | "therapist" | "pharmacist" | "lab_tech" | "receptionist" | "camp_doctor" | "nurse";
type HmsModule = "dashboard" | "opd" | "clinical" | "patient" | "ipd" | "lab" | "stock" | "accounts" | "mis" | "ayush" | "panchakarma" | "spine" | "hr" | "marketing" | "masters" | "reports" | "all";

interface StaffMember {
  id: string; name: string; email: string; phone: string; designation: string;
  hmsAccess: boolean; role: HmsRole; branches: string[]; modules: HmsModule[];
  vaidyaAccess: boolean; accessExpiry: string | null; lastLogin: string;
}

const ALL_BRANCHES = ["Kadayanallur", "Tirunelveli", "Rajapalayam", "Theni", "Chennai", "Tenkasi"];
const ALL_MODULES: { id: HmsModule; label: string }[] = [
  { id: "all", label: "All Modules (Full Access)" },
  { id: "dashboard", label: "Dashboard & Analytics" },
  { id: "opd", label: "OPD / Front Office" },
  { id: "clinical", label: "Clinical (Consultation, Rx)" },
  { id: "patient", label: "Patient Management" },
  { id: "ipd", label: "IPD / Wards / Nursing" },
  { id: "lab", label: "Lab & Diagnostics" },
  { id: "stock", label: "Stock & Pharmacy" },
  { id: "accounts", label: "Accounts & Billing" },
  { id: "mis", label: "MIS & Reports" },
  { id: "ayush", label: "AYUSH (Panchakarma, Yoga)" },
  { id: "panchakarma", label: "Panchakarma Only" },
  { id: "spine", label: "Spine AYUSH" },
  { id: "hr", label: "HR & Staff" },
  { id: "marketing", label: "Marketing & Engagement" },
  { id: "masters", label: "Master Settings" },
  { id: "reports", label: "Reports Only" },
];

const ALL_ROLES: { id: HmsRole; label: string; defaultModules: HmsModule[] }[] = [
  { id: "owner", label: "Owner / Super Admin", defaultModules: ["all"] },
  { id: "branch_admin", label: "Branch Admin", defaultModules: ["all"] },
  { id: "branch_doctor", label: "Branch Doctor", defaultModules: ["dashboard", "opd", "clinical", "patient", "lab", "ayush", "panchakarma", "spine"] },
  { id: "franchise_doctor", label: "Franchise Doctor", defaultModules: ["dashboard", "opd", "clinical", "patient", "ayush", "spine"] },
  { id: "therapist", label: "Therapist", defaultModules: ["opd", "panchakarma", "ayush", "spine"] },
  { id: "pharmacist", label: "Pharmacist", defaultModules: ["stock"] },
  { id: "lab_tech", label: "Lab Technician", defaultModules: ["lab"] },
  { id: "receptionist", label: "Receptionist", defaultModules: ["dashboard", "opd", "patient"] },
  { id: "camp_doctor", label: "Camp Doctor (Temporary)", defaultModules: ["opd", "clinical", "patient"] },
  { id: "nurse", label: "Nurse / Attendant", defaultModules: ["opd", "ipd", "patient"] },
  { id: "venue_partner", label: "Venue / PK Partner", defaultModules: ["opd", "panchakarma", "reports"] },
  { id: "service_provider", label: "Service Provider (Lab/Courier/AMC)", defaultModules: ["lab", "stock"] },
];

const mockStaff: StaffMember[] = [
  { id: "1", name: "Dr. Mohamad Saleem", email: "curesure4u@gmail.com", phone: "9443314670", designation: "Chief Doctor", hmsAccess: true, role: "owner", branches: ALL_BRANCHES, modules: ["all"], vaidyaAccess: true, accessExpiry: null, lastLogin: "2026-07-31 09:00" },
  { id: "2", name: "Dr. Sahana Fathima", email: "sahana@alshifa.in", phone: "9876543210", designation: "Siddha Physician", hmsAccess: true, role: "branch_doctor", branches: ["Kadayanallur"], modules: ["dashboard", "opd", "clinical", "patient", "lab", "ayush"], vaidyaAccess: true, accessExpiry: null, lastLogin: "2026-07-31 08:45" },
  { id: "3", name: "Dr. Arun Kumar", email: "arun@alshifa.in", phone: "9988776655", designation: "Panchakarma Specialist", hmsAccess: true, role: "branch_doctor", branches: ["Kadayanallur", "Tirunelveli"], modules: ["dashboard", "opd", "clinical", "patient", "panchakarma", "spine"], vaidyaAccess: true, accessExpiry: null, lastLogin: "2026-07-30 17:20" },
  { id: "4", name: "Th. Priya", email: "priya@alshifa.in", phone: "9112233445", designation: "Therapist", hmsAccess: true, role: "therapist", branches: ["Kadayanallur"], modules: ["opd", "panchakarma", "ayush"], vaidyaAccess: false, accessExpiry: null, lastLogin: "2026-07-31 08:30" },
  { id: "5", name: "Mr. Rajesh (Pharmacist)", email: "rajesh@alshifa.in", phone: "9223344556", designation: "Pharmacist", hmsAccess: true, role: "pharmacist", branches: ["Kadayanallur"], modules: ["stock"], vaidyaAccess: false, accessExpiry: null, lastLogin: "2026-07-31 09:10" },
  { id: "6", name: "Ms. Divya (Lab)", email: "divya@alshifa.in", phone: "9334455667", designation: "Lab Technician", hmsAccess: true, role: "lab_tech", branches: ["Kadayanallur"], modules: ["lab"], vaidyaAccess: false, accessExpiry: null, lastLogin: "2026-07-31 08:55" },
  { id: "7", name: "Ms. Lakshmi (Reception)", email: "lakshmi@alshifa.in", phone: "9445566778", designation: "Receptionist", hmsAccess: true, role: "receptionist", branches: ["Kadayanallur"], modules: ["dashboard", "opd", "patient"], vaidyaAccess: false, accessExpiry: null, lastLogin: "2026-07-31 08:00" },
  { id: "8", name: "Dr. Venkat (Franchise - Chennai)", email: "venkat@spineclinic.in", phone: "9556677889", designation: "Franchise Doctor", hmsAccess: true, role: "franchise_doctor", branches: ["Chennai"], modules: ["dashboard", "opd", "clinical", "patient", "spine"], vaidyaAccess: false, accessExpiry: null, lastLogin: "2026-07-30 10:00" },
  { id: "9", name: "Dr. Ramesh (Camp - Sivakasi)", email: "ramesh@gmail.com", phone: "9667788990", designation: "Camp Doctor", hmsAccess: true, role: "camp_doctor", branches: ["Sivakasi Camp"], modules: ["opd", "clinical", "patient"], vaidyaAccess: false, accessExpiry: "2026-08-07", lastLogin: "2026-07-28 09:00" },
  { id: "10", name: "Dr. Meena (Pending)", email: "meena@gmail.com", phone: "9778899001", designation: "Ayurveda Doctor", hmsAccess: false, role: "branch_doctor", branches: [], modules: [], vaidyaAccess: false, accessExpiry: null, lastLogin: "-" },
];

const HmsAccessControl = () => {
  const { loading, error } = useAccessControl();
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const filtered = mockStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">HMS Access Control</h1><p className="text-sm text-muted-foreground">Super Admin — Grant/revoke HMS access, assign roles, branches, and module permissions per staff</p></div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">{mockStaff.filter(s => s.hmsAccess).length} Active</Badge>
          <Badge className="bg-red-100 text-red-800">{mockStaff.filter(s => !s.hmsAccess).length} Pending</Badge>
        </div>
      </div>

      <div className="flex gap-3"><Input placeholder="Search staff by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /><Button variant="outline" onClick={() => toast.info("Invite new staff member")}><Users className="mr-2 h-4 w-4" />Invite Staff</Button></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Staff List */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {filtered.map(s => (
            <Card key={s.id} className={`cursor-pointer transition ${selectedStaff?.id === s.id ? "border-primary ring-1 ring-primary" : "hover:border-muted-foreground/30"}`} onClick={() => setSelectedStaff(s)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.designation} • {s.role}</p></div>
                  <Badge className={s.hmsAccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{s.hmsAccess ? "Active" : "Pending"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permission Panel */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Permissions: {selectedStaff.name}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* HMS Access Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div><p className="font-medium">HMS Access</p><p className="text-xs text-muted-foreground">Enable/disable HMS login for this user</p></div>
                  <Switch checked={selectedStaff.hmsAccess} onCheckedChange={() => toast.success(`HMS access ${selectedStaff.hmsAccess ? "revoked" : "granted"}`)} />
                </div>

                {/* Vaidya Tools Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div><p className="font-medium">Vaidya Clinical Tools Access</p><p className="text-xs text-muted-foreground">Advanced clinical tools (AFI Formulary, Ashtavidha, Hijama, etc.)</p></div>
                  <Switch checked={selectedStaff.vaidyaAccess} onCheckedChange={() => toast.success("Vaidya access updated")} />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Role</p>
                  <Select value={selectedStaff.role} onValueChange={v => toast.success(`Role changed to ${v}`)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Role determines default module access. You can override below.</p>
                </div>

                {/* Branch Assignment */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Branches (can access)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_BRANCHES.map(b => (
                      <label key={b} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm cursor-pointer">
                        <Checkbox checked={selectedStaff.branches.includes(b)} onCheckedChange={() => toast.success(`Branch ${b} toggled`)} />
                        {b}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Module Permissions */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Module Access</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_MODULES.map(m => (
                      <label key={m.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm cursor-pointer">
                        <Checkbox checked={selectedStaff.modules.includes(m.id) || selectedStaff.modules.includes("all")} onCheckedChange={() => toast.success(`Module ${m.label} toggled`)} />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Access Expiry (for camp doctors) */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Access Expiry (optional — for temporary staff)</p>
                  <Input type="date" value={selectedStaff.accessExpiry || ""} onChange={() => toast.success("Expiry date set")} className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">Leave empty for permanent access. Set date for camp/visiting doctors.</p>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 rounded-lg text-sm space-y-1">
                  <p><strong>Email:</strong> {selectedStaff.email}</p>
                  <p><strong>Phone:</strong> {selectedStaff.phone}</p>
                  <p><strong>Last Login:</strong> {selectedStaff.lastLogin}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => toast.success("Permissions saved successfully!")}>Save Permissions</Button>
                  <Button variant="destructive" onClick={() => toast.error("Access revoked — user will be logged out")}>Revoke All Access</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Select a staff member from the list to manage their HMS permissions</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default HmsAccessControl;
