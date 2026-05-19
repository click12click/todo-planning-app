import { getDb } from "@/lib/mongodb";
import { newId } from "@/lib/id";
import type { Session } from "@/lib/types";

const COLLECTION = "sessions";
const projection = { _id: 0 } as const;

export const SESSION_TTL_DAYS = 7;

export async function createSession(userId: string): Promise<Session> {
  const db = await getDb();
  const now = new Date();
  const expires = new Date(
    now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  const session: Session = {
    id: newId(),
    userId,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
  };
  await db.collection<Session>(COLLECTION).insertOne({ ...session });
  return session;
}

export async function findSession(id: string): Promise<Session | null> {
  const db = await getDb();
  const session = await db
    .collection<Session>(COLLECTION)
    .findOne({ id }, { projection });
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.collection(COLLECTION).deleteOne({ id });
    return null;
  }
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION).deleteOne({ id });
}

export async function deleteSessionsByUserId(userId: string): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION).deleteMany({ userId });
}
