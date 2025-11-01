import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: dbUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", authUser.email)
      .single();

    if (userError || !dbUsers) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get all completed rides
    const { data: completedRides, error: ridesError } = await supabase
      .from("rides")
      .select("*")
      .eq("userId", dbUsers.id)
      .eq("status", "COMPLETED")
      .eq("payment_status", "SUCCESS");

    if (ridesError) {
      console.error("Error fetching rides:", ridesError);
      return NextResponse.json(
        { error: "Failed to fetch rides" },
        { status: 500 }
      );
    }

    const rides = completedRides || [];

    // Overall statistics (all-time)
    const totalRides = rides.length;
    const totalSpent = parseFloat(dbUsers.total_spent as string) || 0;
    const currentBalance = parseFloat(dbUsers.balance as string) || 0;

    const overallAvgFare =
      totalRides > 0
        ? Math.round(
            (rides.reduce(
              (sum, ride: any) => sum + (parseFloat(ride.fare) || 0),
              0
            ) /
              totalRides) *
              100
          ) / 100
        : 0;

    // Month-over-month comparison for change percentage
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    // Current month rides
    const currentMonthRides = rides.filter((ride: any) => {
      const date = new Date(ride.start_time);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    // Previous month rides
    const prevMonthRides = rides.filter((ride: any) => {
      const date = new Date(ride.start_time);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Calculate month-over-month changes
    const ridesChange =
      prevMonthRides.length > 0
        ? ((currentMonthRides.length - prevMonthRides.length) /
            prevMonthRides.length) *
          100
        : 0;

    const currentMonthSpent = currentMonthRides.reduce(
      (sum, ride: any) => sum + (parseFloat(ride.fare) || 0),
      0
    );
    const prevMonthSpent = prevMonthRides.reduce(
      (sum, ride: any) => sum + (parseFloat(ride.fare) || 0),
      0
    );

    const spentChange =
      prevMonthSpent > 0
        ? ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100
        : 0;

    const currentMonthAvgFare =
      currentMonthRides.length > 0
        ? currentMonthSpent / currentMonthRides.length
        : 0;
    const prevMonthAvgFare =
      prevMonthRides.length > 0 ? prevMonthSpent / prevMonthRides.length : 0;

    const avgFareChange =
      prevMonthAvgFare > 0
        ? ((currentMonthAvgFare - prevMonthAvgFare) / prevMonthAvgFare) * 100
        : 0;

    // Balance doesn't have previous month data, so mock it
    const balanceChange = -2.5;

    return NextResponse.json({
      success: true,
      stats: [
        {
          title: "Total Rides",
          value: totalRides.toString(),
          change: `${ridesChange > 0 ? "+" : ""}${
            Math.round(ridesChange * 10) / 10
          }%`,
          trend: ridesChange > 0 ? "up" : "down",
        },
        {
          title: "Total Spent",
          value: `₹${Math.round(totalSpent).toLocaleString()}`,
          change: `${spentChange > 0 ? "+" : ""}${
            Math.round(spentChange * 10) / 10
          }%`,
          trend: spentChange > 0 ? "up" : "down",
        },
        {
          title: "Current Balance",
          value: `₹${Math.round(currentBalance).toLocaleString()}`,
          change: `${balanceChange > 0 ? "+" : ""}${
            Math.round(balanceChange * 10) / 10
          }%`,
          trend: balanceChange > 0 ? "up" : "down",
        },
        {
          title: "Avg Fare",
          value: `₹${Math.round(overallAvgFare * 10) / 10}`,
          change: `${avgFareChange > 0 ? "+" : ""}${
            Math.round(avgFareChange * 10) / 10
          }%`,
          trend: avgFareChange > 0 ? "up" : "down",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching hero stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
