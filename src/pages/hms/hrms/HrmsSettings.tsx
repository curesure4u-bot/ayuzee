import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Settings, Building2, Clock, Calendar, IndianRupee,
  Shield, Bell, Save, Users, Loader2,
} from "lucide-react";

const HrmsSettings = () => {
  const [saving, setSaving] = useState(false);

  // Organisation Settings
  const [orgName, setOrgName] = useState("Ayuzee Healthcare");
  const [orgType, setOrgType] = useState("hospital");

  // Attendance Settings
  const [gracePeriod, setGracePeriod] = useState("15");
  const [halfDayThreshold, setHalfDayThreshold] = useState("4");
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(true);
  const [geoFencingEnabled, setGeoFencingEnabled] = useState(true);

  // Leave Settings
  const [casualLeavePerYear, setCasualLeavePerYear] = useState("12");
  const [sickLeavePerYear, setSickLeavePerYear] = useState("12");
  const [earnedLeavePerYear, setEarnedLeavePerYear] = useState("15");
  const [carryForwardEnabled, setCarryForwardEnabled] = useState(true);
  const [maxCarryForward, setMaxCarryForward] = useState("10");

  // Payroll Settings
  const [pfEnabled, setPfEnabled] = useState(true);
  const [pfEmployeeRate, setPfEmployeeRate] = useState("12");
  const [pfEmployerRate, setPfEmployerRate] = useState("12");
  const [esiEnabled, setEsiEnabled] = useState(true);
  const [esiThreshold, setEsiThreshold] = useState("21000");
  const [ptEnabled, setPtEnabled] = useState(true);
  const [payrollLockDay, setPayrollLockDay] = useState("25");

  // Notification Settings
  const [leaveApprovalNotify, setLeaveApprovalNotify] = useState(true);
  const [attendanceAlertNotify, setAttendanceAlertNotify] = useState(true);
  const [salaryProcessedNotify, setSalaryProcessedNotify] = useState(true);
  const [documentExpiryNotify, setDocumentExpiryNotify] = useState(true);
  const [expiryAlertDays, setExpiryAlertDays] = useState("30");

  const handleSave = async () => {
    setSaving(true);
    // Simulate save — in production this would write to hrms_organisations.settings JSONB
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("HRMS settings saved successfully");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-600" /> HRMS Settings
          </h1>
          <p className="text-sm text-muted-foreground">Configure organisation, attendance, leave, payroll, and notification settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="organisation">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="organisation">Organisation</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ─── Organisation ────────────────────────────────────────────────── */}
        <TabsContent value="organisation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Organisation Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Organisation Name</Label>
                <Input className="h-9" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Organisation Type</Label>
                <Select value={orgType} onValueChange={setOrgType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="panchakarma_centre">Panchakarma Centre</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="corporate">Corporate Office</SelectItem>
                    <SelectItem value="multi_speciality">Multi-Speciality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Employee ID Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Prefix</Label>
                  <Input className="h-9" value="EMP-" disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number Length</Label>
                  <Input className="h-9" value="4" disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Example</Label>
                  <Input className="h-9" value="EMP-0001" disabled />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Employee codes are auto-generated sequentially. Custom prefix configuration coming in future update.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Attendance ──────────────────────────────────────────────────── */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Attendance Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Grace Period (minutes)</Label>
                  <Input className="h-9" type="number" value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Minutes allowed after shift start before marking late</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Half Day Threshold (hours)</Label>
                  <Input className="h-9" type="number" value={halfDayThreshold} onChange={(e) => setHalfDayThreshold(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Minimum hours to count as half day</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Auto-mark Absent</p>
                  <p className="text-xs text-muted-foreground">Mark employees absent if no check-in by end of shift</p>
                </div>
                <Switch checked={autoMarkAbsent} onCheckedChange={setAutoMarkAbsent} />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Geo-fencing</p>
                  <p className="text-xs text-muted-foreground">Require staff to be within clinic radius for QR check-in</p>
                </div>
                <Switch checked={geoFencingEnabled} onCheckedChange={setGeoFencingEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Leave ───────────────────────────────────────────────────────── */}
        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> Annual Leave Quota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Casual Leave / Year</Label>
                  <Input className="h-9" type="number" value={casualLeavePerYear} onChange={(e) => setCasualLeavePerYear(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sick Leave / Year</Label>
                  <Input className="h-9" type="number" value={sickLeavePerYear} onChange={(e) => setSickLeavePerYear(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Earned Leave / Year</Label>
                  <Input className="h-9" type="number" value={earnedLeavePerYear} onChange={(e) => setEarnedLeavePerYear(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Carry Forward</p>
                  <p className="text-xs text-muted-foreground">Allow unused leave to carry to next year</p>
                </div>
                <Switch checked={carryForwardEnabled} onCheckedChange={setCarryForwardEnabled} />
              </div>
              {carryForwardEnabled && (
                <div className="space-y-1 max-w-[200px]">
                  <Label className="text-xs">Max Carry Forward Days</Label>
                  <Input className="h-9" type="number" value={maxCarryForward} onChange={(e) => setMaxCarryForward(e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Payroll ─────────────────────────────────────────────────────── */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Statutory Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Provident Fund (PF)</p>
                  <p className="text-xs text-muted-foreground">Enable PF deduction</p>
                </div>
                <Switch checked={pfEnabled} onCheckedChange={setPfEnabled} />
              </div>
              {pfEnabled && (
                <div className="grid sm:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                  <div className="space-y-1">
                    <Label className="text-xs">Employee Contribution (%)</Label>
                    <Input className="h-9" type="number" value={pfEmployeeRate} onChange={(e) => setPfEmployeeRate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Employer Contribution (%)</Label>
                    <Input className="h-9" type="number" value={pfEmployerRate} onChange={(e) => setPfEmployerRate(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">ESI</p>
                  <p className="text-xs text-muted-foreground">Enable ESI deduction</p>
                </div>
                <Switch checked={esiEnabled} onCheckedChange={setEsiEnabled} />
              </div>
              {esiEnabled && (
                <div className="pl-4 border-l-2 border-blue-200">
                  <div className="space-y-1 max-w-[200px]">
                    <Label className="text-xs">ESI Threshold (₹)</Label>
                    <Input className="h-9" type="number" value={esiThreshold} onChange={(e) => setEsiThreshold(e.target.value)} />
                    <p className="text-[10px] text-muted-foreground">Applicable for salary below this amount</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Professional Tax</p>
                  <p className="text-xs text-muted-foreground">Enable Professional Tax deduction</p>
                </div>
                <Switch checked={ptEnabled} onCheckedChange={setPtEnabled} />
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-1 max-w-[200px]">
                  <Label className="text-xs">Payroll Lock Day (of month)</Label>
                  <Input className="h-9" type="number" min="1" max="28" value={payrollLockDay} onChange={(e) => setPayrollLockDay(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Attendance locked for payroll calculation on this day</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3 text-xs text-amber-700">
              <strong>Note:</strong> Statutory rates are configurable because legal thresholds change periodically. Ensure rates are updated when government notifications are issued.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Notifications ───────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Leave Approval</p>
                  <p className="text-xs text-muted-foreground">Notify when leave is approved/rejected</p>
                </div>
                <Switch checked={leaveApprovalNotify} onCheckedChange={setLeaveApprovalNotify} />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Attendance Alert</p>
                  <p className="text-xs text-muted-foreground">Alert HR for consecutive absences</p>
                </div>
                <Switch checked={attendanceAlertNotify} onCheckedChange={setAttendanceAlertNotify} />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Salary Processed</p>
                  <p className="text-xs text-muted-foreground">Notify employees when payslip is ready</p>
                </div>
                <Switch checked={salaryProcessedNotify} onCheckedChange={setSalaryProcessedNotify} />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Document Expiry</p>
                  <p className="text-xs text-muted-foreground">Alert before professional registrations/certificates expire</p>
                </div>
                <Switch checked={documentExpiryNotify} onCheckedChange={setDocumentExpiryNotify} />
              </div>
              {documentExpiryNotify && (
                <div className="pl-4 border-l-2 border-blue-200">
                  <div className="space-y-1 max-w-[200px]">
                    <Label className="text-xs">Alert Before (days)</Label>
                    <Input className="h-9" type="number" value={expiryAlertDays} onChange={(e) => setExpiryAlertDays(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-3 text-xs text-blue-700">
              <strong>Coming Soon:</strong> Email, SMS, WhatsApp, and push notification integrations. Currently notifications appear as in-app alerts on the HR Dashboard.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsSettings;
