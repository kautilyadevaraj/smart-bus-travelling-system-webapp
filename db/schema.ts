import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";

export const rideStatusEnum = pgEnum("ride_status", [
  "IN_PROGRESS",
  "COMPLETED",
]);

/**
 * Users table.
 * This table will be populated by Supabase Auth when a user signs up.
 * We add a custom card_uid column.
 */
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  card_uid: text("card_uid").unique(),
});

export const rides = pgTable("rides", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: rideStatusEnum("status").notNull(),

  startTime: timestamp("start_time", { mode: "date" }).notNull(),
  startLat: text("start_lat"),
  startLng: text("start_lng"),

  endTime: timestamp("end_time", { mode: "date" }),
  endLat: text("end_lat"),
  endLng: text("end_lng"),

  fare: numeric("fare", { precision: 10, scale: 2 }),
});