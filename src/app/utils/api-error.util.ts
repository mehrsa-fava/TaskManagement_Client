/**
 * Extracts a user-facing error message from an API or HTTP error.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (err == null) return fallback;
  const e = err as { error?: { message?: string; errors?: string[] }; message?: string };
  return (
    e.error?.message ??
    (Array.isArray(e.error?.errors) ? e.error.errors.join(' ') : undefined) ??
    e.message ??
    fallback
  );
}
