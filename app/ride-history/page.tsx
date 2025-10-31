"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronRight } from "lucide-react";

interface Ride {
  id: string;
  dateTime: string;
  startLocation: string;
  endLocation: string;
  fare: string;
  status: "Completed" | "In-Progress";
}

const mockRides: Ride[] = [
  {
    id: "1",
    dateTime: "2024-10-25 08:30 AM",
    startLocation: "Central Station",
    endLocation: "Airport Terminal 2",
    fare: "₹125",
    status: "Completed",
  },
  {
    id: "2",
    dateTime: "2024-10-25 02:15 PM",
    startLocation: "Downtown",
    endLocation: "Shopping Mall",
    fare: "₹85",
    status: "Completed",
  },
  {
    id: "3",
    dateTime: "2024-10-24 09:00 AM",
    startLocation: "University",
    endLocation: "Central Station",
    fare: "₹95",
    status: "Completed",
  },
  {
    id: "4",
    dateTime: "2024-10-24 05:45 PM",
    startLocation: "Office Complex",
    endLocation: "Residential Area",
    fare: "₹110",
    status: "In-Progress",
  },
  {
    id: "5",
    dateTime: "2024-10-23 10:20 AM",
    startLocation: "Hospital",
    endLocation: "Market",
    fare: "₹75",
    status: "Completed",
  },
];

export default function RideHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredRides, setFilteredRides] = useState<Ride[]>(mockRides);

  const handleFilter = () => {
    let filtered = mockRides;

    if (searchTerm) {
      filtered = filtered.filter(
        (ride) =>
          ride.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ride.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ride) => ride.status === statusFilter);
    }

    setFilteredRides(filtered);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Ride History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your past rides
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleFilter}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            All Rides ({filteredRides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    Start Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    End Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    Fare
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRides.map((ride) => (
                  <tr
                    key={ride.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-card-foreground">
                      {ride.dateTime}
                    </td>
                    <td className="py-3 px-4 text-card-foreground">
                      {ride.startLocation}
                    </td>
                    <td className="py-3 px-4 text-card-foreground">
                      {ride.endLocation}
                    </td>
                    <td className="py-3 px-4 font-semibold text-card-foreground">
                      {ride.fare}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ride.status === "Completed"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/ride-details/${ride.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10 gap-1"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
