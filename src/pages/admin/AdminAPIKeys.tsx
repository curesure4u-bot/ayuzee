import { useState } from "react";
import { Key, Plus, Copy, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  last_used: string;
  status: "active" | "revoked";
  rate_limit: number;
}

const initialKeys: APIKey[] = [
  {
    id: "1",
    name: "HMS Integration",
    key: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    created: "Aug 1, 2025",
    last_used: "Aug 11, 2026",
    status: "active",
    rate_limit: 1000,
  },
  {
    id: "2",
    name: "Mobile App",
    key: "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    created: "Jul 15, 2025",
    last_used: "Aug 11, 2026",
    status: "active",
    rate_limit: 10000,
  },
];

function generateHexKey(): string {
  const chars = "0123456789abcdef";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

function maskKey(key: string): string {
  return "****" + key.slice(-4);
}

export default function AdminAPIKeys() {
  const [keys, setKeys] = useState<APIKey[]>(initialKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [newKey, setNewKey] = useState({
    name: "",
    rate_limit: "1000",
    expiry: "",
  });

  const activeKeys = keys.filter((k) => k.status === "active").length;

  const handleGenerate = () => {
    if (!newKey.name) {
      toast.error("Please enter a key name");
      return;
    }
    const key = generateHexKey();
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newKey.name,
      key,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      last_used: "Never",
      status: "active",
      rate_limit: Number(newKey.rate_limit),
    };
    setKeys((prev) => [...prev, apiKey]);
    setGeneratedKey(key);
    setDialogOpen(false);
    setShowKeyDialog(true);
    setNewKey({ name: "", rate_limit: "1000", expiry: "" });
    toast.success("API key generated");
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success("Key copied to clipboard");
  };

  const revokeKey = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
    toast.success("API key revoked");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Key Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage API access for external integrations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Key Name</Label>
                <Input
                  value={newKey.name}
                  onChange={(e) =>
                    setNewKey({ ...newKey, name: e.target.value })
                  }
                  placeholder="e.g. HMS Integration"
                />
              </div>
              <div>
                <Label>Rate Limit (requests/day)</Label>
                <Select
                  value={newKey.rate_limit}
                  onValueChange={(v) =>
                    setNewKey({ ...newKey, rate_limit: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100/day</SelectItem>
                    <SelectItem value="1000">1,000/day</SelectItem>
                    <SelectItem value="10000">10,000/day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={newKey.expiry}
                  onChange={(e) =>
                    setNewKey({ ...newKey, expiry: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleGenerate} className="w-full">
                Generate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy this key now. You won't be able to see it again.
            </p>
            <div className="flex gap-2">
              <Input value={generatedKey} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Keys</p>
            <p className="text-2xl font-bold">{keys.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Keys</p>
            <p className="text-2xl font-bold">{activeKeys}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total API Calls Today</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {maskKey(apiKey.key)}
                  </TableCell>
                  <TableCell>{apiKey.created}</TableCell>
                  <TableCell>{apiKey.last_used}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        apiKey.status === "active" ? "default" : "destructive"
                      }
                    >
                      {apiKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{apiKey.rate_limit.toLocaleString()}/day</TableCell>
                  <TableCell>
                    {apiKey.status === "active" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeKey(apiKey.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
