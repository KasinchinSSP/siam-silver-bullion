// lib/time.ts
export function yesterdayICTISO(): string {
  const now = new Date();
  const ictOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
  const nowICT = new Date(now.getTime() + ictOffsetMs);
  const yICT = new Date(nowICT.getTime() - 24 * 60 * 60 * 1000);
  return yICT.toISOString().slice(0, 10);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayICTISO(): string {
  const now = new Date();
  const ictOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
  const nowICT = new Date(now.getTime() + ictOffsetMs);
  return nowICT.toISOString().slice(0, 10);
}
