// Fare structure (configure based on your city)
const FARE_CONFIG = {
  BASE_FARE: 10.0, // ₹10 base fare
  PER_KM: 5.0, // ₹5 per kilometer
  PER_MINUTE: 0.5, // ₹0.5 per minute after 5 minutes
  MINIMUM_FARE: 15.0, // Minimum charge
  MAXIMUM_FARE: 100.0, // Cap fare at ₹100
};

/**
 * Calculate fare based on distance and duration
 */
export function calculateFare(
  distanceKm: number,
  durationMinutes: number
): number {
  // Base fare
  let fare = FARE_CONFIG.BASE_FARE;

  // Distance charge
  fare += distanceKm * FARE_CONFIG.PER_KM;

  // Duration charge (only after 5 minutes to avoid penalizing short stops)
  if (durationMinutes > 5) {
    fare += (durationMinutes - 5) * FARE_CONFIG.PER_MINUTE;
  }

  // Apply minimum and maximum
  fare = Math.max(fare, FARE_CONFIG.MINIMUM_FARE);
  fare = Math.min(fare, FARE_CONFIG.MAXIMUM_FARE);

  // Round to 2 decimal places
  return Math.round(fare * 100) / 100;
}

/**
 * Get fare breakdown for display
 */
export function getFareBreakdown(
  distanceKm: number,
  durationMinutes: number,
  calculatedFare: number
) {
  return {
    baseFare: FARE_CONFIG.BASE_FARE,
    distanceCharge: distanceKm * FARE_CONFIG.PER_KM,
    durationCharge: Math.max(0, (durationMinutes - 5) * FARE_CONFIG.PER_MINUTE),
    totalFare: calculatedFare,
  };
}
