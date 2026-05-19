"use client";

import { useCallback, useEffect, useState } from "react";
import type { Goal } from "@/lib/types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data: Goal[]) => {
        setGoals(data);
        setMounted(true);
      });
  }, []);

  const addGoal = useCallback(
    async (title: string, description: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, description: description.trim() }),
      });
      const created: Goal = await res.json();
      setGoals((prev) => [...prev, created]);
    },
    [],
  );

  const updateGoal = useCallback(
    async (id: string, patch: Partial<Pick<Goal, "title" | "description">>) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const updated: Goal = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    },
    [],
  );

  const removeGoal = useCallback(async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, mounted, addGoal, updateGoal, removeGoal };
}
