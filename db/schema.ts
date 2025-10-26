import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  doublePrecision,
} from "drizzle-orm/pg-core";

/**
 * Users table.
 * This table will be populated by Supabase Auth when a user signs up.
 * We add a custom card_uid column.
 */
export const users = pgTable("users", {
  // This ID comes from Supabase Auth
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),

  // Our custom field to link a physical card.
  // We make it unique so one card can't be registered to two users.
  card_uid: text("card_uid").unique(),
});

/**
 * Rides table.
 * This table logs every valid tap from a registered card.
 */
export const rides = pgTable("rides", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Foreign key to our users table
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  tap_type: text("tap_type").notNull(), // 'ENTRY' or 'EXIT'
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
