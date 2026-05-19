import { NextResponse } from "next/server";
import { removeObjective, updateObjective } from "@/lib/repo/weekly-plans";

interface Ctx {
  params: Promise<{ weekStart: string; objId: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { weekStart, objId } = await ctx.params;
  const body = await request.json();
  const patch: { title?: string; goalId?: string | null } = {};
  if (typeof body?.title === "string") patch.title = body.title.trim();
  if (body?.goalId === null || typeof body?.goalId === "string") {
    patch.goalId = body.goalId;
  }
  const updated = await updateObjective(weekStart, objId, patch);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { weekStart, objId } = await ctx.params;
  await removeObjective(weekStart, objId);
  return NextResponse.json({ ok: true });
}
