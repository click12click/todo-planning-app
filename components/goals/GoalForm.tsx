"use client";

import { useState } from "react";

interface Props {
  onAdd: (title: string, description: string) => void;
}

export default function GoalForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title, description);
    setTitle("");
    setDescription("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-gray-200 bg-white p-4 space-y-2"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="목표 제목 (예: 시스템 디자인 책 한 권 완독)"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="이 목표가 왜 중요한가요? (선택)"
        rows={2}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:bg-gray-300"
      >
        목표 추가
      </button>
    </form>
  );
}
