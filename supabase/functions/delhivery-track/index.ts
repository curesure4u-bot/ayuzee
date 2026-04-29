const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScanEvent {
  date: string;
  status: string;
  location: string;
  instructions?: string;
}

interface TrackResponse {
  waybill: string;
  status: string;
  current_location?: string;
  expected_delivery?: string;
  scans: ScanEvent[];
  simulated: boolean;
}

const simulate = (waybill: string): TrackResponse => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return {
    waybill,
    status: "In Transit",
    current_location: "Delhi Hub",
    expected_delivery: new Date(now + 2 * day).toISOString(),
    simulated: true,
    scans: [
      { date: new Date(now - 3 * day).toISOString(), status: "Manifested", location: "Ayuzee Warehouse, Bengaluru", instructions: "Shipment created" },
      { date: new Date(now - 2 * day).toISOString(), status: "Picked Up", location: "Bengaluru Hub", instructions: "Package picked up by courier" },
      { date: new Date(now - 1 * day).toISOString(), status: "In Transit", location: "Hyderabad Sort Center", instructions: "Forwarded to next hub" },
      { date: new Date(now - 6 * 60 * 60 * 1000).toISOString(), status: "In Transit", location: "Delhi Hub", instructions: "Arrived at destination hub" },
    ],
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { waybill } = await req.json();
    if (!waybill || typeof waybill !== "string") {
      return new Response(JSON.stringify({ error: "waybill is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("DELHIVERY_API_TOKEN");

    if (!token) {
      return new Response(JSON.stringify(simulate(waybill)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://track.delhivery.com/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`;
    const res = await fetch(url, { headers: { Authorization: `Token ${token}`, Accept: "application/json" } });

    if (!res.ok) {
      console.error("Delhivery API error", res.status, await res.text());
      return new Response(JSON.stringify(simulate(waybill)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const shipment = data?.ShipmentData?.[0]?.Shipment;
    if (!shipment) {
      return new Response(JSON.stringify(simulate(waybill)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scans: ScanEvent[] = (shipment.Scans ?? []).map((s: any) => ({
      date: s.ScanDetail?.ScanDateTime ?? s.ScanDetail?.Scan ?? "",
      status: s.ScanDetail?.Scan ?? s.ScanDetail?.ScanType ?? "Update",
      location: s.ScanDetail?.ScannedLocation ?? "",
      instructions: s.ScanDetail?.Instructions ?? "",
    }));

    const result: TrackResponse = {
      waybill,
      status: shipment.Status?.Status ?? "Unknown",
      current_location: shipment.Status?.StatusLocation,
      expected_delivery: shipment.ExpectedDeliveryDate,
      scans,
      simulated: false,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("delhivery-track error", err);
    return new Response(JSON.stringify({ error: "Failed to fetch tracking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
