import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  full_name: string;
  relation: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  marital_status: string | null;
}

const PatientProfile = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [memberOpen, setMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: "",
    relation: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    marital_status: "",
  });

  useEffect(() => {
    document.title = "My Profile — Ayuzee";
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      setUserId(uid);
      setEmail(data.session?.user.email ?? "");
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, phone, gender, date_of_birth")
        .eq("user_id", uid)
        .maybeSingle();
      if (prof) {
        setForm({
          full_name: prof.full_name ?? "",
          phone: prof.phone ?? "",
          gender: prof.gender ?? "",
          date_of_birth: prof.date_of_birth ?? "",
        });
      }
      loadMembers(uid);
    });
  }, []);

  const loadMembers = async (uid: string) => {
    const { data } = await supabase
      .from("patient_associated_members")
      .select("*")
      .eq("patient_user_id", uid)
      .order("created_at", { ascending: false });
    setMembers((data as Member[]) ?? []);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
      })
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const addMember = async () => {
    if (!newMember.full_name || !newMember.relation) {
      toast.error("Name and relation are required");
      return;
    }
    const { error } = await supabase.from("patient_associated_members").insert({
      patient_user_id: userId,
      full_name: newMember.full_name,
      relation: newMember.relation,
      age: newMember.age ? Number(newMember.age) : null,
      gender: newMember.gender || null,
      height_cm: newMember.height_cm ? Number(newMember.height_cm) : null,
      weight_kg: newMember.weight_kg ? Number(newMember.weight_kg) : null,
      marital_status: newMember.marital_status || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Family member added");
    setMemberOpen(false);
    setNewMember({ full_name: "", relation: "", age: "", gender: "", height_cm: "", weight_kg: "", marital_status: "" });
    loadMembers(userId);
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("patient_associated_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Member removed");
      loadMembers(userId);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal details and family members</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="members">Associated Members</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Personal & Contact Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="hero" onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Family Members</CardTitle>
              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm"><Plus className="mr-1 h-4 w-4" />Add New Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={newMember.full_name} onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Relation *</Label>
                      <Select value={newMember.relation} onValueChange={(v) => setNewMember({ ...newMember, relation: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Other"].map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={newMember.gender} onValueChange={(v) => setNewMember({ ...newMember, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Height (cm)</Label>
                      <Input type="number" value={newMember.height_cm} onChange={(e) => setNewMember({ ...newMember, height_cm: e.target.value })} />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input type="number" value={newMember.weight_kg} onChange={(e) => setNewMember({ ...newMember, weight_kg: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Marital Status</Label>
                      <Select value={newMember.marital_status} onValueChange={(v) => setNewMember({ ...newMember, marital_status: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="hero" onClick={addMember}>Save Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium">No family members yet</p>
                  <p className="text-sm text-muted-foreground">Add family members to book appointments on their behalf.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-start justify-between rounded-xl border border-border p-4">
                      <div>
                        <div className="font-semibold">{m.full_name}</div>
                        <div className="text-xs text-muted-foreground">{m.relation}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {[m.age && `${m.age} yrs`, m.gender, m.height_cm && `${m.height_cm} cm`, m.weight_kg && `${m.weight_kg} kg`]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
