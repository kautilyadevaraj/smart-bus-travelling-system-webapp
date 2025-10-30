import { NextResponse, type NextRequest } from "next/server";
import polyline from "@mapbox/polyline";
import { dbAdmin as db } from "@/db/admin";
import { rides } from "@/db/schema";
import { eq } from "drizzle-orm";

const OLA_MAPS_API_KEY = process.env.OLA_MAPS_API_KEY;
const OLA_DIRECTIONS_URL = "https://api.olamaps.io/routing/v1/directions";
const OLA_REVERSE_GEOCODE_URL =
  "https://api.olamaps.io/places/v1/reverse-geocode";

async function getAddress(lat: number, lng: number): Promise<string> {
  try {
    const url = `${OLA_REVERSE_GEOCODE_URL}?latlng=${lat},${lng}&api_key=${OLA_MAPS_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return "Address not found";

    const data = await response.json();
    return data?.results?.[0]?.formatted_address || `${lat}, ${lng}`;
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "Address not found";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rideId } = await request.json();

    if (!rideId || typeof rideId !== "string") {
      return NextResponse.json(
        { error: "Ride ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch Ride Data from Database
    const [rideData] = await db
      .select()
      .from(rides)
      .where(eq(rides.id, rideId));

    if (!rideData) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Check for coordinates
    if (
      !rideData.startLat ||
      !rideData.startLng ||
      !rideData.endLat ||
      !rideData.endLng
    ) {
      return NextResponse.json({
        ride: rideData,
        route: null,
        steps: [],
        distance: null,
        duration: null,
        startAddress: "N/A",
        endAddress: "N/A",
      });
    }

    // Fetch addresses in parallel with the route
    const startAddrPromise = getAddress(
      Number(rideData.startLat),
      Number(rideData.startLng)
    );
    const endAddrPromise = getAddress(
      Number(rideData.endLat),
      Number(rideData.endLng)
    );

    // 2. Format coordinates for Ola
    const origin = `${rideData.startLat},${rideData.startLng}`;
    const destination = `${rideData.endLat},${rideData.endLng}`;

    // 3. Build the Ola Maps API URL
    const url = `${OLA_DIRECTIONS_URL}?origin=${origin}&destination=${destination}&traffic=true&profile=auto&api_key=${OLA_MAPS_API_KEY}`;

    // 4. Call the Ola Maps API
    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    let route = null;
    let steps = [];
    let distance = null;
    let duration = null;
    let routeError = null;

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const leg = routeData.legs?.[0];

        route = polyline.decode(routeData.overview_polyline);
        steps =
          leg?.steps?.map((step: any) => ({
            instructions: step.instructions,
            distance: step.readable_distance || `${step.distance} m`,
            duration: step.readable_duration || `${step.duration} sec`,
            maneuver: step.maneuver,
          })) || [];
        distance = leg?.distance;
        duration = leg?.duration;
      } else {
        routeError = "No route found by Ola Maps.";
      }
    } else {
      routeError = "Failed to fetch route from Ola Maps.";
    }

    // 5. Wait for addresses to be fetched
    const startAddress = await startAddrPromise;
    const endAddress = await endAddrPromise;

    // 6. Combine All Data
    const combinedData = {
      ride: rideData,
      route: route,
      steps: steps,
      distance: distance,
      duration: duration,
      routeError: routeError,
      startAddress: startAddress,
      endAddress: endAddress,
    };

    return NextResponse.json(combinedData);
  } catch (error: any) {
    console.error("Get-route handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
