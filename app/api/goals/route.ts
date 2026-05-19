import { NextResponse } from "next/server";
import { createGoal, listGoals } from "@/lib/repo/goals";

export async function GET() {
  const goals = await listGoals();
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  if (!title) {
    return NextResponse.json(
      { error: "title은 비어 있을 수 없습니다." },
      { status: 400 },
    );
  }
  const goal = await createGoal({ title, description });
  return NextResponse.json(goal, { status: 201 });
}
