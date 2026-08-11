import { useState } from "react";
import { Users, Plus, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  type: "manufacturer" | "venue_partner" | "content_partner" | "lab";
  mou_status: "active" | "expired" | "draft";
  revenue_share: number;
  contract_start: string;
  contract_end: string;
  notes: string;
}

const initialPartners: Partner[] = [
  {
    id: "1",
    name: "Arya Vaidya Sala",
    type: "manufacturer",
    mou_status: "active",
    revenue_share: 15,
    contract_start: "2025-01-01",
    contract_end: "2026-12-31",
    notes: "Primary Ayurvedic medicine supplier",
  },
  {
    id: "2",
    name: "Kerala Ayurveda",
    type: "manufacturer",
    mou_status: "active",
    revenue_share: 12,
    contract_start: "2025-03-01",
    contract_end: "2026-06-30",
    notes: "Secondary supplier for oils and treatments",
  },
  {
    id: "3",
    name: "Dharma Ayurveda Venue",
    type: "venue_partner",
    mou_status: "active",
    revenue_share: 15,
    contract_start: "2025-06-01",
    contract_end: "2027-05-31",
    notes: "Treatment venue partner in Bangalore",
  },
];

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "" as Partner["type"],
    revenue_share: 10,
    contract_start: "",
    contract_end: "",
    notes: "",
  });

  const totalPartners = partners.length;
  const activeMoUs = partners.filter((p) => p.mou_status === "active").length;

  const addPartner = async () => {
    if (!newPartner.name || !newPartner.type) {
      toast.error("Please fill required fields");
      return;
    }

    const partner: Partner = {
      id: Date.now().toString(),
      name: newPartner.name,
      type: newPartner.type,
      mou_status: "draft",
      revenue_share: newPartner.revenue_share,
      contract_start: newPartner.contract_start,
      contract_end: newPartner.contract_end,
      notes: newPartner.notes,
    };

    setPartners((prev) => [...prev, partner]);

    try {
      await (supabase as any).from("platform_audit_log").insert({
        action_type: "create",
        module: "partners",
        details: { partner_name: newPartner.name, type: newPartner.type },
      });
    } catch (e) {
      // silent fail for audit log
    }

    setNewPartner({
      name: "",
      type: "" as Partner["type"],
      revenue_share: 10,
      contract_start: "",
      contract_end: "",
      notes: "",
    });
    setDialogOpen(false);
    toast.success("Partner added successfully");
  };

  const renewPartner = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, mou_status: "active" as const } : p))
    );
    toast.success("Partner MoU renewed");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      expired: "destructive",
      draft: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return <Badge variant="outline">{type.replace("_", " ")}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Partners & Vendors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage partners, MoUs, and vendor relationships
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Partner Name</Label>
                <Input
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                  placeholder="Partner organization name"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newPartner.type}
                  onValueChange={(v) =>
                    setNewPartner({ ...newPartner, type: v as Partner["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="venue_partner">Venue Partner</SelectItem>
                    <SelectItem value="content_partner">
                      Content Partner
                    </SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Revenue Share (%)</Label>
                <Input
                  type="number"
                  value={newPartner.revenue_share}
                  onChange={(e) =>
                    setNewPartner({
                      ...newPartner,
                      revenue_share: Number(e.target.value),
                    })
                  }
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contract Start</Label>
                  <Input
                    type="date"
                    value={newPartner.contract_start}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        contract_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Contract End</Label>
                  <Input
                    type="date"
                    value={newPartner.contract_end}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        contract_end: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newPartner.notes}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </div>
              <Button onClick={addPartner} className="w-full">
                Add Partner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Partners</p>
            <p className="text-2xl font-bold">{totalPartners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active MoUs</p>
            <p className="text-2xl font-bold">{activeMoUs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue from Partners</p>
            <p className="text-2xl font-bold">₹0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>MoU Status</TableHead>
                <TableHead>Revenue Share %</TableHead>
                <TableHead>Contract Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{getTypeBadge(partner.type)}</TableCell>
                  <TableCell>{getStatusBadge(partner.mou_status)}</TableCell>
                  <TableCell>{partner.revenue_share}%</TableCell>
                  <TableCell>{partner.contract_end || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {partner.mou_status === "expired" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => renewPartner(partner.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Renew
                        </Button>
                      )}
                    </div>
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
