import { v4 as uuidv4 } from "uuid";

export function generateOrderId(): string {
  return uuidv4().substring(0, 8).toUpperCase();
}

export function isValidPhone(phone: string): boolean {
  // Accept formats: +998901234567, 998901234567, 901234567
  const phoneRegex = /^(\+?998)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Add +998 if not present
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("998")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 9) {
      cleaned = "+998" + cleaned;
    }
  }

  return cleaned;
}

/**
 * Convert day (today/tomorrow/after_tomorrow) and time (HH:MM) to Date object
 */
export function getDepartureDate(day: string, time: string): Date {
  const now = new Date();
  const result = new Date(now);

  // Set the day
  if (day === "tomorrow") {
    result.setDate(result.getDate() + 1);
  } else if (day === "after_tomorrow") {
    result.setDate(result.getDate() + 2);
  }
  // "today" - no change needed

  // Set the time (format: "HH:00")
  const [hours] = time.split(":").map(Number);
  result.setHours(hours, 0, 0, 0);

  return result;
}

/**
 * Check if two time windows overlap (considering 6-hour buffer in both directions)
 * Returns true if there's a conflict
 *
 * New order conflicts if:
 * - Its departure is within 6 hours AFTER existing order departure (during existing trip)
 * - Its departure is within 6 hours BEFORE existing order departure (new trip would overlap)
 */
export function hasTimeConflict(
  existingDepartureDate: Date,
  newDepartureDate: Date,
  bufferHours: number = 6
): boolean {
  // Calculate the blocked window: 6 hours before to 6 hours after existing departure
  const windowStart = new Date(existingDepartureDate);
  windowStart.setHours(windowStart.getHours() - bufferHours);

  const windowEnd = new Date(existingDepartureDate);
  windowEnd.setHours(windowEnd.getHours() + bufferHours);

  // New order conflicts if its departure falls within the blocked window
  return newDepartureDate >= windowStart && newDepartureDate < windowEnd;
}

/**
 * Check if driver is currently on a trip (blocked)
 */
export function isDriverBlocked(departureDate: Date, tripDurationHours: number = 6): boolean {
  const now = new Date();
  const tripEnd = new Date(departureDate);
  tripEnd.setHours(tripEnd.getHours() + tripDurationHours);

  // Driver is blocked if current time is between departure and trip end
  return now >= departureDate && now < tripEnd;
}
