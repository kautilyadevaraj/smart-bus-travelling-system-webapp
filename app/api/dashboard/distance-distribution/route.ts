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

    // Distance ranges
    const distanceRanges: { [key: string]: number } = {
      "0-5 km": 0,
      "5-10 km": 0,
      "10-15 km": 0,
      "15+ km": 0,
    };

    // Categorize rides by distance
    (completedRides || []).forEach((ride: any) => {
      const distance = parseFloat(ride.distance) || 0;

      if (distance >= 0 && distance <= 5) {
        distanceRanges["0-5 km"]++;
      } else if (distance > 5 && distance <= 10) {
        distanceRanges["5-10 km"]++;
      } else if (distance > 10 && distance <= 15) {
        distanceRanges["10-15 km"]++;
      } else if (distance > 15) {
        distanceRanges["15+ km"]++;
      }
    });

    // Convert to chart data format
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
    ];

    const chartData = Object.entries(distanceRanges).map(
      ([dist, rides], index) => ({
        dist,
        rides,
        fill: chartColors[index],
      })
    );

    const totalRides = Object.values(distanceRanges).reduce((a, b) => a + b, 0);

    // Find most common distance range
    const mostCommonRange = Object.entries(distanceRanges).sort(
      ([, a], [, b]) => b - a
    )[0];

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalRides,
        mostCommonRange: mostCommonRange[0],
        mostCommonCount: mostCommonRange[1],
      },
    });
  } catch (error) {
    console.error("Error fetching distance distribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
