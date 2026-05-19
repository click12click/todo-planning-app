import { getDb } from "@/lib/mongodb";
import { newId } from "@/lib/id";
import type { WeeklyObjective, WeeklyPlan } from "@/lib/types";

const COLLECTION = "weekly_plans";
const projection = { _id: 0 } as const;

function emptyPlan(weekStart: string): WeeklyPlan {
  return { weekStart, objectives: [], memo: "", retrospective: "" };
}

export async function listWeeklyPlans(): Promise<WeeklyPlan[]> {
  const db = await getDb();
  return db
    .collection<WeeklyPlan>(COLLECTION)
    .find({}, { projection })
    .sort({ weekStart: 1 })
    .toArray();
}

export async function getOrCreateWeeklyPlan(
  weekStart: string,
): Promise<WeeklyPlan> {
  const db = await getDb();
  const existing = await db
    .collection<WeeklyPlan>(COLLECTION)
    .findOne({ weekStart }, { projection });
  if (existing) return existing;
  const plan = emptyPlan(weekStart);
  await db.collection<WeeklyPlan>(COLLECTION).insertOne(plan);
  return plan;
}

export async function patchWeeklyPlanFields(
  weekStart: string,
  patch: Partial<Pick<WeeklyPlan, "memo" | "retrospective">>,
): Promise<WeeklyPlan | null> {
  const db = await getDb();
  await db.collection<WeeklyPlan>(COLLECTION).updateOne(
    { weekStart },
    { $set: patch, $setOnInsert: { weekStart, objectives: [] } },
    { upsert: true },
  );
  return db
    .collection<WeeklyPlan>(COLLECTION)
    .findOne({ weekStart }, { projection });
}

export async function addObjective(
  weekStart: string,
  title: string,
): Promise<WeeklyObjective> {
  const db = await getDb();
  const objective: WeeklyObjective = { id: newId(), title, goalId: null };
  await db.collection<WeeklyPlan>(COLLECTION).updateOne(
    { weekStart },
    {
      $push: { objectives: objective },
      $setOnInsert: { weekStart, memo: "", retrospective: "" },
    },
    { upsert: true },
  );
  return objective;
}

export async function updateObjective(
  weekStart: string,
  objectiveId: string,
  patch: Partial<Pick<WeeklyObjective, "title" | "goalId">>,
): Promise<WeeklyPlan | null> {
  const db = await getDb();
  const set: Record<string, string | null> = {};
  if (patch.title !== undefined)
    set["objectives.$[obj].title"] = patch.title;
  if (patch.goalId !== undefined)
    set["objectives.$[obj].goalId"] = patch.goalId;
  await db.collection<WeeklyPlan>(COLLECTION).updateOne(
    { weekStart },
    { $set: set },
    { arrayFilters: [{ "obj.id": objectiveId }] },
  );
  return db
    .collection<WeeklyPlan>(COLLECTION)
    .findOne({ weekStart }, { projection });
}

export async function removeObjective(
  weekStart: string,
  objectiveId: string,
): Promise<void> {
  const db = await getDb();
  await db
    .collection<WeeklyPlan>(COLLECTION)
    .updateOne(
      { weekStart },
      { $pull: { objectives: { id: objectiveId } } },
    );
  await db
    .collection("tasks")
    .updateMany(
      { weeklyObjectiveId: objectiveId },
      { $set: { weeklyObjectiveId: null } },
    );
}
