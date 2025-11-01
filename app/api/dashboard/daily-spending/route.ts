import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user from Supabase Auth
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ===== Use Supabase client to query custom users table =====
    const { data: dbUsers, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", authUser.email)
      .single();

    if (userError || !dbUsers) {
      return NextResponse.json(
        {
          error: "User profile not found",
          message: `No profile found for email: ${authUser.email}`,
        },
        { status: 404 }
      );
    }

    // ===== Query rides using Supabase client =====
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

    // Group by date and sum fare
    const dailySpending: { [key: string]: number } = {};

    (completedRides || []).forEach((ride: any) => {
      if (!ride.start_time) return;

      const date = new Date(ride.start_time);
      const dateStr = date.toISOString().split("T")[0];
      const fare = parseFloat(ride.fare) || 0;

      if (!dailySpending[dateStr]) {
        dailySpending[dateStr] = 0;
      }
      dailySpending[dateStr] += fare;
    });

    // Convert to array format for chart
    const chartData = Object.entries(dailySpending)
      .map(([date, spent]) => ({
        date,
        spent: Math.round(spent * 100) / 100,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalDays: chartData.length,
        totalSpent:
          Math.round(chartData.reduce((sum, d) => sum + d.spent, 0) * 100) /
          100,
        averagePerDay:
          chartData.length > 0
            ? Math.round(
                (chartData.reduce((sum, d) => sum + d.spent, 0) /
                  chartData.length) *
                  100
              ) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching daily spending:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
