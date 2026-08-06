import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown, GraduationCap, Loader2, Search, Shield, ShieldCheck, ShieldPlus,
  Trash2, TrendingUp, User, UserPlus, Users,
} from "lucide-react";
import { toast } from "sonner";
import { useStudentAdmin, type StudentSearchResult } from "@/hooks/useStudentAdmin";

const ROLES = [
  { value: "mega_admin", label: "Mega Admin", icon: Crown, description: "Full access to everything", color: "text-red-600" },
  { value: "college_admin", label: "College Admin", icon: GraduationCap, description: "Manages their college chapter + content", color: "text-purple-600" },
  { value: "quiz_master", label: "Quiz Master", icon: ShieldCheck, description: "Creates and reviews quiz questions", color: "text-blue-600" },
  { value: "contributor", label: "Contributor", icon: User, description: "Submits questions for review", color: "text-green-600" },
];

const roleColor: Record<string, string> = {
  mega_admin: "bg-red-100 text-red-800",
  college_admin: "bg-purple-100 text-purple-800",
  quiz_master: "bg-blue-100 text-blue-800",
  contributor: "bg-green-100 text-green-800",
};

// ---------- Promote Dialog ----------

function PromoteDialog({ onPromote }: { onPromote: (userId: string, role: string, college?: string) => void }) {
  const { searchStudents } = useStudentAdmin();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<StudentSearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState("contributor");
  const [college, setCollege] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) { toast.error("Type at least 2 characters"); return; }
    setSearching(true);
    const res = await searchStudents(searchQuery.trim());
    setResults(res);
    setSearching(false);
  };

  const handlePromote = () => {
    if (!selectedUser) { toast.error("Select a student first"); return; }
    onPromote(selectedUser.user_id, selectedRole, college.trim() || undefined);
    setOpen(false);
    setSelectedUser(null);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Promote Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Promote Student to Admin Role</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Search */}
          <div>
            <label className="text-sm font-medium">Search Student by Name</label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Type student name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }} />
              <Button variant="outline" size="sm" onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
              {results.map((student) => (
                <button
                  key={student.user_id}
                  className={`w-full text-left rounded px-3 py-2 text-sm transition-colors ${selectedUser?.user_id === student.user_id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}
                  onClick={() => setSelectedUser(student)}
                >
                  <p className="font-medium">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground">{student.college_name || "—"} · {student.course || "—"} · Year {student.year_of_study || "—"}</p>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-sm font-medium">{selectedUser.full_name}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.college_name}</p>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium">Assign Role</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ROLES.filter((r) => r.value !== "mega_admin").map((role) => (
                <button
                  key={role.value}
                  className={`text-left rounded-lg border p-3 transition-colors ${selectedRole === role.value ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-center gap-2">
                    <role.icon className={`h-4 w-4 ${role.color}`} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* College for college_admin */}
          {selectedRole === "college_admin" && (
            <div>
              <label className="text-sm font-medium">College Name</label>
              <Input placeholder="e.g. SDM College of Ayurveda, Udupi" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
          )}

          <Button onClick={handlePromote} disabled={!selectedUser} className="w-full">
            <ShieldPlus className="h-4 w-4 mr-2" /> Promote to {ROLES.find((r) => r.value === selectedRole)?.label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Page ----------

const StudentAdminPanel = () => {
  const { admins, stats, loading, userId, isSuperAdmin, userRole, promoteStudent, demoteStudent, claimSuperAdmin } = useStudentAdmin();
  const [tab, setTab] = useState("roles");

  const handlePromote = async (targetUserId: string, role: string, college?: string) => {
    const result = await promoteStudent(targetUserId, role, college);
    if (result.success) toast.success("Student promoted!");
    else toast.error(result.error || "Failed to promote");
  };

  const handleDemote = async (roleId: string, name: string) => {
    const result = await demoteStudent(roleId);
    if (result.success) toast.success(`${name} demoted`);
    else toast.error(result.error || "Failed");
  };

  const handleClaimSuperAdmin = async () => {
    const result = await claimSuperAdmin();
    if (result.success) toast.success("You are now Mega Admin!");
    else toast.error(result.error || "Failed");
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  // Not an admin and no mega admin exists — only platform owner can assign
  if (!userRole && admins.filter((a) => a.role === "mega_admin").length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <Shield className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">The Mega Admin role is assigned by the platform owner (Ayuzee team). Contact <strong>curesure4u@gmail.com</strong> to request admin access for your Student Hub.</p>
      </div>
    );
  }

  // Not admin but mega admin exists
  if (!userRole) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2">Contact a Mega Admin to get promoted to a content management role.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles and content moderation
            <Badge className={`ml-2 text-[10px] ${roleColor[userRole] || ""}`}>{userRole.replace("_", " ")}</Badge>
          </p>
        </div>
        {isSuperAdmin && <PromoteDialog onPromote={handlePromote} />}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="roles" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Team ({admins.length})</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Overview</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          {/* Role explanation cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map((role) => (
              <Card key={role.value} className="text-center">
                <CardContent className="p-3">
                  <role.icon className={`h-5 w-5 mx-auto ${role.color}`} />
                  <p className="text-xs font-medium mt-1">{role.label}</p>
                  <p className="text-[10px] text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Admin list */}
          <div className="space-y-2">
            {admins.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No admins yet.</CardContent></Card>
            ) : admins.map((admin) => (
              <Card key={admin.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{admin.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={`text-[10px] ${roleColor[admin.role] || ""}`}>{admin.role.replace("_", " ")}</Badge>
                        {admin.college_name && <span>{admin.college_name}</span>}
                        <span>{new Date(admin.granted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                  </div>
                  {isSuperAdmin && admin.user_id !== userId && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDemote(admin.id, admin.full_name || "User")} aria-label="Remove role">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-primary">{stats.total_admins}</p><p className="text-[10px] text-muted-foreground">Total Admins</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">{stats.mega_admins}</p><p className="text-[10px] text-muted-foreground">Mega Admins</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-purple-600">{stats.college_admins}</p><p className="text-[10px] text-muted-foreground">College Admins</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-blue-600">{stats.quiz_masters}</p><p className="text-[10px] text-muted-foreground">Quiz Masters</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{stats.contributors}</p><p className="text-[10px] text-muted-foreground">Contributors</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">How it works</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Mega Admin:</strong> Can promote/demote anyone, approve all content, manage all features.</p>
              <p><strong className="text-foreground">College Admin:</strong> Manages their college chapter, can approve content for their college.</p>
              <p><strong className="text-foreground">Quiz Master:</strong> Creates and reviews quiz questions. Approved questions go directly into quizzes.</p>
              <p><strong className="text-foreground">Contributor:</strong> Can submit questions and content for review. Cannot approve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentAdminPanel;
