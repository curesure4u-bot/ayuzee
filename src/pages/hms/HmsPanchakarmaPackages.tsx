import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, Plus, IndianRupee, Loader2 } from "lucide-react";
import { usePanchakarmaPackages } from "@/hooks/usePanchakarmaPackages";

const HmsPanchakarmaPackages = () => {
  const { packages, loading, error, createPackage } = usePanchakarmaPackages();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTherapies, setNewTherapies] = useState("");
  const [newSessionsPerDay, setNewSessionsPerDay] = useState("2");

  const handleCreate = async () => {
    if (!newName || !newDuration || !newPrice) {
      toast.error("Name, duration, and price are required");
      return;
    }
    const durationDays = parseInt(newDuration) || 7;
    const sessionsPerDay = parseInt(newSessionsPerDay) || 2;
    const therapies = newTherapies.split(",").map((t) => t.trim()).filter(Boolean);

    const success = await createPackage({
      name: newName,
      durationDays,
      durationLabel: `${durationDays} days`,
      therapies,
      sessionsPerDay,
      totalSessions: durationDays * sessionsPerDay,
      price: Number(newPrice),
      description: newDesc,
    });

    if (success) {
      toast.success("Package created!");
      setCreateOpen(false);
      setNewName(""); setNewDuration(""); setNewPrice(""); setNewDesc(""); setNewTherapies(""); setNewSessionsPerDay("2");
    } else {
      toast.error("Failed to create package");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" /> Panchakarma Packages & Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage treatment packages, pricing and therapy combinations
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Package
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading packages...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{pkg.name}</CardTitle>
                <Badge variant="outline">{pkg.durationLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
              <div className="flex flex-wrap gap-1">
                {pkg.therapies.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Sessions/Day</p>
                  <p className="font-medium">{pkg.sessionsPerDay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                  <p className="font-medium">{pkg.totalSessions}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                  <IndianRupee className="h-4 w-4" />
                  {pkg.price.toLocaleString("en-IN")}
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info(`Enrolling patient in ${pkg.name}`)}>
                  Enroll Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Package Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Package</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><label className="text-xs font-medium">Package Name *</label><Input className="h-8 text-xs" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. 7-day Rejuvenation" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><label className="text-xs font-medium">Duration (days) *</label><Input className="h-8 text-xs" type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="7" /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Sessions/Day</label><Input className="h-8 text-xs" type="number" value={newSessionsPerDay} onChange={(e) => setNewSessionsPerDay(e.target.value)} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Price (₹) *</label><Input className="h-8 text-xs" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="28000" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium">Therapies (comma separated)</label><Input className="h-8 text-xs" value={newTherapies} onChange={(e) => setNewTherapies(e.target.value)} placeholder="Abhyanga, Shirodhara, Steam Bath" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Description</label><Textarea className="text-xs min-h-[60px]" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Package description..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanchakarmaPackages;
