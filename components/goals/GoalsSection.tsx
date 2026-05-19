"use client";

import type { Goal } from "@/lib/types";
import GoalForm from "./GoalForm";
import GoalCard from "./GoalCard";

interface Props {
  goals: Goal[];
  mounted: boolean;
  goalPercent: (id: string) => number | null;
  addGoal: (title: string, description: string) => void;
  updateGoal: (
    id: string,
    patch: Partial<Pick<Goal, "title" | "description">>,
  ) => void;
  removeGoal: (id: string) => void;
}

export default function GoalsSection({
  goals,
  mounted,
  goalPercent,
  addGoal,
  updateGoal,
  removeGoal,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">1년 목표</h2>
        <span className="text-xs text-gray-500">{goals.length}개</span>
      </div>

      <GoalForm onAdd={addGoal} />

      {!mounted ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : goals.length === 0 ? (
        <p className="rounded-md bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          아직 등록된 목표가 없어요. 위 폼으로 첫 목표를 만들어 보세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li key={goal.id}>
              <GoalCard
                goal={goal}
                percent={goalPercent(goal.id)}
                onUpdate={updateGoal}
                onRemove={removeGoal}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
