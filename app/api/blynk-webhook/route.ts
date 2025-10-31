import { db } from "@/db";
import { dbAdmin } from "@/db/admin";
import { users, rides, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateFare } from "@/lib/fare-calculator";

const UID_REGEX = /^([0-9A-Fa-f]{2}:){3,}([0-9A-Fa-f]{2})/;

// Mock route data - Replace with real Ola Maps API calls
const ROUTES = {
  "12.9716,77.5946": { lat: 12.9716, lng: 77.5946, name: "Majestic" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📍 Tap received:", body);

    const rawUid = body.card_uid;
    const cleanedValue = rawUid ? String(rawUid).replace(/\0/g, "") : "";
    const match = cleanedValue.match(UID_REGEX);
    const cardUID = match ? match[0] : null;

    if (!cardUID) {
      return NextResponse.json({ error: "Invalid card UID" }, { status: 400 });
    }

    // Find user
    const user = await dbAdmin.query.users.findFirst({
      where: eq(users.card_uid, cardUID),
    });

    if (!user) {
      console.log("❌ Unregistered card:", cardUID);
      return NextResponse.json(
        { error: "Card not registered" },
        { status: 401 }
      );
    }

    // Check for ongoing ride
    const ongoingRide = await dbAdmin.query.rides.findFirst({
      where: and(
        eq(rides.userId, user.id),
        eq(rides.status, "IN_PROGRESS")
      ),
    });

    if (!ongoingRide) {
      // ===== ENTRY TAP =====
      console.log("✅ Entry tap - Starting new ride");

      const newRide = await dbAdmin.insert(rides).values({
        userId: user.id,
        status: "IN_PROGRESS",
        startTime: new Date(),
        startLat: "12.9716",
        startLng: "77.5946",
      }).returning();

      return NextResponse.json({
        success: true,
        action: "ENTRY",
        rideId: newRide[0].id,
        message: "Ride started",
      });

    } else {
      // ===== EXIT TAP - Calculate fare and process payment =====
      console.log("🏁 Exit tap - Completing ride");

      const endTime = new Date();
      const durationMs = endTime.getTime() - ongoingRide.startTime.getTime();
      const durationMinutes = durationMs / (1000 * 60);

      // Mock distance calculation (replace with Ola Maps API)
      const mockDistance = Math.random() * 15 + 3; // 3-18 km

      // Calculate fare
      const fare = calculateFare(mockDistance, durationMinutes);
      console.log(`💰 Calculated fare: ₹${fare}`);

      // Convert user balance to number for comparison
      const userBalance = parseFloat(user.balance as string) || 0;

      if (userBalance < fare) {
        // ===== INSUFFICIENT BALANCE =====
        console.log(`❌ Insufficient balance. Required: ₹${fare}, Available: ₹${userBalance}`);

        // Update ride to INSUFFICIENT_BALANCE status
        await dbAdmin.update(rides)
          .set({
            status: "INSUFFICIENT_BALANCE",
            endTime: endTime,
            endLat: "12.9352",
            endLng: "77.6245",
            distance: mockDistance.toString(),
            duration: durationMinutes.toString(),
            fare: fare.toString(),
            paymentStatus: "FAILED",
          })
          .where(eq(rides.id, ongoingRide.id));

        // Log failed payment
        await dbAdmin.insert(payments).values({
          userId: user.id,
          rideId: ongoingRide.id,
          amount: fare.toString(),
          balanceBefore: userBalance.toString(),
          balanceAfter: userBalance.toString(),
          status: "FAILED",
          reason: `Insufficient balance. Required: ₹${fare}, Available: ₹${userBalance}`,
        });

        return NextResponse.json({
          success: false,
          action: "EXIT_FAILED",
          rideId: ongoingRide.id,
          fare: fare,
          userBalance: userBalance,
          deficit: fare - userBalance,
          message: `Insufficient balance. Needs ₹${(fare - userBalance).toFixed(2)} more`,
          errorCode: "INSUFFICIENT_BALANCE",
        }, { status: 402 }); // 402 Payment Required

      } else {
        // ===== PAYMENT SUCCESSFUL =====
        const newBalance = userBalance - fare;

        // Update user balance
        await dbAdmin.update(users)
          .set({ balance: newBalance.toString() })
          .where(eq(users.id, user.id));

        // Update ride to COMPLETED
        await dbAdmin.update(rides)
          .set({
            status: "COMPLETED",
            endTime: endTime,
            endLat: "12.9352",
            endLng: "77.6245",
            distance: mockDistance.toString(),
            duration: durationMinutes.toString(),
            fare: fare.toString(),
            paymentStatus: "SUCCESS",
          })
          .where(eq(rides.id, ongoingRide.id));

        // Log successful payment
        await dbAdmin.insert(payments).values({
          userId: user.id,
          rideId: ongoingRide.id,
          amount: fare.toString(),
          balanceBefore: userBalance.toString(),
          balanceAfter: newBalance.toString(),
          status: "SUCCESS",
          reason: "Payment processed successfully",
        });

        console.log(`✅ Payment successful`);
        console.log(`   Fare: ₹${fare}`);
        console.log(`   Previous balance: ₹${userBalance}`);
        console.log(`   New balance: ₹${newBalance}`);

        return NextResponse.json({
          success: true,
          action: "EXIT_SUCCESS",
          rideId: ongoingRide.id,
          fare: fare,
          userBalance: newBalance,
          message: "Ride completed and payment processed",
        });
      }

    }
  } catch (error) {
      console.error("❌ Webhook error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

