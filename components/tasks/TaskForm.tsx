"use client";

import { useState } from "react";
import type { Priority, TaskStatus, WeeklyObjective } from "@/lib/types";

interface Props {
  weeklyObjectives: WeeklyObjective[];
  onSubmit: (input: {
    title: string;
    status: TaskStatus;
    weeklyObjectiveId: string | null;
    priority: Priority;
    dueDate: string | null;
  }) => void;
  onCancel: () => void;
}

export default function TaskForm({ weeklyObjectives, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [weeklyObjectiveId, setWeeklyObjectiveId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      status,
      weeklyObjectiveId: weeklyObjectiveId || null,
      priority,
      dueDate: dueDate || null,
    });
    setTitle("");
    setStatus("todo");
    setWeeklyObjectiveId("");
    setPriority("medium");
    setDueDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-gray-200 bg-white p-3 space-y-2"
    >
      <input
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일 제목"
        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="todo">할 일</option>
          <option value="doing">진행 중</option>
          <option value="done">완료</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <select
          value={weeklyObjectiveId}
          onChange={(e) => setWeeklyObjectiveId(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">주간 목표 없음</option>
          {weeklyObjectives.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
        >
          추가
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
        >
          취소
        </button>
      </div>
    </form>
  );
}
