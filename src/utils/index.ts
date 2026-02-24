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
