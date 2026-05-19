"use client";

import { useCallback, useEffect, useState } from "react";
import type { Priority, Task, TaskStatus } from "@/lib/types";

type TaskPatch = Partial<
  Pick<Task, "title" | "weeklyObjectiveId" | "status" | "priority" | "dueDate">
>;

interface AddTaskOptions {
  status?: TaskStatus;
  weeklyObjectiveId?: string | null;
  priority?: Priority;
  dueDate?: string | null;
}

export function useTasks(enabled: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setTasks([]);
      setMounted(true);
      return;
    }
    fetch("/api/tasks")
      .then((r) => (r.status === 200 ? (r.json() as Promise<Task[]>) : []))
      .then((data) => {
        setTasks(data);
        setMounted(true);
      });
  }, [enabled]);

  const addTask = useCallback(
    async (title: string, options: AddTaskOptions = {}) => {
      if (!enabled) return;
      const trimmed = title.trim();
      if (!trimmed) return;
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, ...options }),
      });
      if (!res.ok) return;
      const created: Task = await res.json();
      setTasks((prev) => [...prev, created]);
    },
    [enabled],
  );

  const updateTask = useCallback(
    async (id: string, patch: TaskPatch) => {
      if (!enabled) return;
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return;
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [enabled],
  );

  const removeTask = useCallback(
    async (id: string) => {
      if (!enabled) return;
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [enabled],
  );

  const moveTask = useCallback(
    async (id: string, toStatus: TaskStatus) => {
      if (!enabled) return;
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus }),
      });
      if (!res.ok) return;
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [enabled],
  );

  const reorderInColumn = useCallback(
    async (status: TaskStatus, sortedIds: string[]) => {
      if (!enabled) return;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.status !== status) return t;
          const idx = sortedIds.indexOf(t.id);
          return idx === -1 ? t : { ...t, order: idx };
        }),
      );
      await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, sortedIds }),
      });
    },
    [enabled],
  );

  const clearObjectiveRef = useCallback((objectiveId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.weeklyObjectiveId === objectiveId
          ? { ...t, weeklyObjectiveId: null }
          : t,
      ),
    );
  }, []);

  return {
    tasks,
    mounted,
    addTask,
    updateTask,
    removeTask,
    moveTask,
    reorderInColumn,
    clearObjectiveRef,
  };
}
