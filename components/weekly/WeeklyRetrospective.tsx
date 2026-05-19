"use client";

import DebouncedTextarea from "./DebouncedTextarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function WeeklyRetrospective({ value, onChange }: Props) {
  return (
    <DebouncedTextarea
      label="주간 회고"
      placeholder="이번 주 잘한 점, 아쉬운 점, 다음 주에 시도해볼 것"
      rows={4}
      value={value}
      onChange={onChange}
    />
  );
}
