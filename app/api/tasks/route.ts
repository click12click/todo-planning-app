import { NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/repo/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import type { Priority, TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const tasks = await listTasks(user.id);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const body = await request.json();
  const title = String(body?.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title이 비었습니다." }, { status: 400 });
  }
  const status: TaskStatus = STATUSES.includes(body?.status)
    ? body.status
    : "todo";
  const priority: Priority = PRIORITIES.includes(body?.priority)
    ? body.priority
    : "medium";
  const weeklyObjectiveId =
    typeof body?.weeklyObjectiveId === "string" ? body.weeklyObjectiveId : null;
  const dueDate = typeof body?.dueDate === "string" ? body.dueDate : null;
  const task = await createTask(user.id, {
    title,
    status,
    priority,
    weeklyObjectiveId,
    dueDate,
  });
  return NextResponse.json(task, { status: 201 });
}
