"use client";

import { useState } from "react";
import type { Goal } from "@/lib/types";
import GoalProgress from "./GoalProgress";

interface Props {
  goal: Goal;
  percent: number | null;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Goal, "title" | "description">>,
  ) => void;
  onRemove: (id: string) => void;
}

export default function GoalCard({ goal, percent, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);

  function handleSave() {
    if (!title.trim()) return;
    onUpdate(goal.id, { title, description });
    setEditing(false);
  }

  function handleCancel() {
    setTitle(goal.title);
    setDescription(goal.description);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-md border border-gray-300 bg-white p-3 space-y-2 shadow-sm">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
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
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
              {goal.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => onRemove(goal.id)}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
      <GoalProgress percent={percent} />
    </div>
  );
}
