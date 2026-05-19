import { NextResponse } from "next/server";
import { addObjective } from "@/lib/repo/weekly-plans";

interface Ctx {
  params: Promise<{ weekStart: string }>;
}

export async function POST(request: Request, ctx: Ctx) {
  const { weekStart } = await ctx.params;
  const body = await request.json();
  const title = String(body?.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title이 비었습니다." }, { status: 400 });
  }
  const objective = await addObjective(weekStart, title);
  return NextResponse.json(objective, { status: 201 });
}
