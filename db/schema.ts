import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

export const rideStatusEnum = pgEnum("ride_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "INSUFFICIENT_BALANCE", // NEW: For incomplete rides
]);

/**
 * Users table - with balance tracking
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
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0"), // NEW: User wallet balance
  totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).default("0"), // NEW: Track spending
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
  distance: numeric("distance"), // NEW: Route distance in KM
  duration: numeric("duration"), // NEW: Ride duration in minutes
  fare: numeric("fare", { precision: 10, scale: 2 }), // Calculated fare
  paymentStatus: pgEnum("payment_status", ["PENDING", "SUCCESS", "FAILED"])(
    "payment_status"
  ).default("PENDING"), // NEW: Track payment
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  startLoc : text("start_loc"), // NEW: Human-readable start location
  endLoc : text("end_loc"),     // NEW: Human-readable end location
});

/**
 * NEW: Payment history for auditing
 */
export const payments = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rideId: uuid("ride_id")
    .references(() => rides.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", {
    precision: 10,
    scale: 2,
  }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 10, scale: 2 }).notNull(),
  status: text("status"), // "SUCCESS" or "FAILED"
  reason: text("reason"), // Why it failed (if applicable)
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
