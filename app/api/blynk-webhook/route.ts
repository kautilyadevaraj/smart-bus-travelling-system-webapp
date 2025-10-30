import { dbAdmin as db } from "@/db/admin";
import { rides, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

const UID_REGEX = /^([0-9A-Fa-f]{2}:){3,}([0-9A-Fa-f]{2})/;

// Hardcoded locations
const LOCATION_A = { lat: 12.9770, lng: 77.5706 }; // Majestic
const LOCATION_B = { lat: 12.9352, lng: 77.6245 }; // Koramangala

// A simple function to calculate fare.
// You can make this complex later (e.g., based on time).
function calculateFare(startTime: Date, endTime: Date): number {
  // For now, a flat fare
  return 25.0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const rawUid = body.card_uid;
    const lat = body.lat;
    const lng = body.lng;

    // 1. Clean the incoming UID
    const cleanedValue = rawUid ? String(rawUid).replace(/\0/g, "") : "";
    const match = cleanedValue.match(UID_REGEX);
    const cardUID = match ? match[0] : null;

    if (!cardUID) {
      return NextResponse.json({ error: "Invalid card UID" }, { status: 400 });
    }

    // 2. Find the user this card belongs to
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.card_uid, cardUID));

    if (!user) {
      // Not a registered card. Reject the tap.
      return NextResponse.json(
        { error: "Card not registered" },
        { status: 401 }
      );
    }

    // 3. This is a registered user. Check if they are on a ride.
    const [inProgressRide] = await db
      .select()
      .from(rides)
      .where(and(eq(rides.userId, user.id), eq(rides.status, "IN_PROGRESS")));

    // 4. --- LOGIC: No active ride ---
    if (!inProgressRide) {
      // This is an "ENTRY" tap. Start a new ride.
      await db.insert(rides).values({
        userId: user.id,
        status: "IN_PROGRESS",
        startTime: new Date(),
        startLat: LOCATION_A.lat.toString(),
        startLng: LOCATION_A.lng.toString(),
      });

      return NextResponse.json({
        success: true,
        message: "Ride started.",
        card: cardUID,
      });
    }

    // 5. --- LOGIC: Active ride found ---
    if (inProgressRide) {
      // This is an "EXIT" tap. Complete the ride.
      const startTime = inProgressRide.startTime;
      const endTime = new Date();
      const fare = calculateFare(startTime, endTime);

      await db
        .update(rides)
        .set({
          status: "COMPLETED",
          endTime: endTime,
          endLat: LOCATION_B.lat.toString(),
          endLng: LOCATION_B.lng.toString(),
          fare: fare.toString(), // Drizzle numeric types often prefer strings
        })
        .where(eq(rides.id, inProgressRide.id));

      return NextResponse.json({
        success: true,
        message: "Ride completed.",
        fare: fare,
      });
    }

    // Default catch (shouldn't be reached)
    return NextResponse.json({ error: "Unhandled logic" }, { status: 500 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
