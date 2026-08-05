/**
 * Postgres `interval` values come back from PostgREST as strings such as
 * "01:23:45", "01:23:45.678", or "2 days 03:04:05" for larger sums.
 * These helpers normalise that into seconds and back into display strings.
 */
export function intervalToSeconds(interval: string | null): number {
  if (!interval) return 0;

  let totalSeconds = 0;

  const dayMatch = interval.match(/(-?\d+)\s+days?/);
  if (dayMatch) {
    totalSeconds += parseInt(dayMatch[1], 10) * 86400;
  }

  const timeMatch = interval.match(/(-?\d{1,3}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseFloat(timeMatch[3]);
    totalSeconds += hours * 3600 + minutes * 60 + seconds;
  }

  return totalSeconds;
}

export function secondsToHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

/** Formats a pace interval (per km) as "MM:SS" or "H:MM:SS" for very slow paces. */
export function paceToDisplay(interval: string | null): string {
  if (!interval) return "-";
  const totalSeconds = intervalToSeconds(interval);
  if (totalSeconds <= 0) return "-";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Converts an "HH:MM:SS" form input into a Postgres-friendly interval string. */
export function hmsInputToInterval(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

export function formatKm(km: number | null | undefined, decimals = 2): string {
  if (km === null || km === undefined) return "-";
  return km.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDateID(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeHM(timeStr: string): string {
  // timeStr like "14:23:00" -> "14:23"
  return timeStr.slice(0, 5);
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}
