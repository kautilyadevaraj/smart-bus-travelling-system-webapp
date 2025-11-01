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

    // Time ranges
    const timeRanges = {
      "6-9 AM": { start: 6, end: 9 },
      "12-3 PM": { start: 12, end: 15 },
      "6-9 PM": { start: 18, end: 21 },
      "12-3 AM": { start: 0, end: 3 },
    };

    // Count rides by time of day
    const ridesByTime: { [key: string]: number } = {
      "6-9 AM": 0,
      "12-3 PM": 0,
      "6-9 PM": 0,
      "12-3 AM": 0,
    };

    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const hour = date.getHours();

      // Categorize by time range
      if (hour >= 6 && hour < 9) {
        ridesByTime["6-9 AM"]++;
      } else if (hour >= 12 && hour < 15) {
        ridesByTime["12-3 PM"]++;
      } else if (hour >= 18 && hour < 21) {
        ridesByTime["6-9 PM"]++;
      } else if (hour >= 0 && hour < 3) {
        ridesByTime["12-3 AM"]++;
      }
    });

    // Convert to chart data format
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
    ];

    const chartData = Object.entries(ridesByTime).map(
      ([time, rides], index) => ({
        time,
        rides,
        fill: chartColors[index],
      })
    );

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalRides: (completedRides || []).length,
        peakTime: Object.entries(ridesByTime).sort(
          ([, a], [, b]) => b - a
        )[0][0],
      },
    });
  } catch (error) {
    console.error("Error fetching rides by time:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
