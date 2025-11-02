"use client";

import { useState, useEffect } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, ChevronRight, Loader2 } from "lucide-react";

interface Ride {
  id: string;
  dateTime: string;
  startLocation: string;
  endLocation: string;
  fare: string;
  distance: string;
  duration: string;
  status: "COMPLETED" | "IN_PROGRESS" | "INSUFFICIENT_BALANCE";
}

interface ApiResponse {
  rides: Ride[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function RideHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rides, setRides] = useState<Ride[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);

  // Fetch rides from API
  const fetchRides = async (page: number, search: string, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        status,
      });

      const response = await fetch(`/api/rides?${params}`);
      const data: ApiResponse = await response.json();

      setRides(data.rides);
      setPagination(data.pagination);
    } catch (error) {
      console.error("[v0] Failed to fetch rides:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter apply
  const handleFilter = () => {
    setCurrentPage(1);
    fetchRides(1, searchTerm, statusFilter);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchRides(newPage, searchTerm, statusFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial load
  useEffect(() => {
    fetchRides(1, "", "all");
  }, []);

  // Render pagination items
  const renderPaginationItems = () => {
    const { currentPage, totalPages } = pagination;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i == 1 ||
        i == totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots.map((item, idx) => {
      if (item === "...") {
        return (
          <PaginationItem key={`ellipsis-${idx}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const pageNum = item as number;
      return (
        <PaginationItem key={pageNum}>
          <PaginationLink
            onClick={() => handlePageChange(pageNum)}
            isActive={pageNum === currentPage}
            className="cursor-pointer"
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "INSUFFICIENT_BALANCE":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
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
              <SelectTrigger className="w-full md:w-56 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="INSUFFICIENT_BALANCE">
                  Insufficient Balance
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleFilter}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            All Rides ({pagination.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rides found matching your criteria
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
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
                        Distance
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-card-foreground">
                        Duration
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
                    {rides.map((ride) => (
                      <tr
                        key={ride.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-card-foreground text-xs sm:text-sm">
                          {ride.dateTime}
                        </td>
                        <td className="py-3 px-4 text-card-foreground text-xs sm:text-sm">
                          {ride.startLocation}
                        </td>
                        <td className="py-3 px-4 text-card-foreground text-xs sm:text-sm">
                          {ride.endLocation}
                        </td>
                        <td className="py-3 px-4 text-card-foreground text-xs sm:text-sm">
                          {ride.distance}
                        </td>
                        <td className="py-3 px-4 text-card-foreground text-xs sm:text-sm">
                          {ride.duration}
                        </td>
                        <td className="py-3 px-4 font-semibold text-card-foreground text-xs sm:text-sm">
                          {ride.fare}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              ride.status
                            )}`}
                          >
                            {ride.status === "COMPLETED"
                              ? "Completed"
                              : ride.status === "IN_PROGRESS"
                              ? "In Progress"
                              : "Insufficient Balance"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/ride-details/${ride.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 gap-1"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {rides.map((ride) => (
                  <Card key={ride.id} className="bg-muted border-border">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Date & Time
                          </p>
                          <p className="font-semibold text-sm">
                            {ride.dateTime}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            ride.status
                          )}`}
                        >
                          {ride.status === "COMPLETED"
                            ? "Completed"
                            : ride.status === "IN_PROGRESS"
                            ? "In Progress"
                            : "Insufficient"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Route</p>
                          <p className="font-semibold text-sm">
                            {ride.startLocation}
                          </p>
                          <p className="text-xs text-muted-foreground">→</p>
                          <p className="font-semibold text-sm">
                            {ride.endLocation}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Distance
                          </p>
                          <p className="font-semibold text-sm">
                            {ride.distance}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Duration
                          </p>
                          <p className="font-semibold text-sm">
                            {ride.duration}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fare</p>
                          <p className="font-semibold text-sm">{ride.fare}</p>
                        </div>
                      </div>

                      <Link href={`/ride-details/${ride.id}`} className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-primary bg-transparent"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    pagination.currentPage > 1 &&
                    handlePageChange(pagination.currentPage - 1)
                  }
                  className={
                    pagination.currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.currentPage < pagination.totalPages &&
                    handlePageChange(pagination.currentPage + 1)
                  }
                  className={
                    pagination.currentPage === pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
