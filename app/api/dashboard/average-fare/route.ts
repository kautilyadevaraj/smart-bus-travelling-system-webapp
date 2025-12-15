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

    // Group by month and calculate average fare
    const monthlyData: { [key: string]: { total: number; count: number } } = {};

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const monthYear = monthNames[date.getMonth()];
      const fare = parseFloat(ride.fare) || 0;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { total: 0, count: 0 };
      }

      monthlyData[monthYear].total += fare;
      monthlyData[monthYear].count++;
    });

    // Convert to chart data format (Jan to Dec order)
    const chartData = monthNames
      .filter((month) => monthlyData[month])
      .map((month) => {
        const data = monthlyData[month];
        return {
          month,
          avgFare: Math.round((data.total / data.count) * 100) / 100,
        };
      });

    // Calculate overall average
    const totalFare = (completedRides || []).reduce(
      (sum, ride: any) => sum + (parseFloat(ride.fare) || 0),
      0
    );
    const overallAverage =
      Math.round((totalFare / (completedRides || []).length) * 100) / 100;

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        overallAverage,
        totalRides: (completedRides || []).length,
      },
    });
  } catch (error) {
    console.error("Error fetching average fare:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
