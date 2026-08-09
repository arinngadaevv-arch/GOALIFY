import { auth } from "@/lib/auth";
import { isOwnerEmail } from "@/lib/owner";

/**
 * Owner access to /admin (and other owner-only server routes, e.g. the
 * test-payment-bypass route) is checked against, in order: the hardcoded
 * owner emails in owner.ts, an `ADMIN_EMAIL` env var (for staging/local
 * deployments that shouldn't hardcode the real owner's address), and the
 * DB's `isAdmin` flag (set manually, no self-serve path — see schema.ts,
 * and nothing in this app's UI ever sets it, so it only ever changes via
 * direct DB access, i.e. the owner). Any one of the three is sufficient —
 * this is strictly an owner-only gate, not a general admin-role system.
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const email = session.user.email.toLowerCase().trim();
  const envOwnerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isEnvOwner = Boolean(envOwnerEmail && email === envOwnerEmail);

  const isOwner = isOwnerEmail(email) || isEnvOwner || session.user.isAdmin;
  return isOwner ? session : null;
}
