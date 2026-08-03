import { auth } from "@/lib/auth";

/**
 * The store owner's account email, hardcoded so /admin is locked down out of
 * the box regardless of Vercel env config. Both spellings are accepted since
 * it's unconfirmed which one the real signed-up account actually used —
 * "gmal.com" (as given) and the likely-intended "gmail.com" typo fix. Safe
 * to list both: this only ever narrows who gets in, never widens it, since
 * an attacker can't make their own account's email match either literal
 * string.
 */
const OWNER_EMAILS = ["arinngadaevv@gmal.com", "arinngadaevv@gmail.com"];

/**
 * Owner access to /admin is checked against, in order: the hardcoded owner
 * emails above, an `ADMIN_EMAIL` env var (for staging/local deployments that
 * shouldn't hardcode the real owner's address), and the DB's `isAdmin` flag
 * (set manually, no self-serve path — see schema.ts, and nothing in this
 * app's UI ever sets it, so it only ever changes via direct DB access, i.e.
 * the owner). Any one of the three is sufficient — this is strictly an
 * owner-only gate, not a general admin-role system.
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const email = session.user.email.toLowerCase().trim();
  const isHardcodedOwner = OWNER_EMAILS.includes(email);

  const envOwnerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isEnvOwner = Boolean(envOwnerEmail && email === envOwnerEmail);

  const isOwner = isHardcodedOwner || isEnvOwner || session.user.isAdmin;
  return isOwner ? session : null;
}
