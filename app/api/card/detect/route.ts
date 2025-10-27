import { type NextRequest, NextResponse } from "next/server";

const BLYNK_TOKEN = process.env.NEXT_PUBLIC_BLYNK_AUTH_TOKEN; // Changed from NEXT_PUBLIC_BLYNK_AUTH_TOKEN
// URL to SET the mode to "Linking" (V4=1)
const BLYNK_MODE_LINK_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_TOKEN}&v4=1`;
// URL to SET the mode to "Ride" (V4=0)
const BLYNK_MODE_RIDE_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_TOKEN}&v4=0`;
// URL to READ the linking tap from V5
const BLYNK_GET_V5_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&v5`;
// URL to CLEAR the linking tap from V5
const BLYNK_CLEAR_V5_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_TOKEN}&v5=0`;

// Our trusty regex to clean the UID
const UID_REGEX = /^([0-9A-Fa-f]{2}:){3,}([0-9A-Fa-f]{2})/;

export async function POST(request: NextRequest) {
  console.log("--- DETECT CARD API START ---");
  try {
    // 1. Clear the V5 pin
    console.log("Setting V5 to 0 (Clearing pin)...");
    await fetch(BLYNK_CLEAR_V5_URL);

    // 2. Tell the ESP32 to enter "Linking Mode"
    console.log("Setting V4 to 1 (Entering Linking Mode)...");
    await fetch(BLYNK_MODE_LINK_URL);

    // 3. Poll V5 for the new card tap
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\nAttempt ${attempts}/${maxAttempts}: Polling V5...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(BLYNK_GET_V5_URL);
      if (!response.ok) {
        console.error(
          "Blynk fetch error:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to fetch from Blynk");
      }

      const rawValue = await response.text();
      console.log(`Raw value from V5: "${rawValue}"`);

      if (rawValue && rawValue !== "0" && rawValue.length > 2) {
        // We got a tap!
        console.log("Valid value detected!");

        // 4. Clean the UID
        const cleanedValue = rawValue.replace(/\0/g, ""); // Remove null chars
        const match = cleanedValue.match(UID_REGEX);
        const cardUID = match ? match[0] : null;

        console.log(`Cleaned value: "${cleanedValue}"`);
        console.log(`Regex match: "${cardUID}"`);

        if (cardUID) {
          // 5. Clear V5 and set mode back to Ride
          console.log("SUCCESS! Card detected. Clearing V5 and setting V4=0.");
          await fetch(BLYNK_CLEAR_V5_URL);
          await fetch(BLYNK_MODE_RIDE_URL);
          return NextResponse.json({ success: true, cardUID: cardUID });
        } else {
          console.warn("Value detected but regex match failed.");
          // Continue loop in case we got a partial/corrupted value
        }
      } else {
        console.log("...V5 is empty or '0'. Waiting...");
      }
    }

    // Timeout
    console.warn("--- TIMEOUT ---");
    console.log("Setting V4 back to 0 (Ride Mode).");
    await fetch(BLYNK_MODE_RIDE_URL); // Set back to Ride Mode
    return NextResponse.json(
      { success: false, error: "Card detection timeout" },
      { status: 408 }
    );
  } catch (error) {
    console.error("--- CATCH BLOCK ERROR ---");
    console.error("Card detection error:", error);
    // Ensure we go back to ride mode on error
    console.log("Setting V4 back to 0 (Ride Mode).");
    await fetch(BLYNK_MODE_RIDE_URL);
    return NextResponse.json(
      { success: false, error: "Failed to detect card" },
      { status: 500 }
    );
  }
}
