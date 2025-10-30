"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  IndianRupee,
  Route,
  Footprints,
  MapPin,
  Bus,
  User,
  CreditCard,
  Download,
  Share2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { use } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Polyline = [number, number][];

interface Step {
  instructions: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

interface Ride {
  id: string;
  startLocation?: string;
  endLocation?: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  startTime?: string;
  endTime?: string;
  fare?: string;
  status?: string;
  driverName?: string;
  driverRating?: number;
  busNumber?: string;
  busId?: string;
  cardUid?: string;
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

function CardSkeleton() {
  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

function MapSkeleton() {
  return (
    <Card className="bg-card border border-border py-0 overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-96 md:h-[500px] w-full" />
      </CardContent>
    </Card>
  );
}

export default function RideDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/RideMapVector"), {
        loading: () => (
          <div className="flex items-center justify-center h-96 md:h-[500px] bg-muted rounded-lg">
            <Spinner />
          </div>
        ),
        ssr: false,
      }),
    []
  );

  const [details, setDetails] = useState<CombinedRideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    type: "start" | "end";
    address: string;
  } | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setError("Invalid Ride ID provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchAllDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/get-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rideId: id }),
        });

        if (!isMounted) return;

        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: "Failed to parse error response" }));
          throw new Error(
            errData.error ||
              `Failed to fetch ride details (Status: ${response.status})`
          );
        }

        const data: CombinedRideDetails = await response.json();
        setDetails(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unknown error occurred");
          setDetails(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAllDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const actualDuration = useMemo(() => {
    if (details?.ride?.startTime && details?.ride?.endTime) {
      try {
        const start = new Date(details.ride.startTime);
        const end = new Date(details.ride.endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return "Invalid Date";
        }
        const diffSeconds = Math.round(
          (end.getTime() - start.getTime()) / 1000
        );
        if (diffSeconds < 0) return "Invalid Dates";
        return formatDuration(diffSeconds);
      } catch (e) {
        return "Error";
      }
    }
    return "N/A";
  }, [details]);

  const handleCopyDetails = () => {
    if (!details?.ride) return;
    const ride = details.ride;
    const detailsText = `Ride Details\nFrom: ${
      ride.startLocation || "N/A"
    }\nTo: ${ride.endLocation || "N/A"}\nFare: ₹${ride.fare || "0"}\nBus: ${
      ride.busNumber || "N/A"
    }\nDriver: ${ride.driverName || "N/A"}`;
    navigator.clipboard.writeText(detailsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLocationClick = (type: "start" | "end", address: string) => {
    setSelectedLocation({ type, address });
    setLocationDialogOpen(true);
  };

  if (error && !loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Link href="/ride-history">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Button>
        </Link>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">
                Error Loading Ride
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {error || "Ride data could not be loaded."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MapSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Link href="/ride-history">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Button>
        </Link>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">
                Error Loading Ride
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ride data could not be loaded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    ride,
    route,
    steps,
    distance: apiDistance,
    duration: apiDuration,
    startAddress,
    endAddress,
    routeError,
  } = details;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link href="/ride-history">
        <Button
          variant="ghost"
          className="gap-2 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Button>
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Ride Details
        </h1>
        <p className="text-muted-foreground mt-1">
          {ride.startTime
            ? format(new Date(ride.startTime), "PPP 'at' p")
            : "Start time N/A"}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          <Card className="bg-card border border-border overflow-hidden py-0">
            <CardContent className="p-0">
              {route &&
              ride.startLat &&
              ride.startLng &&
              ride.endLat &&
              ride.endLng ? (
                <div className="h-96 md:h-[500px] w-full">
                  <Map
                    start={{
                      lat: Number(ride.startLat),
                      lng: Number(ride.startLng),
                    }}
                    end={{ lat: Number(ride.endLat), lng: Number(ride.endLng) }}
                    route={route}
                  />
                </div>
              ) : (
                <div className="h-96 md:h-[500px] flex items-center justify-center bg-muted text-muted-foreground">
                  Route data unavailable
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trip Summary - Now includes locations */}
          <Card className="bg-card border border-border py-4 gap-2">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-4 border-b border-border">
                <div className="space-y-1">
                  {/* Start Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <button
                        onClick={() =>
                          handleLocationClick(
                            "start",
                            startAddress || ride.startLocation || "N/A"
                          )
                        }
                        className="text-sm font-semibold text-card-foreground truncate hover:underline text-left w-full md:cursor-help"
                        title="Click to view full address"
                      >
                        {startAddress || ride.startLocation || "N/A"}
                      </button>
                    </div>
                  </div>

                  {/* End Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <button
                        onClick={() =>
                          handleLocationClick(
                            "end",
                            endAddress || ride.endLocation || "N/A"
                          )
                        }
                        className="text-sm font-semibold text-card-foreground truncate hover:underline text-left w-full md:cursor-help"
                        title="Click to view full address"
                      >
                        {endAddress || ride.endLocation || "N/A"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration and Distance */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {actualDuration}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Route className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {apiDistance
                      ? `${(apiDistance / 1000).toFixed(1)} km`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {steps && steps.length > 0 && (
            <Collapsible open={directionsOpen} onOpenChange={setDirectionsOpen}>
              <Card className="bg-card border border-border py-3 justify-center">
                <CollapsibleTrigger asChild className="pt-2">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-card-foreground flex items-center gap-2">
                        <Footprints className="w-5 h-5" />
                        Turn-by-Turn Directions
                      </CardTitle>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          directionsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          className="pb-3 border-b border-border last:border-b-0 last:pb-0"
                        >
                          <p className="font-medium text-card-foreground text-sm">
                            {index + 1}. {step.instructions || "Continue"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.distance}
                            {step.duration ? ` • ${step.duration}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-4">
          {/* Fare Breakdown */}
          <Card className="bg-card border border-border py-3 gap-1">
            <CardHeader className="">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                Fare Details
                <IndianRupee className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final Fare</span>
                <span className="font-bold text-lg text-card-foreground">
                  ₹
                  {ride.fare ? Number.parseFloat(ride.fare).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    ride.status === "COMPLETED"
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {ride.status || "UNKNOWN"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          {ride.driverName && (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {ride.driverName}
                  </p>
                </div>
                {ride.driverRating && (
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-semibold text-card-foreground">
                      ⭐ {ride.driverRating}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bus Information */}
          {ride.busNumber && (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  Bus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Bus Number</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {ride.busNumber}
                  </p>
                </div>
                {ride.busId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bus ID</p>
                    <p className="text-sm font-mono text-card-foreground">
                      {ride.busId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          {ride.cardUid && (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Card UID</p>
                  <p className="text-sm font-mono text-card-foreground">
                    {ride.cardUid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    Smart Card
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCopyDetails}
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin
                className={`w-5 h-5 ${
                  selectedLocation?.type === "start"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
              {selectedLocation?.type === "start"
                ? "Pickup Location"
                : "Dropoff Location"}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-card-foreground break-words">
              {selectedLocation?.address}
            </p>
          </div>
          <Button
            onClick={() => setLocationDialogOpen(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
