import { NextResponse } from "next/server";
import { reorderColumn } from "@/lib/repo/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import type { TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const body = await request.json();
  if (!STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  if (!Array.isArray(body?.sortedIds)) {
    return NextResponse.json(
      { error: "sortedIds must be array" },
      { status: 400 },
    );
  }
  await reorderColumn(user.id, body.status, body.sortedIds);
  return NextResponse.json({ ok: true });
}
