import type { Task, WeeklyPlan } from "@/lib/types";

export function weeklyProgress(
  weeklyObjectiveIds: string[],
  tasks: Task[],
): number | null {
  if (weeklyObjectiveIds.length === 0) return null;
  const objectiveSet = new Set(weeklyObjectiveIds);
  const linked = tasks.filter(
    (t) =>
      t.weeklyObjectiveId !== null && objectiveSet.has(t.weeklyObjectiveId),
  );
  if (linked.length === 0) return null;
  const done = linked.filter((t) => t.status === "done").length;
  return Math.round((done / linked.length) * 100);
}

export function goalProgress(
  goalId: string,
  weeklyPlans: WeeklyPlan[],
  tasks: Task[],
): number | null {
  const objectiveIds = new Set<string>();
  for (const plan of weeklyPlans) {
    for (const objective of plan.objectives) {
      if (objective.goalId === goalId) {
        objectiveIds.add(objective.id);
      }
    }
  }
  if (objectiveIds.size === 0) return null;
  const linked = tasks.filter(
    (t) =>
      t.weeklyObjectiveId !== null && objectiveIds.has(t.weeklyObjectiveId),
  );
  if (linked.length === 0) return null;
  const done = linked.filter((t) => t.status === "done").length;
  return Math.round((done / linked.length) * 100);
}
