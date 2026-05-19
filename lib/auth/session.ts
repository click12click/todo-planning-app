import { cookies } from "next/headers";
import { findSession } from "@/lib/repo/sessions";
import { findUserById } from "@/lib/repo/users";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "session_id";

export async function getCurrentUser(): Promise<User | null> {
  const c = await cookies();
  const sessionId = c.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const session = await findSession(sessionId);
  if (!session) return null;
  return findUserById(session.userId);
}
