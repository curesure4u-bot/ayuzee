import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ClipboardList, Search, RefreshCw, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useRadiology, type RadiologyOrder, type RadiologyStatus } from "@/hooks/useRadiology";

const RadiologyWorklist = () => {
  const { orders, stats, loading, error, updateStatus, refetch } = useRadiology();
  const [filterModality, setFilterModality] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Map hook statuses to worklist-relevant ones
  const worklistOrders = orders.filter((o) => o.status !== "reported");

  const filtered = worklistOrders.filter((item) => {
    if (filterModality !== "all" && item.modality !== filterModality) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (search && !item.patientName.toLowerCase().includes(search.toLowerCase()) && !item.uhid.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === "emergency") return "destructive";
    if (priority === "urgent") return "secondary";
    return "outline";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === "in-progress") return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    return <Clock className="h-4 w-4 text-amber-600" />;
  };

  const handleStart = async (id: string) => {
    const success = await updateStatus(id, "in-progress");
    if (success) toast.success("Study started");
  };

  const handleComplete = async (id: string) => {
    const success = await updateStatus(id, "completed");
    if (success) toast.success("Study completed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-violet-600" /> Radiology Worklist
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time queue of pending, in-progress, and completed imaging studies
          </p>
        </div>
        <Button variant="outline" onClick={() => { refetch(); toast.success("Worklist refreshed"); }}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading worklist...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.ordered + stats.scheduled}</p><p className="text-xs text-muted-foreground">Waiting</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{orders.filter(o => o.priority === "emergency").length}</p><p className="text-xs text-muted-foreground">Emergency</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search patient / UHID" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger><SelectValue placeholder="Modality" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="USG">USG</SelectItem>
                <SelectItem value="DEXA">DEXA</SelectItem>
                <SelectItem value="Echo">Echo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full" onClick={() => { setFilterModality("all"); setFilterStatus("all"); setSearch(""); }}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Worklist Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Investigation</th>
                  <th className="px-4 py-3 text-left font-medium">Modality</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{item.scheduledTime}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.patientName}</p>
                      <p className="text-xs text-muted-foreground">{item.uhid}</p>
                    </td>
                    <td className="px-4 py-3">{item.investigation}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.modality}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority === "emergency" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(item.status === "ordered" || item.status === "scheduled") && (
                        <Button size="sm" variant="outline" onClick={() => handleStart(item.id)}>Start</Button>
                      )}
                      {item.status === "in-progress" && (
                        <Button size="sm" onClick={() => handleComplete(item.id)}>Complete</Button>
                      )}
                      {item.status === "completed" && (
                        <Button size="sm" variant="ghost" onClick={() => toast.info("Opening report editor...")}>Report</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No items match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiologyWorklist;
