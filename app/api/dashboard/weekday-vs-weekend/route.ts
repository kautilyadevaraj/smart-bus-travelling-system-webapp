import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // // Get authenticated user
    // const {
    //   data: { user: authUser },
    // } = await supabase.auth.getUser();

    // if (!authUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get user profile
    const { data: dbUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")
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

    // Separate weekday and weekend rides
    const weekdayRides: any[] = [];
    const weekendRides: any[] = [];

    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const dayOfWeek = date.getDay();

      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendRides.push(ride);
      } else {
        weekdayRides.push(ride);
      }
    });

    // Calculate metrics
    const weekdayMetrics = {
      count: weekdayRides.length,
      avgDuration:
        weekdayRides.length > 0
          ? Math.round(
              (weekdayRides.reduce(
                (sum, r) => sum + (parseFloat(r.duration) || 0),
                0
              ) /
                weekdayRides.length) *
                100
            ) / 100
          : 0,
      avgFare:
        weekdayRides.length > 0
          ? Math.round(
              (weekdayRides.reduce(
                (sum, r) => sum + (parseFloat(r.fare) || 0),
                0
              ) /
                weekdayRides.length) *
                100
            ) / 100
          : 0,
    };

    const weekendMetrics = {
      count: weekendRides.length,
      avgDuration:
        weekendRides.length > 0
          ? Math.round(
              (weekendRides.reduce(
                (sum, r) => sum + (parseFloat(r.duration) || 0),
                0
              ) /
                weekendRides.length) *
                100
            ) / 100
          : 0,
      avgFare:
        weekendRides.length > 0
          ? Math.round(
              (weekendRides.reduce(
                (sum, r) => sum + (parseFloat(r.fare) || 0),
                0
              ) /
                weekendRides.length) *
                100
            ) / 100
          : 0,
    };

    // Prepare chart data
    const chartData = [
      {
        month: "Ride Count",
        weekday: weekdayMetrics.count,
        weekend: weekendMetrics.count,
      },
      {
        month: "Avg Duration (min)",
        weekday: weekdayMetrics.avgDuration,
        weekend: weekendMetrics.avgDuration,
      },
      {
        month: "Avg Fare (₹)",
        weekday: Math.round(weekdayMetrics.avgFare),
        weekend: Math.round(weekendMetrics.avgFare),
      },
    ];

    // Calculate trend (weekday vs weekend rides percentage difference)
    const rideDifference =
      weekdayMetrics.count > 0
        ? Math.round(
            ((weekdayMetrics.count - weekendMetrics.count) /
              weekdayMetrics.count) *
              100 *
              100
          ) / 100
        : 0;

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        weekdayCount: weekdayMetrics.count,
        weekendCount: weekendMetrics.count,
        weekdayAvgFare: weekdayMetrics.avgFare,
        weekendAvgFare: weekendMetrics.avgFare,
        trendPercentage: rideDifference,
      },
    });
  } catch (error) {
    console.error("Error fetching weekday vs weekend data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
