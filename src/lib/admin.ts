import { auth } from "@/lib/auth";

/**
 * Owner access to /admin comes from two independent sources: the DB's
 * `isAdmin` flag (set manually, no self-serve path — see schema.ts) or an
 * `ADMIN_EMAIL` env var match, since there's no way to flip a DB row from
 * outside a real deployment. Either is sufficient.
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user) return null;

  const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isOwner = Boolean(
    ownerEmail && session.user.email?.toLowerCase() === ownerEmail,
  );

  return isOwner || session.user.isAdmin ? session : null;
}
