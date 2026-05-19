"use client";

interface Props {
  percent: number | null;
}

export default function WeeklyProgress({ percent }: Props) {
  if (percent === null) {
    return (
      <p className="rounded-md bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
        할 일을 주간 목표에 연결해 진행률을 만들어 보세요.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-gray-600">이번 주 진행률</span>
        <span className="font-semibold text-gray-900">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
