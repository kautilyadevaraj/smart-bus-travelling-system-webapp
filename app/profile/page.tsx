"use client"; // 1. Make this a client component

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { useEffect, useState } from "react"; // 2. Import hooks
import { Loader2 } from "lucide-react"; // 3. Import loader

// 4. Define the user data interface based on your API response
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  balance: string;
  totalSpent: string;
  card_uid: string | null;
}

export default function ProfilePage() {
  // 5. Add state for loading and user data
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 6. Fetch data on component mount
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        // You could add an error state here
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  // 7. Show loading spinner
  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  // 8. Pass the dynamic 'user' object to the child components
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        {/* Profile Header */}
        <ProfileHeader user={user} />

        {/* Profile Stats */}
        <ProfileStats user={user} />

        {/* Profile Settings */}
        <ProfileSettings user={user} />
      </div>
    </main>
  );
}
