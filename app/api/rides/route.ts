import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  console.log("\n[RIDES_API] --- NEW GET REQUEST ---");

  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // We MUST have an email to link to the public.users table
    if (!authUser || !authUser.email) {
      console.warn("[RIDES_API] ERROR: Unauthorized. No user or email found.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      `[RIDES_API] Auth success for user: ${authUser.id} (Email: ${authUser.email})`
    );

    // ---
    // *** THE FIX: Get the internal user ID from the 'public.users' table ***
    // ---
    console.log("[RIDES_API] Fetching internal user profile by email...");
    const { data: internalUser, error: userError } = await supabase
      .from("users") // Your 'public.users' table
      .select("id")
      .eq("email", authUser.email)
      .single(); // We expect only one user with this email

    if (userError || !internalUser) {
      console.error(
        "[RIDES_API] ERROR fetching internal user profile:",
        userError
      );
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const internalUserId = internalUser.id;
    console.log(`[RIDES_API] Found internal user ID: ${internalUserId}`);
    // --- End of Fix ---

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "all";

    console.log(
      `[RIDES_API] Params: page=${page}, search='${search}', status='${status}'`
    );

    const validPage = Math.max(1, page);
    const offset = (validPage - 1) * ITEMS_PER_PAGE;
    const limit = offset + ITEMS_PER_PAGE - 1;

    console.log(`[RIDES_API] Pagination: offset=${offset}, limit=${limit}`);

    // 1. Start the query
    let query = supabase
      .from("rides")
      .select("*", { count: "exact" })
      // *** USE THE CORRECT ID ***
      .eq("userId", internalUserId); // Use the ID from public.users

    // 2. Apply status filter
    if (status !== "all") {
      console.log(`[RIDES_API] Applying status filter: ${status}`);
      query = query.eq("status", status);
    }

    // 3. Apply search filter
    if (search) {
      const searchPattern = `%${search}%`;
      console.log(`[RIDES_API] Applying search filter: ${searchPattern}`);
      query = query.or(
        `start_loc.ilike.${searchPattern},end_loc.ilike.${searchPattern}`
      );
    }

    // 4. Apply ordering and pagination
    query = query
      .order("start_time", { ascending: false })
      .range(offset, limit);

    console.log("[RIDES_API] Executing Supabase query for rides...");

    // 5. Execute the single query
    const { data: ridesList, error, count } = await query;

    if (error) {
      console.error("[RIDES_API] SUPABASE RIDES QUERY ERROR:", error);
      throw error;
    }

    console.log(
      `[RIDES_API] Query success. Total matching items: ${count}, Fetched this page: ${ridesList.length}`
    );

    // 6. Format the rides
    const formattedRides = ridesList.map((ride) => {
      return {
        id: ride.id,
        dateTime: new Date(ride.start_time).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        startLocation: ride.start_loc,
        endLocation: ride.end_loc,
        fare: `₹${ride.fare || 0}`,
        distance: `${ride.distance || 0} km`,
        duration: `${ride.duration || 0} min`,
        status: ride.status,
      };
    });

    // 7. Calculate pagination
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const responseData = {
      rides: formattedRides,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    };

    console.log(
      `[RIDES_API] Sending successful response. Page ${validPage}/${totalPages}.`
    );
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[RIDES_API] FATAL ERROR in GET handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
