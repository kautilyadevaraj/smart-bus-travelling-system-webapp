import { type NextRequest, NextResponse } from "next/server";

const BLYNK_AUTH_TOKEN = process.env.NEXT_PUBLIC_BLYNK_AUTH_TOKEN;
const BLYNK_GET_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&v0`;
const BLYNK_UPDATE_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&v0=0`;

// This regex matches a 4-byte (XX:XX:XX:XX) or 7-byte (XX:XX:XX:XX:XX:XX:XX) UID pattern.
const uidRegex =
  /^((?:[0-9A-F]{2}:){3}[0-9A-F]{2}|(?:[0-9A-F]{2}:){6}[0-9A-F]{2})/i;

export async function POST(request: NextRequest) {
  try {
    // Clear the Blynk pin first to ensure a fresh reading
    await fetch(BLYNK_UPDATE_URL);

    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max (30 * 2 seconds)

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(BLYNK_GET_URL);
      if (!response.ok) throw new Error("Failed to fetch from Blynk");

      const garbled_uid = await response.text();

      if (garbled_uid && garbled_uid !== "0" && garbled_uid.length > 2) {
        // --- FIX: Parse the garbled UID ---
        const cleaned_string = garbled_uid.replace(/\0/g, ""); // Remove null bytes
        const match = cleaned_string.match(uidRegex);

        if (match && match[0]) {
          const final_card_uid = match[0].toUpperCase();

          // Clear pin after successful detection
          await fetch(BLYNK_UPDATE_URL);

          // Return *only* the clean UID
          return NextResponse.json({ success: true, cardUID: final_card_uid });
        }
        // --- END OF FIX ---
      }

      attempts++;
    }

    // Timeout - no valid card detected
    await fetch(BLYNK_UPDATE_URL);
    return NextResponse.json(
      { success: false, error: "Card detection timeout" },
      { status: 408 }
    );
  } catch (error) {
    console.error("Card detection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to detect card" },
      { status: 500 }
    );
  }
}
