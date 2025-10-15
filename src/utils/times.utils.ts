/**
 * Time utilities for day-bound calculations.
 */

/**
 * Get the local start and end timestamps for yesterday.
 *
 * Semantics:
 * - start: 00:00:00.000 local time yesterday (inclusive)
 * - end:   23:59:59.999 local time yesterday (inclusive)
 *
 * Notes:
 * - Uses local time zone. If your application stores dates in UTC and you want UTC day bounds,
 *   compute from UTC methods instead (e.g., setUTCHours and getUTCDate) or add a UTC helper.
 * - For DB range queries, you can use:
 *   - inclusive:   createdAt >= start && createdAt <= end
 *   - half-open:   createdAt >= start && createdAt < startOfToday
 */
export function getYesterdayBounds(): { start: Date; end: Date } {
  const now = new Date();

  // Start of today in local time
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Start of yesterday in local time
  const start = new Date(startOfToday);
  start.setDate(start.getDate() - 1);

  // End of yesterday is the last millisecond before start of today
  const end = new Date(startOfToday.getTime() - 1);

  return { start, end };
}

/**
 * Convenience helper that returns ISO strings.
 */
export function getYesterdayBoundsISO(): { startISO: string; endISO: string } {
  const { start, end } = getYesterdayBounds();
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
