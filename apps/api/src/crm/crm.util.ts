// Small serialization helpers shared by the CRM services.

/** null → undefined, so DB-nullable columns surface as optional API fields. */
export function opt<T>(v: T | null | undefined): T | undefined {
  return v ?? undefined
}

/** Lowercase, dash-separated slug from a display name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 72)
}

/** A short random suffix to keep generated slugs unique. */
export function randomSuffix(len = 4): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}
