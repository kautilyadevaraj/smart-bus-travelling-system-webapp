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

    // Group by month and calculate averages
    const monthlyData: {
      [key: string]: {
        distances: number[];
        durations: number[];
        fares: number[];
      };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const monthName = monthNames[date.getMonth()];
      const distance = parseFloat(ride.distance) || 0;
      const duration = parseFloat(ride.duration) || 0;
      const fare = parseFloat(ride.fare) || 0;

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {
          distances: [],
          durations: [],
          fares: [],
        };
      }

      monthlyData[monthName].distances.push(distance);
      monthlyData[monthName].durations.push(duration);
      monthlyData[monthName].fares.push(fare);
    });

    // Calculate averages for each month
    const chartData = monthNames
      .filter((month) => monthlyData[month])
      .map((month) => {
        const data = monthlyData[month];
        const avgDistance =
          Math.round(
            (data.distances.reduce((a, b) => a + b, 0) /
              data.distances.length) *
              10
          ) / 10;
        const avgDuration = Math.round(
          data.durations.reduce((a, b) => a + b, 0) / data.durations.length
        );
        const avgFare =
          Math.round(
            (data.fares.reduce((a, b) => a + b, 0) / data.fares.length) * 100
          ) / 100;

        return {
          month,
          avgDistance,
          avgDuration,
          avgFare,
        };
      });

    // Calculate overall trends
    const firstMonth = chartData[0];
    const lastMonth = chartData[chartData.length - 1];

    const distanceTrend =
      firstMonth && lastMonth
        ? Math.round(
            ((lastMonth.avgDistance - firstMonth.avgDistance) /
              firstMonth.avgDistance) *
              100 *
              100
          ) / 100
        : 0;

    const fareTrend =
      firstMonth && lastMonth
        ? Math.round(
            ((lastMonth.avgFare - firstMonth.avgFare) / firstMonth.avgFare) *
              100 *
              100
          ) / 100
        : 0;

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalRides: (completedRides || []).length,
        distanceTrend,
        fareTrend,
        lastMonthAvgDistance: lastMonth?.avgDistance || 0,
        lastMonthAvgFare: lastMonth?.avgFare || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching trip efficiency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
