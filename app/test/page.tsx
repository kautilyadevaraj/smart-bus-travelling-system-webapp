"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Get the Blynk Auth Token from the environment
const BLYNK_AUTH_TOKEN = process.env.NEXT_PUBLIC_BLYNK_AUTH_TOKEN;
const BLYNK_GET_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&v0`;
const BLYNK_UPDATE_URL = `https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&v0=0`;

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userCard, setUserCard] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the user's session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/"); // Not logged in, redirect to home
        return;
      }
      setUser(user);
      // TODO: You would also fetch their current card_uid from your own DB
      // For this demo, we'll just show a button.
      setIsLoading(false);
    });
  }, [supabase, router]);

  const clearBlynkPin = async () => {
    try {
      await fetch(BLYNK_UPDATE_URL);
    } catch (error) {
      console.error("Error clearing Blynk pin:", error);
    }
  };

  const startRegistration = async () => {
    setStatus("Waiting... Please tap your card on any reader.");
    await clearBlynkPin(); // Clear any old value first

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(BLYNK_GET_URL);
        if (!response.ok) throw new Error("Network error");

        const card_uid = await response.text();

        // Check if the pin has a new value
        if (card_uid && card_uid !== "0" && card_uid.length > 2) {
          clearInterval(pollInterval);
          setStatus(`Card ${card_uid} detected! Linking to your account...`);

          // Send this UID to our secure API route
          const apiResponse = await fetch("/api/register-card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_uid: card_uid }),
          });

          const result = await apiResponse.json();

          if (apiResponse.ok) {
            setStatus(`Success! Card ${result.card_uid} is now linked.`);
            setUserCard(result.card_uid);
            await clearBlynkPin(); // Clear pin again after success
          } else {
            setStatus(`Error: ${result.error}`);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        setStatus("Error connecting to reader. Please try again.");
        clearInterval(pollInterval);
      }
    }, 2000); // Poll Blynk every 2 seconds
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p>Email: {user.email}</p>
      <p>Your Card: {userCard || "Not Linked"}</p>

      <div className="mt-8">
        <button
          onClick={startRegistration}
          disabled={status.startsWith("Waiting...")}
          className="p-3 bg-green-600 rounded text-white disabled:bg-gray-400"
        >
          Register My Card
        </button>
        {status && <p className="mt-4">{status}</p>}
      </div>
    </div>
  );
}
