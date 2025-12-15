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

    // Define short vs long ride threshold (in km)
    const SHORT_RIDE_THRESHOLD = 10; // rides <= 10km are short

    let shortRideCount = 0;
    let longRideCount = 0;

    (completedRides || []).forEach((ride: any) => {
      const distance = parseFloat(ride.distance) || 0;

      if (distance <= SHORT_RIDE_THRESHOLD) {
        shortRideCount++;
      } else {
        longRideCount++;
      }
    });

    // Prepare chart data
    const chartData = [
      {
        month: "january",
        short_ride: shortRideCount,
        long_ride: longRideCount,
      },
    ];

    const totalRides = shortRideCount + longRideCount;
    const shortRidePercentage =
      totalRides > 0
        ? Math.round((shortRideCount / totalRides) * 100 * 100) / 100
        : 0;
    const longRidePercentage =
      totalRides > 0
        ? Math.round((longRideCount / totalRides) * 100 * 100) / 100
        : 0;

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        shortRideCount,
        longRideCount,
        totalRides,
        shortRidePercentage,
        longRidePercentage,
      },
    });
  } catch (error) {
    console.error("Error fetching ride type distribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
