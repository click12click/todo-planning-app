"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  Priority,
  Task,
  TaskStatus,
  WeeklyObjective,
} from "@/lib/types";
import { formatDueDate, isDueToday, isOverdue, todayYmd } from "@/lib/date";

interface Props {
  task: Task;
  weeklyObjectives: WeeklyObjective[];
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<
        Task,
        "title" | "status" | "weeklyObjectiveId" | "priority" | "dueDate"
      >
    >,
  ) => void;
  onRemove: (id: string) => void;
}

const priorityBadge: Record<Priority, { label: string; className: string }> = {
  high: {
    label: "High",
    className: "bg-red-100 text-red-700",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700",
  },
  low: {
    label: "Low",
    className: "bg-gray-100 text-gray-600",
  },
};

export default function TaskCard({
  task,
  weeklyObjectives,
  onUpdate,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [weeklyObjectiveId, setWeeklyObjectiveId] = useState<string>(
    task.weeklyObjectiveId ?? "",
  );
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState<string>(task.dueDate ?? "");

  const sortable = useSortable({ id: task.id, disabled: editing });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.4 : 1,
  };

  function handleSave() {
    if (!title.trim()) return;
    onUpdate(task.id, {
      title,
      status,
      weeklyObjectiveId: weeklyObjectiveId || null,
      priority,
      dueDate: dueDate || null,
    });
    setEditing(false);
  }

  function handleCancel() {
    setTitle(task.title);
    setStatus(task.status);
    setWeeklyObjectiveId(task.weeklyObjectiveId ?? "");
    setPriority(task.priority);
    setDueDate(task.dueDate ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        ref={sortable.setNodeRef}
        style={style}
        className="rounded-md border border-gray-300 bg-white p-2 space-y-2 shadow-sm"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <div className="grid grid-cols-2 gap-1">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="todo">할 일</option>
            <option value="doing">진행 중</option>
            <option value="done">완료</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <select
          value={weeklyObjectiveId}
          onChange={(e) => setWeeklyObjectiveId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="">주간 목표 연결 없음</option>
          {weeklyObjectives.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-gray-900 px-2 py-1 text-xs text-white"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onRemove(task.id)}
            className="ml-auto rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
    );
  }

  const linkedObjective = weeklyObjectives.find(
    (o) => o.id === task.weeklyObjectiveId,
  );
  const today = todayYmd();
  const badge = priorityBadge[task.priority];

  let dueClass = "text-gray-500";
  if (task.dueDate) {
    if (isDueToday(today, task.dueDate)) dueClass = "text-orange-600 font-semibold";
    else if (isOverdue(today, task.dueDate)) dueClass = "text-red-600";
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      onClick={() => setEditing(true)}
      className="cursor-grab rounded-md border border-gray-200 bg-white p-2 shadow-sm hover:border-gray-300 active:cursor-grabbing touch-none"
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
        {task.dueDate && (
          <span className={`text-[11px] ${dueClass}`}>
            {task.dueDate} · {formatDueDate(today, task.dueDate)}
          </span>
        )}
        {linkedObjective && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            {linkedObjective.title}
          </span>
        )}
      </div>
    </div>
  );
}
