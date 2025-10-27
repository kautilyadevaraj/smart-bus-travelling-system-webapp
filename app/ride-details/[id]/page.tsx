"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Bus,
  CreditCard,
  Zap,
  Download,
  Share2,
} from "lucide-react";

// Mock ride data with route coordinates
const rideDataMap: Record<string, any> = {
  "1": {
    id: "1",
    startLocation: "Central Station",
    endLocation: "Airport Terminal 2",
    startCoords: { lat: 28.6139, lng: 77.209 },
    endCoords: { lat: 28.5562, lng: 77.1 },
    duration: "45 minutes",
    distance: "32.5 km",
    baseFare: "₹50",
    distanceCharge: "₹75",
    total: "₹125",
    busId: "BUS-2024-001",
    busNumber: "AC-101",
    driverName: "Rajesh Kumar",
    driverRating: 4.8,
    cardUid: "B3:9E:38:F6",
    dateTime: "2024-10-25 08:30 AM",
    status: "Completed",
    routePoints: [
      { lat: 28.6139, lng: 77.209, label: "Start" },
      { lat: 28.605, lng: 77.2 },
      { lat: 28.59, lng: 77.18 },
      { lat: 28.57, lng: 77.14 },
      { lat: 28.5562, lng: 77.1, label: "End" },
    ],
  },
  "2": {
    id: "2",
    startLocation: "Downtown",
    endLocation: "Shopping Mall",
    startCoords: { lat: 28.63, lng: 77.22 },
    endCoords: { lat: 28.55, lng: 77.25 },
    duration: "25 minutes",
    distance: "18.3 km",
    baseFare: "₹40",
    distanceCharge: "₹45",
    total: "₹85",
    busId: "BUS-2024-002",
    busNumber: "AC-205",
    driverName: "Priya Singh",
    driverRating: 4.9,
    cardUid: "B3:9E:38:F6",
    dateTime: "2024-10-25 02:15 PM",
    status: "Completed",
    routePoints: [
      { lat: 28.63, lng: 77.22, label: "Start" },
      { lat: 28.61, lng: 77.23 },
      { lat: 28.58, lng: 77.24 },
      { lat: 28.55, lng: 77.25, label: "End" },
    ],
  },
  "3": {
    id: "3",
    startLocation: "University",
    endLocation: "Central Station",
    startCoords: { lat: 28.54, lng: 77.27 },
    endCoords: { lat: 28.6139, lng: 77.209 },
    duration: "35 minutes",
    distance: "22.1 km",
    baseFare: "₹45",
    distanceCharge: "₹50",
    total: "₹95",
    busId: "BUS-2024-003",
    busNumber: "AC-310",
    driverName: "Amit Patel",
    driverRating: 4.7,
    cardUid: "B3:9E:38:F6",
    dateTime: "2024-10-24 09:00 AM",
    status: "Completed",
    routePoints: [
      { lat: 28.54, lng: 77.27, label: "Start" },
      { lat: 28.56, lng: 77.25 },
      { lat: 28.59, lng: 77.23 },
      { lat: 28.6139, lng: 77.209, label: "End" },
    ],
  },
};

interface RouteMapProps {
  routePoints: Array<{ lat: number; lng: number; label?: string }>;
}

function RouteMap({ routePoints }: RouteMapProps) {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-border">
      {/* Map Background with Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255,0,0,.05) 25%, rgba(255,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(255,0,0,.05) 75%, rgba(255,0,0,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,0,0,.05) 25%, rgba(255,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(255,0,0,.05) 75%, rgba(255,0,0,.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Route Visualization */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        {/* Route Line */}
        <polyline
          points={routePoints
            .map((p, i) => {
              const x = 50 + (i / (routePoints.length - 1)) * 300;
              const y = 150 + Math.sin(i * 0.5) * 30;
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-blue-500"
          strokeDasharray="5,5"
        />

        {/* Route Points */}
        {routePoints.map((point, i) => {
          const x = 50 + (i / (routePoints.length - 1)) * 300;
          const y = 150 + Math.sin(i * 0.5) * 30;
          const isStart = i === 0;
          const isEnd = i === routePoints.length - 1;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isStart || isEnd ? 8 : 5}
                fill={isStart ? "#10b981" : isEnd ? "#ef4444" : "#3b82f6"}
                stroke="white"
                strokeWidth="2"
              />
              {(isStart || isEnd) && (
                <text
                  x={x}
                  y={y - 20}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-foreground"
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-foreground">Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-foreground">End</span>
        </div>
      </div>
    </div>
  );
}

export default function RideDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const rideData = rideDataMap[params.id] || rideDataMap["1"];
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = () => {
    const details = `Ride Details\nFrom: ${rideData.startLocation}\nTo: ${rideData.endLocation}\nFare: ${rideData.total}\nBus: ${rideData.busNumber}\nDriver: ${rideData.driverName}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Back Button */}
      <Link href="/ride-history">
        <Button
          variant="ghost"
          className="gap-2 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ride History
        </Button>
      </Link>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ride Details</h1>
        <p className="text-muted-foreground mt-2">{rideData.dateTime}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="md:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RouteMap routePoints={rideData.routePoints} />
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Status Badge */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rideData.status === "Completed"
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {rideData.status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trip Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Start Location
                  </p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {rideData.startLocation}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">End Location</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {rideData.endLocation}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex gap-3">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {rideData.duration}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-semibold text-card-foreground">
                    {rideData.distance}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fare Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Fare Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="text-card-foreground font-semibold">
                  {rideData.baseFare}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance Charge</span>
                <span className="text-card-foreground font-semibold">
                  {rideData.distanceCharge}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-semibold text-card-foreground">
                  Total Fare
                </span>
                <span className="text-lg font-bold text-card-foreground">
                  {rideData.total}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Driver Name</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {rideData.driverName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-sm font-semibold text-card-foreground">
                  ⭐ {rideData.driverRating}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bus Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
                <Bus className="w-5 h-5" />
                Bus Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Bus Number</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {rideData.busNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bus ID</p>
                <p className="text-sm font-mono text-card-foreground">
                  {rideData.busId}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Card UID</p>
                <p className="text-sm font-mono text-card-foreground">
                  {rideData.cardUid}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="text-sm font-semibold text-card-foreground">
                  Smart Card
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopyDetails}
              variant="outline"
              className="flex-1 gap-2 border-border text-foreground hover:bg-muted bg-transparent"
            >
              <Download className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-border text-foreground hover:bg-muted bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
