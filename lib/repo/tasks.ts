import { getDb } from "@/lib/mongodb";
import { newId } from "@/lib/id";
import type { Priority, Task, TaskStatus } from "@/lib/types";

const COLLECTION = "tasks";
const projection = { _id: 0 } as const;

async function nextOrder(userId: string, status: TaskStatus): Promise<number> {
  const db = await getDb();
  const top = await db
    .collection<Task>(COLLECTION)
    .find({ userId, status })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  return top.length === 0 ? 0 : top[0].order + 1;
}

export async function listTasks(userId: string): Promise<Task[]> {
  const db = await getDb();
  return db
    .collection<Task>(COLLECTION)
    .find({ userId }, { projection })
    .sort({ status: 1, order: 1 })
    .toArray();
}

export async function createTask(
  userId: string,
  input: {
    title: string;
    status?: TaskStatus;
    weeklyObjectiveId?: string | null;
    priority?: Priority;
    dueDate?: string | null;
  },
): Promise<Task> {
  const status = input.status ?? "todo";
  const now = new Date().toISOString();
  const task: Task = {
    id: newId(),
    userId,
    title: input.title,
    status,
    order: await nextOrder(userId, status),
    weeklyObjectiveId: input.weeklyObjectiveId ?? null,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const db = await getDb();
  await db.collection<Task>(COLLECTION).insertOne({ ...task });
  return task;
}

type TaskPatch = Partial<
  Pick<Task, "title" | "status" | "weeklyObjectiveId" | "priority" | "dueDate">
>;

export async function updateTask(
  userId: string,
  id: string,
  patch: TaskPatch,
): Promise<Task | null> {
  const db = await getDb();
  const existing = await db
    .collection<Task>(COLLECTION)
    .findOne({ id, userId }, { projection });
  if (!existing) return null;

  const set: Record<string, unknown> = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.status && patch.status !== existing.status) {
    set.order = await nextOrder(userId, patch.status);
  }
  await db
    .collection<Task>(COLLECTION)
    .updateOne({ id, userId }, { $set: set });
  return db
    .collection<Task>(COLLECTION)
    .findOne({ id, userId }, { projection });
}

export async function deleteTask(
  userId: string,
  id: string,
): Promise<boolean> {
  const db = await getDb();
  const r = await db.collection(COLLECTION).deleteOne({ id, userId });
  return r.deletedCount > 0;
}

export async function reorderColumn(
  userId: string,
  status: TaskStatus,
  sortedIds: string[],
): Promise<void> {
  if (sortedIds.length === 0) return;
  const db = await getDb();
  const ops = sortedIds.map((id, index) => ({
    updateOne: {
      filter: { id, userId, status },
      update: { $set: { order: index } },
    },
  }));
  await db.collection<Task>(COLLECTION).bulkWrite(ops);
}
