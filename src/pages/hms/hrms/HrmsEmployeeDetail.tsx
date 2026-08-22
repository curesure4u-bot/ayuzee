import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, User, Briefcase, GraduationCap, FileText,
  IndianRupee, Calendar, Clock, Phone, Mail, MapPin,
  Droplets, Heart, Shield, Edit, Loader2, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useHrmsPermissions, canViewSensitiveData } from "@/hooks/hrms/useHrmsPermissions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployeeDetail {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  department: string;
  designation: string | null;
  phone: string;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  joinDate: string;
  employmentType: string;
  employeeStatus: string;
  salary: number;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  aadhaarMasked: string | null;
  pan: string | null;
  photoUrl: string | null;
  branchId: string | null;
  shiftId: string | null;
  weeklyOff: string;
  probationEndDate: string | null;
  confirmationDate: string | null;
  noticePeriodDays: number;
  resignationDate: string | null;
  lastWorkingDate: string | null;
  relievingDate: string | null;
  reportingManagerId: string | null;
  productivityScore: number;
  todayAttendance: string;
  createdAt: string;
}

interface Qualification {
  id: string;
  qualification: string;
  institution: string | null;
  university: string | null;
  yearOfPassing: number | null;
  registrationNumber: string | null;
  registrationAuthority: string | null;
  registrationExpiry: string | null;
  isPrimary: boolean;
}

interface Document {
  id: string;
  documentType: string;
  documentName: string;
  isVerified: boolean;
  expiryDate: string | null;
  createdAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_EMPLOYEE: EmployeeDetail = {
  id: "1",
  employeeCode: "EMP-0001",
  name: "Dr. Arun Sharma",
  role: "Senior Doctor",
  department: "Ayurveda",
  designation: "Senior Consultant",
  phone: "9876543210",
  email: "arun@ayuzee.com",
  gender: "male",
  dateOfBirth: "1985-03-15",
  bloodGroup: "B+",
  maritalStatus: "Married",
  addressLine1: "42, Gandhi Nagar",
  addressLine2: "Near Bus Stand",
  city: "Kadayanallur",
  state: "Tamil Nadu",
  pincode: "627751",
  emergencyContactName: "Priya Sharma",
  emergencyContactPhone: "9876543220",
  emergencyContactRelation: "Spouse",
  joinDate: "2023-04-01",
  employmentType: "permanent",
  employeeStatus: "active",
  salary: 120000,
  bankName: "Indian Overseas Bank",
  bankAccountNo: "****4521",
  bankIfsc: "IOBA0001234",
  aadhaarMasked: "XXXX-XXXX-7890",
  pan: "ABCDE1234F",
  photoUrl: null,
  branchId: null,
  shiftId: null,
  weeklyOff: "Sunday",
  probationEndDate: null,
  confirmationDate: "2023-07-01",
  noticePeriodDays: 60,
  resignationDate: null,
  lastWorkingDate: null,
  relievingDate: null,
  reportingManagerId: null,
  productivityScore: 92,
  todayAttendance: "present",
  createdAt: "2023-04-01T10:00:00Z",
};

const MOCK_QUALIFICATIONS: Qualification[] = [
  { id: "q1", qualification: "BAMS", institution: "Govt. Ayurveda College, Thiruvananthapuram", university: "Kerala University of Health Sciences", yearOfPassing: 2008, registrationNumber: "TN/AYU/12345", registrationAuthority: "TNBIM", registrationExpiry: "2027-03-31", isPrimary: true },
  { id: "q2", qualification: "MD (Kayachikitsa)", institution: "NIA Jaipur", university: "Rajasthan University of Health Sciences", yearOfPassing: 2012, registrationNumber: null, registrationAuthority: null, registrationExpiry: null, isPrimary: false },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: "d1", documentType: "aadhaar", documentName: "Aadhaar Card", isVerified: true, expiryDate: null, createdAt: "2023-04-01" },
  { id: "d2", documentType: "pan", documentName: "PAN Card", isVerified: true, expiryDate: null, createdAt: "2023-04-01" },
  { id: "d3", documentType: "registration_certificate", documentName: "TNBIM Registration", isVerified: true, expiryDate: "2027-03-31", createdAt: "2023-04-01" },
  { id: "d4", documentType: "qualification_certificate", documentName: "BAMS Degree Certificate", isVerified: true, expiryDate: null, createdAt: "2023-04-01" },
  { id: "d5", documentType: "experience_certificate", documentName: "Previous Hospital Experience", isVerified: false, expiryDate: null, createdAt: "2023-04-05" },
];

// ─── Component ───────────────────────────────────────────────────────────────

const HrmsEmployeeDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const permissions = useHrmsPermissions();
  const showSensitive = canViewSensitiveData(permissions);

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>(MOCK_QUALIFICATIONS);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const { data, error: fetchErr } = await (supabase as any)
          .from("hms_staff")
          .select("*")
          .eq("id", employeeId)
          .maybeSingle();

        if (fetchErr || !data) {
          setEmployee(MOCK_EMPLOYEE);
          if (fetchErr) setError(fetchErr.message);
          setLoading(false);
          return;
        }

        setEmployee({
          id: data.id,
          employeeCode: data.employee_code || `EMP-${data.id.slice(0, 4)}`,
          name: data.name,
          role: data.role,
          department: data.department || "Unassigned",
          designation: data.designation || data.role,
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender,
          dateOfBirth: data.date_of_birth,
          bloodGroup: data.blood_group,
          maritalStatus: data.marital_status,
          addressLine1: data.address_line1,
          addressLine2: data.address_line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          emergencyContactName: data.emergency_contact_name,
          emergencyContactPhone: data.emergency_contact_phone,
          emergencyContactRelation: data.emergency_contact_relation,
          joinDate: data.join_date || "",
          employmentType: data.employment_type || "permanent",
          employeeStatus: data.employee_status || data.status || "active",
          salary: Number(data.salary) || 0,
          bankName: data.bank_name,
          bankAccountNo: data.bank_account_no ? `****${data.bank_account_no.slice(-4)}` : null,
          bankIfsc: data.bank_ifsc,
          aadhaarMasked: data.aadhaar_masked,
          pan: data.pan,
          photoUrl: data.photo_url,
          branchId: data.branch_id,
          shiftId: data.shift_id,
          weeklyOff: data.weekly_off || "Sunday",
          probationEndDate: data.probation_end_date,
          confirmationDate: data.confirmation_date,
          noticePeriodDays: data.notice_period_days || 30,
          resignationDate: data.resignation_date,
          lastWorkingDate: data.last_working_date,
          relievingDate: data.relieving_date,
          reportingManagerId: data.reporting_manager_id,
          productivityScore: data.productivity_score || 80,
          todayAttendance: data.today_attendance || "present",
          createdAt: data.created_at,
        });

        // Fetch qualifications
        const { data: quals } = await (supabase as any)
          .from("hrms_employee_qualifications")
          .select("*")
          .eq("employee_id", employeeId)
          .order("is_primary", { ascending: false });

        if (quals && quals.length > 0) {
          setQualifications(quals.map((q: any) => ({
            id: q.id,
            qualification: q.qualification,
            institution: q.institution,
            university: q.university,
            yearOfPassing: q.year_of_passing,
            registrationNumber: q.registration_number,
            registrationAuthority: q.registration_authority,
            registrationExpiry: q.registration_expiry,
            isPrimary: q.is_primary,
          })));
        }

        // Fetch documents
        const { data: docs } = await (supabase as any)
          .from("hrms_employee_documents")
          .select("id, document_type, document_name, is_verified, expiry_date, created_at")
          .eq("employee_id", employeeId)
          .order("created_at", { ascending: false });

        if (docs && docs.length > 0) {
          setDocuments(docs.map((d: any) => ({
            id: d.id,
            documentType: d.document_type,
            documentName: d.document_name,
            isVerified: d.is_verified,
            expiryDate: d.expiry_date,
            createdAt: d.created_at,
          })));
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setEmployee(MOCK_EMPLOYEE);
        setLoading(false);
      }
    };

    if (employeeId) fetchEmployee();
    else { setEmployee(MOCK_EMPLOYEE); setLoading(false); }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /><span>Loading employee profile...</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Employee not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/hms/hrms/employees")}>Back to Employees</Button>
      </div>
    );
  }

  const statusColor = {
    active: "bg-green-100 text-green-700",
    probation: "bg-amber-100 text-amber-700",
    notice_period: "bg-red-100 text-red-700",
    on_leave: "bg-blue-100 text-blue-700",
    resigned: "bg-slate-100 text-slate-700",
    relieved: "bg-slate-100 text-slate-600",
  }[employee.employeeStatus] || "bg-gray-100 text-gray-700";

  const InfoRow = ({ label, value, icon }: { label: string; value: string | null | undefined; icon?: any }) => (
    value ? (
      <div className="flex items-start gap-2 py-1.5">
        {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-sm">{value}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/hrms/employees")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 grid place-items-center text-lg font-bold text-indigo-700">
              {employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {employee.name}
                <Badge className={`text-[10px] border-0 capitalize ${statusColor}`}>
                  {employee.employeeStatus.replace("_", " ")}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                {employee.employeeCode} &middot; {employee.designation || employee.role} &middot; {employee.department}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo profile. {error}
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {showSensitive && <TabsTrigger value="financial">Financial</TabsTrigger>}
        </TabsList>

        {/* ─── Personal Tab ────────────────────────────────────────────────── */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Full Name" value={employee.name} />
                <InfoRow label="Gender" value={employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : null} />
                <InfoRow label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null} />
                <InfoRow label="Blood Group" value={employee.bloodGroup} icon={<Droplets className="h-3 w-3" />} />
                <InfoRow label="Marital Status" value={employee.maritalStatus} icon={<Heart className="h-3 w-3" />} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-green-600" /> Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Phone" value={employee.phone} icon={<Phone className="h-3 w-3" />} />
                <InfoRow label="Email" value={employee.email} icon={<Mail className="h-3 w-3" />} />
                <Separator className="my-2" />
                <InfoRow label="Address" value={[employee.addressLine1, employee.addressLine2].filter(Boolean).join(", ") || null} icon={<MapPin className="h-3 w-3" />} />
                <InfoRow label="City / State / PIN" value={[employee.city, employee.state, employee.pincode].filter(Boolean).join(", ") || null} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-red-600" /> Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <InfoRow label="Name" value={employee.emergencyContactName} />
                  <InfoRow label="Phone" value={employee.emergencyContactPhone} />
                  <InfoRow label="Relationship" value={employee.emergencyContactRelation} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Employment Tab ──────────────────────────────────────────────── */}
        <TabsContent value="employment" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-indigo-600" /> Current Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Employee Code" value={employee.employeeCode} />
                <InfoRow label="Designation" value={employee.designation || employee.role} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Employment Type" value={employee.employmentType.replace("_", " ").toUpperCase()} />
                <InfoRow label="Weekly Off" value={employee.weeklyOff} />
                <InfoRow label="Notice Period" value={`${employee.noticePeriodDays} days`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-600" /> Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Joining Date" value={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null} icon={<Calendar className="h-3 w-3" />} />
                <InfoRow label="Confirmation Date" value={employee.confirmationDate ? new Date(employee.confirmationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null} />
                <InfoRow label="Probation End Date" value={employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null} />
                {employee.resignationDate && <InfoRow label="Resignation Date" value={new Date(employee.resignationDate).toLocaleDateString("en-IN")} />}
                {employee.lastWorkingDate && <InfoRow label="Last Working Date" value={new Date(employee.lastWorkingDate).toLocaleDateString("en-IN")} />}
                {employee.relievingDate && <InfoRow label="Relieving Date" value={new Date(employee.relievingDate).toLocaleDateString("en-IN")} />}
                <Separator className="my-2" />
                <InfoRow label="Tenure" value={employee.joinDate ? `${Math.floor((Date.now() - new Date(employee.joinDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years ${Math.floor(((Date.now() - new Date(employee.joinDate).getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))} months` : null} icon={<Clock className="h-3 w-3" />} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Qualifications Tab ──────────────────────────────────────────── */}
        <TabsContent value="qualifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-green-600" /> Qualifications & Registrations</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs">+ Add Qualification</Button>
              </div>
            </CardHeader>
            <CardContent>
              {qualifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No qualifications added yet</p>
              ) : (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div key={q.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {q.qualification}
                            {q.isPrimary && <Badge variant="outline" className="text-[9px]">Primary</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {q.institution}{q.university ? ` — ${q.university}` : ""}{q.yearOfPassing ? ` (${q.yearOfPassing})` : ""}
                          </p>
                        </div>
                      </div>
                      {q.registrationNumber && (
                        <div className="mt-2 pt-2 border-t grid sm:grid-cols-3 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Reg. No:</span> {q.registrationNumber}</div>
                          <div><span className="text-muted-foreground">Authority:</span> {q.registrationAuthority}</div>
                          {q.registrationExpiry && (
                            <div>
                              <span className="text-muted-foreground">Expiry:</span>{" "}
                              <span className={new Date(q.registrationExpiry) < new Date() ? "text-red-600 font-medium" : ""}>
                                {new Date(q.registrationExpiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Documents Tab ───────────────────────────────────────────────── */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-amber-600" /> Employee Documents</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs">+ Upload Document</Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium">Document</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                        <th className="px-3 py-2 text-center text-xs font-medium">Verified</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Expiry</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/20">
                          <td className="px-3 py-2 font-medium">{doc.documentName}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {doc.documentType.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {doc.isVerified
                              ? <Badge className="text-[9px] bg-green-100 text-green-700 border-0">Verified</Badge>
                              : <Badge className="text-[9px] bg-amber-100 text-amber-700 border-0">Pending</Badge>
                            }
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {doc.expiryDate ? (
                              <span className={new Date(doc.expiryDate) < new Date() ? "text-red-600 font-medium" : ""}>
                                {new Date(doc.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Financial Tab (Sensitive) ───────────────────────────────────── */}
        {showSensitive && (
          <TabsContent value="financial" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><IndianRupee className="h-4 w-4 text-green-600" /> Salary & Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow label="Monthly Salary (CTC)" value={`₹${employee.salary.toLocaleString("en-IN")}`} />
                  <InfoRow label="Annual CTC" value={`₹${(employee.salary * 12).toLocaleString("en-IN")}`} />
                  <Separator className="my-2" />
                  <p className="text-[10px] text-muted-foreground italic">Detailed salary structure will be available in Phase 3 (Payroll module)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-red-600" /> Bank & Identity (Confidential)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow label="Bank Name" value={employee.bankName} />
                  <InfoRow label="Account No." value={employee.bankAccountNo} />
                  <InfoRow label="IFSC Code" value={employee.bankIfsc} />
                  <Separator className="my-2" />
                  <InfoRow label="Aadhaar" value={employee.aadhaarMasked} />
                  <InfoRow label="PAN" value={employee.pan} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default HrmsEmployeeDetail;
