"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus, WeeklyObjective } from "@/lib/types";
import TaskCard from "./TaskCard";

interface Props {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  weeklyObjectives: WeeklyObjective[];
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<
        Task,
        | "title"
        | "status"
        | "weeklyObjectiveId"
        | "priority"
        | "dueDate"
      >
    >,
  ) => void;
  onRemove: (id: string) => void;
}

const emptyMessage: Record<TaskStatus, string> = {
  todo: "할 일을 추가해 보세요.",
  doing: "진행 중인 할 일이 없어요.",
  done: "완료된 할 일이 없어요.",
};

export default function TaskColumn({
  status,
  label,
  tasks,
  weeklyObjectives,
  onUpdate,
  onRemove,
}: Props) {
  const sorted = [...tasks].sort((a, b) => a.order - b.order);
  const ids = sorted.map((t) => t.id);
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg p-3 min-h-[200px] transition-colors ${
        isOver ? "bg-gray-200" : "bg-gray-100"
      }`}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {sorted.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-4">
            {emptyMessage[status]}
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((t) => (
              <li key={t.id}>
                <TaskCard
                  task={t}
                  weeklyObjectives={weeklyObjectives}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              </li>
            ))}
          </ul>
        )}
      </SortableContext>
    </div>
  );
}
