import { type NextRequest, NextResponse } from "next/server";

const BLYNK_AUTH_TOKEN = process.env.NEXT_PUBLIC_BLYNK_AUTH_TOKEN;
const BLYNK_GET_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&v0`;
const BLYNK_UPDATE_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&v0=0`;

export async function POST(request: NextRequest) {
  try {
    // Clear the Blynk pin first
    await fetch(BLYNK_UPDATE_URL);

    // Poll for card detection
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max (30 * 2 seconds)

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(BLYNK_GET_URL);
      if (!response.ok) throw new Error("Failed to fetch from Blynk");

      const cardUID = await response.text();

      if (cardUID && cardUID !== "0" && cardUID.length > 2) {
        // Clear pin after detection
        await fetch(BLYNK_UPDATE_URL);
        return NextResponse.json({ success: true, cardUID });
      }

      attempts++;
    }

    // Timeout - no card detected
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
