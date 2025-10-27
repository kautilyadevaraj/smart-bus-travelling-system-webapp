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

  // --- NEW FIX: Clean the incoming data ---
  // The raw data from the pin is "B3:9E:38:F6ENTRY0.0000000.000000" + a null byte.

  // 1. Remove the null byte (0x00) that causes the 'invalid byte sequence' error.
  const cleaned_string = garbled_uid.replace(/\0/g, "");

  // 2. Extract just the card UID (e.g., "B3:9E:38:F6") from the string.
  // This regex matches a 4 or 7-byte UID format at the start of the string.
  const uidRegex = /^([0-9A-Fa-f]{2}(:|$)){4,7}/i;
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

  // This is the clean, final Card UID
  const final_card_uid = match[0].toUpperCase();
  // --- END OF FIX ---

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!existingUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || "New User",
        card_uid: final_card_uid, // Use the clean UID
      });
    } else {
      await db
        .update(users)
        .set({ card_uid: final_card_uid }) // Use the clean UID
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true, card_uid: final_card_uid });
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
