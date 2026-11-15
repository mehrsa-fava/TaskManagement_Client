export function parseRelatedTaskIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const part of raw.split(/[,;\s]+/)) {
    const id = part.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function serializeRelatedTaskIds(ids: string[]): string {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].join(',');
}
