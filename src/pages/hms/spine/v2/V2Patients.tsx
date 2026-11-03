import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus } from "lucide-react";

const V2Patients = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Patient Management V2</h1>
          <p className="text-muted-foreground mt-1">Enhanced patient tracking with journey visualization</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Patient</Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input placeholder="Search patients..." className="max-w-md" />
        <Button variant="outline"><Search className="h-4 w-4" /></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">401</p><p className="text-xs text-muted-foreground">Total Patients</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">124</p><p className="text-xs text-muted-foreground">Active Treatment</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">89</p><p className="text-xs text-muted-foreground">Follow-up Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">188</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      {/* Placeholder for patient table */}
      <Card>
        <CardHeader><CardTitle>Recent Patients</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Patient list will appear here with search and filters</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Patients;