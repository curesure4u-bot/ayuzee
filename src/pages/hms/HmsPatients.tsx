import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, Plus, Search, ArrowRight, Brain, UserPlus,
  ClipboardList, Sparkles, Loader2, Receipt, CheckCircle,
  Calendar, MoreHorizontal, CreditCard, GitMerge,
} from "lucide-react";
import { aiSmartSearch } from "@/services/patientAiService";

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  blood_group: string | null;
  created_at: string;
};

const HmsPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [aiHint, setAiHint] = useState("");

  const load = async () => {
    const { data } = await (supabase as any)
      .from("profiles")
      .select("user_id,full_name,phone,email,gender,age,blood_group,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setPatients((data ?? []).map((p: any) => ({ ...p, id: p.user_id })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!search.trim()) { setAiHint(""); return; }
    setSearching(true);
    const result = await aiSmartSearch(search);
    setAiHint(result.suggestion);
    setSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.full_name ?? "").toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) ||
      (p.id ?? "").toLowerCase().includes(q)
    );
  });

  const handleQuickBill = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Quick Bill for ${p.full_name}`);
    navigate(`/hms/patient/bills/${p.id}`);
  };

  const handleCheckin = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${p.full_name} checked in`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-600" /> Patient Registry
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI-powered search & management · {patients.length} patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/hms/patient/register")}>
            <Plus className="mr-1 h-4 w-4" /> Register Patient
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => navigate("/hms/patient/manage-op")}>
            <CheckCircle className="mr-1 h-4 w-4" /> Check In
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/hms/patient/manage-op")}>
            <ClipboardList className="mr-1 h-4 w-4" /> Manage OP
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/hms/patient-card")}>
            <CreditCard className="mr-1 h-4 w-4" /> Health Card
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/hms/patient-merge")}>
            <GitMerge className="mr-1 h-4 w-4" /> Merge Duplicates
          </Button>
        </div>
      </div>

      {/* AI Search Bar (combined from PatientFind) */}
      <Card className="border-2 border-sky-200">
        <CardContent className="p-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-10"
                placeholder="Search by Patient ID, Name, or Mobile number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setAiHint(""); }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching} className="bg-orange-500 hover:bg-orange-600 h-10 px-5">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {aiHint && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-500" /> {aiHint}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:border-orange-300 transition" onClick={() => navigate("/hms/patient/register")}>
          <CardContent className="p-3 flex items-center gap-3">
            <UserPlus className="h-7 w-7 text-orange-500" />
            <div>
              <p className="font-medium text-sm">Register New Patient</p>
              <p className="text-[11px] text-muted-foreground">AI duplicate detection + auto-fill</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-300 transition" onClick={() => navigate("/hms/patient/register-with-bill")}>
          <CardContent className="p-3 flex items-center gap-3">
            <Receipt className="h-7 w-7 text-green-500" />
            <div>
              <p className="font-medium text-sm">Register + OP Bill</p>
              <p className="text-[11px] text-muted-foreground">Register & generate bill together</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition" onClick={() => navigate("/hms/patient/manage-op")}>
          <CardContent className="p-3 flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Manage OP (Checked-In)</p>
              <p className="text-[11px] text-muted-foreground">Today's checked-in patients</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading patients...</p>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No patients found.</p>
              <Button variant="link" className="text-orange-600 mt-2" onClick={() => navigate("/hms/patient/register")}>
                <UserPlus className="h-4 w-4 mr-1" /> Click here to register new Patient
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium">S.No</th>
                    <th className="px-3 py-3 text-left font-medium">Name</th>
                    <th className="px-3 py-3 text-left font-medium">Phone</th>
                    <th className="px-3 py-3 text-left font-medium">Gender</th>
                    <th className="px-3 py-3 text-left font-medium">Age</th>
                    <th className="px-3 py-3 text-left font-medium">Blood Group</th>
                    <th className="px-3 py-3 text-left font-medium">Registered</th>
                    <th className="px-3 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/hms/patient/dashboard/${p.id}`)}>
                      <td className="px-3 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-3 font-medium">{p.full_name}</td>
                      <td className="px-3 py-3">{p.phone ?? "—"}</td>
                      <td className="px-3 py-3 capitalize">{p.gender ?? "—"}</td>
                      <td className="px-3 py-3">{p.age ?? "—"}</td>
                      <td className="px-3 py-3">{p.blood_group ?? "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 px-2" onClick={(e) => handleQuickBill(p, e)}>
                            <Receipt className="h-3 w-3 mr-1" /> Quick Bill
                          </Button>
                          <Button size="sm" className="h-6 text-xs bg-orange-500 hover:bg-orange-600 px-2" onClick={(e) => handleCheckin(p, e)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Checkin
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-orange-600 px-2" onClick={(e) => { e.stopPropagation(); navigate(`/hms/patient/dashboard/${p.id}`); }}>
                            Open <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsPatients;
