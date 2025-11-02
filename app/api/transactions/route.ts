import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Helper function to format date as "Oct 25"
 */
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Helper function to format time as "09:30 AM"
 */
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the user's internal ID from the 'users' table
    const { data: internalUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", authUser.email)
      .single();

    if (userError || !internalUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    const internalUserId = internalUser.id;

    // 2. Fetch recent completed rides
    const { data: ridesData, error: ridesError } = await supabase
      .from("rides")
      .select("id, start_time, start_loc, end_loc, fare")
      .eq("userId", internalUserId)
      .eq("status", "COMPLETED") // Only show completed rides
      .order("start_time", { ascending: false })
      .limit(5); // Get last 10 completed rides

    if (ridesError) {
      console.error("Rides fetch error:", ridesError);
      throw new Error("Failed to fetch rides");
    }

    // 3. Fetch recent recharges from the 'payments' table
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("id, created_at, amount, reason")
      .eq("userId", internalUserId)
      .eq("reason", "Card Recharge") // Only fetch recharges
      .order("created_at", { ascending: false })
      .limit(10); // Get last 10 recharges

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError);
      throw new Error("Failed to fetch payments");
    }

    // 4. Map rides to the common transaction format
    const formattedRides = ridesData.map((ride) => {
      const rideDate = new Date(ride.start_time);
      return {
        id: ride.id,
        type: "ride" as const,
        // Store fare as negative, as per your frontend mock data
        amount: (Number.parseFloat(ride.fare) || 0) * -1,
        description: `Ride: ${ride.start_loc || "Start"} to ${
          ride.end_loc || "End"
        }`,
        timestamp: rideDate, // Use this for sorting
      };
    });

    // 5. Map payments to the common transaction format
    const formattedPayments = paymentsData.map((payment) => {
      const paymentDate = new Date(payment.created_at);
      return {
        id: payment.id,
        type: "recharge" as const,
        amount: Number.parseFloat(payment.amount) || 0,
        description: payment.reason || "Card Recharge",
        timestamp: paymentDate, // Use this for sorting
      };
    });

    // 6. Combine, sort by date (most recent first), and take the top 10
    const allTransactions = [...formattedRides, ...formattedPayments];

    allTransactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const recentTransactions = allTransactions.slice(0, 10);

    // 7. Apply final formatting (date and time strings) for the frontend
    const finalTransactions = recentTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      date: formatDate(tx.timestamp),
      time: formatTime(tx.timestamp),
    }));

    return NextResponse.json(finalTransactions);
  } catch (error: any) {
    console.error("GET /api/transactions error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
