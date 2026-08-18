import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown, Users, Plus, Trash2, Mail, Shield, Search,
  CheckCircle2, XCircle, RefreshCw, Brain, Calendar,
} from "lucide-react";

interface AccessEntry {
  id: string;
  email: string;
  access_type: string;
  patient_name: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminDispenzaAccess() {
  const [entries, setEntries] = useState<AccessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New entry form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAccessType, setNewAccessType] = useState<string>("premium");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dispenza_premium_access")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load access list");
      console.error(error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const addAccess = async () => {
    if (!newEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    setAdding(true);

    const { error } = await supabase.from("dispenza_premium_access").insert({
      email: newEmail.trim().toLowerCase(),
      access_type: newAccessType,
      patient_name: newName.trim() || null,
      phone: newPhone.trim() || null,
      notes: newNotes.trim() || null,
      granted_by: "superadmin",
      is_active: true,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("This email already has access");
      } else {
        toast.error("Failed to grant access");
        console.error(error);
      }
    } else {
      toast.success(`Premium access granted to ${newEmail}`);
      setNewEmail("");
      setNewName("");
      setNewPhone("");
      setNewNotes("");
      fetchEntries();
    }
    setAdding(false);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("dispenza_premium_access")
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(currentActive ? "Access revoked" : "Access restored");
      fetchEntries();
    }
  };

  const deleteEntry = async (id: string, email: string) => {
    if (email === "curesure4u@gmail.com") {
      toast.error("Cannot delete superadmin access");
      return;
    }
    const { error } = await supabase
      .from("dispenza_premium_access")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Access removed");
      fetchEntries();
    }
  };

  const filteredEntries = entries.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.patient_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = entries.filter(e => e.is_active).length;
  const premiumCount = entries.filter(e => e.is_active && (e.access_type === "premium" || e.access_type === "both")).length;
  const clinicCount = entries.filter(e => e.is_active && (e.access_type === "clinic" || e.access_type === "both")).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Dispenza Premium Access Manager
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Grant or revoke access to premium meditation tools by email
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEntries}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-800">{activeCount}</p>
            <p className="text-xs text-green-600">Active Users</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-800">{premiumCount}</p>
            <p className="text-xs text-amber-600">Premium Access</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-800">{clinicCount}</p>
            <p className="text-xs text-purple-600">Clinic Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Access */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Grant New Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
              <Input
                placeholder="patient@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Patient Name</label>
              <Input
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
              <Input
                placeholder="+91 98765 43210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Access Type</label>
              <Select value={newAccessType} onValueChange={setNewAccessType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium (7 tools)</SelectItem>
                  <SelectItem value="clinic">Clinic (Group Coherence)</SelectItem>
                  <SelectItem value="both">Both (All 10 tools)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
              <Input
                placeholder="Package purchased, referral source, etc."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={addAccess}
                disabled={adding || !newEmail.trim()}
              >
                <Mail className="w-4 h-4 mr-2" />
                {adding ? "Granting..." : "Grant Access"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Access List ({filteredEntries.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : filteredEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No entries found</p>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    entry.is_active ? "border-gray-200 bg-white" : "border-red-200 bg-red-50/30 opacity-70"
                  }`}
                >
                  {/* Status */}
                  {entry.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{entry.email}</span>
                      {entry.email === "curesure4u@gmail.com" && (
                        <Badge className="bg-red-100 text-red-700 text-[9px]">
                          <Shield className="w-2.5 h-2.5 mr-0.5" /> SUPERADMIN
                        </Badge>
                      )}
                    </div>
                    {entry.patient_name && (
                      <p className="text-xs text-gray-500">{entry.patient_name}</p>
                    )}
                    {entry.notes && (
                      <p className="text-[10px] text-gray-400 italic">{entry.notes}</p>
                    )}
                  </div>

                  {/* Access Type Badge */}
                  <Badge className={`shrink-0 text-[10px] ${
                    entry.access_type === "both" ? "bg-purple-100 text-purple-700" :
                    entry.access_type === "clinic" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {entry.access_type === "both" ? "ALL" :
                     entry.access_type === "clinic" ? "CLINIC" : "PREMIUM"}
                  </Badge>

                  {/* Date */}
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>

                  {/* Actions */}
                  <Button
                    size="sm" variant="outline"
                    className={`h-7 text-[10px] shrink-0 ${entry.is_active ? "text-orange-600 border-orange-200" : "text-green-600 border-green-200"}`}
                    onClick={() => toggleActive(entry.id, entry.is_active)}
                  >
                    {entry.is_active ? "Revoke" : "Restore"}
                  </Button>

                  {entry.email !== "curesure4u@gmail.com" && (
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      onClick={() => deleteEntry(entry.id, entry.email)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" /> How Access Works
          </h4>
          <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
            <li><strong>Premium:</strong> Unlocks 7 paid meditation tools (Breathwork, Body Blessing, Walking, Pineal, Scheduler, Rehearsal, Score)</li>
            <li><strong>Clinic:</strong> Unlocks Group Coherence Healing sessions</li>
            <li><strong>Both:</strong> Unlocks all 10 tools (premium + clinic)</li>
            <li>Users with granted access will see the tools unlocked when they log in with that email</li>
            <li>You can revoke access anytime — the lock will reappear immediately</li>
            <li>Superadmin (you) always has full access regardless</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
