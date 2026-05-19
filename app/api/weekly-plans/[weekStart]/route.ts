import { NextResponse } from "next/server";
import {
  getOrCreateWeeklyPlan,
  patchWeeklyPlanFields,
} from "@/lib/repo/weekly-plans";

interface Ctx {
  params: Promise<{ weekStart: string }>;
}

export async function GET(_request: Request, ctx: Ctx) {
  const { weekStart } = await ctx.params;
  const plan = await getOrCreateWeeklyPlan(weekStart);
  return NextResponse.json(plan);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { weekStart } = await ctx.params;
  const body = await request.json();
  const patch: { memo?: string; retrospective?: string } = {};
  if (typeof body?.memo === "string") patch.memo = body.memo;
  if (typeof body?.retrospective === "string")
    patch.retrospective = body.retrospective;
  const updated = await patchWeeklyPlanFields(weekStart, patch);
  return NextResponse.json(updated);
}
