import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield, Wifi, Clock, Eye, EyeOff, Lock, AlertTriangle,
  Key, Monitor, UserX, Plus, Trash2, Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type UnmaskLog = {
  id: string;
  staff_name: string;
  patient_name: string;
  reason: string;
  time: string;
  ip: string;
};

type LoginAttempt = {
  id: string;
  email: string;
  ip: string;
  success: boolean;
  time: string;
  reason?: string;
};

const mockUnmaskLogs: UnmaskLog[] = [
  { id: "1", staff_name: "Receptionist Priya", patient_name: "Rajesh Kumar", reason: "Appointment confirmation call", time: "10:30 AM", ip: "192.168.1.45" },
  { id: "2", staff_name: "Nurse Amit", patient_name: "Meera Devi", reason: "Emergency contact needed", time: "11:15 AM", ip: "192.168.1.22" },
  { id: "3", staff_name: "Receptionist Priya", patient_name: "Sunita Devi", reason: "Follow-up reminder", time: "11:45 AM", ip: "192.168.1.45" },
  { id: "4", staff_name: "Receptionist Priya", patient_name: "Amit Patel", reason: "Bill collection", time: "12:00 PM", ip: "192.168.1.45" },
  { id: "5", staff_name: "Receptionist Priya", patient_name: "Vikram Singh", reason: "Report delivery", time: "12:15 PM", ip: "192.168.1.45" },
];

const mockLoginAttempts: LoginAttempt[] = [
  { id: "1", email: "doctor@clinic.com", ip: "192.168.1.10", success: true, time: "08:45 AM" },
  { id: "2", email: "admin@clinic.com", ip: "103.45.67.89", success: false, time: "09:00 AM", reason: "IP not whitelisted" },
  { id: "3", email: "nurse@clinic.com", ip: "192.168.1.22", success: true, time: "09:10 AM" },
  { id: "4", email: "unknown@hacker.com", ip: "45.33.22.11", success: false, time: "09:30 AM", reason: "Invalid credentials (attempt 3/5)" },
  { id: "5", email: "receptionist@clinic.com", ip: "192.168.1.45", success: true, time: "09:35 AM" },
];

const HmsSecurityControls = () => {
  // Config state
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  const [securityConfig, setSecurityConfig] = useState<any>(null);

  useEffect(() => { loadSecurityConfig(); }, []);

  const loadSecurityConfig = async () => {
    try {
      const { data } = await (supabase as any)
        .from("hms_security_config")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setSecurityConfig(data);
        setIpWhitelistEnabled(data.ip_whitelist_enabled ?? true);
      }
    } catch (err) { console.error("Security config load:", err); }
  };
  const [whitelistedIps, setWhitelistedIps] = useState(["192.168.1.0/24", "10.0.0.1"]);
  const [newIp, setNewIp] = useState("");
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(true);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState("30");
  const [maxSessions, setMaxSessions] = useState("3");
  const [phoneMaskingEnabled, setPhoneMaskingEnabled] = useState(true);
  const [unmaskRequiresReason, setUnmaskRequiresReason] = useState(true);
  const [maxUnmaskPerDay, setMaxUnmaskPerDay] = useState("10");
  const [unmaskAlertThreshold, setUnmaskAlertThreshold] = useState("5");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  const addIp = () => {
    if (!newIp.trim()) return;
    setWhitelistedIps([...whitelistedIps, newIp.trim()]);
    setNewIp("");
    toast.success(`IP ${newIp} added to whitelist`);
  };

  const removeIp = (ip: string) => {
    setWhitelistedIps(whitelistedIps.filter(i => i !== ip));
    toast.info(`IP ${ip} removed`);
  };

  const saveConfig = () => {
    toast.success("Security configuration saved successfully!");
  };

  // Alert: Priya has unmasked 5 numbers today (threshold reached)
  const priyaUnmasks = mockUnmaskLogs.filter(l => l.staff_name.includes("Priya")).length;
  const alertActive = priyaUnmasks >= Number(unmaskAlertThreshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Security Controls
          </h1>
          <p className="text-sm text-muted-foreground">
            IP whitelisting, session management, phone masking & login security
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/audit-trail"}>Audit Trail</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/settings"}>Settings</Button>
          <Button size="sm" onClick={saveConfig}><Save className="mr-1 h-4 w-4" /> Save Changes</Button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertActive && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Excessive Phone Unmasking Alert</p>
              <p className="text-xs text-red-600">Receptionist Priya has unmasked {priyaUnmasks} numbers today (threshold: {unmaskAlertThreshold}). Review activity below.</p>
            </div>
            <Button size="sm" variant="destructive" className="ml-auto">Review</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ip" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ip">IP Whitelisting</TabsTrigger>
          <TabsTrigger value="session">Session Controls</TabsTrigger>
          <TabsTrigger value="masking">Phone Masking</TabsTrigger>
          <TabsTrigger value="login">Login Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* IP Whitelisting Tab */}
        <TabsContent value="ip">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Wifi className="h-4 w-4" /> IP Whitelisting</CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Enabled</Label>
                  <Switch checked={ipWhitelistEnabled} onCheckedChange={setIpWhitelistEnabled} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Only these IPs can access the HMS. All other connections will be blocked.</p>
              <div className="flex gap-2">
                <Input value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.0/24 or specific IP" className="max-w-sm" />
                <Button size="sm" onClick={addIp}><Plus className="mr-1 h-3 w-3" /> Add IP</Button>
              </div>
              <div className="space-y-1">
                {whitelistedIps.map((ip) => (
                  <div key={ip} className="flex items-center justify-between rounded border px-3 py-2">
                    <span className="text-sm font-mono">{ip}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeIp(ip)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Controls Tab */}
        <TabsContent value="session">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Auto-Logout on Idle</Label><p className="text-xs text-muted-foreground">Log out inactive users automatically</p></div>
                <Switch checked={autoLogoutEnabled} onCheckedChange={setAutoLogoutEnabled} />
              </div>
              {autoLogoutEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">Timeout (minutes)</Label><Input type="number" value={autoLogoutMinutes} onChange={(e) => setAutoLogoutMinutes(e.target.value)} /></div>
                  <div><Label className="text-xs">Max Concurrent Sessions</Label><Input type="number" value={maxSessions} onChange={(e) => setMaxSessions(e.target.value)} /></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Masking Tab */}
        <TabsContent value="masking">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><EyeOff className="h-4 w-4" /> Phone Number Masking</CardTitle>
                <Switch checked={phoneMaskingEnabled} onCheckedChange={setPhoneMaskingEnabled} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Patient phone numbers are masked (98****3210) by default. Unmasking is audited.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between border rounded p-3">
                  <div><Label className="text-sm">Require Reason</Label><p className="text-xs text-muted-foreground">Staff must enter reason to unmask</p></div>
                  <Switch checked={unmaskRequiresReason} onCheckedChange={setUnmaskRequiresReason} />
                </div>
                <div className="border rounded p-3 space-y-2">
                  <Label className="text-xs">Max Unmasks/Day per Staff</Label>
                  <Input type="number" value={maxUnmaskPerDay} onChange={(e) => setMaxUnmaskPerDay(e.target.value)} />
                </div>
              </div>
              <div className="border rounded p-3 space-y-2">
                <Label className="text-xs">Alert Owner After (unmasks)</Label>
                <Input type="number" value={unmaskAlertThreshold} onChange={(e) => setUnmaskAlertThreshold(e.target.value)} className="max-w-32" />
                <p className="text-xs text-muted-foreground">Owner gets WhatsApp alert when a staff member exceeds this threshold</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Security Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Login Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3 space-y-2">
                  <Label className="text-xs">Max Login Attempts</Label>
                  <Input type="number" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Account locked for 30 min after exceeding</p>
                </div>
                <div className="flex items-center justify-between border rounded p-3">
                  <div><Label className="text-sm">Two-Factor Auth</Label><p className="text-xs text-muted-foreground">Require OTP for owner/admin roles</p></div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
              </div>

              {/* Recent Login Attempts */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Recent Login Attempts</p>
                <div className="space-y-1">
                  {mockLoginAttempts.map((attempt) => (
                    <div key={attempt.id} className={`flex items-center justify-between rounded border px-3 py-2 ${!attempt.success ? "bg-red-50 border-red-100" : ""}`}>
                      <div className="flex items-center gap-2">
                        {attempt.success ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <UserX className="h-3.5 w-3.5 text-red-500" />}
                        <span className="text-sm">{attempt.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{attempt.ip}</span>
                        {attempt.reason && <span className="text-red-600">{attempt.reason}</span>}
                        <span>{attempt.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Phone Unmask Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockUnmaskLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded border px-3 py-2">
                    <div>
                      <p className="text-sm"><span className="font-medium">{log.staff_name}</span> unmasked <span className="font-medium">{log.patient_name}</span></p>
                      <p className="text-xs text-muted-foreground">Reason: {log.reason}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{log.time}</p>
                      <p className="font-mono">{log.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsSecurityControls;
