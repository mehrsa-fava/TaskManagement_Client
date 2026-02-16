/**
 * Formats a timestamp as a short locale date string.
 */
export function formatShortDate(ts: number | undefined | null): string {
  if (ts == null) return '';
  return new Date(ts).toLocaleDateString(undefined, { dateStyle: 'short' });
}
