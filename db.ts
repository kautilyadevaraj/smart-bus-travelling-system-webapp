import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create the client connection
const client = postgres(process.env.DATABASE_URL);

// Export the Drizzle instance
export const db = drizzle(client);
