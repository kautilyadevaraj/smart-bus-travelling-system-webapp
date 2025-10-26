import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { card_uid } = await request.json();
  if (!card_uid) {
    return NextResponse.json(
      { error: "Card UID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the user in our public 'users' table and update their card_uid
    // This assumes the user's profile has been created in our public table
    // (A more robust way is to use a Supabase trigger to copy auth.users to public.users)

    // For simplicity, let's try to find them, if not, create them.
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!existingUser) {
      // If profile doesn't exist, create it
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        card_uid: card_uid,
      });
    } else {
      // If profile exists, update it
      await db
        .update(users)
        .set({ card_uid: card_uid })
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true, card_uid: card_uid });
  } catch (error: any) {
    // Handle potential unique constraint error (card already registered)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This card is already registered to another user." },
        { status: 409 }
      );
    }
    console.error("Error registering card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
