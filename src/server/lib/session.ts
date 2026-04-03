import { getSessionFromCookie } from "@/server/lib/auth";
import { unauthorized } from "@/server/lib/errors";

export async function requireSession() {
  const session = await getSessionFromCookie();
  if (!session.sub || !session.tenantId) {
    throw unauthorized();
  }
  return { userId: session.sub, tenantId: session.tenantId };
}
