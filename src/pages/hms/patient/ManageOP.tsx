import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Activity, UserPlus, Eye, AlertCircle, RefreshCw, Printer,
  MoreHorizontal, ClipboardList, Heart, FileText, Clock, Pill,
  LogOut, Syringe, Shield, BarChart3, Brain, Loader2, Search,
} from "lucide-react";

interface OPVisit {
  id: string;
  op_number: number;
  patient_display_id: string;
  patient_name: string;
  patient_age: string;
  patient_gender: string;
  patient_phone: string;
  doctor_name: string;
  referred_by: string;
  mode_visit: string;
  purpose: string;
  check_in_time: string;
  session_token: number;
  bill_amount: number;
  bill_status: string;
  status: string;
  patient_id: string;
}

const ManageOP = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<OPVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billFilter, setBillFilter] = useState("all");

  // New Check-in dialog
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinMode, setCheckinMode] = useState<"search" | "new">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [checkinForm, setCheckinForm] = useState({
    first_name: "", last_name: "", mobile: "", gender: "Male",
    age_years: "", doctor_name: "", purpose: "Consultation",
    mode_visit: "Direct", consultation_fee: "200", payment_mode: "cash",
    chief_complaint: "",
  });
  const [checkinSaving, setCheckinSaving] = useState(false);

  // Search existing patients
  const searchPatients = async (q: string) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await (supabase as any)
        .from("hms_op_patients")
        .select("id, patient_id, first_name, last_name, mobile, gender, age_years, total_visits, last_visit_date")
        .or(`mobile.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,patient_id.ilike.%${q}%`)
        .order("last_visit_date", { ascending: false, nullsFirst: false })
        .limit(10);
      setSearchResults(data || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  // Select existing patient for quick re-checkin
  const selectPatientForCheckin = (patient: any) => {
    setSelectedPatient(patient);
    setCheckinForm(f => ({
      ...f,
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      mobile: patient.mobile || "",
      gender: patient.gender || "Male",
      age_years: patient.age_years?.toString() || "",
    }));
    setCheckinMode("new"); // show the form pre-filled
  };

  // Reset checkin dialog
  const resetCheckinDialog = () => {
    setCheckinMode("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPatient(null);
    setCheckinForm({
      first_name: "", last_name: "", mobile: "", gender: "Male",
      age_years: "", doctor_name: "", purpose: "Consultation",
      mode_visit: "Direct", consultation_fee: "200", payment_mode: "cash",
      chief_complaint: "",
    });
  };

  // Load visits from database
  const loadVisits = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("hms_op_visits")
        .select(`
          id, op_number, patient_display_id, doctor_name, referred_by,
          mode_visit, purpose, check_in_time, session_token,
          bill_amount, bill_status, status, patient_id,
          hms_op_patients!inner(first_name, last_name, gender, age_years, mobile)
        `)
        .order("check_in_time", { ascending: false });

      if (filter === "today") {
        query = query.eq("visit_date", new Date().toISOString().slice(0, 10));
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      const mapped: OPVisit[] = (data || []).map((v: any) => ({
        id: v.id,
        op_number: v.op_number,
        patient_display_id: v.patient_display_id,
        patient_name: `${v.hms_op_patients?.first_name || ""} ${v.hms_op_patients?.last_name || ""}`.trim(),
        patient_age: v.hms_op_patients?.age_years ? `${v.hms_op_patients.age_years} years` : "—",
        patient_gender: v.hms_op_patients?.gender?.charAt(0) || "—",
        patient_phone: v.hms_op_patients?.mobile || "—",
        doctor_name: v.doctor_name || "—",
        referred_by: v.referred_by || "none",
        mode_visit: v.mode_visit || "Direct",
        purpose: v.purpose || "Consultation",
        check_in_time: v.check_in_time ? new Date(v.check_in_time).toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—",
        session_token: v.session_token || 0,
        bill_amount: v.bill_amount || 0,
        bill_status: v.bill_status || "pending",
        status: v.status || "checked_in",
        patient_id: v.patient_id,
      }));

      setVisits(mapped);
    } catch (e: any) {
      console.error(e);
      // If table doesn't exist yet, show empty
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVisits(); }, [filter]);

  // Quick Check-in (register + check-in in one step)
  const handleQuickCheckin = async () => {
    if (!checkinForm.first_name.trim()) return toast.error("Patient name is required");
    if (!checkinForm.mobile.trim()) return toast.error("Mobile number is required");
    setCheckinSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      let patientRow: any = selectedPatient;

      if (!patientRow) {
        // Check if patient exists by mobile in hms_op_patients
        const { data: existing } = await (supabase as any)
          .from("hms_op_patients")
          .select("id, patient_id, total_visits")
          .eq("mobile", checkinForm.mobile.trim())
          .limit(1)
          .maybeSingle();

        if (existing) {
          patientRow = existing;
        } else {
          // Also check if this person has a platform account (profiles table)
          let authUserId: string | null = null;
          const { data: platformUser } = await (supabase as any)
            .from("profiles")
            .select("user_id, full_name, phone")
            .eq("phone", checkinForm.mobile.trim())
            .limit(1)
            .maybeSingle();
          if (platformUser) authUserId = platformUser.user_id;

          // Generate patient ID and create new patient
          const { data: pidData } = await (supabase as any).rpc("generate_patient_id", { prefix: "AL" });
          const patientDisplayId = pidData || `AL-${Date.now().toString().slice(-5)}`;

          const { data: newPat, error: patErr } = await (supabase as any)
            .from("hms_op_patients")
            .insert({
              patient_id: patientDisplayId,
              auth_user_id: authUserId,
              first_name: checkinForm.first_name.trim(),
              last_name: checkinForm.last_name.trim() || null,
              mobile: checkinForm.mobile.trim(),
              gender: checkinForm.gender,
              age_years: checkinForm.age_years ? parseInt(checkinForm.age_years) : null,
              registered_by: uid,
              branch: "Main Branch",
              source: "walk-in",
            })
            .select("id, patient_id, total_visits")
            .single();
          if (patErr) throw patErr;
          patientRow = newPat;
        }
      }

      // Get next token
      const { data: tokenData } = await (supabase as any).rpc("next_session_token", { p_branch: "Main Branch" });
      const token = tokenData || 1;

      // Create visit (check-in)
      const { error: visitErr } = await (supabase as any)
        .from("hms_op_visits")
        .insert({
          patient_id: patientRow.id,
          patient_display_id: patientRow.patient_id,
          doctor_name: checkinForm.doctor_name || "Dr. Mohamad Saleem",
          mode_visit: checkinForm.mode_visit,
          purpose: checkinForm.purpose,
          consultation_fee: parseFloat(checkinForm.consultation_fee) || 0,
          bill_amount: parseFloat(checkinForm.consultation_fee) || 0,
          bill_status: "paid",
          payment_mode: checkinForm.payment_mode,
          session_token: token,
          status: "checked_in",
          branch: "Main Branch",
          chief_complaint: checkinForm.chief_complaint || null,
        });
      if (visitErr) throw visitErr;

      // Update patient visit count
      await (supabase as any)
        .from("hms_op_patients")
        .update({ total_visits: (patientRow.total_visits || 0) + 1, last_visit_date: new Date().toISOString().slice(0, 10) })
        .eq("id", patientRow.id);

      toast.success(`✅ Checked in: ${checkinForm.first_name} | Token: ${token} | ID: ${patientRow.patient_id}`);
      setCheckinOpen(false);
      resetCheckinDialog();
      loadVisits();
    } catch (e: any) {
      toast.error(e.message || "Check-in failed");
    } finally {
      setCheckinSaving(false);
    }
  };

  // Checkout patient
  const handleCheckout = async (visit: OPVisit) => {
    await (supabase as any)
      .from("hms_op_visits")
      .update({ status: "checked_out", check_out_time: new Date().toISOString() })
      .eq("id", visit.id);
    toast.success(`${visit.patient_name} checked out`);
    loadVisits();
  };

  const handleAction = (action: string, entry: OPVisit) => {
    const pid = entry.patient_display_id;
    const routes: Record<string, string> = {
      "Vitals": `/hms/patient/vitals/${pid}`,
      "Dashboard": `/hms/patient/dashboard/${pid}`,
      "Casesheet": `/hms/patient/casesheet/${pid}`,
      "Prescription": `/hms/patient/prescription/${pid}`,
      "MRD": `/hms/patient/mrd/${pid}`,
      "Bills": `/hms/patient/bills/${pid}`,
    };
    if (action === "Checkout") return handleCheckout(entry);
    if (routes[action]) navigate(routes[action]);
    else toast.info(`${action} → ${entry.patient_name}`);
  };

  const filtered = visits.filter((v) => {
    // Status filter
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    // Bill filter
    if (billFilter === "pending" && v.bill_status === "paid") return false;
    // Search
    if (!search) return true;
    const q = search.toLowerCase();
    return v.patient_name.toLowerCase().includes(q) || v.patient_display_id.toLowerCase().includes(q) || v.patient_phone.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-600" /> Manage OP
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI-assisted outpatient management with smart routing
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show All</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="in_consultation">In Consultation</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID, phone..." className="w-[220px]" />
            <div className="flex gap-2 ml-auto flex-wrap">
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setCheckinOpen(true)}>
                <UserPlus className="h-3 w-3 mr-1" /> New Checkin
              </Button>
              <Button size="sm" variant={statusFilter === "checked_out" ? "default" : "outline"} className={statusFilter === "checked_out" ? "bg-orange-500 hover:bg-orange-600" : ""} onClick={() => setStatusFilter(statusFilter === "checked_out" ? "all" : "checked_out")}>
                <Eye className="h-3 w-3 mr-1" /> Show Checkedout
              </Button>
              <Button size="sm" variant={billFilter === "pending" ? "default" : "outline"} className={billFilter === "pending" ? "bg-red-500 hover:bg-red-600" : ""} onClick={() => setBillFilter(billFilter === "pending" ? "all" : "pending")}>
                <AlertCircle className="h-3 w-3 mr-1" /> Show Not Paid
              </Button>
              <Button size="sm" variant="outline" onClick={loadVisits}>
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-3 w-3 mr-1" /> Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{visits.filter(v => v.status === "checked_in").length}</p><p className="text-xs text-muted-foreground">Checked In</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{visits.filter(v => v.status === "in_consultation").length}</p><p className="text-xs text-muted-foreground">In Consultation</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-gray-600">{visits.filter(v => v.status === "checked_out").length}</p><p className="text-xs text-muted-foreground">Checked Out</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">₹{visits.reduce((s, v) => s + v.bill_amount, 0).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Revenue Today</p></CardContent></Card>
      </div>

      {/* OP Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground mt-2">Loading visits...</p></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center"><Activity className="h-8 w-8 mx-auto text-muted-foreground/30" /><p className="text-sm text-muted-foreground mt-2">No check-ins yet today. Click "New Checkin" to start.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {["#", "Token", "ID", "Name", "Age", "Gender", "Phone", "Doctor", "Mode", "Purpose", "Check-In", "Bill", "Status", ""].map((h) => (
                      <th key={h} className="px-2 py-3 text-left font-semibold text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => (
                    <tr key={entry.id} className="border-b hover:bg-amber-50/50">
                      <td className="px-2 py-2.5 text-xs">{idx + 1}</td>
                      <td className="px-2 py-2.5"><Badge className="bg-green-600 text-white">{entry.session_token}</Badge></td>
                      <td className="px-2 py-2.5 font-mono text-xs">{entry.patient_display_id}</td>
                      <td className="px-2 py-2.5 font-medium">{entry.patient_name}</td>
                      <td className="px-2 py-2.5 text-xs">{entry.patient_age}</td>
                      <td className="px-2 py-2.5">{entry.patient_gender}</td>
                      <td className="px-2 py-2.5 text-xs">{entry.patient_phone}</td>
                      <td className="px-2 py-2.5 text-xs max-w-[120px] truncate">{entry.doctor_name}</td>
                      <td className="px-2 py-2.5 text-xs">{entry.mode_visit}</td>
                      <td className="px-2 py-2.5 text-xs">{entry.purpose}</td>
                      <td className="px-2 py-2.5 text-xs whitespace-nowrap">{entry.check_in_time}</td>
                      <td className="px-2 py-2.5">
                        <Badge variant={entry.bill_status === "paid" ? "default" : "outline"} className={entry.bill_status === "paid" ? "bg-green-600 text-white text-xs" : "text-xs"}>
                          ₹{entry.bill_amount}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge variant="outline" className={`text-[10px] ${entry.status === "checked_in" ? "text-green-600" : entry.status === "checked_out" ? "text-gray-500" : "text-blue-600"}`}>
                          {entry.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleAction("Vitals", entry)}><Heart className="h-3 w-3 mr-2" /> Vitals</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("Casesheet", entry)}><FileText className="h-3 w-3 mr-2" /> Casesheet</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("Prescription", entry)}><Pill className="h-3 w-3 mr-2" /> Prescription</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("Dashboard", entry)}><BarChart3 className="h-3 w-3 mr-2" /> Dashboard</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("MRD", entry)}><ClipboardList className="h-3 w-3 mr-2" /> MRD</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("Checkout", entry)}><LogOut className="h-3 w-3 mr-2" /> Checkout</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Check-in Dialog: Search → Select → Check-in */}
      <Dialog open={checkinOpen} onOpenChange={(o) => { setCheckinOpen(o); if (!o) resetCheckinDialog(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              {checkinMode === "search" ? "Check-in Patient" : selectedPatient ? `Re-Check-in: ${selectedPatient.first_name}` : "New Patient Check-in"}
            </DialogTitle>
          </DialogHeader>

          {/* MODE: SEARCH — find existing patient first */}
          {checkinMode === "search" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Search by Phone, Name, or Patient ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); searchPatients(e.target.value); }}
                    placeholder="Enter phone number, name, or AL-XXXXX..."
                    autoFocus
                  />
                  {searching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-2" />}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left p-3 hover:bg-green-50 border-b last:border-0 flex items-center justify-between"
                      onClick={() => selectPatientForCheckin(p)}
                    >
                      <div>
                        <p className="font-medium text-sm">{p.first_name} {p.last_name || ""}</p>
                        <p className="text-xs text-muted-foreground">{p.patient_id} · {p.mobile} · {p.gender} · {p.age_years ? `${p.age_years}y` : "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px]">{p.total_visits || 0} visits</Badge>
                        {p.last_visit_date && <p className="text-[10px] text-muted-foreground mt-0.5">Last: {p.last_visit_date}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                <p className="text-xs text-muted-foreground text-center py-2">No existing patient found with "{searchQuery}"</p>
              )}

              <div className="flex justify-between pt-2 border-t">
                <Button variant="outline" onClick={() => setCheckinOpen(false)}>Cancel</Button>
                <Button onClick={() => setCheckinMode("new")} className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-1" /> Register New Patient
                </Button>
              </div>
            </div>
          )}

          {/* MODE: NEW/RE-CHECKIN — form (pre-filled for returning patients) */}
          {checkinMode === "new" && (
            <div className="space-y-3">
              {selectedPatient && (
                <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-medium text-green-800">Returning patient: </span>
                    <span className="text-green-700">{selectedPatient.patient_id} · {selectedPatient.total_visits || 0} previous visits</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setSelectedPatient(null); setCheckinMode("search"); }}>
                    Change
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">First Name *</Label>
                  <Input value={checkinForm.first_name} onChange={(e) => setCheckinForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Patient name" disabled={!!selectedPatient} />
                </div>
                <div>
                  <Label className="text-xs">Last Name</Label>
                  <Input value={checkinForm.last_name} onChange={(e) => setCheckinForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" disabled={!!selectedPatient} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Mobile *</Label>
                  <Input value={checkinForm.mobile} onChange={(e) => setCheckinForm(f => ({ ...f, mobile: e.target.value }))} placeholder="9876543210" disabled={!!selectedPatient} />
                </div>
                <div>
                  <Label className="text-xs">Age</Label>
                  <Input value={checkinForm.age_years} onChange={(e) => setCheckinForm(f => ({ ...f, age_years: e.target.value }))} placeholder="35" type="number" disabled={!!selectedPatient} />
                </div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <Select value={checkinForm.gender} onValueChange={(v) => setCheckinForm(f => ({ ...f, gender: v }))} disabled={!!selectedPatient}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Doctor</Label>
                  <Input value={checkinForm.doctor_name} onChange={(e) => setCheckinForm(f => ({ ...f, doctor_name: e.target.value }))} placeholder="Dr. Mohamad Saleem" />
                </div>
                <div>
                  <Label className="text-xs">Purpose</Label>
                  <Select value={checkinForm.purpose} onValueChange={(v) => setCheckinForm(f => ({ ...f, purpose: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Chief Complaint (optional)</Label>
                <Input value={checkinForm.chief_complaint} onChange={(e) => setCheckinForm(f => ({ ...f, chief_complaint: e.target.value }))} placeholder="e.g. knee pain, fever, follow-up for diabetes..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Fee (₹)</Label>
                  <Input value={checkinForm.consultation_fee} onChange={(e) => setCheckinForm(f => ({ ...f, consultation_fee: e.target.value }))} type="number" />
                </div>
                <div>
                  <Label className="text-xs">Payment</Label>
                  <Select value={checkinForm.payment_mode} onValueChange={(v) => setCheckinForm(f => ({ ...f, payment_mode: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Visit Mode</Label>
                  <Select value={checkinForm.mode_visit} onValueChange={(v) => setCheckinForm(f => ({ ...f, mode_visit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Teleconsult">Teleconsult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => { if (selectedPatient) { setSelectedPatient(null); setCheckinMode("search"); } else { setCheckinOpen(false); } }}>
                  {selectedPatient ? "← Back" : "Cancel"}
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleQuickCheckin} disabled={checkinSaving}>
                  {checkinSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  {checkinSaving ? "Saving..." : selectedPatient ? "Re-Check In" : "Register & Check In"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOP;
