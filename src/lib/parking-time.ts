const KST_OFFSET_SEC = 9 * 3600;

export const REQUEST_WINDOW_MINUTES = 15;

export function kstToEpochSec(kstDateTime: string): number {
  return Date.parse(`${kstDateTime.replace(" ", "T")}+09:00`) / 1000;
}

export function toRegisterMinutes(usedSeconds: number): number {
  const minutes = Math.floor(Math.max(0, usedSeconds) / 60);
  return Math.floor((minutes + 5) / 10) * 10 + 10;
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function kstDateString(epochSec: number): string {
  return new Date((epochSec + KST_OFFSET_SEC) * 1000).toISOString().slice(0, 10);
}
