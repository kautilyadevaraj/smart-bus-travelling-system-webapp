import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { card_uid: garbled_uid } = await request.json();
  if (!garbled_uid) {
    return NextResponse.json(
      { error: "Card UID is required" },
      { status: 400 }
    );
  }

  // Clean the incoming data
  const cleaned_string = garbled_uid.replace(/\0/g, "");

  const uidRegex =
    /^((?:[0-9A-F]{2}:){3}[0-9A-F]{2}|(?:[0-9A-F]{2}:){6}[0-9A-F]{2})/i;
  const match = cleaned_string.match(uidRegex);

  if (!match || !match[0]) {
    return NextResponse.json(
      {
        error: "Could not parse a valid Card UID from the tap.",
        received: cleaned_string,
      },
      { status: 400 }
    );
  }

  const final_card_uid = match[0].toUpperCase();

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email!));

    let userBalance = 0; // Default balance for new users

    if (!existingUser) {
      // New user - insert with default balance
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || "New User",
        card_uid: final_card_uid,
        balance: "0", // String as per your schema (numeric type)
      });
      userBalance = 0;
    } else {
      // Existing user - update card_uid and get their current balance
      await db
        .update(users)
        .set({ card_uid: final_card_uid })
        .where(eq(users.id, user.id));

      // ✅ FIX: Parse the balance correctly (it's a string/numeric in DB)
      userBalance = parseFloat(existingUser.balance as string) || 0;
    }

    return NextResponse.json({
      success: true,
      card_uid: final_card_uid,
      balance: userBalance, // ✅ Return as plain number
    });
  } catch (error: any) {
    if (
      error.code === "23505" ||
      (error.message && error.message.includes("unique constraint"))
    ) {
      return NextResponse.json(
        { error: "This card is already registered to another user." },
        { status: 409 }
      );
    }

    console.error("Error registering card:", error.message);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
