"use client";

import { useState } from "react";
import type { Goal, WeeklyObjective, WeeklyPlan } from "@/lib/types";
import { MAX_OBJECTIVES } from "@/hooks/useWeeklyPlan";
import WeeklyObjectiveItem from "./WeeklyObjectiveItem";
import WeeklyMemo from "./WeeklyMemo";
import WeeklyProgress from "./WeeklyProgress";
import WeeklyRetrospective from "./WeeklyRetrospective";

interface Props {
  plan: WeeklyPlan;
  goals: Goal[];
  canAddObjective: boolean;
  weeklyPercent: number | null;
  addObjective: (title: string) => void;
  removeObjective: (id: string) => void;
  updateObjective: (
    id: string,
    patch: Partial<Pick<WeeklyObjective, "title" | "goalId">>,
  ) => void;
  setMemo: (memo: string) => void;
  setRetrospective: (text: string) => void;
}

export default function WeeklyPlanSection({
  plan,
  goals,
  canAddObjective,
  weeklyPercent,
  addObjective,
  removeObjective,
  updateObjective,
  setMemo,
  setRetrospective,
}: Props) {
  const [newTitle, setNewTitle] = useState("");

  function handleAdd() {
    if (!newTitle.trim() || !canAddObjective) return;
    addObjective(newTitle);
    setNewTitle("");
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">이번 주 계획</h2>
        <span className="text-xs text-gray-500">
          {plan.weekStart} (월요일 기준)
        </span>
      </div>

      <WeeklyProgress percent={weeklyPercent} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">이번 주 목표</h3>
          <span className="text-xs text-gray-500">
            {plan.objectives.length} / {MAX_OBJECTIVES}
          </span>
        </div>

        {plan.objectives.length === 0 ? (
          <p className="rounded-md bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">
            이번 주 목표를 1~5개 추가해 보세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.objectives.map((o) => (
              <li key={o.id}>
                <WeeklyObjectiveItem
                  objective={o}
                  goals={goals}
                  onUpdate={updateObjective}
                  onRemove={removeObjective}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="새 주간 목표"
            disabled={!canAddObjective}
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTitle.trim() || !canAddObjective}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
          >
            추가
          </button>
        </div>
      </div>

      <WeeklyMemo value={plan.memo} onChange={setMemo} />
      <WeeklyRetrospective
        value={plan.retrospective}
        onChange={setRetrospective}
      />
    </section>
  );
}
