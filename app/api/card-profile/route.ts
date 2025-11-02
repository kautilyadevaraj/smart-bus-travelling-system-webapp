import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET: Fetch the user's linked card and balance
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user profile from the 'users' table
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("card_uid, balance")
      .eq("email", authUser.email)
      .single();

    if (error || !userProfile) {
      console.error("User profile fetch error:", error);
      // This is not a fatal error, just means they have no profile yet.
      // Send back default values.
      return NextResponse.json({ card_uid: null, balance: 0 });
    }

    // Return the user's card and balance
    return NextResponse.json({
      card_uid: userProfile.card_uid,
      balance: userProfile.balance,
    });
  } catch (error) {
    console.error("GET /api/card-profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Recharge the user's balance
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get recharge amount from request body
    const { amount } = await request.json();
    const rechargeAmount = Number.parseFloat(amount);

    if (
      !rechargeAmount ||
      rechargeAmount < 100 ||
      !Number.isFinite(rechargeAmount)
    ) {
      return NextResponse.json(
        { error: "Invalid recharge amount. Minimum is ₹100." },
        { status: 400 }
      );
    }

    // 2. Get user's current profile and balance
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("id, balance")
      .eq("email", authUser.email)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Calculate new balance
    const currentBalance = Number.parseFloat(userProfile.balance) || 0;
    const newBalance = currentBalance + rechargeAmount;

    // 4. Update the user's balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance.toFixed(2) })
      .eq("id", userProfile.id);

    if (updateError) {
      console.error("Balance update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 500 }
      );
    }

    // 5. (IMPORTANT) Log the payment for auditing
    const { error: paymentLogError } = await supabase.from("payments").insert({
      userId: userProfile.id,
      amount: rechargeAmount.toFixed(2),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      status: "SUCCESS",
      reason: "Card Recharge",
    });

    if (paymentLogError) {
      // Don't fail the whole request, but log this critical error
      console.error("CRITICAL: Failed to log payment:", paymentLogError);
    }

    // 6. Return the new balance to the frontend
    return NextResponse.json({ success: true, newBalance: newBalance });
  } catch (error) {
    console.error("POST /api/card-profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
