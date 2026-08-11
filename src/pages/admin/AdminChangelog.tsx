import { useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Release {
  id: string;
  version: string;
  date: string;
  title: string;
  changes: string[];
}

const initialReleases: Release[] = [
  {
    id: "1",
    version: "v3.5",
    date: "Aug 11, 2026",
    title: "Therapist Portal Enhancements",
    changes: [
      "Pre-procedure checklist gate",
      "Geo-fence enforcement",
      "Doctor sign-off workflow",
      "Material consumption logging",
      "10 new therapist pages",
    ],
  },
  {
    id: "2",
    version: "v3.4",
    date: "Aug 11, 2026",
    title: "Beyond Praxis: Dreams & Vision",
    changes: [
      "101 Bucket List with SAG",
      "Short-term Vision Board",
      "Long-term Vision Board with milestones",
      "Celebration confetti + XP rewards",
    ],
  },
  {
    id: "3",
    version: "v3.3",
    date: "Aug 11, 2026",
    title: "Admin Governance",
    changes: [
      "Audit Log",
      "Role & Permission Manager",
      "Doctor Sign-off Queue",
      "Support Tickets",
    ],
  },
];

export default function AdminChangelog() {
  const [releases, setReleases] = useState<Release[]>(initialReleases);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRelease, setNewRelease] = useState({
    version: "",
    date: "",
    title: "",
    changes: "",
  });

  const addRelease = () => {
    if (!newRelease.version || !newRelease.title) {
      toast.error("Please fill version and title");
      return;
    }
    const release: Release = {
      id: Date.now().toString(),
      version: newRelease.version,
      date: newRelease.date || new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      title: newRelease.title,
      changes: newRelease.changes
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean),
    };
    setReleases((prev) => [release, ...prev]);
    setNewRelease({ version: "", date: "", title: "", changes: "" });
    setDialogOpen(false);
    toast.success("Release added");
  };

  const filteredReleases = releases.filter(
    (r) =>
      r.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Changelog & Release Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            Track platform updates and releases
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Release
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Release</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Version</Label>
                <Input
                  value={newRelease.version}
                  onChange={(e) =>
                    setNewRelease({ ...newRelease, version: e.target.value })
                  }
                  placeholder="e.g. v3.6"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newRelease.date}
                  onChange={(e) =>
                    setNewRelease({ ...newRelease, date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newRelease.title}
                  onChange={(e) =>
                    setNewRelease({ ...newRelease, title: e.target.value })
                  }
                  placeholder="Release title"
                />
              </div>
              <div>
                <Label>Changes (one per line)</Label>
                <Textarea
                  value={newRelease.changes}
                  onChange={(e) =>
                    setNewRelease({ ...newRelease, changes: e.target.value })
                  }
                  placeholder="Feature 1&#10;Feature 2&#10;Bug fix 3"
                  rows={5}
                />
              </div>
              <Button onClick={addRelease} className="w-full">
                Add Release
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by version or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredReleases.map((release) => (
          <Card key={release.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm font-mono">
                  {release.version}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {release.date}
                </span>
              </div>
              <CardTitle className="text-lg">{release.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {release.changes.map((change, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {change}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
