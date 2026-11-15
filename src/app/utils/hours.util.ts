/** Format integer API hours for the UI. */
export function formatHours(hours: number | null | undefined): string {
  if (hours == null) return '';
  if (hours === 0) return '0h';
  return `${hours}h`;
}

export function parseHoursInput(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase().replace(/h$/, '');
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}
