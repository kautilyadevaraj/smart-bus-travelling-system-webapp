"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    // Logout logic will be added here
    try {
        await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-24 h-24 md:w-32 md:h-32">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">
            {user.name || "User"}
          </h1>
          <p className="text-muted-foreground mt-1 break-all">{user.email}</p>
          <p className="text-sm text-muted-foreground mt-2">
            User ID: {user.id.slice(0, 8)}...
          </p>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
          className="md:self-start bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" onClick={handleLogout} />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </Card>
  );
}
