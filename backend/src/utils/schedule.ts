export const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

export function normalizeDay(day: unknown): string {
  return String(day || "").trim().toUpperCase();
}

function parseTimeSlotStart(timeSlot: unknown): { hour: number; minute: number } | null {
  const start = String(timeSlot || "").split("-")[0];
  const [hour, minute] = start.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

export function getNextSessionDate(dayOfWeek: string, timeSlot: string): Date | null {
  const today = new Date();
  const targetDayIndex = DAYS.indexOf(normalizeDay(dayOfWeek) as (typeof DAYS)[number]);
  const slot = parseTimeSlotStart(timeSlot);
  if (targetDayIndex < 0 || !slot) return null;

  const next = new Date(today);
  const diff = (targetDayIndex - today.getDay() + 7) % 7;
  next.setDate(today.getDate() + diff);
  next.setHours(slot.hour, slot.minute, 0, 0);

  if (next <= today) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}
