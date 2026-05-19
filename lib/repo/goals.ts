import { getDb } from "@/lib/mongodb";
import { newId } from "@/lib/id";
import type { Goal } from "@/lib/types";

const COLLECTION = "goals";
const projection = { _id: 0 } as const;

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  return db
    .collection<Goal>(COLLECTION)
    .find({}, { projection })
    .sort({ createdAt: 1 })
    .toArray();
}

export async function createGoal(input: {
  title: string;
  description: string;
}): Promise<Goal> {
  const db = await getDb();
  const goal: Goal = {
    id: newId(),
    title: input.title,
    description: input.description,
    createdAt: new Date().toISOString(),
  };
  await db.collection<Goal>(COLLECTION).insertOne({ ...goal });
  return goal;
}

export async function updateGoal(
  id: string,
  patch: Partial<Pick<Goal, "title" | "description">>,
): Promise<Goal | null> {
  const db = await getDb();
  const set: Record<string, string> = {};
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.description !== undefined) set.description = patch.description;
  await db.collection<Goal>(COLLECTION).updateOne({ id }, { $set: set });
  return db.collection<Goal>(COLLECTION).findOne({ id }, { projection });
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION).deleteOne({ id });
  await db
    .collection("weekly_plans")
    .updateMany(
      { "objectives.goalId": id },
      { $set: { "objectives.$[obj].goalId": null } },
      { arrayFilters: [{ "obj.goalId": id }] },
    );
}
