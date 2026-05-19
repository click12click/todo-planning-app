import { getDb } from "@/lib/mongodb";
import { newId } from "@/lib/id";
import type { User } from "@/lib/types";

const COLLECTION = "users";
const projection = { _id: 0 } as const;

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb();
  return db.collection<User>(COLLECTION).findOne({ id }, { projection });
}

export async function upsertUserByGithubId(input: {
  githubId: number;
  username: string;
  avatarUrl: string;
}): Promise<User> {
  const db = await getDb();
  const existing = await db
    .collection<User>(COLLECTION)
    .findOne({ githubId: input.githubId }, { projection });
  if (existing) {
    await db.collection<User>(COLLECTION).updateOne(
      { id: existing.id },
      { $set: { username: input.username, avatarUrl: input.avatarUrl } },
    );
    return { ...existing, username: input.username, avatarUrl: input.avatarUrl };
  }
  const user: User = {
    id: newId(),
    githubId: input.githubId,
    username: input.username,
    avatarUrl: input.avatarUrl,
    createdAt: new Date().toISOString(),
  };
  await db.collection<User>(COLLECTION).insertOne({ ...user });
  return user;
}
