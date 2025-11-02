import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's internal ID from the 'users' table
    const { data: internalUser, error: userError } = await supabase
      .from("users") // Your 'public.users' table
      .select("id, name, email, image, card_uid, balance, total_spent")
      .eq("email", authUser.email)
      .single(); // We expect only one user with this email

    if (userError || !internalUser) {
      console.error("[PROFILE_API] Error fetching internal user:", userError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Format the data for the frontend
    const profileData = {
      id: internalUser.id,
      name: internalUser.name || "User",
      email: internalUser.email,
      image: authUser.user_metadata?.avatar_url || internalUser.image || null,
      balance: internalUser.balance || "0",
      totalSpent: internalUser.total_spent || "0",
      card_uid: internalUser.card_uid,
    };

    return NextResponse.json(profileData);
  } catch (error: any) {
    console.error("GET /api/profile-data error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
