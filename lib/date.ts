export function formatYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentWeekStart(now: Date = new Date()): string {
  const day = now.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + offsetToMonday);
  return formatYmd(monday);
}

export function todayYmd(): string {
  return formatYmd(new Date());
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDueDate(today: string, due: string): string {
  if (today === due) return "오늘";
  const todayDate = parseYmd(today);
  const dueDate = parseYmd(due);
  const diffDays = Math.round(
    (dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;
  return `D-${diffDays}`;
}

export function isDueToday(today: string, due: string | null): boolean {
  return due !== null && today === due;
}

export function isOverdue(today: string, due: string | null): boolean {
  if (due === null) return false;
  return parseYmd(due).getTime() < parseYmd(today).getTime();
}
