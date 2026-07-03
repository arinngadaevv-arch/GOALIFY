/** Postgres SQLSTATE for unique_violation. */
const UNIQUE_VIOLATION = "23505";

/**
 * True if `error` is a Postgres unique-constraint violation - whether thrown
 * directly by `postgres` or wrapped by Drizzle's DrizzleQueryError (which
 * puts the real pg error on `.cause`).
 */
export function isUniqueViolation(error: unknown): boolean {
  const code =
    (error as { code?: string } | undefined)?.code ??
    (error as { cause?: { code?: string } } | undefined)?.cause?.code;
  return code === UNIQUE_VIOLATION;
}
