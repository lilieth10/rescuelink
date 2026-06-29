const MAX_FORMATTED_LENGTH = 20;
const MIN_DIGITS = 7;
const MAX_DIGITS = 15;

export function sanitizeContactInput(value: string): string {
  return value.replace(/[^\d+\s\-()]/g, '').slice(0, MAX_FORMATTED_LENGTH);
}

export function countContactDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}

export function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  const digits = countContactDigits(trimmed);
  return digits >= MIN_DIGITS && digits <= MAX_DIGITS;
}

export const CONTACT_MIN_DIGITS = MIN_DIGITS;
export const CONTACT_MAX_DIGITS = MAX_DIGITS;
