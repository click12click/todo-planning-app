"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeeklyObjective, WeeklyPlan } from "@/lib/types";
import { currentWeekStart } from "@/lib/date";

export const MAX_OBJECTIVES = 5;

function emptyPlan(weekStart: string): WeeklyPlan {
  return { weekStart, objectives: [], memo: "", retrospective: "" };
}

export function useWeeklyPlan() {
  const [plans, setPlans] = useState<Record<string, WeeklyPlan>>({});
  const [mounted, setMounted] = useState(false);
  const [weekStart] = useState(() => currentWeekStart());

  useEffect(() => {
    (async () => {
      const [listRes, currentRes] = await Promise.all([
        fetch("/api/weekly-plans"),
        fetch(`/api/weekly-plans/${weekStart}`),
      ]);
      const list: WeeklyPlan[] = await listRes.json();
      const current: WeeklyPlan = await currentRes.json();
      const map: Record<string, WeeklyPlan> = {};
      for (const p of list) map[p.weekStart] = p;
      map[current.weekStart] = current;
      setPlans(map);
      setMounted(true);
    })();
  }, [weekStart]);

  const setLocalPlan = useCallback((plan: WeeklyPlan) => {
    setPlans((prev) => ({ ...prev, [plan.weekStart]: plan }));
  }, []);

  const addObjective = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const currentPlan = plans[weekStart] ?? emptyPlan(weekStart);
      if (currentPlan.objectives.length >= MAX_OBJECTIVES) return;
      const res = await fetch(
        `/api/weekly-plans/${weekStart}/objectives`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed }),
        },
      );
      const objective: WeeklyObjective = await res.json();
      setPlans((prev) => {
        const cur = prev[weekStart] ?? emptyPlan(weekStart);
        return {
          ...prev,
          [weekStart]: { ...cur, objectives: [...cur.objectives, objective] },
        };
      });
    },
    [plans, weekStart],
  );

  const removeObjective = useCallback(
    async (objectiveId: string) => {
      await fetch(
        `/api/weekly-plans/${weekStart}/objectives/${objectiveId}`,
        { method: "DELETE" },
      );
      setPlans((prev) => {
        const cur = prev[weekStart] ?? emptyPlan(weekStart);
        return {
          ...prev,
          [weekStart]: {
            ...cur,
            objectives: cur.objectives.filter((o) => o.id !== objectiveId),
          },
        };
      });
    },
    [weekStart],
  );

  const updateObjective = useCallback(
    async (
      objectiveId: string,
      patch: Partial<Pick<WeeklyObjective, "title" | "goalId">>,
    ) => {
      const res = await fetch(
        `/api/weekly-plans/${weekStart}/objectives/${objectiveId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const updated: WeeklyPlan | null = await res.json();
      if (updated) setLocalPlan(updated);
    },
    [setLocalPlan, weekStart],
  );

  const setMemo = useCallback(
    async (memo: string) => {
      const res = await fetch(`/api/weekly-plans/${weekStart}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });
      const updated: WeeklyPlan | null = await res.json();
      if (updated) setLocalPlan(updated);
    },
    [setLocalPlan, weekStart],
  );

  const setRetrospective = useCallback(
    async (retrospective: string) => {
      const res = await fetch(`/api/weekly-plans/${weekStart}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retrospective }),
      });
      const updated: WeeklyPlan | null = await res.json();
      if (updated) setLocalPlan(updated);
    },
    [setLocalPlan, weekStart],
  );

  const clearGoalRef = useCallback((goalId: string) => {
    setPlans((prev) => {
      const next: Record<string, WeeklyPlan> = {};
      for (const [k, p] of Object.entries(prev)) {
        next[k] = {
          ...p,
          objectives: p.objectives.map((o) =>
            o.goalId === goalId ? { ...o, goalId: null } : o,
          ),
        };
      }
      return next;
    });
  }, []);

  const plan: WeeklyPlan = plans[weekStart] ?? emptyPlan(weekStart);

  return {
    plan,
    allPlans: Object.values(plans),
    mounted,
    canAddObjective: plan.objectives.length < MAX_OBJECTIVES,
    addObjective,
    removeObjective,
    updateObjective,
    setMemo,
    setRetrospective,
    clearGoalRef,
  };
}
