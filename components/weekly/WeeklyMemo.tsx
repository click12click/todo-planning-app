"use client";

import DebouncedTextarea from "./DebouncedTextarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function WeeklyMemo({ value, onChange }: Props) {
  return (
    <DebouncedTextarea
      label="주간 메모"
      placeholder="이번 주를 한 문장으로 표현하면? 마주칠 걸림돌은?"
      rows={3}
      value={value}
      onChange={onChange}
    />
  );
}
