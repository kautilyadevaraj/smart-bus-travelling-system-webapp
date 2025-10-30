"use client";
import { useEffect, useState, useMemo } from "react";
import { type rides } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  IndianRupee,
  Route,
  Footprints,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
// REMOVE this line - no longer need leaflet CSS
// import "leaflet/dist/leaflet.css";
import { format } from "date-fns";
import { use } from "react";

type Polyline = [number, number][];
type Ride = InferSelectModel<typeof rides>;

interface Step {
  instructions: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

interface CombinedRideDetails {
  ride: Ride;
  route: Polyline | null;
  steps: Step[] | null;
  distance: number | null;
  duration: number | null;
  startAddress: string;
  endAddress: string;
  routeError?: string;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes === 0) return `${remainingSeconds} sec`;
  return `${minutes} min ${remainingSeconds} sec`;
}

export default function RideDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  console.log("Page params.id on initial render:", id);

  // CHANGE: Import RideMapVector instead of RideMap
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/RideMapVector"), {
        loading: () => (
          <div style={{ height: "400px", width: "100%" }}>
            <p>Loading map...</p>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  const [data, setData] = useState<CombinedRideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchRideDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/get-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rideId: id }),
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Error fetching ride details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRideDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-5xl">
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Error: {error || "Ride data could not be loaded."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    ride,
    route,
    steps,
    distance,
    duration,
    startAddress,
    endAddress,
    routeError,
  } = data;

  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-6">
      <Link href="/">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rides
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ride Details</CardTitle>
          <CardDescription>
            {ride.startTime
              ? format(new Date(ride.startTime), "PPP 'at' p")
              : "Start time N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Duration:</span>
              <span>
                {duration ? formatDuration(duration) : duration || "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Footprints className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Distance:</span>
              <span>
                {distance
                  ? `${(distance / 1000).toFixed(2)} km`
                  : distance || "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Fare:</span>
              <span>₹{ride.fare}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Route className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Status:</span>
              <span
                className={
                  status === "completed"
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {ride.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
        </CardHeader>
        <CardContent>
          {routeError && (
            <p className="text-yellow-600 mb-4">
              {routeError || "Route data unavailable."}
            </p>
          )}
          {route &&
            ride.startLat &&
            ride.startLng &&
            ride.endLat &&
            ride.endLng && (
              <Map
                start={{
                  lat: Number(ride.startLat),
                  lng: Number(ride.startLng),
                }}
                end={{
                  lat: Number(ride.endLat),
                  lng: Number(ride.endLng),
                }}
                route={route}
              />
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Start Point</p>
              <p className="text-sm text-gray-600">{startAddress}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">End Point</p>
              <p className="text-sm text-gray-600">{endAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {steps && steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Turn-by-Turn Directions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-none">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">{index + 1}.</span>
                  <div>
                    <p>{step.instructions || "Continue"}</p>
                    <p className="text-sm text-gray-500">
                      {step.distance}{" "}
                      {step.duration ? `(${step.duration})` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
