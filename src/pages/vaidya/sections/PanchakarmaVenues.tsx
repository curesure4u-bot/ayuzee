import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Loader2, Pencil, Plus, PowerOff, PowerIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type Venue = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  license_number: string | null;
  license_expiry: string | null;
  registration_status: "pending" | "approved" | "suspended" | "rejected";
  owner_admin_id: string | null;
  offered_therapy_type_ids: string[] | null;
  is_active: boolean;
  updated_at: string;
};

type TherapyType = { id: string; name: string };

const emptyForm = {
  name: "",
  address: "",
  city: "",
  license_number: "",
  license_expiry: "",
  offered_therapy_type_ids: [] as string[],
};

const statusVariant: Record<Venue["registration_status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  suspended: "destructive",
  rejected: "destructive",
};

export default function PanchakarmaVenues() {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [therapyTypes, setTherapyTypes] = useState<TherapyType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const _uid = auth.user?.id ?? null;
    setUid(_uid);
    if (!_uid) {
      setVenues([]);
      setLoading(false);
      return;
    }
    const [{ data: vData, error: vErr }, { data: tData }] = await Promise.all([
      sb
        .from("panchakarma_venues")
        .select("*")
        .eq("owner_admin_id", _uid)
        .order("created_at", { ascending: false }),
      sb.from("panchakarma_therapy_types").select("id,name").order("name"),
    ]);
    if (vErr) toast.error(vErr.message);
    setVenues((vData ?? []) as Venue[]);
    setTherapyTypes((tData ?? []) as TherapyType[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (v: Venue) => {
    setEditing(v);
    setForm({
      name: v.name ?? "",
      address: v.address ?? "",
      city: v.city ?? "",
      license_number: v.license_number ?? "",
      license_expiry: v.license_expiry ?? "",
      offered_therapy_type_ids: v.offered_therapy_type_ids ?? [],
    });
    setDialogOpen(true);
  };

  const toggleTherapy = (id: string) => {
    setForm((f) => ({
      ...f,
      offered_therapy_type_ids: f.offered_therapy_type_ids.includes(id)
        ? f.offered_therapy_type_ids.filter((x) => x !== id)
        : [...f.offered_therapy_type_ids, id],
    }));
  };

  const save = async () => {
    if (!uid) return;
    if (!form.name.trim()) return toast.error("Venue name is required.");
    if (!form.license_number.trim()) return toast.error("License number is required.");
    if (!form.license_expiry) return toast.error("License expiry date is required.");
    setSaving(true);
    const payload: any = {
      name: form.name.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      license_number: form.license_number.trim(),
      license_expiry: form.license_expiry,
      offered_therapy_type_ids: form.offered_therapy_type_ids,
    };
    let error;
    if (editing) {
      ({ error } = await sb.from("panchakarma_venues").update(payload).eq("id", editing.id));
    } else {
      payload.owner_admin_id = uid;
      // new registrations start pending, inactive
      payload.registration_status = "pending";
      payload.is_active = false;
      ({ error } = await sb.from("panchakarma_venues").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Venue updated" : "Venue submitted for admin review");
    setDialogOpen(false);
    load();
  };

  const toggleActive = async (v: Venue) => {
    if (v.registration_status !== "approved" && !v.is_active) {
      toast.error("Venue must be approved by an admin before it can be activated.");
      return;
    }
    const { error } = await sb
      .from("panchakarma_venues")
      .update({ is_active: !v.is_active })
      .eq("id", v.id);
    if (error) return toast.error(error.message);
    toast.success(!v.is_active ? "Venue activated" : "Venue deactivated");
    load();
  };

  const daysToExpiry = (d: string | null) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            My Panchakarma Venues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register your Panchakarma centers, keep license details current, and manage their active status. New
            venues require admin approval before they can accept bookings.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Register new venue
        </Button>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-3" />
            You haven't registered any venues yet. Click "Register new venue" to submit one for approval.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {venues.map((v) => {
            const dte = daysToExpiry(v.license_expiry);
            const licenseWarn = dte !== null && dte < 30;
            const licenseExpired = dte !== null && dte < 0;
            return (
              <Card key={v.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-base">{v.name}</CardTitle>
                      <CardDescription>
                        {[v.address, v.city].filter(Boolean).join(", ") || "No address"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[v.registration_status]}>
                        {v.registration_status === "approved" && <ShieldCheck className="h-3 w-3 mr-1" />}
                        {(v.registration_status === "suspended" || v.registration_status === "rejected") && (
                          <ShieldAlert className="h-3 w-3 mr-1" />
                        )}
                        {v.registration_status}
                      </Badge>
                      <Badge variant={v.is_active ? "default" : "outline"}>
                        {v.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">License</div>
                      <div>{v.license_number || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Expiry</div>
                      <div className={licenseExpired ? "text-destructive" : licenseWarn ? "text-amber-600" : ""}>
                        {v.license_expiry ?? "—"}
                        {dte !== null && (
                          <span className="ml-1 text-xs">
                            ({licenseExpired ? `${Math.abs(dte)}d ago` : `${dte}d left`})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Therapies offered</div>
                      <div>{v.offered_therapy_type_ids?.length ?? 0} type(s)</div>
                    </div>
                  </div>

                  {v.registration_status === "rejected" && (
                    <p className="text-xs text-destructive">
                      This registration was rejected. Please contact platform admins for details.
                    </p>
                  )}
                  {v.registration_status === "suspended" && (
                    <p className="text-xs text-destructive">
                      This venue is currently suspended and cannot accept bookings.
                    </p>
                  )}
                  {v.registration_status === "pending" && (
                    <p className="text-xs text-muted-foreground">
                      Awaiting admin review — you can continue to edit details in the meantime.
                    </p>
                  )}

                  <Separator />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={v.is_active ? "destructive" : "default"}
                          disabled={!v.is_active && v.registration_status !== "approved"}
                        >
                          {v.is_active ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <PowerIcon className="h-4 w-4 mr-2" /> Activate
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {v.is_active ? "Deactivate this venue?" : "Activate this venue?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {v.is_active
                              ? "Patients and staff will no longer be able to book new sessions at this venue. Existing bookings are unaffected."
                              : "This venue will become bookable by patients and staff. Ensure staff, rooms and licenses are ready."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => toggleActive(v)}>
                            {v.is_active ? "Deactivate" : "Activate"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit venue" : "Register new venue"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update venue and license details. Changes stay visible to you and platform admins."
                : "Submit your Panchakarma center for admin review. It will be inactive until approved."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="v-name">Venue name *</Label>
              <Input
                id="v-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ayuzee Panchakarma Kendra"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="v-city">City</Label>
                <Input
                  id="v-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="v-lic">License number *</Label>
                <Input
                  id="v-lic"
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="v-addr">Address</Label>
              <Textarea
                id="v-addr"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="v-exp">License expiry *</Label>
              <Input
                id="v-exp"
                type="date"
                value={form.license_expiry}
                onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>Therapy types offered</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-2 max-h-48 overflow-y-auto rounded-md border p-3">
                {therapyTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2">No therapy types configured yet.</p>
                )}
                {therapyTypes.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.offered_therapy_type_ids.includes(t.id)}
                      onCheckedChange={() => toggleTherapy(t.id)}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save changes" : "Submit for review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
