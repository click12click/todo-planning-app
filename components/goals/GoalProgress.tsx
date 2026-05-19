"use client";

interface Props {
  percent: number | null;
}

export default function GoalProgress({ percent }: Props) {
  if (percent === null) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-gray-500">목표 진행률</span>
        <span className="font-semibold text-gray-700">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
