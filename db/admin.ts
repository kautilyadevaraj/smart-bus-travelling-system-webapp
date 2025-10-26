import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// This client is for the service_role key, used in secure backend processes
const adminClient = postgres(process.env.DATABASE_URL);

// Export the Drizzle instance for admin tasks
export const dbAdmin = drizzle(adminClient);
