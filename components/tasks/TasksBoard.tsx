"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus, WeeklyObjective } from "@/lib/types";
import TaskColumn from "./TaskColumn";
import TaskForm from "./TaskForm";

interface Props {
  tasks: Task[];
  weeklyObjectives: WeeklyObjective[];
  addTask: (
    title: string,
    options?: {
      status?: TaskStatus;
      weeklyObjectiveId?: string | null;
      priority?: import("@/lib/types").Priority;
      dueDate?: string | null;
    },
  ) => void;
  updateTask: (
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
  removeTask: (id: string) => void;
  moveTask: (id: string, toStatus: TaskStatus) => void;
  reorderInColumn: (status: TaskStatus, sortedIds: string[]) => void;
}

const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: "todo", label: "할 일" },
  { status: "doing", label: "진행 중" },
  { status: "done", label: "완료" },
];

function resolveTargetStatus(
  overId: string,
  tasks: Task[],
): TaskStatus | null {
  if (overId.startsWith("column-")) {
    return overId.slice("column-".length) as TaskStatus;
  }
  const t = tasks.find((task) => task.id === overId);
  return t?.status ?? null;
}

export default function TasksBoard({
  tasks,
  weeklyObjectives,
  addTask,
  updateTask,
  removeTask,
  moveTask,
  reorderInColumn,
}: Props) {
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const targetStatus = resolveTargetStatus(overId, tasks);
    if (!targetStatus) return;

    if (targetStatus !== activeTask.status) {
      moveTask(activeId, targetStatus);
      return;
    }

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order - b.order);
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const newIndex = columnTasks.findIndex((t) => t.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(columnTasks, oldIndex, newIndex).map(
      (t) => t.id,
    );
    reorderInColumn(targetStatus, reordered);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">할 일 보드</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            + 할 일 추가
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          weeklyObjectives={weeklyObjectives}
          onSubmit={(input) => {
            addTask(input.title, {
              status: input.status,
              weeklyObjectiveId: input.weeklyObjectiveId,
              priority: input.priority,
              dueDate: input.dueDate,
            });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map(({ status, label }) => (
            <TaskColumn
              key={status}
              status={status}
              label={label}
              tasks={tasks.filter((t) => t.status === status)}
              weeklyObjectives={weeklyObjectives}
              onUpdate={updateTask}
              onRemove={removeTask}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
