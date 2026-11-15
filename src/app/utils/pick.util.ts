/** Read a JSON field that may arrive as camelCase or PascalCase. */
export function pick<T = unknown>(raw: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key] as T;
  }
  return undefined;
}
