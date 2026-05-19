"use client";

import type { Goal, WeeklyObjective } from "@/lib/types";

interface Props {
  objective: WeeklyObjective;
  goals: Goal[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<WeeklyObjective, "title" | "goalId">>,
  ) => void;
  onRemove: (id: string) => void;
}

export default function WeeklyObjectiveItem({
  objective,
  goals,
  onUpdate,
  onRemove,
}: Props) {
  const linkedGoal = goals.find((g) => g.id === objective.goalId) ?? null;

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 flex flex-col gap-2 shadow-sm sm:flex-row sm:items-center">
      <input
        type="text"
        value={objective.title}
        onChange={(e) => onUpdate(objective.id, { title: e.target.value })}
        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
      />
      <select
        value={objective.goalId ?? ""}
        onChange={(e) =>
          onUpdate(objective.id, { goalId: e.target.value || null })
        }
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">1년 목표 연결 없음</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.title}
          </option>
        ))}
      </select>
      {linkedGoal && (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
          {linkedGoal.title}
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(objective.id)}
        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  );
}
