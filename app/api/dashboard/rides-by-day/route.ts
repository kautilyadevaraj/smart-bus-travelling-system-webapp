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

    // Days of week
    const daysOfWeek = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

    // Initialize ride counts
    const ridesByDay: { [key: number]: number } = {
      0: 0, // Sunday
      1: 0, // Monday
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0, // Saturday
    };

    // Count rides by day
    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const dayOfWeek = date.getDay();
      ridesByDay[dayOfWeek]++;
    });

    // Convert to chart data format (Monday to Sunday)
    const chartData = [
      { day: "Mon", rides: ridesByDay[1] },
      { day: "Tues", rides: ridesByDay[2] },
      { day: "Wed", rides: ridesByDay[3] },
      { day: "Thurs", rides: ridesByDay[4] },
      { day: "Fri", rides: ridesByDay[5] },
      { day: "Sat", rides: ridesByDay[6] },
      { day: "Sun", rides: ridesByDay[0] },
    ];

    // Find most active day
    const mostActiveDay = chartData.reduce((max, day) =>
      day.rides > max.rides ? day : max
    );

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalRides: (completedRides || []).length,
        mostActiveDay: mostActiveDay.day,
        mostActiveDayCount: mostActiveDay.rides,
      },
    });
  } catch (error) {
    console.error("Error fetching rides by day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
