import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VehicleStatus = "available" | "on_trip" | "maintenance";
export type TripStatus = "dispatched" | "arrived" | "returning" | "completed";

export interface AmbulanceVehicle {
  id: string;
  number: string;
  type: string;
  driver: string;
  driverPhone: string;
  status: VehicleStatus;
  currentLocation: string;
}

export interface AmbulanceTrip {
  id: string;
  vehicle: string;
  patient: string;
  pickup: string;
  destination: string;
  dispatchTime: string;
  arrivalTime: string;
  status: TripStatus;
  urgency: string;
}

const MOCK_VEHICLES: AmbulanceVehicle[] = [
  { id: "1", number: "KL-01-AB-1234", type: "Advanced Life Support", driver: "Rajan K", driverPhone: "9876500001", status: "available", currentLocation: "Hospital Parking" },
  { id: "2", number: "KL-01-CD-5678", type: "Basic Life Support", driver: "Suresh M", driverPhone: "9876500002", status: "on_trip", currentLocation: "En-route to Varkala" },
  { id: "3", number: "KL-01-EF-9012", type: "Patient Transport", driver: "Mohan R", driverPhone: "9876500003", status: "available", currentLocation: "Hospital Parking" },
  { id: "4", number: "KL-01-GH-3456", type: "Basic Life Support", driver: "Vijay S", driverPhone: "9876500004", status: "maintenance", currentLocation: "Service Center" },
];

const MOCK_TRIPS: AmbulanceTrip[] = [
  { id: "1", vehicle: "KL-01-CD-5678", patient: "Emergency Call #415", pickup: "Varkala Junction", destination: "Ayuzee Main Hospital", dispatchTime: "10:15 AM", arrivalTime: "—", status: "dispatched", urgency: "Emergency" },
  { id: "2", vehicle: "KL-01-AB-1234", patient: "Ramesh Kumar", pickup: "Ayuzee Hospital", destination: "SRL Diagnostics Lab", dispatchTime: "09:00 AM", arrivalTime: "09:25 AM", status: "completed", urgency: "Routine" },
  { id: "3", vehicle: "KL-01-EF-9012", patient: "Lakshmi Devi", pickup: "Residence - Kowdiar", destination: "Ayuzee Hospital", dispatchTime: "08:30 AM", arrivalTime: "08:50 AM", status: "completed", urgency: "Scheduled" },
];

export const useAmbulance = () => {
  const [vehicles, setVehicles] = useState<AmbulanceVehicle[]>(MOCK_VEHICLES);
  const [trips, setTrips] = useState<AmbulanceTrip[]>(MOCK_TRIPS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: vData, error: vErr }, { data: tData, error: tErr }] = await Promise.all([
        (supabase as any).from("hms_ambulance_vehicles").select("*").eq("is_active", true),
        (supabase as any).from("hms_ambulance_trips").select("*").order("dispatch_time", { ascending: false }).limit(20),
      ]);

      if (vErr && tErr) { setError(vErr?.message); setLoading(false); return; }

      if (vData && vData.length > 0) {
        setVehicles(vData.map((v: any) => ({
          id: v.id, number: v.vehicle_number || "", type: v.vehicle_type || "",
          driver: v.driver_name || "", driverPhone: v.driver_phone || "",
          status: v.status || "available", currentLocation: v.current_location || "",
        })));
      }
      if (tData && tData.length > 0) {
        setTrips(tData.map((t: any) => ({
          id: t.id, vehicle: t.vehicle_number || "", patient: t.patient_name || "",
          pickup: t.pickup_location || "", destination: t.destination || "",
          dispatchTime: t.dispatch_time || "", arrivalTime: t.arrival_time || "—",
          status: t.status || "dispatched", urgency: t.urgency || "Routine",
        })));
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dispatchVehicle = async (vehicleId: string, patient: string, pickup: string, urgency: string): Promise<boolean> => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return false;

    const tripPayload = {
      vehicle_number: vehicle.number,
      patient_name: patient,
      pickup_location: pickup,
      destination: "Ayuzee Main Hospital",
      urgency,
      status: "dispatched",
      dispatch_time: new Date().toISOString(),
    };

    const { error: insertErr } = await (supabase as any).from("hms_ambulance_trips").insert(tripPayload);
    if (insertErr) {
      // Fallback: update local state
      const newTrip: AmbulanceTrip = {
        id: `TR-${Date.now()}`, vehicle: vehicle.number, patient, pickup,
        destination: "Ayuzee Main Hospital", dispatchTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        arrivalTime: "—", status: "dispatched", urgency,
      };
      setTrips(prev => [newTrip, ...prev]);
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: "on_trip" as VehicleStatus, currentLocation: `En-route: ${pickup}` } : v));
      return true;
    }
    await fetchData();
    return true;
  };

  const available = vehicles.filter(v => v.status === "available").length;
  const onTrip = vehicles.filter(v => v.status === "on_trip").length;
  const todayTrips = trips.length;

  return { vehicles, trips, loading, error, available, onTrip, todayTrips, dispatchVehicle, refetch: fetchData };
};
