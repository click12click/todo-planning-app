import { NextResponse } from "next/server";
import { deleteGoal, updateGoal } from "@/lib/repo/goals";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json();
  const patch: { title?: string; description?: string } = {};
  if (typeof body?.title === "string") patch.title = body.title.trim();
  if (typeof body?.description === "string")
    patch.description = body.description.trim();
  const updated = await updateGoal(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await deleteGoal(id);
  return NextResponse.json({ ok: true });
}
