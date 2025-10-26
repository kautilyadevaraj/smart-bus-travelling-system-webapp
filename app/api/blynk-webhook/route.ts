import { dbAdmin } from "@/db/admin";
import { users, rides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// This API route is called by BLYNK, not by a user.
// It must be secured, e.g., by checking a secret token if Blynk supports it.
// For now, it's open but only processes known cards.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_uid, reader_id, lat, lng } = body;

    if (!card_uid || !reader_id) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // --- THIS IS YOUR CORE AI/BUSINESS LOGIC ---
    // 1. Find the user associated with this card_uid
    const [user] = await dbAdmin
      .select({ id: users.id })
      .from(users)
      .where(eq(users.card_uid, card_uid))
      .limit(1);

    // 2. If no user is found, reject the tap.
    if (!user) {
      console.warn(`REJECTED: Tap from unknown card: ${card_uid}`);
      return NextResponse.json(
        { error: "Card not registered" },
        { status: 401 }
      );
    }

    // 3. If user is found, log the ride in the 'rides' table
    await dbAdmin.insert(rides).values({
      user_id: user.id,
      tap_type: reader_id,
      latitude: Number(lat) || 0.0, // Use hardcoded 0.0 if not provided
      longitude: Number(lng) || 0.0,
    });

    console.log(`LOGGED: Ride for user ${user.id} from card ${card_uid}`);
    return NextResponse.json({ success: true, message: "Ride logged" });
  } catch (error) {
    console.error("Error in Blynk webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
