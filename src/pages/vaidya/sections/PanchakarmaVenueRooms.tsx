import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, DoorOpen, Loader2, Pencil, Plus, PowerIcon, PowerOff, Users } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type Venue = {
  id: string;
  name: string;
  registration_status: "pending" | "approved" | "suspended" | "rejected";
  is_active: boolean;
};

type Room = {
  id: string;
  venue_id: string;
  room_name: string;
  capacity: number | null;
  amenities: string[] | null;
  is_active: boolean;
  created_at: string;
};

function parseAmenities(value: string): string[] {
  return value
    .split(/[,\n]+/)
    .map((a) => a.trim())
    .filter(Boolean);
}

function formatAmenities(list: string[] | null | undefined): string {
  return (list ?? []).join(", ");
}

export default function PanchakarmaVenueRooms() {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueId, setVenueId] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadVenues = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const _uid = auth.user?.id ?? null;
    setUid(_uid);
    if (!_uid) {
      setVenues([]);
      setLoading(false);
      return;
    }
    const { data, error } = await sb
      .from("panchakarma_venues")
      .select("id,name,registration_status,is_active")
      .eq("owner_admin_id", _uid)
      .order("name");
    if (error) toast.error(error.message);
    const list = (data ?? []) as Venue[];
    setVenues(list);
    if (list.length > 0 && !venueId) setVenueId(list[0].id);
    setLoading(false);
  }, [venueId]);

  const loadRooms = useCallback(async (vid: string) => {
    if (!vid) {
      setRooms([]);
      return;
    }
    const { data, error } = await sb
      .from("panchakarma_rooms")
      .select("*")
      .eq("venue_id", vid)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setRooms((data ?? []) as Room[]);
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    if (venueId) loadRooms(venueId);
  }, [venueId, loadRooms]);

  const openCreate = () => {
    setEditing(null);
    setRoomName("");
    setCapacity("");
    setAmenitiesInput("");
    setDialogOpen(true);
  };
  const openEdit = (r: Room) => {
    setEditing(r);
    setRoomName(r.room_name);
    setCapacity(r.capacity?.toString() ?? "");
    setAmenitiesInput(formatAmenities(r.amenities));
    setDialogOpen(true);
  };

  const save = async () => {
    const name = roomName.trim();
    if (!name) return toast.error("Room name is required.");
    if (!venueId) return;
    const cap = capacity.trim() === "" ? null : Number(capacity);
    if (cap !== null && (!Number.isInteger(cap) || cap < 1)) {
      return toast.error("Capacity must be a positive whole number.");
    }
    const amenities = parseAmenities(amenitiesInput);
    setSaving(true);
    let error;
    if (editing) {
      ({ error } = await sb
        .from("panchakarma_rooms")
        .update({ room_name: name, capacity: cap, amenities })
        .eq("id", editing.id));
    } else {
      ({ error } = await sb
        .from("panchakarma_rooms")
        .insert({ room_name: name, venue_id: venueId, capacity: cap, amenities, is_active: true }));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Room updated" : "Room added");
    setDialogOpen(false);
    loadRooms(venueId);
  };

  const toggleActive = async (r: Room) => {
    const { error } = await sb
      .from("panchakarma_rooms")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(!r.is_active ? "Room activated" : "Room deactivated");
    loadRooms(venueId);
  };

  const currentVenue = venues.find((v) => v.id === venueId);
  const venueBlocked = currentVenue && (currentVenue.registration_status !== "approved" || !currentVenue.is_active);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-primary" />
          Venue Rooms
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage therapy rooms for each of your Panchakarma venues.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-3" />
            You don't own any venues yet. Register a venue first from the Venues page.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Select venue</CardTitle>
              <CardDescription>Rooms belong to a single venue.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 flex-wrap">
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="Choose a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentVenue && (
                <div className="flex gap-2">
                  <Badge variant={currentVenue.registration_status === "approved" ? "default" : "secondary"}>
                    {currentVenue.registration_status}
                  </Badge>
                  <Badge variant={currentVenue.is_active ? "default" : "outline"}>
                    {currentVenue.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {venueBlocked && (
            <p className="text-xs text-muted-foreground mb-3">
              Note: this venue is not yet approved/active. Rooms you add will remain hidden from patients and staff
              until the venue is approved and activated.
            </p>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Rooms</CardTitle>
                  <CardDescription>{rooms.length} configured</CardDescription>
                </div>
                <Button onClick={openCreate} disabled={!venueId}>
                  <Plus className="h-4 w-4 mr-2" /> Add room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No rooms yet. Click "Add room" to create the first one.
                </p>
              ) : (
                <div className="divide-y">
                  {rooms.map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <DoorOpen className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{r.room_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Added {new Date(r.created_at).toLocaleDateString()}
                          </div>
                          {r.capacity ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3" />
                              Capacity {r.capacity}
                            </div>
                          ) : null}
                          {r.amenities && r.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {r.amenities.map((a) => (
                                <Badge key={a} variant="outline" className="text-xs font-normal">
                                  {a}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={r.is_active ? "default" : "outline"}>
                          {r.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={r.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleActive(r)}
                        >
                          {r.is_active ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <PowerIcon className="h-4 w-4 mr-1" /> Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit room" : "Add room"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the room details."
                : "Give this therapy room a short, recognisable name and describe its setup."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="room-name">Room name *</Label>
              <Input
                id="room-name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Abhyanga Room 1"
              />
            </div>
            <div>
              <Label htmlFor="room-capacity">Capacity</Label>
              <Input
                id="room-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 2"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum number of clients the room can hold.</p>
            </div>
            <div>
              <Label htmlFor="room-amenities">Amenities</Label>
              <Input
                id="room-amenities"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="e.g. AC, Steam bath, Music"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate amenities with commas.</p>
              {amenitiesInput.trim() && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parseAmenities(amenitiesInput).map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs font-normal">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save" : "Add room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
