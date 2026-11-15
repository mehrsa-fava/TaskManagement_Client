export interface ActivityLine {
  at: string;
  userId: string;
  message: string;
}

export function parseActivityLines(raw: string | null | undefined): ActivityLine[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(' | ');
      if (parts.length < 3) return { at: '', userId: '', message: line };
      return {
        at: parts[0],
        userId: parts[1],
        message: parts.slice(2).join(' | '),
      };
    })
    .reverse();
}

export function formatActivityTime(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleString();
}
