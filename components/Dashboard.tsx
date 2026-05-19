"use client";

import { useCallback, useMemo } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useWeeklyPlan } from "@/hooks/useWeeklyPlan";
import { useTasks } from "@/hooks/useTasks";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { goalProgress, weeklyProgress } from "@/lib/progress";
import Sidebar from "@/components/Sidebar";
import AuthBar from "@/components/AuthBar";
import GoalsSection from "@/components/goals/GoalsSection";
import WeeklyPlanSection from "@/components/weekly/WeeklyPlanSection";
import TasksBoard from "@/components/tasks/TasksBoard";

export default function Dashboard() {
  const { user, mounted: userMounted } = useCurrentUser();
  const goalsHook = useGoals();
  const weekly = useWeeklyPlan();
  const tasksHook = useTasks(Boolean(user));

  const removeGoal = useCallback(
    (id: string) => {
      goalsHook.removeGoal(id);
      weekly.clearGoalRef(id);
    },
    [goalsHook, weekly],
  );

  const removeObjective = useCallback(
    (id: string) => {
      weekly.removeObjective(id);
      tasksHook.clearObjectiveRef(id);
    },
    [weekly, tasksHook],
  );

  const weeklyPercent = useMemo(
    () =>
      weeklyProgress(
        weekly.plan.objectives.map((o) => o.id),
        tasksHook.tasks,
      ),
    [weekly.plan.objectives, tasksHook.tasks],
  );

  const goalPercent = useCallback(
    (id: string) => goalProgress(id, weekly.allPlans, tasksHook.tasks),
    [weekly.allPlans, tasksHook.tasks],
  );

  const doneCount = tasksHook.tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasksHook.tasks.length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-8 md:px-8 space-y-10">
        <div className="flex items-center justify-end">
          <AuthBar user={user} mounted={userMounted} />
        </div>

        <section id="dashboard" className="scroll-mt-4 space-y-3">
          <header>
            <h1 className="text-2xl font-bold">할 일 + 계획 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              1년 목표 → 이번 주 계획 → 오늘의 할 일을 한 화면에서.
            </p>
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="1년 목표" value={goalsHook.goals.length} />
            <SummaryCard
              label="이번 주 목표"
              value={weekly.plan.objectives.length}
            />
            <SummaryCard label="총 할 일" value={totalTasks} />
            <SummaryCard
              label="완료"
              value={doneCount}
              hint={
                totalTasks > 0
                  ? `${Math.round((doneCount / totalTasks) * 100)}%`
                  : undefined
              }
            />
          </div>
        </section>

        <section id="goals" className="scroll-mt-4">
          <GoalsSection
            goals={goalsHook.goals}
            mounted={goalsHook.mounted}
            goalPercent={goalPercent}
            addGoal={goalsHook.addGoal}
            updateGoal={goalsHook.updateGoal}
            removeGoal={removeGoal}
          />
        </section>

        <section id="weekly" className="scroll-mt-4">
          <WeeklyPlanSection
            plan={weekly.plan}
            goals={goalsHook.goals}
            canAddObjective={weekly.canAddObjective}
            weeklyPercent={weeklyPercent}
            addObjective={weekly.addObjective}
            removeObjective={removeObjective}
            updateObjective={weekly.updateObjective}
            setMemo={weekly.setMemo}
            setRetrospective={weekly.setRetrospective}
          />
        </section>

        <section id="tasks" className="scroll-mt-4">
          {!userMounted ? (
            <p className="text-sm text-gray-400">불러오는 중…</p>
          ) : !user ? (
            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-lg font-semibold">할 일 보드</h2>
              </div>
              <div className="rounded-md border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
                할 일을 관리하려면 로그인이 필요합니다.
                <div className="mt-3">
                  <a
                    href="/auth/github"
                    className="inline-flex items-center rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    GitHub으로 로그인
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <TasksBoard
              tasks={tasksHook.tasks}
              weeklyObjectives={weekly.plan.objectives}
              addTask={tasksHook.addTask}
              updateTask={tasksHook.updateTask}
              removeTask={tasksHook.removeTask}
              moveTask={tasksHook.moveTask}
              reorderInColumn={tasksHook.reorderInColumn}
            />
          )}
        </section>
      </main>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  hint?: string;
}

function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </p>
    </div>
  );
}
