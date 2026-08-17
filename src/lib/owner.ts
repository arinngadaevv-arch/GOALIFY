/**
 * The store owner's account email — split out from admin.ts so it can be
 * imported from client components too (admin.ts pulls in `@/lib/auth`,
 * which drags in server-only DB/bcrypt code that can't reach the client
 * bundle). Purely a UI-visibility convenience; the server-side gate in
 * admin.ts's `getAdminSession` is the one that actually enforces anything.
 */
const OWNER_EMAILS = ["arin.gadaev1@gmail.com"];

export function isOwnerEmail(email: string | null | undefined) {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase().trim());
}
