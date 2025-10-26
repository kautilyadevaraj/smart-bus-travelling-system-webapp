"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    // Get initial user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <p>Hi, {user.email}</p>
        <button onClick={handleLogout} className="p-2 bg-red-500 rounded">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleGoogleLogin} className="p-2 bg-blue-500 rounded">
      Sign in with Google
    </button>
  );
}
