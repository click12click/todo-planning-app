import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/lib/repo/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import type { Priority, TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await request.json();
  const patch: {
    title?: string;
    status?: TaskStatus;
    weeklyObjectiveId?: string | null;
    priority?: Priority;
    dueDate?: string | null;
  } = {};
  if (typeof body?.title === "string") patch.title = body.title.trim();
  if (STATUSES.includes(body?.status)) patch.status = body.status;
  if (PRIORITIES.includes(body?.priority)) patch.priority = body.priority;
  if (body?.weeklyObjectiveId === null || typeof body?.weeklyObjectiveId === "string") {
    patch.weeklyObjectiveId = body.weeklyObjectiveId;
  }
  if (body?.dueDate === null || typeof body?.dueDate === "string") {
    patch.dueDate = body.dueDate;
  }
  const updated = await updateTask(user.id, id, patch);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteTask(user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
