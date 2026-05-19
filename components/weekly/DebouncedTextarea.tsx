"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export default function DebouncedTextarea({
  label,
  placeholder,
  rows = 3,
  value,
  onChange,
  debounceMs = 300,
}: Props) {
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const id = setTimeout(() => {
      onChangeRef.current(draft);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [draft, value, debounceMs]);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />
    </div>
  );
}
